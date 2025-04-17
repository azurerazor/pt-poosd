import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  /**
   * The user's username (unique; used as an identifier)
   */
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
  },

  /**
   * The user's (hashed) password
   */
  password: {
    type: String,
    required: [true, "Password is required"],
  },
});

// Hash the user's password before serializing
userSchema.pre("save", async function () {
  const user = this;

  if (!user.isModified("password")) return;
  user.password = await bcrypt.hash(user.password, 12);
});

const User = mongoose.model("User", userSchema);
export default User;
