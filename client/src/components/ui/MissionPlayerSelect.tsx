import { useState } from "react";
import { Player } from "../../../../common/game/player";

interface Props {
  player: Player
}

const MissionPlayerSelect: React.FC<Props> = ({ player }) => {
  const [isGreen, setIsGreen] = useState(false);

  const handleClick = () => {
    setIsGreen((prevStatus) => !prevStatus);
  };

  const greenVal = isGreen ? 0.5 : 0;

  return (
    <div onClick={handleClick} className="relative">
      <div className="avatar join-item p-1">
        <div className="w-24 rounded relative">
          <img src={player.avatar} alt={player.username} />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "green",
              opacity: greenVal,
              borderRadius: "0.375rem",
            }}
          />
        </div>
      </div>
      <div className="join-item">
        <h2 className="font-bold">{player.username}</h2>
      </div>
    </div>
  );
};

export default MissionPlayerSelect;
