import { EventPacket, UpdateEvent } from '@common/game/events';
import { GameState, Lobby } from '@common/game/state';
import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { AUTH_KEY } from '../routes/auth';
import { ServerEventBroker } from './events';
import { getActiveLobby, getLobbyById, setActiveLobby } from './lobbies';
import { ServerLobby } from './lobby';
import { acquireCat } from '../networking/cats';

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
            return next(new Error("Missing lobby ID or auth token"));
        }

        try {
            // Verify the token
            const data: any = jwt.verify(token, AUTH_KEY);
            const user: string = data.username;

            // If the player is in an active lobby, refuse this connection
            const activeLobby = getActiveLobby(user);
            if (activeLobby && activeLobby.id !== lobby) {
                return next(new Error(`Already in a lobby (${activeLobby.id})`));
            }

            // Check if the user is already connected
            if (playerSockets.has(user)) {
                const existingSocket: Socket = playerSockets.get(user) as Socket;
                existingSocket.disconnect(true);
            }

            // Get the lobby object
            const lobbyObj = getLobbyById(lobby);
            if (!lobbyObj) {
                return next(new Error(`Lobby closed or invalid lobby ID`));
            }

            // Check if the lobby is full 
            if (!lobbyObj.getPlayer(user) && lobbyObj.getPlayerCount() > 10) {
                return next(new Error("Lobby is full"));
            }

            // Check if the game has started
            if (!lobbyObj.getPlayer(user) && lobbyObj.state.state !== GameState.LOBBY) {
                return next(new Error("Game has already started"));
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
            console.log("Error validating socket handshake token:", err);
            next(new Error("Invalid token"));
        }
    });

    io!.on('connection', async (socket: Socket) => {
        const user: string = socket.data.username;
        console.log(`User ${user} opened a socket connection`);

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
            let reassignedHost = false;
            if (lobby.state.state === GameState.LOBBY) {
                lobby.removePlayer(user);

                // If the lobby is now empty, close it
                if (lobby.getConnectedPlayerCount() === 0) {
                    console.log(`Lobby ${lobby.id} is empty, removing`);
                    lobby.close();

                    return;
                }

                // Otherwise, update the host to someone who's still in the lobby
                if (lobby.host === user) {
                    lobby.reassignHost();
                    reassignedHost = true;
                }

                // If the player is in the player ordering, remove them
                const playerOrder = lobby.playerOrder;
                const index = playerOrder.indexOf(user);
                if (index !== -1) {
                    playerOrder.splice(index, 1);
                }
                lobby.playerOrder = playerOrder;
            } else {
                // Otherwise, keep the player in the lobby but disconnect them
                if (!lobby.getPlayer(user)) return;
                lobby.getPlayer(user)!.isConnected = false;
            }

            // If this was the last player, clean up the lobby
            if (lobby.getConnectedPlayerCount() === 0) {
                console.log(`Lobby ${lobby.id} is empty, removing`);
                lobby.close();

                return;
            }

            // Otherwise, update other players in the lobby
            updatePlayers(lobby, event => {
                // Update the host if we did the thing
                if (reassignedHost) event.setHost(lobby.host)
            });
        });

        // Join the lobby, then update all players (now including this one)
        const lobby = getActiveLobby(user);
        if (!lobby) {
            console.log(`User ${user} connected but lobby is null`);
            socket.disconnect(true);
            return;
        }

        // If already in the lobby, just update connection status
        const player = lobby.getPlayer(user);
        if (player) {
            player.isConnected = true;
        } else {
            // If not, check whether the game has started (can't join if it has)
            if (lobby.state.state !== GameState.LOBBY) {
                console.log(`User ${user} connected but game has started`);
                socket.disconnect(true);
                return;
            }

            // If not, add them to the lobby
            lobby.addPlayer(user);

            // Assign the player a new cat image
            const cat = await acquireCat();
            lobby.getPlayer(user)!.avatar = cat;
        }

        // Update the player order
        const playerOrder = lobby.playerOrder;
        if (playerOrder.indexOf(user) === -1) {
            playerOrder.push(user);
            lobby.playerOrder = playerOrder;
        }

        // Update all players in the lobby
        // For ease of use, we send all non-player-specific data to everyone here
        // to ensure the newly connected player gets the whole game state
        updatePlayers(lobby, (event => {
            event
                .setHost(lobby.host)
                .setLeader(lobby.leader)
                .setState(lobby.state)
                .setEnabledRoles(lobby.enabledRoles)
        }));

        // Handle events
        socket.on('event', (packet: EventPacket) => {
            // Check if the lobby still exists
            const lobby = getActiveLobby(packet.origin);
            if (!lobby) {
                console.error(`User ${packet.origin} is sending events to a dead lobby; killing connection`);
                socket.disconnect(true);
                return;
            }

            ServerEventBroker.getInstance().receive(packet);
        });
    });
}

/**
 * Updates all players in a lobby with their copy of the new player map
 * Also update other fields if provided in the callback
 */
export async function updatePlayers(lobby: ServerLobby, extra: (event: UpdateEvent) => void = _ => { }): Promise<void> {
    // Clear the ready map for the active lobby
    lobby.clearReady();

    // Update all sockets in the lobby
    const sockets = await io!.in(lobby.id).fetchSockets();
    sockets.forEach(socket => {
        const username = socket.data.username;
        const event = new UpdateEvent()
            .setPlayers(lobby.getPlayerMapFor(username))
            .setPlayerOrder(lobby.playerOrder);
        extra(event);

        const packet = new EventPacket(
            event.type,
            event.write(),
            'server',
        );
        socket.emit('event', packet);
    });
}

/**
 * Gets the socket for a given player
 */
export function getPlayerSocket(username: string): Socket | null {
    return playerSockets.get(username) || null;
}
