import mongoose from "mongoose";


const rdvSchema = new mongoose.Schema({
  idRdv: { type: Number, required: true, unique: true },
  datetime: { type: Date, required: true },
  status: { 
  type: String, 
  enum: ["scheduled", "confirmed", "canceled", "completed"], 
  default: "scheduled" 
  },
  notified: { type: Boolean, default: false },
  motif: String,
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: "Medecin", required: true }
}, { timestamps: true });

export default mongoose.model("Rdv", rdvSchema);