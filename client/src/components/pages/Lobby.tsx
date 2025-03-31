import React from "react";
import FaceCard from "../ui/FaceCard";
import PlayerProfile from "../ui/PlayerProfile";
import RouteButton from "../misc/RouteButton";
import { useLocation } from 'react-router';


const Lobby: React.FC = () => {
    // Should eventually always be passed
    // Need a random code when first making the lobby
    const location = useLocation();
    const gameCode = location.state ? location.state.gameCode : "ABCDE";
    const gameRoute = `/game/${gameCode}`

    return (
        <>
            <div className="flex justify-center gap-4 p-4 h-screen">
                <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-bold">Lobby Code: {gameCode}</h2>
                        <hr className="mb-2" />
                        <PlayerProfile 
                            username = "user1"
                            userCharacter = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                            isHost = {true}
                        />
                        <PlayerProfile 
                            username = "user2"
                            userCharacter = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                        <PlayerProfile 
                            username = "user3"
                            userCharacter = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                        <PlayerProfile 
                            username = "user4"
                            userCharacter = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                        <PlayerProfile 
                            username = "user5"
                            userCharacter = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                        <PlayerProfile 
                            username = "user6"
                            userCharacter = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                        <PlayerProfile 
                            username = "user7"
                            userCharacter = "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <RouteButton to={gameRoute}>
                            Start
                        </RouteButton>
                        <RouteButton to="/dashboard">
                            Exit
                        </RouteButton>
                    </div>
                </div>

                <div className="grid grid-rows-2 grid-cols-3 gap-4 gap-x-4 justify-between">
                    <FaceCard 
                        img={"https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"}
                        status={false}
                    />
                    <FaceCard 
                        img={"https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"}
                        status={false}
                    />
                    <FaceCard 
                        img={"https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"}
                        status={false}
                    />
                    <FaceCard 
                        img={"https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"}
                        status={false}
                    />
                    <FaceCard 
                        img={"https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"}
                        status={false}
                    />
                    <FaceCard 
                        img={"https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"}
                        status={false}
                    />
                </div>
            </div>
        </>
    );
}

export default Lobby;
