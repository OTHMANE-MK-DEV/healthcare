import mongoose from "mongoose";


const availableSlotSchema = new mongoose.Schema({
  medecin: { type: mongoose.Schema.Types.ObjectId, ref: "Medecin", required: true },
  datetime: { type: Date, required: true },
  isBooked: { type: Boolean, default: false },
  slotDuration: { type: Number, default: 30 }
}, { timestamps: true });

export default mongoose.model("AvailableSlot", availableSlotSchema);