import { Request, Response, Router } from 'express';
import { getLobby, putLobby } from '../game/lobbies.js';
import { ServerLobby } from '../game/lobby.js';
import { requireAuth } from '../middleware/auth.js';

// Set up the Express router
const router = Router();
router.use(requireAuth);

// Creates a new lobby and returns its code
router.post('/create', async (req: Request, res: Response) => {
    // Fetch the current user's name
    const user = res.locals.user;

    // Choose a unique lobby ID
    let lobbyId;
    do {
        lobbyId = Math.random().toString(36).substring(2, 8);
    } while (getLobby(lobbyId));

    // Create the new lobby and add it to the store
    const lobby = new ServerLobby(lobbyId, user);
    putLobby(lobby);

    // Set a timer to delete this lobby after 5 minutes
    // if nobody has joined
    setTimeout(() => {
        const lobby = getLobby(lobbyId);
        if (!lobby) return;

        if (lobby.getConnectedPlayerCount() === 0) {
            lobby.close();
            return;
        }
    }, 5 * 60 * 1000);

    // Return the lobby ID
    res
        .status(201)
        .json({ code: lobby.id });
});

export default router;
