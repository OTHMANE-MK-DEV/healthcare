// routes/appointments.js
import express from 'express';
import {
  getDoctorAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  getPatientAppointments,
  cancelPatientAppointment,
  getPatientFromUser
} from '../controllers/appointmentController.js';
import { verifyToken } from '../middleware/AuthMiddleware.js';

const AppointmentRouter = express.Router();

AppointmentRouter.patch('/:id/cancel', verifyToken, cancelPatientAppointment);
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



AppointmentRouter.get('/', verifyToken, getPatientAppointments);

export default AppointmentRouter;

