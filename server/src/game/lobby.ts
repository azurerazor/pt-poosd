import { Lobby } from "@common/game/state";
import { deleteLobby } from "./lobbies";

export class ServerLobby extends Lobby {
    private readonly readySet: Set<string> = new Set();
    private onReadyCallback: (lobby: ServerLobby) => void = () => { };

    constructor(id: string, host: string) {
        super(id, host, () => { deleteLobby(id); });
    }

    /**
     * Marks a player as ready.
     * 
     * If all connected players are ready, triggers the onReady callback.
     */
    public setReady(username: string): void {
        this.readySet.add(username);
        
        // Check if all players are ready (or disconnected)
        for (const player of this.getPlayers()) {
            if (!player.isConnected) continue;
            if (!this.readySet.has(player.username)) {
                return;
            }
        }

        // All players are ready
        this.onReadyCallback(this);
        this.onReadyCallback = () => { }; // Reset the callback
        this.readySet.clear(); // Clear the ready map
    }

    /**
     * Sets a callback to run the next time everyone in this lobby is ready.
     * Ignores disconnected players.
     * 
     * The callback is reset after it is called.
     */
    public onReady(callback: (lobby: ServerLobby) => void): void {
        this.onReadyCallback = callback;
    }

    /**
     * Clears the ready map; does NOT reset the callback.
     */
    public clearReady(): void {
        this.readySet.clear();
    }
}
