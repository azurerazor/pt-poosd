import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";
import FunctionButton from "../misc/FunctionButton";
import { useState, useEffect } from 'react';
import { TEAM_VOTE_TIME, SECONDS } from "@common/game/timing";

interface Props {
  selectedTeam: string[];
  players: Map<string, Player>;
  setAcceptReject: React.Dispatch<React.SetStateAction<boolean | null>>;
}

const MissionVoteCard: React.FC<Props> = ({ selectedTeam, players, setAcceptReject }) => {
    const selectedPlayers = Array.from(players)
      .filter(([_, player]) => selectedTeam.includes(player.username))
      .map(([_, player]) => player);

    const [counter, setCounter] = useState(TEAM_VOTE_TIME / SECONDS);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setCounter((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
  
      return () => clearInterval(interval);
    }, []);
    
    const accept = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/SMirC-thumbsup.svg/2048px-SMirC-thumbsup.svg.png";
    const reject = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/SMirC-thumbsdown.svg/1200px-SMirC-thumbsdown.svg.png";

    const [leftActive, setLeft] = useState(false);
    const [rightActive, setRight] = useState(false);

    const handleAccept = () => {
        console.log("accepted team choice");
        if (!leftActive) {
            setAcceptReject(true);
            setRight(false);
            setLeft(leftActive => !leftActive);
        }
    };

    const handleReject = () => {
        console.log("rejected team choice");
        if (!rightActive) {
            setAcceptReject(false);
            setLeft(false);
            setRight(rightActive => !rightActive);
        }
    };

    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="absolute top-4 right-4">
            <span id="counterElement" className="countdown">
                {counter}
            </span>
        </div>
        <div className="card-body flex-col">
            <h1 className="text-xl font-bold flex-row">Vote for this mission:</h1>
            <div className="justify-center join join-horizontal">
                {selectedPlayers.map((p) => (
                  <div className="relative">
                    <div className="avatar join-item p-1">
                      <div className="w-24 rounded relative border-6 border-transparent">
                        <img src={p.avatar} alt={p.username} />
                      </div>
                    </div>
                    <div className="join-item">
                      <h2 className="font-bold">{p.username}</h2>
                    </div>
                  </div>
                ))}
            </div>
            <div className="join join-horizontal flex justify-between space-x-5">
                <img src={accept} alt="Accept Card" 
                  className={`w-50 border-6 ${leftActive ? 'border-blue-400' : 'border-transparent'}`}
                  onClick={handleAccept}
                />
                <img src={reject} alt="Reject Card" 
                  className={`w-50 border-6 ${rightActive ? 'border-blue-400' : 'border-transparent'}`} 
                  onClick={handleReject}
                />
            </div>
        </div>
        </div>
    );
};

export default MissionVoteCard;

