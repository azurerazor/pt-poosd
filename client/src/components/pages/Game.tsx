import { useState, useEffect } from 'react';
import GameAvatar from "../ui/GameAvatar";
import GameMission from "../ui/GameMission";
import GameCard from "../ui/GameCard";
import { Roles, getRoleByName } from "../../../../common/game/roles";
import { Player } from "../../../../common/game/player"
import FunctionButton from "../misc/FunctionButton";
import { useUser } from '../../util/auth';
import { useNavigate } from 'react-router';
import { ContextProvider } from "../../util/hiddenContext";
import { ClientLobby } from "../../game/lobby";

export default function Game() {
    const navigate = useNavigate();
    const { username } = useUser();

    //TEMP UNTIL LOBBY BACKEND
    let lobby = ClientLobby.getInstance();
    lobby.setEnabledRoles(Roles.ANY);
    lobby.setPlayerRoles("booleancube", Roles.PERCIVAL);
    lobby.setPlayerRoles("user2", Roles.MERLIN);
    lobby.setPlayerRoles("user3", Roles.MORGANA);
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        setPlayers(lobby.getPlayers());
    }, []);

    const handleLeave = () => {
        lobby.removePlayer(username);
        navigate(`/dashboard`);
    };


    return (
        <ContextProvider>
      <div className="hero-content w-full text-center m-auto flex-col gap-0 h-screen">
        <div className="join join-vertical lg:join-horizontal absolute top-1">
          {players.map((player) => (
            <GameAvatar key={player.username} player={player} />
          ))}
        </div>

        <div className="join join-vertical lg:join-horizontal">
          {[...Array(5)].map((_, i) => (
            <GameMission key={i} status={false} />
          ))}
        </div>

        <div className="absolute bottom-4 right-4 p-2">
          <GameCard
            role={getRoleByName("Percival")}
          />
        </div>

        <div className="absolute bottom-4 left-4 p-2">
          <FunctionButton
            label="Options"
            onClick={() => (document.getElementById("Options") as HTMLDialogElement)?.showModal()}
          />
          <dialog id="Options" className="modal">
            <div className="modal-box">
              <FunctionButton label="Leave" onClick={handleLeave} />
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>
      </div>
    </ContextProvider>
  );
}
