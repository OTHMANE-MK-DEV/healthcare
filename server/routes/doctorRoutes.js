import express from 'express';
import {
  getDoctors,
  getDoctorById,
  getDoctorsBySpecialty
} from '../controllers/doctorController.js';

const DoctorRouter = express.Router();

DoctorRouter.get('/', getDoctors);
DoctorRouter.get('/specialty/:specialty', getDoctorsBySpecialty);
DoctorRouter.get('/:id', getDoctorById);

export default DoctorRouter;