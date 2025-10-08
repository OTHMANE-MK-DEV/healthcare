import mongoose from "mongoose";


const patientSchema = new mongoose.Schema({
  CIN: { type: String, required: true, unique: true },
  nom: String,
  prenom: String,
  adresse: String,
  sexe: String,
  age: Number,
  contact: String,
  dateNaissance: Date,
  email: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export default mongoose.model("Patient", patientSchema);