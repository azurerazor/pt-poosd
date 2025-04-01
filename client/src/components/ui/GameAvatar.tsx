import { useState } from "react";

interface Props {
  username: string;
  userCharacter: string;
  isSelected: boolean;
}

const GameAvatar: React.FC<Props> = ({ username, userCharacter, isSelected = false }) => {
  const [isGreen, setIsGreen] = useState(isSelected);

  const handleClick = () => {
    setIsGreen((prevStatus) => !prevStatus);
  };

  const greenVal = isGreen ? 0.5 : 0;

  return (
    <div onClick={handleClick} className="relative">
      <div className="avatar join-item p-1">
        <div className="w-24 rounded relative">
          <img src={userCharacter} alt={username} />
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
        <h2 className="font-bold">{username}</h2>
      </div>
    </div>
  );
};

export default GameAvatar;
