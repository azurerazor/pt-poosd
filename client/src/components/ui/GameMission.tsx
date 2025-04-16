import React from "react";
import { LobbyState } from "../../../../common/game/state";
import {fails} from "../pages/GameFlow"

interface Props {
  round: number;
  numberOfPlayers: number;
  status: number, // Status of the mission -1 incomplete otherwise # of fails
  pcount: number, // number of players required for this mission
}

const incomplete = "/images/incomplete.png";
const success = "/images/good.png";
const fail = "/images/evil.png";

const GameMission: React.FC<Props> = ({ round, numberOfPlayers, status = -1, pcount=0 }) => {
  let image: string;
  if (status === -1) {
    image = incomplete;
  } else if (status >= fails[numberOfPlayers][round]) {
    image = fail;
  } else {
    image = success;
  }

  return (
    <div className="join-item avatar p-4">
      <div className={`relative w-45 rounded-full border-8 ${(fails[numberOfPlayers][round] > 1) ? 'border-red-400' : 'border-black'}`}>
        <img src={image}/>
        {(status === -1) &&
        <div className="absolute inset-0 flex items-center justify-center text-7xl  font-bold">
            {pcount.toString()}
        </div>}
      </div>
    </div>
  );
};

export default GameMission;
