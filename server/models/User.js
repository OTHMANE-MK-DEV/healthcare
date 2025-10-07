import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["patient", "medecin", "admin"], 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);