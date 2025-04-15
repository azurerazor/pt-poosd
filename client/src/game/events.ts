import { DisconnectEvent, EventBroker, EventPacket, GameEvent, ReadyEvent } from "@common/game/events";
import { Lobby } from "@common/game/state";
import { ClientLobby } from "./lobby";
import { acquireSocket } from "./socket";

/**
 * Describes an event handler for the client
 */
export type ClientEventHandler<T extends GameEvent> = (state: ClientLobby, event: T) => void;

export class ClientEventBroker extends EventBroker {
    /**
     * The singleton instance of the client event broker
     */
    private static instance: ClientEventBroker | null = null;

    /**
     * The username of the local user
     */
    private username: string;

    /**
     * The authenticated user's JWT for sending with events
     */
    private token: string;

    /**
     * The client socket connection
     */
    private socket: SocketIOClient.Socket;

    constructor(username: string, token: string, socket: SocketIOClient.Socket) {
        super();
        this.username = username;
        this.token = token;
        this.socket = socket;
    }

    /**
     * Gets the singleton instance of the client event broker
     */
    public static getInstance(): ClientEventBroker {
        if (this.instance === null) {
            throw new Error("ClientEventBroker not initialized");
        }
        return this.instance;
    }

    /**
     * Initializes the client event broker with the given username and token
     * Opens a socket connection; then we wait to receive either ready or disconnect
     * 
     * Assumes the client lobby has already been initialized
     */
    public static initialize(username: string, token: string): ClientEventBroker {
        // Acquire the socket connection
        const lobby_id = ClientLobby.getInstance().id;
        const socket = acquireSocket(lobby_id, token);

        // Set up the event broker
        this.instance = new ClientEventBroker(username, token, socket);

        // Handle connection error
        // FIXME: Verify connect_error and disconnect handling
        socket.on('connect_error', (err: Error) => {
            console.error("Connection error:", err);

            // Dispatch a disconnect event so the client will clean up
            ClientEventBroker.instance!.dispatch(
                ClientLobby.getInstance(),
                new DisconnectEvent(err.message));
        });

        // Register event callbacks
        socket.on('event', (packet: EventPacket) => {
            ClientEventBroker.instance!.receive(packet);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            // Dispatch a disconnect event so the client will clean up
            console.log("Lost socket connection");
            ClientEventBroker.instance!.dispatch(
                ClientLobby.getInstance(),
                new DisconnectEvent("Socket closed"));
        });

        return this.instance;
    }

    /**
     * Forces a socket disconnect when leaving a lobby
     */
    public static disconnect(): void {
        if (!this.instance) return;
        this.instance.socket.close();
    }

    /**
     * Sends an event to the other side
     */
    public send<T extends GameEvent>(event: T): void {
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

    /**
     * Registers a client-side handler on the singleton event broker
     */
    public static on<T extends GameEvent>(event: string, callback: ClientEventHandler<T>): ClientEventBroker {
        return this.instance!.on(event, callback);
    }

    /**
     * Registers a client-side handler on the event broker instance
     */
    public on<T extends GameEvent>(event: string, callback: ClientEventHandler<T>): ClientEventBroker {
        this.register(event, (state: Lobby, event: T) => {
            const clientState = state as ClientLobby;
            callback(clientState, event);
        });
        return this;
    }

    protected getOrigin(): string { return this.username; }
    protected getToken(): string { return this.token; }

    protected sendPacket(_: Lobby, packet: EventPacket): void {
        // Send the packet to the server
        this.socket.emit("event", packet);
    }

    protected getActiveLobby(_: string): Lobby | null {
        return ClientLobby.getInstance();
    }
}
