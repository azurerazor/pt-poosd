import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import FunctionButton from "../misc/FunctionButton";
import { useState, useEffect } from 'react';
import AssassinationPlayerSelect from "./AssassinationPlayerSelect";
import { ASSASSINATION_TIME, SECONDS } from "@common/game/timing";

interface Props {
    player: Player;
    players: Map<string, Player>;
    goodPlayers: string[];
    setAssassinate: React.Dispatch<React.SetStateAction<string | null>>;
}

const AssassinationScreen: React.FC<Props> = ({ player, players, goodPlayers, setAssassinate }) => {
    console.log(goodPlayers);
    const [selected, setSelected] = useState(-1);

    const [counter, setCounter] = useState(ASSASSINATION_TIME / SECONDS);
            
    useEffect(() => {
        const interval = setInterval(() => {
        setCounter((prev) => {
            if (prev <= 1) {
            clearInterval(interval);
            return 0;
            }
            return prev - 1;
        });
        }, 1000);
    
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="absolute top-4 right-4">
            <span id="counterElement" className="countdown font-bold">
                {counter}
            </span>
        </div>
        <div className="card-body w-full">
            <h1 className="text-xl font-bold flex-row">Pick who you think is Merlin:</h1>
            <div className="join join-horizontal flex flex-row flex-wrap justify-center">
                {goodPlayers.map((username, idx) => {
                    const playerObj = players.get(username);
                    if (!playerObj) return null;

                    return (
                        <AssassinationPlayerSelect
                            key={playerObj.username}
                            player={playerObj}
                            id={idx}
                            setAssassinate={setAssassinate}
                            selected={selected}
                            setSelected={setSelected}
                        />
                    );
                })}
            </div>
        </div>
        </div>
    );
};

export default AssassinationScreen;

