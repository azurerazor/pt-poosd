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
import VoteMission from 'components/ui/VoteMission';
import RoleRevealCard from "../ui/RoleRevealCard"

export default function Game() {
    const navigate = useNavigate();
    const { username } = useUser();
    const [showRoleCard, setShowRoleCard] = useState(true);

    //TEMP UNTIL LOBBY BACKEND
    let lobby = ClientLobby.getInstance();
    lobby.setEnabledRoles(Roles.ANY);
    lobby.setPlayerRoles("blueol", Roles.PERCIVAL);
    lobby.setPlayerRoles("user2", Roles.MERLIN | Roles.MORGANA);
    lobby.setPlayerRoles("user3", Roles.MORGANA | Roles.MERLIN);
    const [players, setPlayers] = useState<Player[]>([]);
    lobby.setLeader("the_host");
    console.log(lobby.leader, " is the leader");

    console.log(lobby.getPlayer(username));

    useEffect(() => {
        setPlayers(lobby.getConnectedPlayers());
    }, []);

    const handleLeave = () => {
        lobby.removePlayer(username);
        navigate(`/dashboard`);
    };


    return (
      <ContextProvider>
        {showRoleCard && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            onClick={() => setShowRoleCard(false)}
          >
            <div
              className="rounded-lg p-8 max-w-xl w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <RoleRevealCard player={lobby.getPlayer(username)!} />
            </div>
          </div>
        )}
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
        <h1 className="text-3xl font-bold absolute bottom-35 left-8">Vote Tracker:</h1>
        <div className="absolute bottom-4 left-4">
          {[...Array(5)].map((_, i) => (
            <VoteMission key={i} status={false} />
          ))}
        </div>

        <div className="absolute bottom-4 right-4 p-2">
          <GameCard
            role={getRoleByName("Percival")}
          />
        </div>

        <div className="absolute top-4 left-4 p-2">
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
