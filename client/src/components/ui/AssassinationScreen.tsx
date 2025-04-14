import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";
import { Outcome } from "../../../../common/game/state";
import FunctionButton from "../misc/FunctionButton";
import { useState } from 'react';
import AssassinationPlayerSelect from "./AssassinationPlayerSelect";

interface Props {
    player: Player;
    players: Map<string, Player>;
    setSuccessFail: React.Dispatch<React.SetStateAction<Outcome>>;
}

const AssassinationScreen: React.FC<Props> = ({ player, players, setSuccessFail}) => {
    const playersInfo = Array.from(players)
        .filter(([_, player]) => player.role)
        .map(([_, player]) => player);

    const myRole = getRoles(player.role!)[0];
    let otherRoles = [];
    let otherPlayers = [];

    playersInfo.forEach((p) => {
    if (p.username !== player.username && p.role) {
        otherRoles = getRoles(p.role!);
        otherPlayers.push(p);
    }
    });

    const [selected, setSelected] = useState(-1);

    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="card-body w-full">
            <h1 className="text-xl font-bold flex-row">Pick who you think is Merlin:</h1>
            <div className="join join-horizontal flex flex-row flex-wrap justify-center">
                {Array.from(players.entries()).map(([username, player], idx) => (
                    <AssassinationPlayerSelect key={player.username} player={player} id={idx} selected={selected} setSelected={setSelected} />
                ))}
            </div>
            <div className="flex-row"><FunctionButton label="Submit" /></div>
        </div>
        </div>
    );
};

export default AssassinationScreen;

