import * as crypto from 'crypto';
import { Lobby } from "./state";

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
     * The RSA-SHA256 signature of this event (sans signature)
     * 
     * If sending from the server, this is a plain sha256 hash of the body
     * If sending from the client, this will be signed with the user's JWT
     */
    public signature: string;

    public constructor(type: string, data: any, origin: string, signature: string) {
        this.type = type;
        this.data = data;
        this.origin = origin;
        this.signature = signature;
    }

    /**
     * Creats an event packet and signs it with the given key
     */
    public static createAndSign(type: string, data: any, origin: string, key: string | null): EventPacket {
        // Get the message body to sign
        const body = JSON.stringify({ type, data, origin });

        if (!key) {
            // No key; hash the body instead
            const hash = crypto.hash('sha256', Buffer.from(body), 'base64url');
            return new EventPacket(type, data, origin, hash);
        }

        // Sign the body with the key
        const signature = crypto.sign('sha256', Buffer.from(body), key).toString('base64url');
        return new EventPacket(type, data, origin, signature);
    }

    /** 
     * Verifies the signature of this event packet
     */
    public verify(key: string | null): boolean {
        // Get the message body to verify
        const body = JSON.stringify({ type: this.type, data: this.data, origin: this.origin });

        if (!key) {
            // No key; verify the hash instead
            const hash = crypto.hash('sha256', Buffer.from(body), 'base64url');
            return hash === this.signature;
        }

        // Otherwise verify the signature with the key
        return crypto.verify('sha256', Buffer.from(body), key, Buffer.from(this.signature, 'base64url'));
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
     * Gets the origin to send with events
     * 
     * On the client, this is the username of the logged-in user
     * On the server, this is always "server"
     */
    protected abstract getOrigin(): string;

    /**
     * Gets the JWT signing key if on the client
     * 
     * If called on the server, always returns null
     */
    protected abstract getSigningKey(): string | null;

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
        // Verify the packet signature
        const key = this.getSigningKey();
        if (!packet.verify(key)) {
            console.error("Invalid event signature");
            return;
        }

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
        const packet = EventPacket.createAndSign(
            event.type,
            event.write(),
            origin,
            this.getSigningKey());

        // Send the packet
        const lobby = this.getActiveLobby(origin)!;
        this.sendPacket(lobby, packet);
    }
}

/**
//  * Describes an event passed between the client and server
// */
// export abstract class Event {
//     /**
//      * The event type identifier
//     */
//     abstract type: EventType;

//     /**
//      * The direction of this event
//     */
//     abstract direction: Direction;

//     /**
//      * Whether this event type is only valid from the lobby host
//      * Only set for events sent to the server
//     */
//     abstract hostOnly?: boolean;

//     /**
//      * The user that originated this event
//      * Only set for events sent to the server
//     */
//     user?: string;

//     /**
//      * Apply the event to the given lobby state
//      */
//     abstract apply(state: Lobby): void;
// }

// export enum EventType {
//     /**
//      * Player joined the lobby
//      */
//     PLAYER_JOIN = "player_join",
// }

// abstract class ServerEvent extends Event {
//     direction = Direction.TO_SERVER;
//     hostOnly = false;

//     constructor(public user: string) {
//         super();
//         this.user = user;
//     }
// }

// class PlayerJoinEvent extends ServerEvent {
//     type = EventType.PLAYER_JOIN;

//     apply(state: Lobby): void {
//         // Add the player to the lobby
//         state.playerJoin(this.user);
//     }
// }
