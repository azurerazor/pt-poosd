import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';

import { register, login, logout } from './routes/auth.js';
import stats from './routes/stats.js';
import game from './routes/game.js';

// Constants (duh)
require('dotenv').config();
const PORT = process.env.PORT!;
const MONGO_URI = process.env.MONGO_URI!;

// Connect to the MongoDB Atlas database
mongoose
    .connect(MONGO_URI)
    .then(() => { console.log("Connected to MongoDB Atlas") })
    .catch((err) => { console.error(err) });

// Set up the Express app
const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
app.post('/register', register);
app.post('/login', login);
app.post('/logout', logout);

// Protected routes
app.use('/stats', stats);
app.use('/game', game);

// Do the thing
app.listen(PORT, () => {
    console.log(`Avalon server listening on port ${PORT}`);
});
