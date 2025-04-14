import { useState, useEffect } from 'react';
import GameAvatar from "../ui/GameAvatar";
import GameMission from "../ui/GameMission";
import MissionPlayerSelect from "../ui/MissionPlayerSelect";
import GameCard from "../ui/GameCard";
import { Roles, getRoleByName, getRoles } from "../../../../common/game/roles";
import { Player } from "../../../../common/game/player"
import FunctionButton from "../misc/FunctionButton";
import { useUser } from '../../util/auth';
import { useNavigate } from 'react-router';
import { HiddenContextProvider } from "../../util/hiddenContext";
import VoteMission from '../ui/VoteMission';
import RoleRevealCard from "../ui/RoleRevealCard"
import {quests, fails} from "./GameFlow"
import { LobbyState, Outcome, GameState } from "../../../../common/game/state";
import SuccessFailCard from '../ui/SuccessFailCard';
import MissionVoteCard from '../ui/MissionVoteCard';
import MissionRevealCard from '../ui/MissionRevealCard';
import AssassinationScreen from 'components/ui/AssassinationScreen';

type Props = {
  players: Map<string, Player>;
  myPlayer: Player;
  selectedTeam: string[];
  setSelectedTeam: React.Dispatch<React.SetStateAction<string[]>>;
  successFail: Outcome;
  setSuccessFail: React.Dispatch<React.SetStateAction<Outcome>>;
  outcomes: Outcome[];
  round: number;
  showRoleCard: boolean;
};

export default function GameView({ players, myPlayer, selectedTeam, setSelectedTeam, successFail, setSuccessFail, outcomes, round, showRoleCard }: Props) {
  const navigate = useNavigate();
  const [selectedGuys, setSelectedGuys] = useState(0);
  const grayscaleVal = !myPlayer.isLeader ? 100 : 0;

  const handleLeave = () => {
    navigate(`/dashboard`);
  };

  return (
    <HiddenContextProvider>
      {
      /**
       * Display's the player's role and information about it at the start of the game
       */
      }
      {showRoleCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
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
        {
        /**
         * Displays the list of players on the top of the screen
         */
        }
        <div className="join join-vertical lg:join-horizontal absolute top-1">
          {Array.from(players.entries()).map(([username, player], idx) => (
            <GameAvatar key={player.username} player={player} myPlayer={myPlayer} />
          ))}
        </div>
        {
        /**
         * Displays each quest and whether they have succeeded, failed, or haven't been completed
         */
        }
        <div className="join join-vertical lg:join-horizontal">
          {[...Array(5)].map((_, i) => (
            <GameMission key={i} status={Outcome.NONE} pcount={quests[players.size][i]} numFails={fails[players.size][i]} />
          ))}
        </div>
      <div className="justify-between">
        {
        /**
         * Displays the vote tracker
         */
        }
        <h1 className="text-3xl font-bold absolute bottom-35 left-8">Vote Tracker:</h1>
        <div className="absolute bottom-4 left-4">
          {[...Array(5)].map((_, i) => (
            <VoteMission key={i} status={false} />
          ))}
        </div>

        {
        /**
         * Button and menu for selecting the team for the current quest
         */
        }
        <div className="absolute bottom-4">
          <div style={{ filter: `grayscale(${grayscaleVal}%)` }}>
            <FunctionButton
              label="Mission Select"
              onClick={() => { if(myPlayer.isLeader) (document.getElementById("MissionSelect") as HTMLDialogElement)?.showModal() }}
            />
          </div>
        <dialog id="MissionSelect" className="modal">
          <div className="modal-box">
          <h1 className="text-xl font-bold flex-row">Select {quests[players.size][round]} players:</h1>
            <div className="join join-horizontal flex flex-row flex-wrap justify-center">
              {Array.from(players.entries()).map(([username, player], idx) => (
                <MissionPlayerSelect 
                  key={player.username}
                  player={player}
                  selectedGuys={selectedGuys}
                  setSelectedGuys={setSelectedGuys}
                  numberOfGuys={quests[players.size][round]}
                />
              ))}
            </div>
            <FunctionButton label="Submit" />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        </div>
        {
        /**
         * very broken success/fail menu
         * the button currently exists exclusively for testing
         */
        }
        <div className="absolute bottom-35">
          <FunctionButton
          label="Vote Success/Fail"
          onClick={() => (document.getElementById("SuccessFail") as HTMLDialogElement)?.showModal()}
        />
        <dialog id="SuccessFail" className="modal">
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <SuccessFailCard player={myPlayer} players={players} setSuccessFail={setSuccessFail} />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        </div>
        {
        /**
         * Voting on mission
         */
        }
        <div className="absolute bottom-60">
          <FunctionButton
          label="Vote on Mission"
          onClick={() => (document.getElementById("MissionVote") as HTMLDialogElement)?.showModal()}
        />
        <dialog id="MissionVote" className="modal">
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <MissionVoteCard selectedTeam={selectedTeam} players={players} />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
        </div>

        {
        /**
         * Screen for displaying result of mission
         */
        }
        <div className="absolute bottom-20">
          <FunctionButton
            label="Reveal Mission"
            onClick={() => (document.getElementById("RevealMission") as HTMLDialogElement)?.showModal()}
          />
          <dialog id="RevealMission" className="modal">
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <MissionRevealCard outcomes={outcomes} />
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>

        {
        /**
         * Assassination screen
         */
        }
        <div className="absolute top-50">
          <FunctionButton
            label="Assassination"
            onClick={() => (document.getElementById("AssassinationScreen") as HTMLDialogElement)?.showModal()}
          />
          <dialog id="AssassinationScreen" className="modal">
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <AssassinationScreen player={myPlayer} players={players} setSuccessFail={setSuccessFail}/>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button>close</button>
            </form>
          </dialog>
        </div>

        {
        /**
         * Displays the player's role with a toggleable card
         */
        }
        <div className="absolute bottom-4 right-4 p-2">
          <GameCard
            role={getRoles(myPlayer.role!)[0]}
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
