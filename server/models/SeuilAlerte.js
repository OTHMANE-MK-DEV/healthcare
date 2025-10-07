import mongoose from "mongoose";


const seuilAlerteSchema = new mongoose.Schema({
  idSeuil: { type: Number, required: true, unique: true },
  valeur: Number,
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true }
});

module.exports = mongoose.model("SeuilAlerte", seuilAlerteSchema);