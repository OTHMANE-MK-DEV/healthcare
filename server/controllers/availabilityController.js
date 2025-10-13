// controllers/availableSlotController.js
import AvailableSlot from '../models/AvailableSlot.js';
import Rdv from '../models/Rdv.js';

// Get available slots for a doctor
export const getDoctorSlots = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { date, startDate, endDate } = req.query;

    let query = { medecin: medecinId };

    // Filter by specific date
    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.datetime = {
        $gte: targetDate,
        $lt: nextDay
      };
    }

    // Filter by date range
    if (startDate && endDate) {
      query.datetime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const slots = await AvailableSlot.find(query)
      .populate('medecin', 'nom prenom specialite')
      .sort({ datetime: 1 });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create multiple slots
export const createSlots = async (req, res) => {
  try {
    const { medecinId, slots } = req.body;

    // Validate input
    if (!medecinId || !slots || !Array.isArray(slots)) {
      return res.status(400).json({ message: 'Invalid input data' });
    }

    // Prepare slots for bulk creation
    const slotsToCreate = slots.map(slotData => ({
      medecin: medecinId,
      datetime: new Date(slotData.datetime),
      slotDuration: slotData.duration || 30,
      isBooked: false
    }));

    const createdSlots = await AvailableSlot.insertMany(slotsToCreate);
    
    // Populate medecin info
    const populatedSlots = await AvailableSlot.find({
      _id: { $in: createdSlots.map(slot => slot._id) }
    }).populate('medecin', 'nom prenom specialite');

    res.status(201).json(populatedSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create slots in bulk for a date range
export const createBulkSlots = async (req, res) => {
  try {
    const { medecinId, date, startTime, endTime, duration, recurring } = req.body;

    const slots = generateTimeSlots(date, startTime, endTime, duration);
    
    const slotsToCreate = slots.map(datetime => ({
      medecin: medecinId,
      datetime,
      slotDuration: duration,
      isBooked: false
    }));

    const createdSlots = await AvailableSlot.insertMany(slotsToCreate);
    const populatedSlots = await AvailableSlot.find({
      _id: { $in: createdSlots.map(slot => slot._id) }
    }).populate('medecin', 'nom prenom specialite');

    res.status(201).json(populatedSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a slot
export const deleteSlot = async (req, res) => {
  try {
    const { slotId } = req.params;

    // Check if slot is booked
    const slot = await AvailableSlot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    if (slot.isBooked) {
      return res.status(400).json({ message: 'Cannot delete a booked slot' });
    }

    await AvailableSlot.findByIdAndDelete(slotId);
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to generate time slots
const generateTimeSlots = (date, startTime, endTime, duration) => {
  const slots = [];
  const startDateTime = new Date(`${date}T${startTime}`);
  const endDateTime = new Date(`${date}T${endTime}`);
  
  let currentTime = new Date(startDateTime);
  
  while (currentTime < endDateTime) {
    slots.push(new Date(currentTime));
    currentTime.setMinutes(currentTime.getMinutes() + duration);
  }
  
  return slots;
};