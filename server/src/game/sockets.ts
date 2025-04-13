import jwt from 'jsonwebtoken';
import { AUTH_KEY } from '../routes/auth';
import { Server, Socket } from 'socket.io';
import { EventPacket, ReadyEvent, UpdateEvent } from '@common/game/events';
import { ServerEventBroker } from './events';
import { deleteLobby, getActiveLobby, setActiveLobby } from './lobbies';
import { GameState, Lobby } from '@common/game/state';

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
    io!.use((socket: Socket, next: any) => {
        const lobby: string = socket.handshake.query.lobby as string;
        const token: string = socket.handshake.query.token as string;
        if (!lobby || !token) {
            return next(new Error("Handshake failed: missing lobby ID or auth token"));
        }

        try {
            // Verify the token
            const data: any = jwt.verify(token, AUTH_KEY);
            const user: string = data.username;

            // If the player is in an active lobby, refuse this connection
            const activeLobby = getActiveLobby(user);
            if (activeLobby && activeLobby.id !== lobby) {
                return next(new Error("Handshake failed: already in a lobby"));
            }

            // Check if the user is already connected
            if (playerSockets.has(user)) {
                const existingSocket: Socket = playerSockets.get(user) as Socket;
                existingSocket.disconnect(true);
            }

            // Set the player's active lobby
            setActiveLobby(user, lobby);

            // Set the username + token in the socket
            socket.data.username = user;
            socket.data.token = token;

            // Store the socket in the map and join the lobby
            playerSockets.set(user, socket);
            socket.join(lobby);

            // All good
            next();
        } catch (err) {
            next(new Error("Handshake failed: invalid token"));
        }
    });

    io!.on('connection', (socket: Socket) => {
        const user: string = socket.data.username;
        console.log(`User ${user} connected`);

        // Handle disconnection
        socket.on('disconnect', async () => {
            console.log(`User ${user} disconnected`);
            playerSockets.delete(user);

            // Find the lobby for this user
            const lobby = getActiveLobby(user);
            if (!lobby) return;

            // Remove the user from the active lobby
            setActiveLobby(user, null);

            // If a game is not active, the user gets removed entirely
            if (lobby.state.state === GameState.LOBBY) {
                lobby.removePlayer(user);
            } else {
                // Otherwise, keep the player in the lobby but disconnect them
                if (!lobby.getPlayer(user)) return;
                lobby.getPlayer(user)!.isConnected = false;
            }

            // If the player is in the player ordering, remove them
            const playerOrder = lobby.playerOrder;
            const index = playerOrder.indexOf(user);
            if (index !== -1) {
                playerOrder.splice(index, 1);
            }
            lobby.playerOrder = playerOrder;

            // If this was the last player, clean up the lobby
            if (lobby.getPlayerCount() === 0) {
                console.log(`Lobby ${lobby.id} is empty, removing`);
                lobby.close();
                deleteLobby(lobby.id);

                return;
            }

            // Update other players in the lobby
            updatePlayers(lobby);
        });

        // Join the lobby, then update all players (now including this one)
        const lobby = getActiveLobby(user);
        if (!lobby) {
            console.log(`User ${user} connected but not in a lobby! Disconnecting...`);
            socket.disconnect(true);
            return;
        }

        // If already in the lobby, just update connection status
        const player = lobby.getPlayer(user);
        if (player) {
            player.isConnected = true;
        } else {
            // If not, add them to the lobby
            lobby.addPlayer(user);
        }

        // Update the player order
        const playerOrder = lobby.playerOrder;
        if (playerOrder.indexOf(user) === -1) {
            playerOrder.push(user);
            lobby.playerOrder = playerOrder;
        }

        // Update all players in the lobby
        updatePlayers(lobby);

        // Handle events
        socket.on('event', ServerEventBroker.getInstance().receive);

        // Send the ready event
        ServerEventBroker.getInstance()
            .sendTo(lobby, socket, new ReadyEvent());
    });
}

/**
 * Updates all players in a lobby with their copy of the new player map
 * Also update other fields if provided in the callback
 */
export async function updatePlayers(lobby: Lobby, extra: (event: UpdateEvent) => void = _ => { }): Promise<void> {
    const sockets = await io!.in(lobby.id).fetchSockets();
    sockets.forEach(socket => {
        const username = socket.data.username;
        const event = new UpdateEvent()
            .setPlayers(lobby.getPlayerMapFor(username))
            .setPlayerOrder(lobby.playerOrder);
        extra(event);
        socket.emit('event', event);
    });
}

/**
 * Gets the socket for a given player
 */
export function getPlayerSocket(username: string): Socket | null {
    return playerSockets.get(username) || null;
}
