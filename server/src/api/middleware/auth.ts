import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import User from "@api/models/User";

require("dotenv").config();
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
  jwt.verify(token, AUTH_KEY, async (err: any, data: any) => {
    if (err) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if the user exists
    const user = await User.findOne({ username: data.username });
    if (!user) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }

    // TODO: Check whether the user has verified their email address

    // All good
    res.locals.user = user.username;
    next();
  });
}
