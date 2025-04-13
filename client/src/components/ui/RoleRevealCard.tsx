import { Player } from "../../../../common/game/player";
import { getRoles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";

interface Props {
  player: Player;
  players: Player[];
  onClose?: () => void;
}

const RoleRevealCard: React.FC<Props> = ({ player, players, onClose }) => {
  const playersInfo = players.filter((p) => p.role);
  
  const myRole = getRoles(player.role!)[0];
  let otherRoles = [];
  let otherPlayers = [];

  playersInfo.forEach((p) => {
    if (p.username !== player.username && p.role) {
      otherRoles = getRoles(p.role!);
      otherPlayers.push(p);
    }
  });

  return (
    <div className="card card-side bg-base-100 shadow-sm">
      <figure>
        <img src={myRole.image} alt={myRole.name} />
      </figure>
      <div className="card-body w-full">
        <h1 className="text-xl font-bold flex-row">{myRole.name}</h1>
        <hr />
        <h2 className="text-l flex-row mb-12">{myRole.description}</h2>
        <h3 className="text-xl font-bold">Information</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="mt-6 self-end bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default RoleRevealCard;
