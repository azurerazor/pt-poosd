import { DisconnectEvent, ReadyEvent, StartGameEvent, UpdateEvent } from "@common/game/events";
import { ClientEventBroker } from "game/events";
import { ClientLobby } from "game/lobby";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useUser } from "util/auth";

export default function TestPage() {
    const navigate = useNavigate();

    // Get lobby ID from query params
    const urlParams = new URLSearchParams(window.location.search);
    const lobbyId = urlParams.get("id") || "none";

    // Get the username and token
    const { username } = useUser();
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))!
        .split('=')[1];

    // State
    const initialized = useRef(false);

    // Hook the shit up
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        ClientLobby.initialize(lobbyId);
        ClientEventBroker.initialize(username, token);

        ClientEventBroker.on('disconnect', (lobby: ClientLobby, event: DisconnectEvent) => {
            alert("Lost connection: " + event.reason);
        })

        ClientEventBroker.on('ready', (lobby: ClientLobby, event: ReadyEvent) => {
            alert("ready!");
        });

        ClientEventBroker.on('update', (lobby: ClientLobby, event: UpdateEvent) => {
            console.log("Updating state:", event);

            // Send ready
            setTimeout(() => {
                ClientEventBroker.getInstance().send(new ReadyEvent());
            }, 1000);
        });

        setTimeout(() => {
            ClientEventBroker.getInstance().send(new StartGameEvent());
        }, 5 * 1000);
    }, []);

    return (
        <div className="hero-content w-full text-center m-auto flex-col h-screen">
            <div className="flex-row m-auto">
                <h1 className="text-5xl font-bold"><code>{lobbyId}</code></h1>
                <button className="btn mt-4" onClick={() => {
                    navigate('/dashboard');
                }}>leave</button>
            </div>
        </div>
    );
}
