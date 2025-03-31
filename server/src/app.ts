import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import { login, logout, register } from './routes/auth.js';
import game from './routes/game.js';
import get_user from './routes/get_user.js';
import stats from './routes/stats.js';

// Constants (duh)
require('dotenv').config();
const PORT = process.env.PORT!;
const MONGO_URI = process.env.MONGO_URI!;

// Connect to the MongoDB Atlas database
mongoose
    .connect(MONGO_URI)
    .then(() => { console.log("Connected to MongoDB Atlas") })
    .catch(err => { console.error(err) });

// Set up the Express app
const app = express();
app.use(cors()); // TODO: https://stackoverflow.com/a/69988063 ?
app.use(cookieParser());
app.use(express.json());

// Auth routes
app.post('/api/register', register);
app.post('/api/login', login);
app.post('/api/logout', logout);

// Protected routes
app.use('/api/get_user', get_user);
app.use('/api/stats', stats);
app.use('/api/game', game);

// Do the thing
app.listen(PORT, () => {
    console.log(`Avalon server listening on port ${PORT}`);
});
