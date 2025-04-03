import { useState, useEffect } from 'react';
import FaceCard from "../ui/FaceCard";
import PlayerProfile from "../ui/PlayerProfile";
import RouteButton from "../misc/RouteButton";
import { Lobby as Lob } from "../../../../common/game/state";
import { getRoles, Roles } from "../../../../common/game/roles";
import { Player } from "../../../../common/game/player"
import { useLocation } from 'react-router';


const Lobby: React.FC = () => {

    // Should eventually always be passed
    // Need a random code when first making the lobby
    const location = useLocation();
    const gameCode = location.state ? location.state.gameCode : "ABCDE";
    const gameRoute = `/game/${gameCode}`

    //TEMP UNTIL LOBBY BACKEND
    let lobby = new Lob(gameCode, "IDK", () => { return; });
    lobby.addPlayer("IDK");
    lobby.addPlayer("user2");
    lobby.addPlayer("user3");
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        setPlayers(lobby.getPlayers());
    }, []);

    let specialRoles = getRoles(Roles.SPECIAL_ROLES);

    return (
        <>
            <div className="flex justify-center gap-4 p-4 h-screen">
                <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-bold">Lobby Code: {gameCode}</h2>
                        <hr className="mb-2" />

                        {players.map((player, idx) => (
                            <PlayerProfile
                                key = {idx}
                                player = {player}
                            />
                        ))}

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
                    
                    {specialRoles.map((role, idx) => (
                        <FaceCard
                            key = {idx}
                            role = {role}
                            status={role.is(lobby.enabledRoles)}
                        />
                    ))}

                </div>
            </div>
        </>
    );
}

export default Lobby;
