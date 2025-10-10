import express from 'express';
import {
  getDoctorAvailability,
  getAllDoctorsAvailability,
  checkDateAvailability
} from '../controllers/availabilityController.js';

const AvailabilityRouter = express.Router();

AvailabilityRouter.get('/doctor/:doctorId/date/:date', getDoctorAvailability);
AvailabilityRouter.get('/date/:date', getAllDoctorsAvailability);
AvailabilityRouter.get('/date/:date/check', checkDateAvailability);

export default AvailabilityRouter;