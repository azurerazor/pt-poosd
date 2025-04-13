import { useState, useEffect } from 'react';
import GameAvatar from "../ui/GameAvatar";
import GameMission from "../ui/GameMission";
import MissionPlayerSelect from "../ui/MissionPlayerSelect";
import GameCard from "../ui/GameCard";
import { Roles, getRoleByName } from "../../../../common/game/roles";
import { Player } from "../../../../common/game/player"
import FunctionButton from "../misc/FunctionButton";
import { useUser } from '../../util/auth';
import { useNavigate } from 'react-router';
import { HiddenContextProvider } from "../../util/hiddenContext";
import VoteMission from 'components/ui/VoteMission';
import RoleRevealCard from "../ui/RoleRevealCard"

type Props = {
  players: Player[];
  myPlayer: Player;
};

export default function GameView({ players, myPlayer }: Props) {
  const navigate = useNavigate();
  const [showRoleCard, setShowRoleCard] = useState(true);

  const handleLeave = () => {
    navigate(`/dashboard`);
  };

  return (
    <HiddenContextProvider>
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
            <RoleRevealCard player={myPlayer} players={players} />
          </div>
        </div>
      )}
      <div className="hero-content w-full text-center m-auto flex-col gap-0 h-screen">
        <div className="join join-vertical lg:join-horizontal absolute top-1">
          {players.map((player) => (
            <GameAvatar key={player.username} player={player} myPlayer={myPlayer} />
          ))}
        </div>

        <div className="join join-vertical lg:join-horizontal">
          {[...Array(5)].map((_, i) => (
            <GameMission key={i} status={false} />
          ))}
        </div>
      <div className="justify-between">
        <h1 className="text-3xl font-bold absolute bottom-35 left-8">Vote Tracker:</h1>
        <div className="absolute bottom-4 left-4">
          {[...Array(5)].map((_, i) => (
            <VoteMission key={i} status={false} />
          ))}
        </div>

        <div className="absolute bottom-4">
          <FunctionButton
          label="Mission Select"
          onClick={() => (document.getElementById("MissionSelect") as HTMLDialogElement)?.showModal()}
        />
        <dialog id="MissionSelect" className="modal">
          <div className="modal-box join join-horizontal w-auto">
            {players.map((player) => (
              <MissionPlayerSelect key={player.username} player={player} />
            ))}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        </div>

        <div className="absolute bottom-4 right-4 p-2">
          <GameCard
            role={getRoleByName("Percival")}
          />
        </div>
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
    </HiddenContextProvider>
  );
}
