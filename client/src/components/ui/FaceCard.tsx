import { useState } from "react";
import { Role, Roles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";

interface Props {
    role: Role;
    status: boolean;
}

const FaceCard: React.FC<Props> = ({ role, status = true }) => {
  const lobby = ClientLobby.getInstance();
  const [isGrayScale, setIsGrayScale] = useState(status);

  const handleClick = () => {
    setIsGrayScale((prevStatus) => !prevStatus);
    lobby.setEnabledRoles(!isGrayScale ? lobby.enabledRoles | role.role : lobby.enabledRoles & (Roles.ANY & ~(role.role)));
  }

  let grayScaleVal = !isGrayScale ? 100 : 0;
  let grayScale = `grayscale(${grayScaleVal}%)`;

  return (
    <div className="card bg-base-100 w-60 shadow-sm h-[380px] flex flex-col" onClick={handleClick}>
        <figure>
            <img
                src={role.image}
                alt={role.name}
                style={{ objectFit: 'cover', maxHeight: 300, filter: grayScale }}
                width="100%"
            />
        </figure>
        <div className="card-body flex flex-col justify-between flex-grow">
          <h2 className="card-title">{role.name}</h2>
          <p style={{ height: '90px' }} className="overflow-hidden">
            {role.description}
          </p>
        </div>
    </div>
  );
}

export default FaceCard;
