import { useState } from "react";
import { Player } from "../../../../common/game/player";

interface Props {
  player: Player,
  id: number
}

const AssassinationPlayerSelect: React.FC<Props> = ({ player, id }) => {
  const [isGreen, setIsGreen] = useState(-1);

  const handleClick = () => {
    if (isGreen == id) setIsGreen(-1);
    else setIsGreen(id);
  };

  return (
    <div onClick={handleClick} className="relative">
      <div className="avatar join-item p-1">
        <div className={`w-24 rounded relative border-6 ${(isGreen == id) ? 'border-red-400' : 'border-transparent'}`}>
          <img src={player.avatar} alt={player.username} />
        </div>
      </div>
      <div className="join-item">
        <h2 className="font-bold">{player.username}</h2>
      </div>
    </div>
  );
};

export default AssassinationPlayerSelect;
