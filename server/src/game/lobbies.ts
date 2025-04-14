import { ServerLobby } from "./lobby";
import { getSocket } from "./sockets";

/**
 * In-memory store for lobbies mapped by ID
 */
const lobbies: Map<string, ServerLobby> = new Map();

/**
 * Maps player names to their active lobby IDs
 */
const playerLobbies: Map<string, string> = new Map();

/**
 * Gets the lobby with the given ID, or null if it doesn't exist
 */
export function getLobbyById(lobbyId: string): ServerLobby | null {
    return lobbies.get(lobbyId) || null;
}

/**
 * Gets the active lobby for a given player, or null if one is not alive
 */
export function getActiveLobby(player: string): ServerLobby | null {
    const lobbyId = playerLobbies.get(player);
    if (!lobbyId) return null;

    return lobbies.get(lobbyId) || null;
}

/**
 * Updates the active lobby for a given player
 * 
 * If the lobbyId is null, the player is removed from any lobby
 */
export function setActiveLobby(player: string, lobbyId: string | null): void {
    if (lobbyId) playerLobbies.set(player, lobbyId);
    else playerLobbies.delete(player);
}

/**
 * Adds a lobby to the store
 */
export function putLobby(lobby: ServerLobby): void {
    if (lobbies.has(lobby.id)) {
        throw new Error(`Lobby with ID ${lobby.id} already exists`);
    }
    lobbies.set(lobby.id, lobby);
    for (const player of lobby.getPlayers()) {
        playerLobbies.set(player.username, lobby.id);
    }
}

/**
 * Deletes a lobby from the store
 */
export function deleteLobby(lobbyId: string): void {
    const lobby = lobbies.get(lobbyId);
    if (lobby) {
        lobbies.delete(lobbyId);
        for (const player of lobby.getPlayers()) {
            playerLobbies.delete(player.username);
        }
    }

    // Disconnect sockets from the room
    getSocket()
        .in(lobbyId)
        .socketsLeave(lobbyId);
}

/**
 * Gets a lobby by its ID
 */
export function getLobby(lobbyId: string): ServerLobby | null {
    return lobbies.get(lobbyId) || null;
}
