import express from 'express';
import Stats from '../models/stats.js';
import User from '../models/user.js';
import { requireAuth } from '../middleware/auth.js';
import { Router, Request, Response } from 'express';

// Set up the Express router
const router = Router();
router.use(requireAuth);

/**
 * Removes fields from a stat block that should not be exposed to the client
 */
function statsToJson(stats: any): any {
    let json: { [P in keyof typeof stats]?: typeof stats[P]; } = stats.toJSON();
    delete json.user;
    delete json._id;
    delete json.__v;
    return json;
}

// Fetches stats for a given username (or the currently authenticated user, if omitted)
router.get('/:forUser?', async (req: Request, res: Response) => {
    // Fetch stats for the user
    const forUser = req.params.forUser ?? res.locals.user;
    const stats = await Stats.findOne({ username: req.params.forUser });

    // Check if the stat block exists
    if (!stats) {
        // If the user exists but the stat block doesn't, create it
        const user = await User.findOne({ username: forUser });
        if (user) {
            // Creating the stat block record should initialize to defaults (zeroes)
            const newStats = await Stats.create({ user: forUser });
            res
                .status(200)
                .json(statsToJson(newStats));
            return;
        }

        // If the user doesn't exist, return a 404
        res
            .status(404)
            .json({ message: "User does not exist" });
        return;
    }

    // Respond
    res
        .status(200)
        .json(statsToJson(stats));
});

export default router;
