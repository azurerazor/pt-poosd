import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    /**
     * The user's email address (unique)
     */
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
    },
    
    /**
     * The user's username (unique; used as an identifier)
     */
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
    },
    
    /**
     * The user's (hashed) password
     */
    password: {
        type: String,
        required: [true, 'Password is required'],
    },    

    /**
     * Whether the user has verified their email address
     */
    isVerified: {
        type: Boolean,
        default: false,
    },
});

// Hash the user's password before serializing
userSchema.pre('save', async function () {
    this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model('User', userSchema);
export default User;
