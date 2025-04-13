import { useHiddenContext } from "../../util/hiddenContext";
import { Player } from "../../../../common/game/player";
import { Roles, getRoles } from "../../../../common/game/roles";
import { useUser } from '../../util/auth';
import { ClientLobby } from "../../game/lobby";


interface Props {
    player: Player;
}

const RoleRevealCard: React.FC<Props> = ({ player }) => {
  const lobby = ClientLobby.getInstance();

  const playersInfo = lobby.getPlayers().filter((player) => player.role);
  let myRole = null;
  let otherRoles = [];
  let otherPlayers = [];

  console.log(playersInfo);
  playersInfo.forEach((player) => {
      if(player.role && getRoles(player.role).length == 1){
        myRole = getRoles(player.role!)[0];
      }else if(player.role){
        otherRoles = getRoles(player.role!);
        otherPlayers.push(player);
      }
  });



  return (
    <div className="card card-side bg-base-100 shadow-sm">
      <figure>
        <img
          src={myRole!.image}
          alt={myRole!.name} 
        />
      </figure>
      <div className="card-body w-full">
        <h1 className="text-xl font-bold flex-row">{myRole!.name}</h1>
        <hr></hr>
        <h2 className="text-l flex-row mb-12">{myRole!.description}</h2>
        <h3 className="text-xl font-bold">Information</h3>

      </div>
    </div>
  );
};

export default RoleRevealCard;
