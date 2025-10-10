import mongoose from "mongoose";


const medecinSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  CIN: { type: String, required: true, unique: true },
  nom: String,
  prenom: String,
  adresse: String,
  specialite: {
    type: String,
    required: false
  },
  experience: {
    type: Number,
    required: false
  },
}, { timestamps: true });

export default mongoose.model("Medecin", medecinSchema);