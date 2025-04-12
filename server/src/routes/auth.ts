import { EMAIL_REGEX, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_REGEX } from '@common/util/validation.js';
import bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { sendEmail } from '../networking/mail.js';

require('dotenv').config();
const AUTH_KEY = process.env.AUTH_KEY!;

/**
 * Acquires a signed JWT token for a user
 */
function acquireToken(username: string): string {
    return jwt.sign({ username }, AUTH_KEY, { expiresIn: '3d' });
}

/**
 * Gets an email verification link for a user with the given token
 */
function getVerificationLink(token: string): string {
    return `${process.env.CLIENT_ORIGIN}/verify?token=${token}`;
}

/**
 * Sends a verification email to the given user
 */
async function sendVerificationEmail(username: string, email: string, token: string): Promise<boolean> {
    const body = `<h1>Verify your email address for Escavalon</h1>
<h2>Hello, ${username}!</h2>
<p>Thank you for registering for Escavalon! To verify your email address, please click the link below:</p>
<p><a href="${getVerificationLink(token)}">verify your email address</a></p>
<p>If you did not try to create an account, please ignore this email.</p>

<!-- Prevent Gmail from clipping here -->
<span style="opacity: 0">${Date.now()}</span>
`;

    const response = await sendEmail({
        from: 'Escavalon <io@escavalon.quest>',
        to: email,
        subject: 'Escavalon: Verify email address',
        html: body,
    });

    // Check for errors
    if (response.error) {
        console.error(response.error);
        return false;
    }

    return true;
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

        // Validate fields
        if (!EMAIL_REGEX.test(email)) {
            res
                .status(400)
                .json({ message: "Invalid email address" });
            return;
        }
        if (!USERNAME_REGEX.test(username) || username.length < USERNAME_MIN_LENGTH || username.length > USERNAME_MAX_LENGTH) {
            res
                .status(400)
                .json({ message: `Invalid username: must be ${USERNAME_MIN_LENGTH}-${USERNAME_MAX_LENGTH} letters, numbers, underscores or hyphens` });
            return;
        }
        if (password.length < PASSWORD_MIN_LENGTH || password.length > PASSWORD_MAX_LENGTH) {
            res
                .status(400)
                .json({ message: `Invalid password: must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters long` });
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

        // Create the new user
        const user = await User.create({ email, username, password });

        // Send the verification email
        const token = acquireToken(username);
        const valid = await sendVerificationEmail(username, email, token);

        // If we failed to send the verification email, the email must be invalid
        // Delete the user and return an error
        if (!valid) {
            await user.deleteOne();
            res
                .status(400)
                .json({ message: "Invalid email address" });
            return;
        }

        // Respond (duh)
        res
            .status(201)
            // .cookie('token', token, { httpOnly: false })
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

export async function verifyEmail(req: Request, res: Response) {
    try {
        const { token } = req.params;
        if (!token) {
            res
                .status(400)
                .json({ message: "Missing token" });
            return;
        }

        // Verify the token
        jwt.verify(token, AUTH_KEY, async (err: any, data: any) => {
            if (err) {
                res
                    .status(401)
                    .json({ message: "Invalid token" });
                return;
            }

            // Locate the user
            const user = await User.findOne({ username: data.username });
            if (!user) {
                res
                    .status(401)
                    .json({ message: "Invalid token" });
                return;
            }
            if (user.isVerified) {
                res
                    .status(400)
                    .json({ message: "Email address already verified" });
                return;
            }

            // Verify the email address
            user.isVerified = true;
            await user.save();

            // Respond
            res
                .status(200)
                .json({ message: "Email address successfully verified" });
        });
    } catch (err) {
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

        // TODO: Check for email verification
        // // Check if the user has verified their email address
        // if (!user.isVerified) {
        //     res
        //         .status(401)
        //         .json({ message: "Email address has not been verified" });
        //     return;
        // }

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
