import { Player } from "../../../../common/game/player";
import { getRoles, Alignment } from "../../../../common/game/roles";
import RoleRevealInfo from "../ui/RoleRevealInfo";
import FunctionButton from "../misc/FunctionButton";
import { useNavigate } from "react-router";

type Props = {
  allPlayers: Map<string, Player>;
  winner: Alignment;
  assassinated: string | null;
  message: string;
  setBackToLobby: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function ResultsView({ allPlayers, winner, assassinated, message, setBackToLobby }: Props) {
  const navigate = useNavigate();
  const players = Array.from(allPlayers.values());

  return (
    <div className="flex flex-row h-screen">
      <div className="w-1/2 bg-gray-100 p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Players & Roles</h2>
        <div className="flex flex-col gap-4">
          {players.map((player) => (
            <div key={player.username} className="flex items-center gap-4 bg-white p-4 rounded shadow">
              { player.role && (
                <RoleRevealInfo role={getRoles(player.role)[0]} />
                )}
              <h2 className="text-lg font-medium">{player.username}</h2>
            </div>
          ))}
        </div>
      </div>

      <div className="w-1/2 flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">{winner === Alignment.EVIL ? "Evil Wins!" : "Good Wins!"}</h1>
        {assassinated && (
          <p className="text-lg mb-2">The assassin targeted: <strong>{assassinated}</strong></p>
        )}
        <p className="text-xl italic mb-8">{message}</p>

        <FunctionButton label="Back to Lobby" onClick={() => setBackToLobby(true)} />
      </div>
    </div>
  );
}
