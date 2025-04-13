import { useHiddenContext } from "../../util/hiddenContext";
import { Player } from "../../../../common/game/player";
import { Role } from "../../../../common/game/roles";
import { useUser } from '../../util/auth';
import { ClientLobby } from "../../game/lobby";


interface Props {
  role: Role;
}

const RoleRevealInfo: React.FC<Props> = ({ role }) => {

  return (
<div className="join-item tooltip" data-tip={role.name}>
      <div className="avatar">
        <div className="w-14 rounded border-2">
          <img src={role.image} alt={role.name} />
        </div>
      </div>
    </div>
  );
};

export default RoleRevealInfo;
