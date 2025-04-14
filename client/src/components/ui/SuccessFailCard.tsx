import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";
import { Outcome } from "../../../../common/game/state";
import FunctionButton from "../misc/FunctionButton";
import { useState } from 'react';

interface Props {
    player: Player;
    players: Map<string, Player>;
    setSuccessFail: React.Dispatch<React.SetStateAction<Outcome>>;
}

const SuccessFailCard: React.FC<Props> = ({ player, players, setSuccessFail}) => {
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

    let successCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ace_of_spades.svg/1200px-Ace_of_spades.svg.png";
    let failCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Playing_card_heart_A.svg/1200px-Playing_card_heart_A.svg.png";

    if(myRole === undefined)return;

    if (myRole.isGood()) {
        failCard = successCard;
    }

    const [leftActive, setLeft] = useState(false);
    const [rightActive, setRight] = useState(false);

    const handleLeft = () => {
        console.log("accepted");
        setLeft(leftActive => !leftActive);
        if (!leftActive) setRight(false);
    };

    const handleRight = () => {
        console.log("rejected");
        setRight(rightActive => !rightActive);
        if (!rightActive) setLeft(false);
    };

    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="card-body w-full">
            <h1 className="text-xl font-bold flex-row">Vote for this mission:</h1>
            <div className="join join-horizontal flex justify-between space-x-5">
                <img src={successCard} alt="Success Card" 
                className={`w-60 border-6 ${leftActive ? 'border-blue-400' : 'border-transparent'}`}
                onClick={handleLeft}
                />
                <img src={failCard} alt="Fail Card" 
                className={`w-60 border-6 ${rightActive ? 'border-blue-400' : 'border-transparent'}`} 
                onClick={handleRight}
                />
            </div>
            <div className="flex-row"><FunctionButton label="Submit" /></div>
        </div>
        </div>
    );
};

export default SuccessFailCard;

