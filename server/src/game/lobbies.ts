import { Lobby } from "@common/game/state";

/**
 * In-memory store for lobbies mapped by ID
 */
const lobbies: Map<string, Lobby> = new Map();

/**
 * Maps player names to their active lobby IDs
 */
const playerLobbies: Map<string, string> = new Map();

/**
 * Gets the active lobby for a given player, or null if one is not alive
 */
export function getActiveLobby(player: string): Lobby | null {
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
