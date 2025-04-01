import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { Request, Response } from 'express';

require('dotenv').config();
const AUTH_KEY = process.env.AUTH_KEY!;

/**
 * Acquires a signed JWT token for a user
 */
function acquireToken(username: string): string {
    return jwt.sign({ username }, AUTH_KEY, { expiresIn: '3d' });
}

/**
 * Registers a new user
 */
export async function register(req: Request, res: Response, next: () => void) {
    try {
        // Validate the request
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            res
                .status(400)
                .json({ message: "Missing one or more required fields" });
            return;
        }

        // Check if a user with this email or username already exists
        const by_email = await User.findOne({ email });
        if (by_email) {
            res
                .status(403)
                .json({ message: "Email is already in use" });
            return;
        }
        const by_username = await User.findOne({ username });
        if (by_username) {
            res
                .status(403)
                .json({ message: "Username is already in use" });
            return;
        }

        // Create the new user and authenticate
        await User.create({ email, username, password });
        const token = acquireToken(username);

        // Respond (duh)
        res
            .status(201)
            .cookie('token', token, { httpOnly: false })
            .json({ message: "User successfully created" });
        next();
    } catch (err) {
        // Uh oh!
        console.error(err);
        res
            .status(500)
            .json({ message: "Internal server error" });
    }
}

/**
 * Logs a user in
 */
export async function login(req: Request, res: Response, next: () => void) {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res
                .status(400)
                .json({ message: "Username and password are required" });
            return;
        }

        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            res
                .status(401)
                .json({ message: "User does not exist" });
            return;
        }

        // Check the password
        const auth = await bcrypt.compare(password, user.password);
        if (!auth) {
            res
                .status(401)
                .json({ message: "Invalid password" });
            return;
        }

        // Authenticate
        const token = acquireToken(username);

        // Respond
        res
            .status(200)
            .cookie('token', token, { httpOnly: false })
            .json({ message: "User successfully logged in" });
        next();
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Internal server error" });
    }
}

/**
 * Logs a user out
 */
export async function logout(_: Request, res: Response) {
    res
        .status(200)
        .clearCookie('token')
        .json({ message: "User successfully logged out" });
}
