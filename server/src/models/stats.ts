import mongoose from 'mongoose';
import { all_roles } from '@common/game/roles.js';

export const statsSchema = new mongoose.Schema({
    /**
     * The username of the user associated with this stat block
     */
    user: {
        type: String,
        required: true,
        unique: true,
    },

    /**
     * Total number of games played
     */
    gamesPlayed: {
        type: Number,
        required: true,
        default: 0,
    },

    /**
     * Total number of games won
     */
    gamesWon: {
        type: Number,
        required: true,
        default: 0,
    },

    /**
     * Number of games played as each role
     */
    gamesPlayedAs: {
        type: Map,
        of: Number,
        required: true,
        default: new Map(),
    },

    /**
     * Number of games won as each role
     */
    gamesWonAs: {
        type: Map,
        of: Number,
        required: true,
        default: new Map(),
    },

    /**
     * Number of games played as a good player
     */
    gamesPlayedAsGood: {
        type: Number,
        required: true,
        default: 0,
    },

    /**
     * Number of games won as a good player
     */
    gamesWonAsGood: {
        type: Number,
        required: true,
        default: 0,
    },

    /**
     * Number of games played as an evil player
     */
    gamesPlayedAsEvil: {
        type: Number,
        required: true,
        default: 0,
    },

    /**
     * Number of games won as an evil player
     */
    gamesWonAsEvil: {
        type: Number,
        required: true,
        default: 0,
    },
});

// Before serializing, set per-role stats to 0 if they don't exist
statsSchema.pre('save', async function () {
    for (let role of all_roles) {
        const name = role.name;
        if (!this.gamesPlayedAs.has(name)) this.gamesPlayedAs.set(name, 0);
        if (!this.gamesWonAs.has(name)) this.gamesWonAs.set(name, 0);
    }
});

const Stats = mongoose.model('Stats', statsSchema);
export default Stats;
