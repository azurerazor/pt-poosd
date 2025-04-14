import { useState, useEffect } from "react";
import LobbyView from "./LobbyView";
import GameView from "./GameView";
import { Roles } from "../../../../common/game/roles";
import { Player } from "../../../../common/game/player";
import { useUser } from '../../util/auth';
import { ClientLobby } from "../../game/lobby";
import Loading from "./Loading";
import { Outcome, GameState } from "../../../../common/game/state";

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameReady, setGameReady] = useState(false);
  const [lobbyId, setLobbyId] = useState("");
  const [enabledRoles, setEnabledRoles] = useState(Roles.NONE);
  const [myPlayer, setMyPlayer] = useState(new Player("TEMP",false));
  const { username } = useUser();
  const lobby = ClientLobby.getInstance();
  const [isLoading, setIsLoading] = useState(false);
  const [changeView, setChangeView] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string[]>([]);
  const [successFail, setSuccessFail] = useState<Outcome>(Outcome.NONE);
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.LOBBY)
  const [changeState, setChangeState] = useState(false);

  //TEMP UNTIL BACKEND
  useEffect(() => {
    lobby.addPlayer("blueol");
    lobby.addPlayer("user2");
    lobby.addPlayer("user3");
    lobby.addPlayer("user123");
    lobby.addPlayer("user124");
    lobby.addPlayer("user125");
    lobby.addPlayer("user126");
    lobby.addPlayer("user127");
    lobby.addPlayer("azure");
    setSelectedTeam(["blueol", "azure", "user2"]);
    setMyPlayer(lobby.getPlayer(username)!);
    setPlayers(lobby.getConnectedPlayers());
    setLobbyId(lobby.id);
  }, []);

  useEffect(() => {
    if (changeView) {
      setIsLoading(true);
      const initializeGame = async () => {        
        lobby.setEnabledRoles(Roles.ANY);
        lobby.setPlayerRoles("blueol", Roles.PERCIVAL);
        lobby.setPlayerRoles("user3", Roles.MERLIN | Roles.MORGANA);
        lobby.setPlayerRoles("azure", Roles.MORGANA | Roles.MERLIN);
        lobby.setLeader("the_host");
        setGameState(GameState.ROLE_REVEAL);
        setGameReady(true);
        setIsLoading(false);
      };

      initializeGame();
    }
  }, [changeView]);

  useEffect(() => {
    console.log("YIPPEE!", successFail);
  }, [successFail]);

  if(isLoading){
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
          myPlayer={myPlayer}
        />
      ) : (
        <GameView
          players={players}
          myPlayer={myPlayer}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          successFail={successFail}
          setSuccessFail={setSuccessFail}
          outcomes={outcomes}
          gameState={gameState}
          changeState={changeState}
          setChangeState={setChangeState}
        />
      )}
    </div>
  );
}
