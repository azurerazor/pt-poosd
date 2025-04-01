import { getRoles, Role, Roles } from "./roles";

export class Player {
    /**
     * The username of the player
     */
    public username: string;

    /**
     * Whether the player is the host
     */
    public isHost: boolean;

    /**
     * Whether the player is currently connected
     */
    public isConnected: boolean = true;

    /**
     * The player's selected avatar
     */
    public avatar: string = "default";

    /**
     * This player's set of possible roles, if applicable.
     * 
     * When a game is not currently active, this is null on both sides.
     * 
     * On the client, this is set for any player we have information on
     * (e.g. Percival will have this field set for himself, for Merlin, and
     * for Morgana, the first of which will be `PERCIVAL` and the latter of
     * which will both be `MERLIN | MORGANA`).
     * 
     * On the server, this is set to a definitive role for all players.
     */
    public role: Roles | null;

    /**
     * If in an active game, and we have information on this player, gets
     * the list of possibilities for their role.
     * 
     * Otherwise, returns null.
     */
    public getPossibleRoles(): Role[] | null {
        if (this.role) {
            return getRoles(this.role);
        }
        return null;
    }

    public constructor(username: string, host: boolean = false, role: Roles | null = null) {
        this.username = username;
        this.isHost = host;
        this.role = role;
    }
}
