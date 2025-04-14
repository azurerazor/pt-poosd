import { EventBroker, EventPacket, GameEvent } from "@common/game/events";
import { Lobby } from "@common/game/state";
import jwt from "jsonwebtoken";
import { AUTH_KEY } from "../routes/auth";
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

    protected sendPacket(lobby: Lobby, packet: EventPacket): void {
        const id = lobby.id;
        getSocket().to(id).emit("event", packet);
    }

    protected getActiveLobby(username: string): Lobby | null {
        const lobby = getActiveLobby(username);
        return lobby;
    }

    public receive(packet: EventPacket): void {
        // Validate the packet
        const username = packet.origin;
        const token = packet.token!;

        jwt.verify(token, AUTH_KEY, (err: any, data: any) => {
            if (err) {
                console.error("Invalid token:", err);
                return;
            }

            if (!data.username) {
                console.error("Invalid token data:", data);
                return;
            }

            if (data.username !== username) {
                console.error("Token does not match username:", data.username, username);
                return;
            }

            // All good
            super.receive(packet);
        });
    }
}
