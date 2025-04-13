import { Lobby } from "@common/game/state";
import { deleteLobby } from "./lobbies";

export class ServerLobby extends Lobby {
    constructor(id: string, host: string) {
        super(id, host, () => { deleteLobby(id); });
    }
}
