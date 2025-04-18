import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import User from "@api/models/User.js";

dotenv.config();
const AUTH_KEY = process.env.AUTH_KEY!;

/**
 * Middleware that requires a user to be authenticated and provides their username to route handlers
 */
export function requireAuth(req: Request, res: Response, next: () => void) {
  // Check for the token
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  // Check authenticity
  jwt.verify(token, AUTH_KEY, async (err: unknown, data: unknown) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (data instanceof Object && "username" in data) {
      const user = await User.findOne({ username: data.username });
      if (user) {
        // TODO: Check whether the user has verified their email address
        // All good
        res.locals.user = user.username;
        return next();
      }
    }
    res.status(401).json({ message: "Invalid token" });
  });
}
