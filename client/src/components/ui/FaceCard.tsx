import React from "react";

const FaceCard: React.FC = () => {
  return (
    <div className="card bg-base-100 w-60 shadow-sm">
        <figure>
            <img
                src="https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"
                alt="Shoes"
                style={{objectFit: 'cover', maxHeight: 300}}
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