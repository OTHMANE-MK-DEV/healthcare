import mongoose from "mongoose";


const medecinSchema = new mongoose.Schema({
  CIN: { type: String, required: true, unique: true },
  nom: String,
  prenom: String,
  adresse: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Medecin", medecinSchema);