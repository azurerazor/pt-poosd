import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { Request, Response } from 'express';

require('dotenv').config();
const AUTH_KEY = process.env.AUTH_KEY;

// Middleware to check for user authentication
function requireAuth(req: Request & { user: string }, res: Response, next: () => void) {
    // Check for the token
    const token = req.cookies.token;
    if (!token) {
        res
            .status(401)
            .json({ message: "Unauthorized" });
        return;
    }

    // Check authenticity
    jwt.verify(token, AUTH_KEY, async (err, data) => {
        if (err) {
            res
                .status(401)
                .json({ message: "Unauthorized" });
            return;
        }

        // Check if the user exists
        const user = await User.findOne({ username: data.username });
        if (!user) {
            res
                .status(401)
                .json({ message: "Invalid token" });
            return;
        }

        const guy = (typeof user);

        // All good
        req.user = user.username;
        next();
    });
}

export default requireAuth;
