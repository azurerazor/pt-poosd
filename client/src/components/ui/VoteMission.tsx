import React from "react";

interface Props {
  status: boolean;
}

const VoteMission: React.FC<Props> = ({ status = false }) => {
  if(status)console.log("THIS MISSION IS DONE");

  return (
    <div className="join-item avatar p-4">
      <div className="w-24 rounded-full">
        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
      </div>
    </div>
  );
};

export default VoteMission;
