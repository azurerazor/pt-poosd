import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "http";
import mongoose from "mongoose";

import get_user from "@api/routes/get_user.js";
import history from "@api/routes/history.js";
import stats from "@api/routes/stats.js";

import auth from "@api/routes/auth.js";

import "@common/game/roles.js";
import "@common/game/game.js";

// Constants (duh)
import {} from "dotenv/config";
const PORT = process.env.PORT!;
const MONGO_URI = process.env.MONGO_URI!;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN!;

// Callback for allowed CORS origins
const CLIENT_ORIGIN_PATTERN = `https?:\\/\\/(?:\\w+.)*${CLIENT_ORIGIN}(?::\\d+)?`;
const CLIENT_ORIGIN_REGEX = new RegExp(CLIENT_ORIGIN_PATTERN);
function checkOrigin(
  origin: string | undefined,
  callback: (err: Error | null, origin?: string) => void,
) {
  if (origin && CLIENT_ORIGIN_REGEX.test(origin)) {
    return callback(null, origin);
  }
  callback(null, "none");
}

// Connect to the MongoDB Atlas database
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error(err);
  });

// Set up the Express app
const app = express();
app.use(
  cors({
    origin: checkOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

// Set up the socket.io server
const httpServer = http.createServer(app);
// const ioServer = new Server(httpServer, {
//   cors: {
//     origin: checkOrigin,
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });
// initializeSockets(ioServer);
// bootstrapEvents();

app.use("/api/auth", auth);
app.use("/api/get_user", get_user);
app.use("/api/stats", stats);
app.use("/api/game_history", history);

// Listen for incoming requests
httpServer.listen(PORT, () => {
  console.log(`Avalon server listening on port ${PORT}`);
});
