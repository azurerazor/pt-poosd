import express from 'express';
import Stats from '../models/stats.js';
import User from '../models/user.js';
import { requireAuth } from '../middleware/auth.js';
import { Router, Request, Response } from 'express';

// Set up the Express router
const router = Router();
router.use(requireAuth);

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
            const newStats = await Stats.create({ username: forUser });
            res
                .status(200)
                .json(newStats.toJSON());
            return;
        }

        // If the user doesn't exist, return a 404
        res
            .status(404)
            .json({ message: "User does not exist" });
        return;
    }

    // Remove object ID and redundant user field
    const data = stats.toJSON();
    let json: { [P in keyof typeof data]?: typeof data[P]; } = data;
    delete json._id;
    delete json.user;

    // Respond
    res
        .status(200)
        .json(json);
});

export default router;
