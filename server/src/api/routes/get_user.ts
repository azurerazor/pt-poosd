import { Request, Response, Router } from "express";

import { requireAuth } from "@api/middleware/auth.js";

// Set up the Express router
const router = Router();
router.use(requireAuth);

// Returns the current user's name
router.get("/", async (_: Request, res: Response) => {
  // Fetch the current user's name and return it
  const user = res.locals.user;
  res.status(200).json({ username: user });
});

export default router;
