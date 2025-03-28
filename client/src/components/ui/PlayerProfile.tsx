import React from "react";

interface Props {
    username: string;
    userCharacter: string;
    isHost?: boolean;
}

const PlayerProfile: React.FC<Props> = ({ username, userCharacter, isHost = false }) => {
    
    const host = isHost ? "👑" : "";

    return (
        <div className="card card-border bg-base-100 w-96">
            <div className="p-4 flex gap-4 justify-between">
                <div className="flex gap-4">
                    <div className="avatar">
                        <div className="ring-primary ring-offset-base-100 w-14 rounded-full ring ring-offset-2">
                            <img src={userCharacter} />
                        </div>
                    </div>
                    <h2 className="card-title text-xl">{username}</h2>
                </div>
                <div className="flex justify-center items-center">
                    <h2 className="text-3xl">{host}</h2>
                </div>
            </div>
        </div>
    )
}

export default PlayerProfile;