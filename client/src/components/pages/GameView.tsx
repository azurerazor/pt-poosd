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
import { LobbyState, GameState } from "../../../../common/game/state";
import SuccessFailCard from '../ui/SuccessFailCard';
import MissionVoteCard from '../ui/MissionVoteCard';
import MissionRevealCard from '../ui/MissionRevealCard';
import AssassinationScreen from 'components/ui/AssassinationScreen';

type Props = {
  players: Map<string, Player>;
  myPlayer: Player;
  selectedTeam: string[];
  setSelectedTeam: React.Dispatch<React.SetStateAction<string[]>>;
  successFail: boolean | null;
  setSuccessFail: React.Dispatch<React.SetStateAction<boolean | null>>;
  setAcceptReject: React.Dispatch<React.SetStateAction<boolean | null>>;
  outcomes: number[];
  round: number;
  order: string[];
  showRoleCard: boolean;
  showMissionVote: boolean;
  showSuccessFail: boolean;
  showMissionOutcome: boolean;
};

export default function GameView({ players, myPlayer, selectedTeam, setSelectedTeam, successFail, setSuccessFail, setAcceptReject, outcomes, round, order, showRoleCard, showMissionVote, showSuccessFail, showMissionOutcome }: Props) {
  const navigate = useNavigate();
  const [selectedGuys, setSelectedGuys] = useState<string[]>([]);
  const grayscaleVal = !myPlayer.isLeader ? 100 : 0;
  const orderedPlayers = order
    .map((username) => players.get(username))
    .filter((p): p is Player => p !== undefined);

  const handleLeave = () => {
    navigate(`/dashboard`);
  };

  const handleSubmitMission = () => {
    if (selectedGuys.length !== quests[players.size][round]) {
      alert("Not enough players on the mission!");
    } else {
      setSelectedTeam(selectedGuys);
      (document.getElementById("MissionSelect") as HTMLDialogElement)?.close();
    }
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
          {orderedPlayers.map((player, idx) => (
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
            <GameMission key={i} round={i} numberOfPlayers={players.size} status={outcomes[i]} pcount={quests[players.size][i]} />
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
              {orderedPlayers.map((player, idx) => (
                <MissionPlayerSelect 
                  key={player.username}
                  player={player}
                  selectedGuys={selectedGuys}
                  setSelectedGuys={setSelectedGuys}
                  numberOfGuys={quests[players.size][round]}
                />
              ))}
            </div>
            <FunctionButton label="Submit" onClick={handleSubmitMission}/>
          </div>
          <form method="dialog" className="modal-backdrop">
          </form>
        </dialog>
        </div>
        {
        /**
         * very broken success/fail menu
         * the button currently exists exclusively for testing
         */
        }
        {(showSuccessFail && selectedTeam.includes(myPlayer.username)) && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            >
            <div className="rounded-lg p-8 max-w-xl w-full text-center">
              <SuccessFailCard player={myPlayer} players={players} setSuccessFail={setSuccessFail} />
            </div>
          </div>
        )}
        {
        /**
         * Voting on mission
         */
        }
        {showMissionVote && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div className="rounded-lg p-8 max-w-xl w-full text-center">
              <MissionVoteCard selectedTeam={selectedTeam} players={players}  setAcceptReject={setAcceptReject} />
            </div>
          </div>
        )}

        {
        /**
         * Screen for displaying result of mission
         */
        }
        {showMissionOutcome && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div className="rounded-lg p-8 max-w-xl w-full text-center">
              <MissionVoteCard selectedTeam={selectedTeam} players={players}  setAcceptReject={setAcceptReject} />
            </div>
          </div>
        )}

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
              <AssassinationScreen player={myPlayer} players={players} />
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
