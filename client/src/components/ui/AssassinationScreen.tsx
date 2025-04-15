import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import FunctionButton from "../misc/FunctionButton";
import { useState } from 'react';
import AssassinationPlayerSelect from "./AssassinationPlayerSelect";

interface Props {
    player: Player;
    players: Map<string, Player>;
    setAssassinate: React.Dispatch<React.SetStateAction<string | null>>;
}

const AssassinationScreen: React.FC<Props> = ({ player, players, setAssassinate }) => {

    const [selected, setSelected] = useState(-1);

    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="card-body w-full">
            <h1 className="text-xl font-bold flex-row">Pick who you think is Merlin:</h1>
            <div className="join join-horizontal flex flex-row flex-wrap justify-center">
                {Array.from(players.entries()).map(([username, player], idx) => (
                    <AssassinationPlayerSelect key={player.username} player={player} id={idx} setAssassinate={setAssassinate} selected={selected} setSelected={setSelected} />
                ))}
            </div>
            <div className="flex-row"><FunctionButton label="Submit" /></div>
        </div>
        </div>
    );
};

export default AssassinationScreen;

