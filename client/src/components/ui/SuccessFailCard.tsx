import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";
import FunctionButton from "../misc/FunctionButton";
import { useState, useEffect } from 'react';
import { MISSION_CHOICE_TIME, SECONDS } from "@common/game/timing";

interface Props {
    player: Player;
    players: Map<string, Player>;
    setSuccessFail: React.Dispatch<React.SetStateAction<boolean | null>>;
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

    const [counter, setCounter] = useState(MISSION_CHOICE_TIME / SECONDS);
    
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

    let successCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ace_of_spades.svg/1200px-Ace_of_spades.svg.png";
    let failCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Playing_card_heart_A.svg/1200px-Playing_card_heart_A.svg.png";

    if(myRole === undefined)return;

    if (myRole.isGood()) {
        failCard = successCard;
    }

    const [leftActive, setLeft] = useState(false);
    const [rightActive, setRight] = useState(false);

    const handleLeft = () => {
        console.log("accepted mission choice");
        if (!leftActive) {
            setSuccessFail(true);
            setRight(false);
            setLeft(leftActive => !leftActive);
        }
    };

    const handleRight = () => {
        console.log("rejected mission choice");
        if (!rightActive) {
            setSuccessFail(failCard === successCard);
            setLeft(false);
            setRight(rightActive => !rightActive);
        }
    };

    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="absolute top-4 right-4">
            <span id="counterElement" className="countdown font-bold">
                {counter}
            </span>
        </div>
        <div className="card-body w-auto join-vertical">
            <h1 className="text-xl font-bold justify-center">Pass or Fail this mission:</h1>
            <div className="join join-horizontal flex-row justify-between space-x-5">
                <img src={"/images/success.png"} alt="Success Card" 
                className={`w-50 border-6 ${leftActive ? 'border-blue-400' : 'border-transparent'}`}
                onClick={handleLeft}
                />
                <img src={`/images/${myRole.isGood() ? 'success' : 'fail'}.png`} alt="Fail Card" 
                className={`w-50 border-6 ${rightActive ? 'border-blue-400' : 'border-transparent'}`} 
                onClick={handleRight}
                />
            </div>
        </div>
        </div>
    );
};

export default SuccessFailCard;

