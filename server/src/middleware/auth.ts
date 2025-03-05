import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { Request, Response } from 'express';

require('dotenv').config();
const AUTH_KEY = process.env.AUTH_KEY;

/**
 * Type representing a request with a username provided
 */
export type AuthorizedRequest = Request & { user: string };

/**
 * Middleware that requires a user to be authenticated and provides their username to route handlers
 */
export function requireAuth(req: AuthorizedRequest, res: Response, next: () => void) {
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
