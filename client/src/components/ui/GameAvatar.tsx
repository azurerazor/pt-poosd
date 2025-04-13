import { useHiddenContext } from "../../util/hiddenContext";
import { Player } from "../../../../common/game/player";
import { Roles } from "../../../../common/game/roles";
import { useUser } from '../../util/auth';
import { ClientLobby } from "../../game/lobby";


interface Props {
  player: Player;
  myPlayer: Player;
}

const GameAvatar: React.FC<Props> = ({ player, myPlayer }) => {
  const { isHidden } = useHiddenContext();
  const leader = player.isLeader;

  const couldBeGood = player.role ? (player.role & Roles.GOOD) != Roles.NONE : false;
  const couldBeBad = player.role ? (player.role & Roles.EVIL) != Roles.NONE : false;
  const result = player.username === myPlayer.username ? "" : couldBeGood && couldBeBad ? "🟣" : couldBeGood ? "🔵" : couldBeBad ? "🔴" : "";

  return (
    <div className="relative">
      <div className="avatar join-item p-1">
        <div className={`w-24 rounded relative border-4 ${leader ? 'border-yellow-400' : 'border-transparent'}`}>
          <img src={player.avatar} alt={player.username} />
        </div>
      </div>
      <div className="join-item">
        <h2 className="font-bold">{player.username}</h2>
      </div>
      <div className="join-item">
        <h2 style={{ opacity: isHidden ? 0 : 1 }}>{result}</h2>
      </div>
    </div>
  );
};

export default GameAvatar;
