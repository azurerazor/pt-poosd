import { useState } from "react";
import { Player } from "../../../../common/game/player";

interface Props {
  player: Player;
  selectedGuys: number;
  setSelectedGuys: React.Dispatch<React.SetStateAction<number>>;
  numberOfGuys: number;
}

const MissionPlayerSelect: React.FC<Props> = ({ player, selectedGuys, setSelectedGuys, numberOfGuys }) => {
  const [isGreen, setIsGreen] = useState(false);

  const handleClick = () => {
    if(!isGreen && selectedGuys == numberOfGuys)return;
    if(isGreen)setSelectedGuys((prevGuys) => prevGuys-1);
    else setSelectedGuys((prevGuys) => prevGuys+1);
    setIsGreen((prevStatus) => !prevStatus);
  };

  return (
    <div onClick={handleClick} className="relative">
      <div className="avatar join-item p-1">
        <div className={`w-24 rounded relative border-6 ${isGreen ? 'border-green-400' : 'border-transparent'}`}>
          <img src={player.avatar} alt={player.username} />
        </div>
      </div>
      <div className="join-item">
        <h2 className="font-bold">{player.username}</h2>
      </div>
    </div>
  );
};

export default MissionPlayerSelect;
