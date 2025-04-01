import { useState } from "react";

interface Props {
    img: string;
    status: boolean;
}

const GameCard: React.FC<Props> = ({ img, status = false }) => {
  const [isVisible, setIsVisible] = useState(status);

  const handleClick = () => {
    setIsVisible((prevStatus) => !prevStatus);
  }

  const visibleVal = isVisible ? 0 : 1;

  return (
    <div className="card bg-base-100 w-60 shadow-sm" onClick={handleClick} >
        <figure>
            <img
                src={img}
                alt="Shoes"
                style={{ objectFit: 'cover', maxHeight: 300 }}
                width="100%"
            />
        </figure>
        <div className="card-body">
            <h2 className="card-title">Percival</h2>
            <p>He knows merlin.</p>
        </div>
        <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "gray",
              opacity: visibleVal,
              borderRadius: "0.375rem",
            }}
        />
    </div>
  );
}

export default GameCard;