import mongoose from 'mongoose';

export const statsSchema = new mongoose.Schema({
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

const Stats = mongoose.model('Stats', statsSchema);
export default Stats;
