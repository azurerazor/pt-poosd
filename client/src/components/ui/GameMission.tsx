import React from "react";

interface Props {
  status: boolean;
}

const GameMission: React.FC<Props> = ({ status = false }) => {
  if(status)console.log("THIS MISSION IS DONE");

  return (
    <div className="join-item avatar p-4">
      <div className="w-45 rounded-full">
        <img src="https://www.calendarclub.ca/cdn/shop/files/8059074F-9CA8-456F-8371-D4552E772A9A_grande.jpg?v=1728040310" />
      </div>
    </div>
  );
};

export default GameMission;
