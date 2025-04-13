import { Alignment, Roles } from "./roles";
import { Lobby, LobbyState } from "./state";

/**
 * An event data container passed between the client and server
 */
export abstract class Event {
    /**
     * The event type identifier
     */
    public type: string;

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
export type EventHandler<T extends Event> = (state: Lobby, event: T) => void;

/**
 * Describes a sided registry for sending and receiving events
 */
export abstract class EventBroker {
    /**
     * Maps event type identifiers to concrete event classes
     */
    private eventTypes: Map<string, new () => Event>;

    /**
     * The registered event handlers
     */
    private handlers: Map<string, EventHandler<any>[]>;

    public constructor() {
        this.eventTypes = new Map<string, new () => Event>();
        this.handlers = new Map<string, EventHandler<any>[]>();
    }

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
    public register<T extends Event>(type: string, handler: EventHandler<T>): void {
        if (!this.handlers.has(type)) this.handlers.set(type, []);
        this.handlers.get(type)!.push(handler);
    }

    /**
     * Dispatches an event to all registered handlers
     */
    public dispatch(lobby: Lobby, event: Event): void {
        const handlers = this.handlers.get(event.type);
        handlers?.forEach(handler => handler(lobby, event));
    }

    /**
     * Receives an event from a packet, instantiates it and
     * dispatches to all registered handlers for a given lobby state
     */
    public receive(packet: EventPacket): void {
        // Get the event type to instantiate
        const eventType = this.eventTypes.get(packet.type);
        if (!eventType) return;

        // Rebuild the event
        const event = new eventType();
        event.read(packet.data);

        // Get the active lobby state and dispatch the event
        const lobby = this.getActiveLobby(packet.origin)!;
        this.dispatch(lobby, event);
    }

    /**
     * Sends an event to the other side
     */
    public send<T extends Event>(event: T): void {
        // Create the event packet
        const origin = this.getOrigin();
        const packet = new EventPacket(
            event.type,
            event.write(),
            origin,
            this.getToken());

        // Send the packet
        const lobby = this.getActiveLobby(origin)!;
        this.sendPacket(lobby, packet);
    }
}

/**
 * Triggered on the client when a connection is established and
 * the current state has been fetched from the server
 */
export class ReadyEvent extends Event {
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
export class DisconnectEvent extends Event {
    public reason: string;
    public constructor(reason: string) {
        super("disconnect");
        this.reason = reason;
    }

    public read(json: any): void { this.reason = json.reason; }
    public write(): any { return { reason: this.reason }; }
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
export class UpdateEvent extends Event {
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
    public enabledRoles: string[] | null = null;

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

    public setEnabledRoles(roles: string[]): UpdateEvent {
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
        this.players = json.players || null;
    }

    public write(): any {
        let json: any = {};
        if (this.playerOrder) json.player_order = this.playerOrder;
        if (this.host) json.host = this.host;
        if (this.leader) json.leader = this.leader;
        if (this.state) json.state = this.state;
        if (this.enabledRoles) json.enabled_roles = this.enabledRoles;
        if (this.players) json.players = this.players;
        return json;
    }
}

/**
 * Sent from the client (only valid from the host) to update
 * the set of enabled roles
 * 
 * When received on the server, if the roleset is valid, an
 * update event is dispatched to all clients
 */
export class SetRoleListEvent extends Event {
    public roles: Roles;
    public constructor(roles: Roles) {
        super("set_role_list");
        this.roles = roles;
    }

    public read(json: any): void { this.roles = json.roles; }
    public write(): any { return { roles: this.roles }; }
}

/**
 * Triggered when a team has been proposed that should be voted for
 * 
 * When received on the server:
 *  - Distributed to clients, if the proposal was valid
 *  - If invalid, the team proposal state update event is sent again
 *    to retrigger a new proposal from the same leader
 * 
 * When received on the client: shows a vote dialog
 */
export class TeamProposalEvent extends Event {
    public players: string[];

    public constructor() {
        super("team_proposal");
        this.players = [];
    }

    public read(json: any): void { this.players = json.players; }
    public write(): any { return { players: this.players }; }
}

/**
 * Sent from client to the server when voting on a team proposal
 */
export class TeamVoteEvent extends Event {
    public vote: boolean;

    public constructor(vote: boolean) {
        super("team_vote");
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
export class MissionStartEvent extends Event {
    public players: string[];

    public constructor() {
        super("mission_start");
        this.players = [];
    }

    public read(json: any): void { this.players = json.players; }
    public write(): any { return { players: this.players }; }
}


/**
 * Sent from the client to the server when selecting a mission
 * outcome (pass or fail)
 */
export class MissionChoiceEvent extends Event {
    public pass: boolean;

    public constructor(pass: boolean) {
        super("mission_choice");
        this.pass = pass;
    }

    public read(json: any): void { this.pass = json.pass; }
    public write(): any { return { pass: this.pass }; }
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
export class AssassinationEvent extends Event {
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
export class MerlinGuessEvent extends Event {
    public guess: string;

    public constructor(guess: string) {
        super("merlin_guess");
        this.guess = guess;
    }

    public read(json: any): void { this.guess = json.guess; }
    public write(): any { return { guess: this.guess }; }
}

/**
 * Sent to clients with the results of the game
 * 
 * An update event will be sent *before* this one that changes
 * the state to RESULTS; a placeholder can be displayed before
 * actual results are received via this event
 */
export class GameResultEvent extends Event {
    public winner: Alignment;

    public constructor(winner: Alignment) {
        super("game_result");
        this.winner = winner;
    }

    public read(json: any): void { this.winner = json.winner; }
    public write(): any { return { winner: this.winner }; }
}
