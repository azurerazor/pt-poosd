import express from 'express';
import db from '../db/connection.js';

const router = express.Router();

router.get('/', async (req, res) => {
    let collection = db.collection('users');
    let users = await collection.find({}).toArray();
    res.json(users).status(200);
});

export default router;
