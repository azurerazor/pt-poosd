import { useState } from 'react';
import GameAvatar from "../ui/GameAvatar";
import GameMission from "../ui/GameMission";
import MissionPlayerSelect from "../ui/MissionPlayerSelect";
import GameCard from "../ui/GameCard";
import { getRoles } from "../../../../common/game/roles";
import { Player } from "../../../../common/game/player";
import { Lobby } from "../../../../common/game/state";
import { ClientLobby } from "../../game/lobby";
import FunctionButton from "../misc/FunctionButton";
import { useNavigate } from 'react-router';
import { HiddenContextProvider } from "../../util/hiddenContext";
import SuccessFailCard from '../ui/SuccessFailCard';
import LoadingCard from '../ui/LoadingCard';
import MissionVoteCard from '../ui/MissionVoteCard';
import MissionRevealCard from '../ui/MissionRevealCard';
import AssassinationScreen from 'components/ui/AssassinationScreen';
import RoleRevealCard from "../ui/RoleRevealCard";
import { quests } from "./GameFlow";
import { ClientEventBroker } from 'game/events';
import { ASSASSINATION_TIME, MISSION_CHOICE_TIME, SECONDS } from '@common/game/timing';

type Props = {
  players: Map<string, Player>;
  myPlayer: Player;
  selectedTeam: string[];
  setSelectedTeam: React.Dispatch<React.SetStateAction<string[]>>;
  successFail: boolean | null;
  setSuccessFail: React.Dispatch<React.SetStateAction<boolean | null>>;
  setAcceptReject: React.Dispatch<React.SetStateAction<boolean | null>>;
  setAssassinate: React.Dispatch<React.SetStateAction<string | null>>;
  goodPlayers: string[];
  outcomes: number[];
  round: number;
  order: string[];
  showRoleCard: boolean;
  showMissionVote: boolean;
  showSuccessFail: boolean;
  showMissionOutcome: boolean;
  showAssassinationCard: boolean;
};

export default function GameView({
  players,
  myPlayer,
  selectedTeam,
  setSelectedTeam,
  successFail,
  setSuccessFail,
  setAcceptReject,
  setAssassinate,
  goodPlayers,
  outcomes,
  round,
  order,
  showRoleCard,
  showMissionVote,
  showSuccessFail,
  showMissionOutcome,
  showAssassinationCard
}: Props) {
  const navigate = useNavigate();
  const [selectedGuys, setSelectedGuys] = useState<string[]>([]);
  const grayscaleVal = !myPlayer.isLeader ? 100 : 0;
  const orderedPlayers = order
    .map((username) => players.get(username))
    .filter((p): p is Player => p !== undefined);

  const handleLeave = () => {
    ClientEventBroker.disconnect();
    navigate(`/dashboard`);
  };

  const handleSubmitMission = () => {
    if (selectedGuys.length !== quests[players.size][round]) {
      alert("Not enough players on the mission!");
    } else {
      setSelectedTeam(selectedGuys);
      (document.getElementById("MissionSelect") as HTMLDialogElement)?.close();
      setSelectedGuys([]);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen">
      {/* Blurred background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("https://images.rawpixel.com/image_800/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvcHg4OTA3MTAtaW1hZ2Uta3d2dXZhYjUuanBn.jpg")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
          WebkitFilter: 'blur(8px)',
        }}
      />

      {/* Foreground content */}
      <div className="relative z-10">
        <HiddenContextProvider>
          {showRoleCard && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
              <div className="rounded-lg p-8 max-w-xl w-full text-center">
                <RoleRevealCard player={myPlayer} players={players} />
              </div>
            </div>
          )}

          <div className="hero-content w-full text-center m-auto flex-col gap-0 min-h-screen">
            <div className="join join-vertical lg:join-horizontal absolute top-1">
              {orderedPlayers.map((player) => (
                <GameAvatar key={player.username} player={player} myPlayer={myPlayer} />
              ))}
            </div>

            <div className="join join-vertical lg:join-horizontal">
              {[...Array(5)].map((_, i) => (
                <GameMission
                  key={i}
                  round={i}
                  numberOfPlayers={players.size}
                  status={outcomes[i]}
                  pcount={quests[players.size][i]}
                />
              ))}
            </div>

            <div className="bottom-4">
              <div style={{ filter: `grayscale(${grayscaleVal}%)` }} className="mt-auto flex justify-center p-4">
                <FunctionButton
                  label="Mission Select"
                  onClick={() => {
                    if (myPlayer.isLeader)
                      (document.getElementById("MissionSelect") as HTMLDialogElement)?.showModal();
                  }}
                />
              </div>

              <dialog id="MissionSelect" className="modal">
                <div className="modal-box">
                  <h1 className="text-xl font-bold">Select {quests[players.size][round]} players:</h1>
                  <div className="join join-horizontal flex flex-row flex-wrap justify-center">
                    {orderedPlayers.map((player) => (
                      <MissionPlayerSelect
                        key={player.username}
                        player={player}
                        selectedGuys={selectedGuys}
                        setSelectedGuys={setSelectedGuys}
                        numberOfGuys={quests[players.size][round]}
                      />
                    ))}
                  </div>
                  <FunctionButton label="Submit" onClick={handleSubmitMission} />
                </div>
                <form method="dialog" className="modal-backdrop" >
                  <button aria-label="close" />
                </form>
              </dialog>
            </div>

            {showSuccessFail && (
              selectedTeam.includes(myPlayer.username) ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                  <div className="rounded-lg p-8 max-w-xl w-full text-center">
                    <SuccessFailCard player={myPlayer} players={players} setSuccessFail={setSuccessFail} />
                  </div>
                </div>
              ) : (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                  <div className="rounded-lg p-8 max-w-xl w-full text-center">
                    <LoadingCard message="Mission in progress..." timer={MISSION_CHOICE_TIME / SECONDS} />
                  </div>
                </div>
              )
            )}

            {showMissionVote && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                <div className="rounded-lg p-8 max-w-xl w-full text-center">
                  <MissionVoteCard selectedTeam={selectedTeam} players={players} setAcceptReject={setAcceptReject} />
                </div>
              </div>
            )}

            {showMissionOutcome && (
              <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                <div className="rounded-lg p-8 max-w-xl w-full text-center">
                  <MissionRevealCard outcomes={outcomes} numberOfPlayers={players.size} round={round} />
                </div>
              </div>
            )}

            {showAssassinationCard && (
              ClientLobby.getInstance().canAssassinateMerlin(myPlayer.username) ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                  <div className="rounded-lg p-8 max-w-xl w-full text-center">
                    <AssassinationScreen
                      player={myPlayer}
                      players={players}
                      goodPlayers={goodPlayers}
                      setAssassinate={setAssassinate}
                    />
                  </div>
                </div>
              ) : (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
                  <div className="rounded-lg p-8 max-w-xl w-full text-center">
                    <LoadingCard message="Merlin assassination in progress..." timer={ASSASSINATION_TIME / SECONDS} />
                  </div>
                </div>
              )
            )}

            <div className="absolute bottom-4 right-4 p-2">
              <GameCard role={getRoles(myPlayer.role!)[0]} />
            </div>

            <div className="absolute top-4 left-4 p-2">
              <FunctionButton label="Leave" onClick={handleLeave} />
            </div>
          </div>
        </HiddenContextProvider>
      </div>
    </div>
  );
}
