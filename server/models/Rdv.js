import mongoose from "mongoose";


const rdvSchema = new mongoose.Schema({
  idRdv: { type: Number, required: true, unique: true },
  date: { type: Date, required: true },
  heure: { type: String, required: true }, // could be stored inside date too
  motif: String,
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: "Medecin", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Rdv", rdvSchema);