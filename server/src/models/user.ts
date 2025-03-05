import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    // Email address (unique)
    email: {
        type: String,
        required: [true, 'Email address is required'],
        unique: true,
    },
    // The plaintext username (unique; used as an identifier)
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
    },
    // The hashed password
    password: {
        type: String,
        required: [true, 'Password is required'],
    }
});

userSchema.pre('save', async function () {
    this.password = await bcrypt.hash(this.password, 12);
});


const User = mongoose.model('User', userSchema);
export default User;
