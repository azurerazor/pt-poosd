import { useState, useEffect, useRef } from "react";
import { MissionChoiceEvent, ReadyEvent, StartGameEvent, UpdateEvent, SetRoleListEvent, TeamProposalEvent } from "@common/game/events";
import { ClientEventBroker } from "game/events";
import LobbyView from "./LobbyView";
import GameView from "./GameView";
import { Roles, getRoleByName } from "../../../../common/game/roles";
import { Player } from "../../../../common/game/player";
import { useUser } from '../../util/auth';
import { ClientLobby } from "../../game/lobby";
import Loading from "./Loading";
import { GameState } from "../../../../common/game/state";

export const quests = [
  [],[],[],[],[],
  [ 2,  3,  2,  3,  3],
  [ 2,  3,  4,  3,  4],
  [ 2,  3,  3,  4,  4],
  [ 3,  4,  4,  5,  5],
  [ 3,  4,  4,  5,  5],
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
  const [enabledRoles, setEnabledRoles] = useState(Roles.NONE);
  const [myPlayer, setMyPlayer] = useState<Player>();
  
  // useStates that should be sent to socket
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [successFail, setSuccessFail] = useState<boolean | null>(null);
  const [outcomes, setOutcomes] = useState<number[]>([]);
  const [round, setRound] = useState(-1);
  const [order, setOrder] = useState<string[]>([]);

  // useStates for different stages of the game
  const [showRoleCard, setShowRoleCard] = useState(false);
  const [showMissionVote, setShowMissionVote] = useState(false);

  // Other useStates used to wait for async stuff
  const [gameReady, setGameReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [changeView, setChangeView] = useState(false);
  const [hasReceivedFirstUpdate, setHasReceivedFirstUpdate] = useState(false);
  const [hasResolvedPlayer, setHasResolvedPlayer] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Update all the necessary useStates whenever socket updates
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    ClientLobby.initialize(lobbyId);
    ClientEventBroker.initialize(username, token);

    ClientEventBroker.on('ready', (lobby: ClientLobby, event: ReadyEvent) => {
        console.log("READY EVENT", event);
    });

    ClientEventBroker.on('update', (lobby: ClientLobby, event: UpdateEvent) => {
        setUpdating(true);
        const updateGuys = async () => {        
          if(event.players){
            setPlayers(event.players);
          }
          if (event.enabledRoles) {
            setEnabledRoles(event.enabledRoles);
          }
          if(event.state){
            setGameState(event.state.state);
            setOutcomes(event.state.outcomes!);
            setSelectedTeam(event.state.team!);
            setRound(event.state.round);
          }
          if(event.playerOrder)setOrder(event.playerOrder);
          setUpdating(false);
          setHasReceivedFirstUpdate(true);
        };

      updateGuys();
    });

    ClientEventBroker.on('role_reveal', (lobby: ClientLobby, event: UpdateEvent) => {
      setShowRoleCard(true);

      const timer = setTimeout(() => {
        setShowRoleCard(false);
      }, 10*1000);

      return () => clearTimeout(timer);
    });

    ClientEventBroker.on('team_vote', (lobby: ClientLobby, event: UpdateEvent) => {
      setShowRoleCard(true);

      const timer = setTimeout(() => {
        setShowRoleCard(false);
      }, 10*1000);

      return () => clearTimeout(timer);
    });

  }, []);

  // Change the page from Lobby to Game
  // TO-DO add a check for number of players (Gray out button for non-hosts and if not enough players)
  useEffect(() => {
    if (changeView) {
      setIsLoading(true);
      ClientEventBroker.getInstance().send(new StartGameEvent());
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
    const foundPlayer = players.get(username);

    if (!updating && hasReceivedFirstUpdate && foundPlayer) {
      setMyPlayer(foundPlayer);
      ClientEventBroker.getInstance().send(new ReadyEvent());
    }
  }, [players, updating, hasReceivedFirstUpdate]);

  // update which player you are after players list updated
  useEffect(() => {
    const foundPlayer = players.get(username);
    setMyPlayer(foundPlayer);
    setHasResolvedPlayer(!!foundPlayer);
  }, [players]);

  // Send a mission choice event whenever you make a choice
  useEffect(() => {
    ClientEventBroker.getInstance().send(new MissionChoiceEvent(successFail!));
  }, [successFail]);

  // Send a roleListEvent whenever the role list changes
  useEffect(() => {
    ClientEventBroker.getInstance().send(new SetRoleListEvent(enabledRoles));
  }, [enabledRoles]);

  useEffect(() => {
    ClientEventBroker.getInstance().send(new TeamProposalEvent(selectedTeam));
  }, [selectedTeam])

  if(isLoading || updating){
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
          outcomes={outcomes}
          round={round}
          order={order}
          showRoleCard={showRoleCard}
          showMissionVote={showMissionVote}
        />
      )}
    </div>
  );
}
