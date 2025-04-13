import { EventBroker, EventPacket, GameEvent } from "@common/game/events";
import { Lobby } from "@common/game/state";
import { Socket } from "socket.io";
import { getActiveLobby } from "./lobbies";
import { ServerLobby } from "./lobby";
import { getSocket } from "./sockets";

/**
 * Describes an event handler for the server
 */
export type ServerEventHandler<T extends GameEvent> = (state: ServerLobby, event: T) => void;

export class ServerEventBroker extends EventBroker {
    /**
     * The singleton instance of the server event broker
     */
    private static instance: ServerEventBroker = new ServerEventBroker();

    /**
     * Gets the singleton instance of the server event broker
     */
    public static getInstance(): ServerEventBroker {
        return this.instance;
    }

    protected getOrigin(): string { return 'server'; }

    /**
     * Registers a server-side handler on the singleton event broker
     */
    public static on<T extends GameEvent>(event: string, callback: ServerEventHandler<T>): ServerEventBroker {
        return this.instance.on(event, callback);
    }

    /**
     * Registers a server-side handler on the event broker instance
     */
    public on<T extends GameEvent>(event: string, callback: ServerEventHandler<T>): ServerEventBroker {
        this.register(event, (state: Lobby, event: T) => {
            const clientState = state as ServerLobby;
            callback(clientState, event);
        });
        return this;
    }

    /**
     * Sends an event to only a specific client socket
     */
    public sendTo<T extends GameEvent>(lobby: Lobby, socket: Socket, event: T): void {
        socket.emit("event", new EventPacket(
            event.type,
            event.write(),
            this.getOrigin(),
            this.getToken()
        ));
    }

    protected sendPacket(lobby: Lobby, packet: EventPacket): void {
        const id = lobby.id;
        getSocket().to(id).emit("event", packet);
    }

    protected getActiveLobby(username: string): Lobby | null {
        const lobby = getActiveLobby(username);
        return lobby;
    }
}
