import React from "react";

const PlayerProfile: React.FC = () => {
    return (
        <div className="card card-border bg-base-100 w-96">
            <div className="p-4 flex gap-4">
                <div className="avatar">
                    <div className="ring-primary ring-offset-base-100 w-14 rounded-full ring ring-offset-2">
                        <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                    </div>
                </div>
                <h2 className="card-title">Username</h2>
            </div>
        </div>
    )
}

export default PlayerProfile;