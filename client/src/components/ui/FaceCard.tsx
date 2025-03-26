import React from "react";

const FaceCard: React.FC = () => {
  return (
    <div className="card bg-base-100 w-96 shadow-sm">
        <figure>
            <img
                src="https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"
                alt="Shoes"
                style={{objectFit: 'cover', maxHeight: 400}}
                width="100%"
            />
        </figure>
        <div className="card-body">
            <h2 className="card-title">Percival</h2>
            <p>He knows merlin.</p>
        </div>
    </div>
    // <Card.Root maxH="100%" overflow="hidden" borderWidth="1px" borderRadius="lg" boxShadow="md">
    //   <Image
    //     src=""
    //     alt="percy jackson"
    //     objectFit="cover"
    //     maxH="200px"
    //     w="100%"
    //   />
    //   <Card.Body gap="2" p={2}>
    //     <Card.Title>Percival</Card.Title>
    //     <Card.Description>
    //       He knows merlin
    //     </Card.Description>
    //   </Card.Body>
    // </Card.Root>
  );
}

export default FaceCard;