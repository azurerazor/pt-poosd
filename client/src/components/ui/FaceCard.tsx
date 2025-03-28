import { useState } from "react";

interface Props {
    img: string;
    status: boolean;
}

const FaceCard: React.FC<Props> = ({ img, status = true }) => {
  const [isGrayScale, setIsGrayScale] = useState(status);

  const handleClick = () => {
    setIsGrayScale((prevStatus) => !prevStatus);
  }

  let grayScaleVal = isGrayScale ? 100 : 0;
  let grayScale = `grayscale(${grayScaleVal}%)`;

  return (
    <div className="card bg-base-100 w-60 shadow-sm" onClick={handleClick} >
        <figure>
            <img
                src={img}
                alt="Shoes"
                style={{ objectFit: 'cover', maxHeight: 300, filter: grayScale }}
                width="100%"
            />
        </figure>
        <div className="card-body">
            <h2 className="card-title">Percival</h2>
            <p>He knows merlin.</p>
        </div>
    </div>
  );
}

export default FaceCard;