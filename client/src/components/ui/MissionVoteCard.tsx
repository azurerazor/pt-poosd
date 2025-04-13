import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";

interface Props {
  selectedTeam: string[];
  players: Player[];
}

const MissionVoteCard: React.FC<Props> = ({ selectedTeam, players }) => {
    const selectedPlayers = players.filter((p) => selectedTeam.includes(p.username));
    const accept = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/SMirC-thumbsup.svg/2048px-SMirC-thumbsup.svg.png";
    const reject = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/SMirC-thumbsdown.svg/1200px-SMirC-thumbsdown.svg.png";

    const handleAccept = () => {
        console.log("accepted");
    };

    const handleReject = () => {
        console.log("rejected");
    };

    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="card-body w-full">
            <h1 className="text-xl font-bold flex-row">Vote for this mission:</h1>
            <div className="justify-center join join-horizontal">
                {selectedPlayers.map((p) => (
                    <div key={p.username} className="flex flex-col">
                    <div className="avatar p-1">
                      <div className="w-14 rounded border-4">
                        <img src={p.avatar} alt={p.username} />
                      </div>
                    </div>
                    <h2 className="text-sm font-semibold">{p.username}</h2>
                  </div>                
                ))}
            </div>
            <div className="join join-horizontal flex justify-between space-x-5">
                <img src={accept} alt="Accept Card" className="w-60" onClick={handleAccept}/>
                <img src={reject} alt="Reject Card" className="w-60" onClick={handleReject}/>
            </div>
        </div>
        </div>
    );
};

export default MissionVoteCard;

