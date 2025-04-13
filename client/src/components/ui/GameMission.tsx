import React from "react";

interface Props {
  status: boolean | null, // incomplete = NULL, success = true, fail = false
  pcount: number, // number of players required for this mission
  numFails: number; // number of fails required for this mission
}

const incomplete = "https://i.imgflip.com/45wu20.png?a484272";
const success = "https://tr.rbxcdn.com/180DAY-9cb60006348d685d54dedf063358d491/420/420/Hat/Webp/noFilter";
const fail = "https://www.calendarclub.ca/cdn/shop/files/8059074F-9CA8-456F-8371-D4552E772A9A_grande.jpg?v=1728040310";

const GameMission: React.FC<Props> = ({ status = null, pcount=0, numFails=1}) => {
  if(status)console.log("THIS MISSION IS DONE");

  let image: string;
  if (status === null) {
    image = incomplete;
  } else if (status === true) {
    image = success;
  } else {
    image = fail;
  }

  return (
    <div className="join-item avatar p-4">
      <div className="relative w-45 rounded-full">
        <img src={image}/>
        {(status === null) &&
        <div className="absolute inset-0 flex items-center justify-center text-7xl font-bold">
            {pcount.toString()}
        </div>}
      </div>
    </div>
  );
};

export default GameMission;
