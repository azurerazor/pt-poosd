import { Lobby } from "@common/game/state";

class ClientLobby extends Lobby {
    private static instance: ClientLobby | null = null;

    public static getInstance(): ClientLobby {
        // TODO: Placeholder; initializes a fake lobby connection
        if (this.instance === null) {
            this.instance = new ClientLobby("abcdef", "the_host", () => {});
        }
        return this.instance;
    }
}
