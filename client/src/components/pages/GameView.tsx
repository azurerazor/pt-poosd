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
import SuccessFailCard from 'components/ui/SuccessFailCard';

type Props = {
  players: Player[];
  myPlayer: Player;
};

let _A = [null, true, false]; // silly debug array for the GameMissions

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
            <GameMission key={i} status={_A[i % 3]} pcount={i} numFails={0} />
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
          <div className="modal-box">
          <h1 className="text-xl font-bold flex-row">Select n players:</h1>
            <div className="join join-horizontal flex flex-row flex-wrap justify-center">
              {players.map((player) => (
                <MissionPlayerSelect key={player.username} player={player} />
              ))}
            </div>
            <FunctionButton label="Submit" />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        </div>

        <div className="absolute bottom-35">
          <FunctionButton
          label="Vote Success/Fail"
          onClick={() => (document.getElementById("SuccessFail") as HTMLDialogElement)?.showModal()}
        />
        <dialog id="SuccessFail" className="modal">
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <SuccessFailCard player={myPlayer} players={players} />
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
