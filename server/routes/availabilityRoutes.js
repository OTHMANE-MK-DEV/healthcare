import express from 'express';
import { createBulkSlots, createSlots, deleteSlot, getDoctorSlots } from '../controllers/availabilityController.js';


const AvailabilityRouter = express.Router();

// Get slots for a doctor
AvailabilityRouter.get('/doctor/:medecinId', getDoctorSlots);

// Create multiple slots
AvailabilityRouter.post('/bulk', createSlots);

// Create bulk slots for a date
AvailabilityRouter.post('/bulk-date', createBulkSlots);

// Delete a slot
AvailabilityRouter.delete('/:slotId', deleteSlot);

export default AvailabilityRouter;