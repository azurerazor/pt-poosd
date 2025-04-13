import { useState, useEffect } from "react";
import { Role, role_dependencies, role_requirements, Roles } from "../../../../common/game/roles";
import { ClientLobby } from "../../game/lobby";
import { useRolesetContext } from "util/rolesetContext";

interface Props {
    role: Role;
    status: boolean;
}

const FaceCard: React.FC<Props> = ({ role, status = true }) => {
  const lobby = ClientLobby.getInstance();
  const {roles, setRoles} = useRolesetContext();
  const isGrayScale = (roles & role.role) === 0;
  console.log(isGrayScale, role.name, roles);

  const handleClick = () => {
    if ((roles & role.role) === 0) {
      // turn on requirements
      setRoles((r: Roles) => (r | role.role | role_requirements[role.role]));
    } else {
      setRoles((r: Roles) => (r & (~role_dependencies[role.role]) & (~role.role)));
    }
  }

  useEffect(() => {
    lobby.setEnabledRoles(roles);
  }, [roles]);

  let grayScaleVal = isGrayScale ? 100 : 0;
  // let grayScale = `grayscale(${grayScaleVal}%)`;

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
