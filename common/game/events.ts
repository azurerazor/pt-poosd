import { Alignment, Roles } from "./roles";
import { Lobby, LobbyState } from "./state";

/**
 * An event data container passed between the client and server
 */
export abstract class GameEvent {
    /**
     * The event type identifier
     */
    public type: string;

    /**
     * The origin of this event
     */
    public origin: string = "";

    public constructor(type: string) {
        this.type = type;
    }

    /**
     * Reads the event data from a JSON object
     */
    public abstract read(json: any): void;

    /**
     * Writes the event data to a JSON object
     */
    public abstract write(): any;
}

/**
 * Describes a packed event with type identifier, data and origin
 */
export class EventPacket {
    /**
     * The event type identifier
     */
    public type: string;

    /**
     * The event data
     */
    public data: any;

    /**
     * The origin of this event
     * 
     * If sent from the server, this is "server"
     * If sent from the client, this is the originating client's username
     */
    public origin: string;

    /**
     * If sent from the client, this is the JWT token of the authenticated user
     * If sent from the server, this will be null
     */
    public token: string | null;

    public constructor(type: string, data: any, origin: string, token: string | null = null) {
        this.type = type;
        this.data = data;
        this.origin = origin;
        this.token = token;
    }

}

/**
 * Describes an event handler for either side
 */
export type EventHandler<T extends GameEvent> = (state: Lobby, event: T) => void;

/**
 * Describes a sided registry for sending and receiving events
 */
export abstract class EventBroker {
    /**
     * Maps event type identifiers to concrete event classes
     */
    protected static eventTypes: Map<string, new () => GameEvent> = new Map();

    /**
     * Registers an event type with a concrete class
     */
    public static registerEvent(type: string, event: new () => GameEvent): void {
        this.eventTypes.set(type, event);
    }

    /**
     * The registered event handlers
     */
    private handlers: Map<string, EventHandler<any>[]> = new Map();

    /**
     * Gets the origin for packets sent from this side
     * 
     * On the client, this is the username of the authenticated user
     * On the server, this is always "server"
     */
    protected abstract getOrigin(): string;

    /**
     * Gets the token to send with packets from this side
     * 
     * On the client, this is the JWT token of the authenticated user
     * On the server, this is always null
     */
    protected getToken(): string | null { return null; }

    /**
     * Sends an actual event packet to the other side
     */
    protected abstract sendPacket(lobby: Lobby, packet: EventPacket): void;

    /**
     * Gets the active lobby state for a given username, or null if none
     * 
     * On the client, always returns the active lobby (username is ignored)
     * On the server, returns the lobby the user is in
     */
    protected abstract getActiveLobby(username: string): Lobby | null;

    /**
     * Registers an event handler for a given event type
     */
    public register<T extends GameEvent>(type: string, handler: EventHandler<T>): void {
        if (!this.handlers.has(type)) this.handlers.set(type, []);
        this.handlers.get(type)!.push(handler);
    }

    /**
     * Dispatches an event to all registered handlers
     */
    public dispatch(lobby: Lobby, event: GameEvent): void {
        const handlers = this.handlers.get(event.type);
        handlers?.forEach(handler => handler(lobby, event));
    }

    /**
     * Receives an event from a packet, instantiates it and
     * dispatches to all registered handlers for a given lobby state
     */
    public receive(packet: EventPacket): void {
        // Get the event type to instantiate
        const eventType = EventBroker.eventTypes.get(packet.type);
        if (!eventType) return;

        // Rebuild the event
        const event = new eventType();
        event.origin = packet.origin;
        event.read(packet.data);

        // Get the active lobby state and dispatch the event
        const lobby = this.getActiveLobby(packet.origin)!;
        this.dispatch(lobby, event);
    }

    /**
     * Sends an event to the other side
     */
    public sendTo<T extends GameEvent>(lobby: Lobby, event: T): void {
        // Create the event packet
        const origin = this.getOrigin();
        const packet = new EventPacket(
            event.type,
            event.write(),
            origin,
            this.getToken());

        // Send the packet
        this.sendPacket(lobby, packet);
    }
}

/**
 * Triggered on the client when a connection is established and
 * the current state has been fetched from the server
 */
export class ReadyEvent extends GameEvent {
    public constructor() { super("ready"); }

    public read(json: any): void { }
    public write(): any { return {}; }
}

/**
 * Triggered on the client when disconnected for any reason
 * This might be instead of a "ready" event if the initial
 * connection was unsuccessful (e.g. invalid lobby ID)
 * 
 * When received on the client, should show a dialog and leave
 * the lobby page (back to dashboard)
 */
export class DisconnectEvent extends GameEvent {
    public reason: string;
    public constructor(reason: string = "") {
        super("disconnect");
        this.reason = reason;
    }

    public read(json: any): void { this.reason = json.reason; }
    public write(): any { return { reason: this.reason! }; }
}

/**
 * Sent from the client (only valid from the host) to update
 * the set of enabled roles
 * 
 * When received on the server, an update event is dispatched
 * to clients:
 *  - If the new role list was valid, the update will contain
 *    the new role list
 *  - Otherwise, the update will contain the old role list
 *    (so as to resync the host's role set display)
 */
export class SetRoleListEvent extends GameEvent {
    public roles: Roles;
    public constructor(roles: Roles = Roles.DEFAULT_ROLES) {
        super("set_role_list");
        this.roles = roles;
    }

    public read(json: any): void { this.roles = json.roles; }
    public write(): any { return { roles: this.roles }; }
}

/**
 * Triggered on the client after the lobby state has changed
 * and the view should update
 * 
 * This describes a general change in the lobby state; the event
 * will have non-null values for any properties that have changed
 * on the lobby
 * 
 * Note that player statuses can change, e.g. the client might
 * now become the host of the lobby or players might be removed
 * entirely
 * 
 * If the state changed, might need some sweeping changes to view
 * (e.g. if game started, switch to the game view)
 */
export class UpdateEvent extends GameEvent {
    /**
     * The current game state, if updated
     */
    public state: LobbyState | null = null;

    /**
     * The username of the new lobby host, if updated
     */
    public host: string | null = null;

    /**
     * The username of the new leader, if updated
     */
    public leader: string | null = null;

    /**
     * The set of enabled roles, if updated
     */
    public enabledRoles: Roles | null = null;

    /**
     * The info + state of all users in the lobby, if updated
     */
    public players: Map<string, any> | null = null;
    /**
     * The new player order, if updated
     */
    public playerOrder: string[] | null = null;

    public constructor() { super("update"); }

    public setHost(host: string): UpdateEvent {
        this.host = host;
        return this;
    }

    public setLeader(leader: string): UpdateEvent {
        this.leader = leader;
        return this;
    }

    public setState(state: LobbyState): UpdateEvent {
        this.state = state;
        return this;
    }

    public setEnabledRoles(roles: Roles): UpdateEvent {
        this.enabledRoles = roles;
        return this;
    }

    public setPlayers(players: Map<string, any>): UpdateEvent {
        this.players = players;
        return this;
    }

    public setPlayerOrder(order: string[]): UpdateEvent {
        this.playerOrder = order;
        return this;
    }

    public read(json: any): void {
        this.playerOrder = json.player_order || null;
        this.host = json.host || null;
        this.leader = json.leader || null;
        this.state = json.state || null;
        this.enabledRoles = json.enabled_roles || null;
        if (json.players) {
            this.players = new Map<string, any>();
            for (const [username, player] of Object.entries(json.players)) {
                this.players.set(username, player);
            }
        }
    }

    public write(): any {
        let json: any = {};
        if (this.playerOrder) json.player_order = this.playerOrder;
        if (this.host) json.host = this.host;
        if (this.leader) json.leader = this.leader;
        if (this.state) json.state = this.state;
        if (this.enabledRoles) json.enabled_roles = this.enabledRoles;
        if (this.players) {
            json.players = {};
            for (const [username, player] of this.players.entries()) {
                json.players[username] = player.toJSON();
            }
        }
        return json;
    }
}

/**
 * Sent from the client (only valid from the host) to trigger
 * the start of the game
 * 
 * If preconditions are not met (e.g. not enough players),
 * nothing will happen
 * 
 * Otherwise an update event will be sent to all clients with
 * the new game state
 */
export class StartGameEvent extends GameEvent {
    public constructor() { super("start_game"); }

    public read(json: any): void { }
    public write(): any { return {}; }
}

/**
 * Sent to all clients when the game starts and roles should be
 * revealed. The client will already have received an update event
 * (and responded with ready) containing the player's information.
 */
export class RoleRevealEvent extends GameEvent {
    public constructor() { super("role_reveal"); }

    public read(json: any): void { }
    public write(): any { return {}; }
}

/**
 * Sent by the leader to propose a team for the next mission
 */
export class TeamProposalEvent extends GameEvent {
    public team: string[];
    public constructor(team: string[] = []) {
        super("team_proposal");
        this.team = team;
    }

    public read(json: any): void { this.team = json.team; }
    public write(): any { return { team: this.team }; }
}

/**
 * Sent to all clients when a team proposal is made and they
 * should show a vote dialog
 */
export class TeamVoteEvent extends GameEvent {
    public players: string[];

    public constructor(players: string[] = []) {
        super("team_vote");
        this.players = players;
    }

    public read(json: any): void { this.players = json.players; }
    public write(): any { return { players: this.players }; }
}

/**
 * Sent from client to the server when voting on a team proposal
 */
export class TeamVoteChoiceEvent extends GameEvent {
    public vote: boolean;

    public constructor(vote: boolean = true) {
        super("team_vote_choice");
        this.vote = vote;
    }

    public read(json: any): void { this.vote = json.vote; }
    public write(): any { return { vote: this.vote }; }
}

/**
 * Sent to all clients when a team vote has passed and a mission
 * is in progress
 * 
 * When received on the client, if the player is on the team,
 * shows a mission dialog to select an outcome
 * 
 * players is technically redundant, but included for ease of use
 */
export class MissionEvent extends GameEvent {
    public players: string[];

    public constructor(players: string[] = []) {
        super("mission");
        this.players = players;
    }

    public read(json: any): void { this.players = json.players; }
    public write(): any { return { players: this.players }; }
}


/**
 * Sent from the client to the server when selecting a mission
 * outcome (pass or fail)
 */
export class MissionChoiceEvent extends GameEvent {
    public pass: boolean;

    public constructor(pass: boolean = false) {
        super("mission_choice");
        this.pass = pass;
    }

    public read(json: any): void { this.pass = json.pass; }
    public write(): any { return { pass: this.pass }; }
}

/**
 * Sent to clients to indicate the mission outcome should be displayed.
 * Information in this event is redundant since it's already provided
 * by the update, but it's here for ease of use.
 */
export class MissionOutcomeEvent extends GameEvent {
    public pass: boolean;
    public numFails: number;
    public constructor(pass: boolean = false, numFails: number = 0) {
        super("mission_outcome");
        this.pass = pass;
        this.numFails = numFails;
    }

    public read(json: any): void {
        this.pass = json.pass;
        this.numFails = json.numFails;
    }

    public write(): any {
        return {
            pass: this.pass,
            numFails: this.numFails
        };
    }
}

/**
 * Sent to clients when enough missions have passed and evil
 * players have the chance to pick out Merlin
 * 
 * If the assassin role is enabled, only the assasin should
 * be able to send in a vote
 * 
 * Otherwise, all evil players can send a MerlinGuessEvent
 */
export class AssassinationEvent extends GameEvent {
    public constructor() {
        super("assassination");
    }

    public read(json: any): void { }
    public write(): any { return {}; }
}

/**
 * Sent from the client to vote for who an evil player thinks
 * Merlin is
 * 
 * If the assassin role is enabled, this event is ignored for
 * any origin other than the assassin
 * 
 * Otherwise, the vote considers all evil players
 */
export class AssasinationChoiceEvent extends GameEvent {
    public guess: string;

    public constructor(guess: string = "") {
        super("assassination_choice");
        this.guess = guess;
    }

    public read(json: any): void { this.guess = json.guess; }
    public write(): any { return { guess: this.guess }; }
}

/**
 * Sent to clients with the results of the game
 * 
 * These results should be displayed until an update event sets
 * the game state back to the lobby (triggered by the host)
 */
export class GameResultEvent extends GameEvent {
    /**
     * Which alignment won the game
     */
    public winner: Alignment;

    /**
     * The message to display to the players
     */
    public message: string;

    /**
     * The player that was assassinated, if any
     */
    public assassinated: string | null = null;

    public constructor(winner: Alignment = Alignment.GOOD, message: string = "", assassinated: string | null = null) {
        super("game_result");
        this.winner = winner;
        this.message = message;
        this.assassinated = assassinated;
    }

    public static goodWin(): GameResultEvent {
        return new GameResultEvent(Alignment.GOOD, "The evil players couldn't find Merlin!");
    }

    public static guessedMerlin(): GameResultEvent {
        return new GameResultEvent(Alignment.EVIL, "The evil players found Merlin!");
    }

    public static evilWin(): GameResultEvent {
        return new GameResultEvent(Alignment.EVIL, "The good players couldn't stop Mordred!");
    }

    public read(json: any): void {
        this.winner = json.winner;
        this.message = json.message || "";
        this.assassinated = json.assassinated || null;
    }

    public write(): any {
        return {
            winner: this.winner,
            message: this.message,
            assassinated: this.assassinated
        };
    }
}

/**
 * Sent by the host after game results are displayed to
 * request sending all players back to the lobby
 */
export class BackToLobbyEvent extends GameEvent {
    public constructor() { super("back_to_lobby"); }

    public read(json: any): void { }
    public write(): any { return {}; }
}

/**
 * Register all event types with the event broker
 */
EventBroker.registerEvent("ready", ReadyEvent);
EventBroker.registerEvent("disconnect", DisconnectEvent);
EventBroker.registerEvent("set_role_list", SetRoleListEvent);
EventBroker.registerEvent("update", UpdateEvent);
EventBroker.registerEvent("start_game", StartGameEvent);
EventBroker.registerEvent("role_reveal", RoleRevealEvent);
EventBroker.registerEvent("team_proposal", TeamProposalEvent);
EventBroker.registerEvent("team_vote", TeamVoteEvent);
EventBroker.registerEvent("team_vote_choice", TeamVoteChoiceEvent);
EventBroker.registerEvent("mission", MissionEvent);
EventBroker.registerEvent("mission_choice", MissionChoiceEvent);
EventBroker.registerEvent("mission_outcome", MissionOutcomeEvent);
EventBroker.registerEvent("assassination", AssassinationEvent);
EventBroker.registerEvent("assassination_choice", AssasinationChoiceEvent);
EventBroker.registerEvent("game_result", GameResultEvent);
EventBroker.registerEvent("back_to_lobby", BackToLobbyEvent);
