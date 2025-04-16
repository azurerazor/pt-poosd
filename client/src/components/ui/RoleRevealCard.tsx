import { useEffect, useState } from "react";
import { Player } from "../../../../common/game/player";
import { Role, getRoles } from "../../../../common/game/roles";
import { ROLE_REVEAL_TIME, SECONDS } from "../../../../common/game/timing";
import { ClientLobby } from "../../game/lobby";
import RoleRevealInfo from "./RoleRevealInfo";

interface Props {
  player: Player;
  players: Map<string, Player>;
  onClose?: () => void;
}

const RoleRevealCard: React.FC<Props> = ({ player, players, onClose }) => {
  const playersInfo = Array.from(players)
    .filter(([_, player]) => player.role)
    .map(([_, player]) => player);

  const [counter, setCounter] = useState(ROLE_REVEAL_TIME / SECONDS);

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

  const myRole = getRoles(player.role!)[0];
  let otherRoles: Role[] = [];
  let otherPlayers: Player[] = [];

  playersInfo.forEach((p) => {
    if (p.username !== player.username && p.role) {
      otherRoles = getRoles(p.role!);
      otherPlayers.push(p);
    }
  });

  return (
    <div className="card card-side bg-base-100 shadow-sm w-[42rem] h-[24rem]">
      <div className="absolute top-4 right-4">
        <span id="counterElement" className="countdown font-bold">
          {counter}
        </span>
      </div>
      <figure className="w-1/2 h-full">
        <img src={myRole.image} alt={myRole.name} />
      </figure>
      <div className="card-body flex flex-col justify-between">
        <div>
          <h1 className="text-xl font-bold">{myRole.name}</h1>
          <hr className="my-1" />
          <h2 className="text-l mb-6">{myRole.description}</h2>
          <h3 className="text-xl font-bold mb-1">Information</h3>
          <p className="mb-2">
            The following players could be <span className="font-bold">ANY</span> of these roles:
          </p>
          <div className="flex justify-center mb-4">
            <div className="join space-x-3">
              {otherRoles.map((r, idx) => (
                <RoleRevealInfo key={r.name + idx} role={r} />
              ))}
            </div>
          </div>

          <div className="join join-horizontal flex flex-row flex-wrap justify-center">
            {otherPlayers.map((p) => (
              <div key={p.username} className="flex flex-col justify-center">
                <div className="avatar p-1">
                  <div className="w-14 rounded border-4">
                    <img src={p.avatar} alt={p.username} />
                  </div>
                </div>
                <h2 className="text-sm font-semibold">{p.username}</h2>
              </div>
            ))}
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 self-end bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
};

export default RoleRevealCard
