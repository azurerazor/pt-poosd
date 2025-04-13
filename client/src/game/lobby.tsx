import { Lobby } from "@common/game/state";

export class ClientLobby extends Lobby {
    /**
     * The singleton instance of the client lobby
     */
    private static instance: ClientLobby | null = null;

    /**
     * Initializes a lobby with the given ID
     * Should be populated later by the client event broker on ready
     */
    public static initialize(id: string): void {
        this.instance = new ClientLobby(id, "none", () => { });
    }

    public static getInstance(): ClientLobby {
        // TODO: Placeholder; initializes a fake lobby connection
        if (this.instance === null) {
            this.instance = new ClientLobby("abcdef", "the_host", () => { });
        }
        return this.instance;
    }
}
