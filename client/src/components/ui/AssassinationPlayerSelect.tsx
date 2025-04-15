import { useState } from "react";
import { Player } from "../../../../common/game/player";

interface Props {
  player: Player;
  id: number;
  selected: number;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  setAssassinate: React.Dispatch<React.SetStateAction<string | null>>;
}

const AssassinationPlayerSelect: React.FC<Props> = ({ player, id, selected, setSelected, setAssassinate }) => {
  const handleClick = () => {
    if (selected === id) setSelected(-1);
    else {
      setAssassinate(player.username);
      setSelected(id);
    }
  };

  return (
    <div onClick={handleClick} className="relative">
      <div className="avatar join-item p-1">
        <div className={`w-24 rounded relative border-6 ${(selected === id) ? 'border-red-400' : 'border-transparent'}`}>
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
