import mongoose from 'mongoose';
import { MOBILE_ROLES } from '@common/game/mobile';

export const mobileGameSchema = new mongoose.Schema({
    /**
     * The username of the user associated with this stat block
     */
    user: {
        type: String,
        required: true,
    },

    /**
     * The time the game started
     */
    timeStarted: {
        type: String,
        required: true,
    },

    /**
     * Whether good won
     */
    goodWin: {
        type: Boolean,
        required: true,
    },

    /**
     * Which roles were enabled
     */
    roles: {
        type: [String],
        enum: MOBILE_ROLES,
        required: true,
    },

    /**
     * Outcomes for each of the five missions (null if the mission didn't happen)
     */
    missionOutcomes: {
        type: [Boolean],
        required: true,
        validate: {
            validator: function (v: boolean[]) {
                return v.length === 5;
            }
        },
    }
});

// Make username and time started unique per document
mobileGameSchema.index({ user: 1, timeStarted: 1 }, { unique: true });

/**
 * Describes a single past game played by a mobile user
 */
const MobileGame = mongoose.model('MobileGame', mobileGameSchema);
export default MobileGame;
