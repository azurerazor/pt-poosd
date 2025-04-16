import { Request, Response, Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import MobileGame from '../models/mobile_game.js';
import { MOBILE_ROLES } from '@common/game/mobile.js';

// Set up the Express router
const router = Router();
router.use(requireAuth);

/**
 * Removes fields from a mobile game block that should not be exposed to the client
 */
function gameToJson(game: any): any {
    let json: { [P in keyof typeof game]?: typeof game[P]; } = game.toJSON();
    delete json.user;
    delete json._id;
    delete json.__v;
    return json;
}

// Fetches mobile game history for the authenticated user
router.get('/get/:num?', async (req: Request, res: Response) => {
    // Fetch games for the user
    const user = res.locals.user;
    const docs = await MobileGame.find({ user })
        .sort({ timeStarted: -1 })
        .limit(parseInt(req.params.num) || 100);

    // Return a list of all games played by the user
    const games = docs.map(gameToJson);

    // Respond
    res
        .status(200)
        .json({ games });
});

// Posts a new mobile game to the user's history
router.post('/put', async (req: Request, res: Response) => {
    const user = res.locals.user;
    const { timeStarted, numPlayers, goodWin, roles, missionOutcomes } = req.body;

    // Validate input
    if (timeStarted === undefined
        || numPlayers === undefined
        || goodWin === undefined
        || roles === undefined
        || missionOutcomes === undefined
        || !Array.isArray(roles)
        || !Array.isArray(missionOutcomes)
    ) {
        res
            .status(400)
            .json({ message: "Missing required fields" });
        return;
    }
    if (numPlayers < 5 || numPlayers > 10) {
        res
            .status(400)
            .json({ message: "Invalid number of players" });
        return;
    }
    if (goodWin !== true && goodWin !== false) {
        res
            .status(400)
            .json({ message: "Invalid goodWin value" });
        return;
    }
    for (const role of roles) {
        if (!MOBILE_ROLES.includes(role)) {
            res
                .status(400)
                .json({ message: "Invalid role" });
            return;
        }
    }
    if (missionOutcomes.length != 5) {
        res
            .status(400)
            .json({ message: "Invalid mission outcomes" });
        return;
    }

    // Check if a game already exists with this start time
    const existingGame = await MobileGame.findOne({ user, timeStarted });
    if (existingGame) {
        res
            .status(403)
            .json({ message: "Game already exists" });
        return;
    }

    // Create the new game
    await MobileGame.create({
        user,
        timeStarted,
        numPlayers,
        goodWin,
        roles,
        missionOutcomes,
    });

    // Respond
    res
        .status(200)
        .json({ message: "Game created successfully" });
});

export default router;
