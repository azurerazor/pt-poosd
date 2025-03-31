import GameAvatar from "../ui/GameAvatar";
import GameMission from "../ui/GameMission";
import GameCard from "../ui/GameCard";

export default function Game() {
    return (
        <div className="hero-content w-full text-center m-auto flex-col gap-0 h-screen">

            {/* Top row of users and their avatars */}
            <div className="join join-vertical lg:join-horizontal absolute top-1">
                <GameAvatar
                    username="user1"
                    userCharacter="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    isSelected={false}
                />
                <GameAvatar
                    username="user2"
                    userCharacter="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    isSelected={false}
                />
                <GameAvatar
                    username="user3"
                    userCharacter="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    isSelected={false}
                />
                <GameAvatar
                    username="user4"
                    userCharacter="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    isSelected={false}
                />
                <GameAvatar
                    username="user5"
                    userCharacter="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    isSelected={false}
                />
                <GameAvatar
                    username="user6"
                    userCharacter="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    isSelected={false}
                />
                <GameAvatar
                    username="user7"
                    userCharacter="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    isSelected={false}
                />
            </div>

            {/* Missions */}
            <div className="join join-vertical lg:join-horizontal">
                <GameMission
                    status={false}
                />
                <GameMission
                    status={false}
                />
                <GameMission
                    status={false}
                />
                <GameMission
                    status={false}
                />
                <GameMission
                    status={false}
                />
            </div>

            <div className="absolute bottom-4 right-4 p-2">
                <GameCard
                    img={"https://assets.dized.app/project/1d4f013b-38de-4a55-bf81-f8390b8c4407/en-US/eb51938ff9a3aaa135a6ae051260d1ab/ed963445-6c3d-4c46-b22c-85f17fb3c60e-d41d8cd98f00b204e9800998ecf8427e.png"}
                    status={false}
                />
            </div>
        </div>
    );
}