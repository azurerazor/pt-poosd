import { Player } from "../../../../common/game/player";
import { Role, getRoles } from "../../../../common/game/roles";
import { fails, quests } from "../pages/GameFlow";
import RoleRevealInfo from "./RoleRevealInfo";

interface Props {
  outcomes: number[];
  numberOfPlayers: number;
  round: number;
  onClose?: () => void;
}

const MissionRevealCard: React.FC<Props> = ({ outcomes, numberOfPlayers, round, onClose }) => {
  const succy = quests[numberOfPlayers][round]-outcomes[round];
  const fail = outcomes[round];

  const successCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ace_of_spades.svg/1200px-Ace_of_spades.svg.png";
  const failCard = "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Playing_card_heart_A.svg/1200px-Playing_card_heart_A.svg.png";
  
  const verdict = succy > fail ? "Success" : "Fail";

  return (
    <div className="card bg-base-100 shadow-sm">
      <div className="card-body w-full">
          <h1 className="text-xl font-bold flex-row">Mission {verdict}</h1>
          <div className="join join-horizontal flex justify-between space-x-5">
          <div className="flex flex-col items-center">
            <img src={successCard} alt="Success Card" className="w-60 h-5/6" />
            <h2 className="text-xl font-bold mt-2">{succy}</h2>
          </div>
          <div className="flex flex-col items-center">
            <img src={failCard} alt="Fail Card" className="w-60 h-5/6" />
            <h2 className="text-xl font-bold mt-2">{fail}</h2>
          </div>
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

export default MissionRevealCard;
