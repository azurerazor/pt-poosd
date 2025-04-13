import jwt from 'jsonwebtoken';
import { AUTH_KEY } from '../routes/auth';
import { Server, Socket } from 'socket.io';

/**
 * Map of usernames to their sockets
 */
const playerSockets: Map<string, Socket> = new Map();

/**
 * The actual socket.io server instance
 */
let io: Server | null = null;

/**
 * Gets the socket.io server instance
 */
export function getSocket(): Server { return io!; }

/**
 * Bootstraps listeners for the socket.io server
 */
export function initializeSockets(server: Server): void {
    // Store the socket.io server instance
    io = server;

    // Handle socket authentication
    io.use((socket: Socket, next: any) => {
        const lobby: string = socket.handshake.query.lobby as string;
        const token: string = socket.handshake.query.token as string;
        if (!lobby || !token) {
            return next(new Error("Handshake failed: missing lobby ID or auth token"));
        }

        try {
            // Verify the token
            const data: any = jwt.verify(token, AUTH_KEY);
            const user: string = data.username;

            // Check if the user is already connected
            if (playerSockets.has(user)) {
                const existingSocket: Socket = playerSockets.get(user) as Socket;
                existingSocket.disconnect(true);
            }

            // Store the socket in the map and join the lobby
            playerSockets.set(user, socket);
            socket.join(lobby);

            // All good
            next();
        } catch (err) {
            next(new Error("Handshake failed: invalid token"));
        }
    });
}

/**
 * Gets the socket for a given player
 */
export function getPlayerSocket(username: string): Socket | null {
    return playerSockets.get(username) || null;
}
