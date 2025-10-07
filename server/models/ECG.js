import mongoose from "mongoose";

const ecgSchema = new mongoose.Schema({
  idECG: { type: Number, required: true, unique: true },
  // signal: Buffer, // Binary data for ECG
  signal: { type: Object, required: true }, // store summary object
  bpm: { type: Number }, // calculated BPM
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ECG", ecgSchema);