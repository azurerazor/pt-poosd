import { Player } from "./player";
import { getRoles, role_requirements, Roles } from "./roles";

export enum GameState {
    /**
     * In the lobby (not yet started)
     */
    LOBBY = "lobby",

    /**
     * Displaying roles/information
     */
    ROLE_REVEAL = "role_reveal",

    /**
     * Selecting a team
     */
    TEAM_SELECTION = "team_selection",

    /**
     * Voting on a team
     */
    TEAM_VOTE = "team_vote",

    /**
     * Performing a mission
     */
    MISSION = "mission",

    /**
     * Guessing Merlin
     */
    MERLIN_GUESS = "merlin_guess",

    /**
     * Game over / displaying results
     */
    RESULTS = "results",
}

export enum Outcome {
    /**
     * The mission has not yet been completed
     */
    NONE = "none",

    /**
     * The mission was successful
     */
    SUCCESS = "success",

    /**
     * The mission failed
     */
    FAILURE = "failure",
}

export class LobbyState {
    /**
     * The current phase of the game
     */
    public state: GameState = GameState.LOBBY;

    /**
     * The current round, if applicable
     */
    public round: number = -1;

    /**
     * Round outcomes, if applicable
     */
    public outcomes: Outcome[] | null = null;

    /**
     * The current team being proposed or on a mission, if applicable
     */
    public team: string[] | null = null;
}

/**
 * Describes all information (on the server) or all known information
 * (on the client) about an active lobby and its state.
 * 
 * No logic is done in the Lobby class's methods; they are instead
 * hooked up to event registries on either side.
 */
export class Lobby {
    /**
     * The lobby ID / join code
     */
    public id: string;

    /**
     * The username of the lobby host/owner
     */
    public host: string;

    /**
     * The username of the current leader (team proposer)
     * Null if a game is not in progress
     */
    public leader: string | null = null;

    /**
     * The current game state
    */
    public state: LobbyState;

    /**
     * The set of enabled roles
    */
    public enabledRoles: Roles = Roles.DEFAULT_ROLES;

    /**
     * The order of players for display and leader selection
     * Randomly shuffled at the start of the game
     */
    public playerOrder: string[] = [];

    /**
     * The info + state of all users in the lobby
     */
    private players: Map<string, Player>;

    /**
     * A callback to run when closing the lobby
    */
    private onClose: (() => void);

    public constructor(id: string, host: string, onClose: () => void) {
        this.id = id;
        this.host = host;
        this.state = new LobbyState();

        this.players = new Map<string, Player>([[host, new Player(host, true)]]);
        this.onClose = onClose;
    }

    /**
     * Closes the lobby and runs the appropriate sided callback
     */
    public close(): void { this.onClose(); }

    /**
     * Gets the appropriate number of evil players for the current number of players
     */
    public getEvilPlayerCount(): number {
        const num_players = this.getPlayerCount();

        // Source: Avalon rulebook
        if (num_players <= 6) return 2;
        if (num_players <= 9) return 3;
        return 4;
    }

    /**
     * Sets the enabled roles for the lobby
     */
    public setEnabledRoles(roles: Roles): void {
        this.enabledRoles = roles;
    }

    /**
     * Checks whether the role set is valid for this number of players
     */
    public isValidRoleset(): boolean {
        const num_players = this.getPlayerCount();

        // Ensure there are no more evil roles than the number of evil players
        const evil_roles = this.enabledRoles & Roles.EVIL & ~Roles.MINION_OF_MORDRED;
        const num_evil = getRoles(evil_roles).length;
        if (num_evil > this.getEvilPlayerCount()) return false;

        // Ensure there are no more good roles than the number of good players
        const good_roles = this.enabledRoles & Roles.GOOD;
        const num_good = getRoles(good_roles).length;
        if (num_good > num_players - this.getEvilPlayerCount()) return false;

        // Ensure all roles have their required roles present
        for (const role of getRoles(this.enabledRoles)) {
            const requires = role_requirements[role.role];
            if ((this.enabledRoles & requires) != requires) return false;
        }

        return true;
    }

    /**
     * Reassigns the lobby host to a new player if they are connected
     * Returns false if the player is not in the lobby or not currently connected
     */
    public setHost(newHost: string): boolean {
        // Get the player object for the new host
        const player = this.getPlayer(newHost);
        if (!player || !player.isConnected) return false;

        // Unset the previous host
        if (this.players.has(this.host)) {
            const oldHost = this.getPlayer(this.host);
            if (oldHost) {
                oldHost.isHost = false;
            }
        }

        // Set the new host
        this.host = newHost;
        player.isHost = true;

        return true;
    }

    /**
     * Sets the lobby leader to a new player if they are connected
     * Returns false if the player is not in the lobby or not currently connected
     */
    public setLeader(newLeader: string): boolean {
        // Get the player object for the new leader
        const player = this.getPlayer(newLeader);
        if (!player || !player.isConnected) return false;

        // Unset the previous leader
        if (this.leader) {
            const oldLeader = this.getPlayer(this.leader);
            if (oldLeader) {
                oldLeader.isLeader = false;
            }
        }

        // Set the new leader
        this.leader = newLeader;
        player.isLeader = true;

        return true;
    }

    /**
     * Adds a player to the lobby
     * Returns false if the player was already in the lobby
     */
    public addPlayer(username: string): boolean {
        // Check if the player is already in the lobby
        if (this.players.has(username)) return false;

        // Otherwise, add to both player map and the ordering
        this.players.set(username, new Player(username));
        this.playerOrder.push(username);

        return true;
    }

    /**
     * Removes a player from the lobby
     * Returns false if the player was not in the lobby
     */
    public removePlayer(username: string): boolean {
        if (!this.players.has(username)) return false;

        // Remove the player from the player order
        const index = this.playerOrder.indexOf(username);
        this.playerOrder.splice(index, 1);

        // Remove the player from the players map
        this.players.delete(username);

        return true;
    }

    /**
     * Sets the player's connection status
     * Returns true if the player was found and their status was changed
     */
    public setPlayerConnected(username: string, connected: boolean): boolean {
        const player = this.getPlayer(username);
        if (!player) return false;

        player.isConnected = connected;
        return true;
    }

    /**
     * Sets the player's avatar
     * Returns true if the player was found and their avatar was changed
     */
    public setPlayerAvatar(username: string, avatar: string): boolean {
        const player = this.getPlayer(username);
        if (!player) return false;

        player.avatar = avatar;
        return true;
    }

    /**
     * Sets the player's possible role set
     * Returns true if the player was found and their role set was changed
     */
    public setPlayerRoles(username: string, role: Roles): boolean {
        const player = this.getPlayer(username);
        if (!player) return false;

        player.role = role;
        return true;
    }


    /**
     * Returns the number of players in the lobby
     */
    public getPlayerCount(): number {
        return this.players.size;
    }

    /**
     * Returns the number of currently connected players in the lobby
     */
    public getConnectedPlayerCount(): number {
        return Array.from(this.players.values()).filter((player) => player.isConnected).length;
    }

    /**
     * Returns a list of all players in the lobby
     */
    public getPlayers(): Player[] {
        return Array.from(this.players.values());
    }

    /**
     * Returns a list of all connected players in the lobby
     */
    public getConnectedPlayers(): Player[] {
        return Array.from(this.players.values()).filter((player) => player.isConnected);
    }

    /**
     * Returns the player object for the given username
     */
    public getPlayer(username: string): Player | null {
        const player = this.players.get(username);
        if (player) return player;
        return null;
    }
}
