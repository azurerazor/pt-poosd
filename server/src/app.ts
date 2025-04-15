import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

import http from 'http';
import { Server } from 'socket.io';
import { bootstrapEvents } from './game/logic.js';
import { initializeSockets } from './game/sockets.js';
import { login, logout, register, verifyEmail } from './routes/auth.js';
import game from './routes/game.js';
import get_user from './routes/get_user.js';
import stats from './routes/stats.js';

// Constants (duh)
require('dotenv').config();
const PORT = process.env.PORT!;
const MONGO_URI = process.env.MONGO_URI!;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN!;

// Callback for allowed CORS origins
const CLIENT_ORIGIN_PATTERN = `https?:\\/\\/(?:\\w+.)*${CLIENT_ORIGIN}(?::\\d+)?`;
const CLIENT_ORIGIN_REGEX = new RegExp(CLIENT_ORIGIN_PATTERN);
function checkOrigin(origin: string | undefined, callback: (err: Error | null, origin?: string) => void) {
    if (origin && CLIENT_ORIGIN_REGEX.test(origin)) {
        return callback(null, origin);
    }
    callback(null, 'none');
}

// Connect to the MongoDB Atlas database
mongoose
    .connect(MONGO_URI)
    .then(() => { console.log("Connected to MongoDB Atlas") })
    .catch(err => { console.error(err) });

// Set up the Express app
const app = express();
app.use(cors({
    origin: checkOrigin,
    credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Set up the socket.io server
const httpServer = http.createServer(app);
const ioServer = new Server(httpServer, {
    cors: {
        origin: checkOrigin,
        methods: ["GET", "POST"],
        credentials: true
    }
});
initializeSockets(ioServer);
bootstrapEvents();

// Auth routes
app.post('/api/register', register);
app.post('/api/login', login);
app.post('/api/logout', logout);
app.post('/api/verify/:token', verifyEmail);

// Protected routes
app.use('/api/get_user', get_user);
app.use('/api/stats', stats);
app.use('/api/game', game);

// Listen for incoming requests
httpServer.listen(PORT, () => {
    console.log(`Avalon server listening on port ${PORT}`);
});
