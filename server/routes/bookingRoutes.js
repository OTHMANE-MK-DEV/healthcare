import express from 'express';
import {
  createBooking,
  getPatientAppointments,
  getDoctorAppointments,
  cancelAppointment
} from '../controllers/bookingController.js';

const BookingRouter = express.Router();

BookingRouter.post('/', createBooking);
BookingRouter.get('/patient/:patientId', getPatientAppointments);
BookingRouter.get('/doctor/:doctorId', getDoctorAppointments);
BookingRouter.put('/:id/cancel', cancelAppointment);

export default BookingRouter;