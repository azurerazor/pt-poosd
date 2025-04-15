import { useState, useEffect, useRef } from "react";
import { MissionChoiceEvent, ReadyEvent, StartGameEvent, UpdateEvent, SetRoleListEvent, TeamProposalEvent, TeamVoteEvent, TeamVoteChoiceEvent, RoleRevealEvent, MissionEvent, MissionOutcomeEvent, AssassinationEvent, AssassinationChoiceEvent, GameResultEvent } from "@common/game/events";
import { ClientEventBroker } from "game/events";
import LobbyView from "./LobbyView";
import GameView from "./GameView";
import { Roles, getRoleByName } from "../../../../common/game/roles";
import { Player } from "../../../../common/game/player";
import { useUser } from '../../util/auth';
import { ClientLobby } from "../../game/lobby";
import Loading from "./Loading";
import { GameState, Lobby } from "../../../../common/game/state";

export const quests = [
  [],[],[],[],[],
  [2, 3, 2, 3, 3],
  [2, 3, 4, 3, 4],
  [2, 3, 3, 4, 4],
  [3, 4, 4, 5, 5],
  [3, 4, 4, 5, 5],
  [3, 4, 4, 5, 5],
];

export const fails = [
  [],[],[],[],[],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 2, 1],
  [1, 1, 1, 2, 1],
  [1, 1, 1, 2, 1],
  [1, 1, 1, 2, 1],
];

export default function GameFlow() {
  // Get lobby ID from query params
  const urlParams = new URLSearchParams(window.location.search);
  const lobbyId = urlParams.get("id") || "none";

  // Get the username and token
  const { username } = useUser();
  const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))!
      .split('=')[1];

  // State
  const initialized = useRef(false);

  // All useStates passed to children when updated in socket
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [myPlayer, setMyPlayer] = useState<Player>();
  
  // useStates that should be sent to socket
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [enabledRoles, setEnabledRoles] = useState(Roles.NONE);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [successFail, setSuccessFail] = useState<boolean | null>(null);
  const [outcomes, setOutcomes] = useState<number[]>([]);
  const [round, setRound] = useState(-1);
  const [order, setOrder] = useState<string[]>([]);
  const [acceptReject, setAcceptReject] = useState<boolean | null>(null);
  const [assassinate, setAssassinate] = useState<string | null>(null);

  // useStates for different stages of the game
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [showSuccessFail, setShowSuccessFail] = useState(false);
  const [showMissionVote, setShowMissionVote] = useState(false);
  const [showMissionOutcome, setShowMissionOutcome] = useState(false);
  const [showAssassinationCard, setShowAssassinationCard] = useState(false);

  // Other useStates used to wait for async stuff
  const [gameReady, setGameReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [changeView, setChangeView] = useState(false);
  const [hasReceivedFirstUpdate, setHasReceivedFirstUpdate] = useState(false);
  const [hasResolvedPlayer, setHasResolvedPlayer] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [sentTeamProposal, setSentTeamProposal] = useState(false);

  // Update all the necessary useStates whenever socket updates
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    ClientLobby.initialize(lobbyId);
    ClientEventBroker.initialize(username, token);

    ClientEventBroker.on('update', (lobby: ClientLobby, event: UpdateEvent) => {
      console.log("Received Update Event", event);
        setUpdating(true);
        const updateGuys = async () => {        
          if(event.players !== null){
            setMyPlayer(event.players.get(username));
            setPlayers(event.players);
          }
          if (event.enabledRoles !== null) {
            setEnabledRoles(event.enabledRoles);
          }
          if(event.state !== null){
            setGameState(event.state.state);
            setOutcomes(event.state.outcomes!);
            setRound(event.state.round);
          }
          if(event.playerOrder !== null)setOrder(event.playerOrder);
          setUpdating(false);
          setHasReceivedFirstUpdate(true);
        };

      updateGuys();
    });

    ClientEventBroker.on('role_reveal', (lobby: ClientLobby, event: RoleRevealEvent) => {
      console.log("Received role reveal Event", event);
      setShowRoleCard(true);

      const timer = setTimeout(() => {
        setShowRoleCard(false);
      }, 10*1000);

      return () => clearTimeout(timer);
    });

    ClientEventBroker.on('team_vote', (lobby: ClientLobby, event: TeamVoteEvent) => {
      console.log("Received team vote Event", event);
      setSelectedTeam(event.players!);
      setShowMissionVote(true);

      const timer = setTimeout(() => {
        setShowMissionVote(false);
      }, 10*1000);

      return () => clearTimeout(timer);
    });

    ClientEventBroker.on('mission', (lobby: ClientLobby, event: MissionEvent) => {

      setSelectedTeam(event.players!);
      setShowSuccessFail(true);

      const timer = setTimeout(() => {
        setShowSuccessFail(false);
      }, 10*1000);

      return () => clearTimeout(timer);
    });

    ClientEventBroker.on('mission_outcome', (lobby: ClientLobby, event: MissionOutcomeEvent) => {
      console.log("Received mission_outcome Event", event);
      setShowMissionOutcome(true);

      const timer = setTimeout(() => {
        setShowMissionOutcome(false);
        setSentTeamProposal(false);
        console.log("Sending Ready event");
        ClientEventBroker.getInstance().send(new ReadyEvent());
      }, 10*1000);

      return () => clearTimeout(timer);
    });

    ClientEventBroker.on('assassination', (lobby: ClientLobby, event: AssassinationEvent) => {
      console.log("Received assassination Event", event);
      setShowAssassinationCard(true);

      const timer = setTimeout(() => {
        setShowAssassinationCard(false);
      }, 10*1000);

      return () => clearTimeout(timer);
    });
  }, []);

  // Change the page from Lobby to Game
  useEffect(() => {
    if (changeView) {
      setIsLoading(true);
      if(myPlayer && myPlayer.isHost) {
        console.log("Sending StartGameEvent");
        ClientEventBroker.getInstance().send(new StartGameEvent());
      }

      const initializeGame = async () => {        
        setGameReady(true);
        setIsLoading(false);
      };

      initializeGame();
    }else {
      setIsLoading(true);
      const noGame = async () => {        
        setGameReady(false);
        setIsLoading(false);
      };

      noGame();
    }
  }, [changeView]);

  // If the game is started change the page
  useEffect(() => {
    if(gameState !== GameState.LOBBY){
      setChangeView(true);
    }else {
      setChangeView(false);
    }
  }, [gameState])

  // If done updating send a ready event to socket
  useEffect(() => {
    if(!updating && hasReceivedFirstUpdate && myPlayer){
      console.log("Sending ready event");
      ClientEventBroker.getInstance().send(new ReadyEvent());
    }
  }, [updating, hasReceivedFirstUpdate, myPlayer]);

  // Send a mission choice event whenever you make a choice
  useEffect(() => {
    if(successFail !== null) {
      console.log("Sending Mission Choice Event", successFail);
      ClientEventBroker.getInstance().send(new MissionChoiceEvent(successFail!));
    }else {
      console.log("Abstained from success fail vote");
    }
  }, [successFail]);

  // Send a roleListEvent whenever the role list changes
  useEffect(() => {
    if(myPlayer && myPlayer.isHost) {
      console.log("Sending SetRoleListEvent", enabledRoles);
      ClientEventBroker.getInstance().send(new SetRoleListEvent(enabledRoles));
    }
  }, [enabledRoles]);

  useEffect(() => {
    if(selectedTeam.length && myPlayer && myPlayer.isLeader && !sentTeamProposal){
      console.log("Sending TeamProposalEvent", selectedTeam);
      setSentTeamProposal(true);
      ClientEventBroker.getInstance().send(new TeamProposalEvent(selectedTeam));
    }
  }, [selectedTeam]);

  useEffect(() => {
    if(acceptReject !== null){
      console.log("Sending TeamVoteChoiceEvent", acceptReject);
      ClientEventBroker.getInstance().send(new TeamVoteChoiceEvent(acceptReject!));
    }else {
      console.log("Abstained form Team vote");
    }
  }, [acceptReject]);

    useEffect(() => {
    if(myPlayer && ClientLobby.getInstance().canAssassinateMerlin(myPlayer!.username)){
      console.log("Sending AssassinateChoiceEvent", assassinate);
      ClientEventBroker.getInstance().send(new AssassinationChoiceEvent(assassinate!));
    }
  }, [assassinate]);

  if(isLoading || updating || !myPlayer){
    return <Loading />;
  }

  return (
    <div>
      {!gameReady ? (
        <LobbyView
          players={players}
          changeView={changeView}
          setChangeView={setChangeView}
          lobbyId={lobbyId}
          enabledRoles={enabledRoles}
          setEnabledRoles={setEnabledRoles}
          myPlayer={myPlayer!}
        />
      ) : (
        <GameView
          players={players}
          myPlayer={myPlayer!}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          successFail={successFail}
          setSuccessFail={setSuccessFail}
          setAcceptReject={setAcceptReject}
          outcomes={outcomes}
          round={round}
          order={order}
          setAssassinate={setAssassinate}
          showRoleCard={showRoleCard}
          showMissionVote={showMissionVote}
          showSuccessFail={showSuccessFail}
          showMissionOutcome={showMissionOutcome}
          showAssassinationCard={showAssassinationCard}
        />
      )}
    </div>
  );
}
