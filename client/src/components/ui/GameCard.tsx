import { useHiddenContext } from "../../util/hiddenContext";
import { Role } from "../../../../common/game/roles";

interface Props {
    role: Role;
}

const GameCard: React.FC<Props> = ({ role }) => {
  const { isHidden, setIsHidden } = useHiddenContext();

  const handleClick = () => {
    setIsHidden((prevStatus: boolean) => !prevStatus);
  }
  const visibleVal = isHidden ? 1 : 0;

  return (
    <div className="flex items-center gap-4 h-[380px]">
      <div className="card join-item bg-base-100 w-60 shadow-sm h-[380px] flex flex-col" onClick={handleClick}>
        <figure>
          <img
            src={role.image}
            alt={role.name}
            style={{ objectFit: "cover", maxHeight: 300 }}
            width="100%"
          />
        </figure>
        <div className="card-body flex flex-col justify-between flex-grow">
          <h2 className="card-title">{role.name}</h2>
          <p style={{ height: "90px" }} className="overflow-hidden">
            {role.description}
          </p>
        </div>
        <div
          style={{
            position: "absolute",
            top: -2,
            left: -2,
            right: 0,
            bottom: 0,
            backgroundColor: "gray",
            opacity: visibleVal,
            borderRadius: "0.375rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <p className="text-white text-lg font-semibold">Click to view role</p>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
