import { Request, Response, Router } from 'express';
import { getLobby, putLobby } from '../game/lobbies.js';
import { ServerLobby } from '../game/lobby.js';
import { requireAuth } from '../middleware/auth.js';
import { acquireCat } from '../networking/cats.js';

// Set up the Express router
const router = Router();
router.use(requireAuth);

// Creates a new lobby and returns its code
router.get('/create', async (req: Request, res: Response) => {
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

    // Assign a cat to the host
    const cat = await acquireCat();
    lobby.getPlayer(user)!.avatar = cat;

    console.log(`Lobby ${lobbyId} created by ${user}`);

    // Set a timer to delete this lobby after 5 minutes
    // if nobody has joined
    setTimeout(() => {
        const lobby = getLobby(lobbyId);
        if (!lobby) return;

        if (lobby.getConnectedPlayerCount() === 0) {
            console.log(`Lobby ${lobbyId} has been inactive for 5 minutes. Deleting...`);
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
