// routes/doctors.js
import express from 'express';
import {
  getDoctors,
  getDoctorById,
  updateDoctor,
  getDoctorStats
} from '../controllers/doctorController.js';

const DoctorRouter = express.Router();

// Get all doctors
DoctorRouter.get('/', getDoctors);

// Get doctor by ID
DoctorRouter.get('/:doctorId', getDoctorById);

// Update doctor profile
DoctorRouter.put('/:doctorId', updateDoctor);

// Get doctor statistics
DoctorRouter.get('/:doctorId/stats', getDoctorStats);

export default DoctorRouter;