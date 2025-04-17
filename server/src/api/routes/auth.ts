import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "@api/models/User.js";
import { validatePassword, validateUsername } from "@common/util/validation.js";

require("dotenv").config();
export const AUTH_KEY = process.env.AUTH_KEY!;

/**
 * Acquires a signed JWT token for a user
 */
function acquireToken(username: string): string {
  return jwt.sign({ username }, AUTH_KEY, { expiresIn: "3d" });
}

/**
 * Registers a new user
 */
export async function register(req: Request, res: Response, next: () => void) {
  try {
    const { username, password } = req.body;

    // Validate the username
    const [username_valid, username_error] = validateUsername(username);
    if (!username_valid) {
      res.status(400).json({ message: username_error });
      return;
    }

    // Validate the password
    const [password_valid, password_error] = validatePassword(password);
    if (!password_valid) {
      res.status(400).json({ message: password_error });
      return;
    }

    // Check if a user with this username already exists
    const by_username = await User.findOne({ username });
    if (by_username) {
      res.status(403).json({ message: "Username is already in use" });
      return;
    }

    // Create the new user
    const user = await User.create({ username, password });

    // Respond (duh)
    const token = acquireToken(username);
    res
      .status(201)
      .cookie("token", token, { httpOnly: false })
      .json({ message: "User successfully created" });
    next();
  } catch (err) {
    // Uh oh!
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Logs a user in
 */
export async function login(req: Request, res: Response, next: () => void) {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ message: "Username and password are required" });
      return;
    }

    // Find the user
    const user = await User.findOne({ username });
    if (!user) {
      res.status(401).json({ message: "User does not exist" });
      return;
    }

    // Check the password
    const auth = await bcrypt.compare(password, user.password);
    if (!auth) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    // Authenticate
    const token = acquireToken(username);

    // Respond
    res
      .status(200)
      .cookie("token", token, { httpOnly: false })
      .json({ message: "User successfully logged in" });
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Logs a user out
 */
export async function logout(_: Request, res: Response) {
  res
    .status(200)
    .clearCookie("token")
    .json({ message: "User successfully logged out" });
}
