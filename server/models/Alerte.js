import mongoose from "mongoose";


const alerteSchema = new mongoose.Schema({
  idAlerte: { type: Number, required: true, unique: true },
  type: String,
  dateHeure: { type: Date, default: Date.now },
  localisation: String,
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: "Medecin" }
}, { timestamps: true });

module.exports = mongoose.model("Alerte", alerteSchema);