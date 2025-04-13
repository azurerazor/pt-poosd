import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";

interface Props {
player: Player;
players: Player[];
onClose?: () => void;
}

const SuccessFailCard: React.FC<Props> = ({ player, players, onClose }) => {
    const playersInfo = players.filter((p) => p.role);

    const myRole = getRoles(player.role!)[0];
    let otherRoles = [];
    let otherPlayers = [];

    playersInfo.forEach((p) => {
    if (p.username !== player.username && p.role) {
        otherRoles = getRoles(p.role!);
        otherPlayers.push(p);
    }
    });

    if (myRole === null) return;

    let successCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ace_of_spades.svg/1200px-Ace_of_spades.svg.png";
    let failCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Playing_card_heart_A.svg/1200px-Playing_card_heart_A.svg.png";
    if (myRole.isGood()) {
        failCard = successCard;
    }

    return (
        <div className="card bg-base-100 shadow-sm">
        <div className="card-body w-full">
            <h1 className="text-xl font-bold flex-row">Vote for this mission:</h1>
            <div className="join join-horizontal flex justify-between space-x-5">
                <img src={successCard} alt="Success Card" className="w-60"/>
                <img src={failCard} alt="Fail Card" className="w-60"/>
            </div>
            {onClose && (
            <button
                onClick={onClose}
                className="mt-6 self-end bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
                Continue
            </button>
            )}
        </div>
        </div>
    );
};

export default SuccessFailCard;

