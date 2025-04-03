import { useState } from "react";
import { Role } from "../../../../common/game/roles";

interface Props {
    role: Role;
    status: boolean;
}

const FaceCard: React.FC<Props> = ({ role, status = true }) => {
  const [isGrayScale, setIsGrayScale] = useState(status);

  const handleClick = () => {
    setIsGrayScale((prevStatus) => !prevStatus);
  }

  let grayScaleVal = !isGrayScale ? 100 : 0;
  let grayScale = `grayscale(${grayScaleVal}%)`;

  return (
    <div className="card bg-base-100 w-60 shadow-sm" onClick={handleClick} >
        <figure>
            <img
                src={role.image}
                alt={role.name}
                style={{ objectFit: 'cover', maxHeight: 300, filter: grayScale }}
                width="100%"
            />
        </figure>
        <div className="card-body">
            <h2 className="card-title">{role.name}</h2>
            <p>{role.description}</p>
        </div>
    </div>
  );
}

export default FaceCard;
