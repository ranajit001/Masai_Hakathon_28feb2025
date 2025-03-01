import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim:true },
    // username: { type: String, required: true, unique: true, trim:true },
    email: { type: String, required: true, unique: true , trim:true  },
    password: { type: String, required: true , trim:true },
    profilePic: { type: String, default: "" , trim:true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);


export const UserModel = mongoose.model("User", userSchema);
