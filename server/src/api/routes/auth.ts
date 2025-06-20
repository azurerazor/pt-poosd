import { Router } from "express";

import { login, logout, register } from "@api/controllers/AuthController.js";

// Set up the Express router
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
