import express from 'express';
import cors from 'cors';
import users from './routes/users.js';
import game from './routes/game.js';

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/users', users);
app.use('/game', game);

app.listen(PORT, () => {
    console.log(`Avalon server listening on port ${PORT}`);
});
