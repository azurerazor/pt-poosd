import { getRoleByName } from "../../../../common/game/roles";
import RoleRevealInfo from './RoleRevealInfo';

interface Props {
  played: number;
  won: number;
  role?: string;
}

const StatsCard: React.FC<Props> = ({ played, won, role = "Overall" }) => {
  const actualRole =
    getRoleByName(role) === getRoleByName("Servant of Arthur") && role !== "Servant of Arthur"
      ? null
      : getRoleByName(role);

  const percentage = played > 0 ? Math.round((won / played) * 100) : 0;

  return (
    <div className="stats bg-base-200 shadow w-full">
      <div className="stat flex items-center gap-4 w-full">
        {actualRole?.image && (
          <img
            src={actualRole.image}
            alt={actualRole.name}
            className="w-12 h-12 rounded-full border"
          />
        )}
        <div className="w-full">
          <div className="stat-title font-bold">{role ? role : "Overall"}</div>
          <div className="stat-value font-bold">
            {won} / {played}
          </div>
          <div className="stat-desc font-semibold">
            {percentage}% win rate
          </div>
          <progress
            className="progress progress-success w-full mt-2"
            value={percentage}
            max="100"
          ></progress>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
