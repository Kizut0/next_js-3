import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    profileImage: String,
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);