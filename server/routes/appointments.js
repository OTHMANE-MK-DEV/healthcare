// routes/appointments.js
import express from 'express';
import {
  getDoctorAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment
} from '../controllers/appointmentController.js';

const AppointmentRouter = express.Router();

// Get appointments for a doctor
AppointmentRouter.get('/doctor/:medecinId', getDoctorAppointments);

// Get specific appointment
AppointmentRouter.get('/:appointmentId', getAppointmentById);

// Create new appointment
AppointmentRouter.post('/', createAppointment);

// Update appointment status
AppointmentRouter.patch('/:appointmentId/status', updateAppointmentStatus);

// Update appointment
AppointmentRouter.put('/:appointmentId', updateAppointment);

// Delete appointment
AppointmentRouter.delete('/:appointmentId', deleteAppointment);

export default AppointmentRouter;