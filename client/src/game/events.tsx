import { GameEvent, EventBroker, EventPacket, DisconnectEvent } from "@common/game/events";
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

        // Register event callbacks
        socket.on("event", this.instance!.receive);
        socket.on("disconnect", () => {
            // Dispatch a disconnect event so the client will clean up
            this.instance!.dispatch(
                ClientLobby.getInstance(),
                new DisconnectEvent("Lost connection"));
        });

        return this.instance;
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
