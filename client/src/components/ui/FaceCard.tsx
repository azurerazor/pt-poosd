import { useState, useEffect } from "react";
import { Role, role_dependencies, role_requirements, Roles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";
import { Player } from "../../../../common/game/player";

interface Props {
    role: Role;
    myPlayer: Player;
    enabledRoles: Roles;
    setEnabledRoles: React.Dispatch<React.SetStateAction<Roles>>;
    status: boolean;
}

const FaceCard: React.FC<Props> = ({ role, myPlayer, enabledRoles, setEnabledRoles, status = true }) => {
  const isGrayScale = (enabledRoles & role.role) === 0;

  const handleClick = () => {
    if(!myPlayer.isHost)return;
    if ((enabledRoles & role.role) === 0) {
      // turn on requirements
      setEnabledRoles((r: Roles) => (r | role.role | role_requirements[role.role]));
    } else {
      setEnabledRoles((r: Roles) => (r & (~role_dependencies[role.role]) & (~role.role)));
    }
  }

  let grayScaleVal = isGrayScale ? 100 : 0;

  return (
    <div className="card bg-base-100 w-60 shadow-sm h-[380px] flex flex-col" onClick={handleClick}>
        <figure>
            <img
                src={role.image}
                alt={role.name}
                style={{ objectFit: 'cover', maxHeight: 300, filter: `grayscale(${grayScaleVal}%)` }}
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
