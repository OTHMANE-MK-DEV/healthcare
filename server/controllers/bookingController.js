import Rdv from "../models/Rdv.js";
import AvailableSlot from "../models/AvailableSlot.js";
import mongoose from "mongoose";

// @desc    Create new appointment
// @route   POST /api/bookings
// @access  Public
export const createBooking = async (req, res) => {
  try {
    const { doctorId, datetime, motif, patientId, slotId } = req.body;

    // Validate required fields
    if (!doctorId || !datetime || !motif || !patientId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide doctorId, datetime, motif, and patientId'
      });
    }

    // Parse datetime
    const appointmentDate = new Date(datetime);

    // Check if slot is available
    const availableSlot = await AvailableSlot.findOne({
      medecin: doctorId,
      datetime: appointmentDate,
      isBooked: false
    });

    if (!availableSlot) {
      return res.status(400).json({
        success: false,
        message: 'Selected time slot is no longer available'
      });
    }

    // Generate unique appointment ID
    const lastAppointment = await Rdv.findOne().sort({ idRdv: -1 });
    const nextId = lastAppointment ? lastAppointment.idRdv + 1 : 1;

    // Create appointment
    const appointment = new Rdv({
      idRdv: nextId,
      datetime: appointmentDate,
      motif: motif,
      patient: patientId,
      medecin: doctorId,
      slot: slotId,
      status: "scheduled"
    });

    const savedAppointment = await appointment.save();

    // Mark slot as booked
    availableSlot.isBooked = true;
    await availableSlot.save();

    // Populate the saved appointment with doctor and patient details
    const populatedAppointment = await Rdv.findById(savedAppointment._id)
      .populate('medecin', 'nom prenom specialite')
      .populate('patient', 'nom prenom email phone');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: populatedAppointment
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }

    // Handle duplicate booking attempts
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Appointment already exists for this time slot'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating booking'
    });
  }
};

// @desc    Get patient appointments
// @route   GET /api/bookings/patient/:patientId
// @access  Public
export const getPatientAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Rdv.find({ patient: patientId })
      .populate('medecin', 'nom prenom specialite')
      .sort({ datetime: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
};

// @desc    Get doctor appointments
// @route   GET /api/bookings/doctor/:doctorId
// @access  Public
export const getDoctorAppointments = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const appointments = await Rdv.find({ medecin: doctorId })
      .populate('patient', 'nom prenom email phone')
      .sort({ datetime: -1 });

    res.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching appointments'
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/bookings/:id/cancel
// @access  Public
export const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Rdv.findById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    if (appointment.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already canceled'
      });
    }

    // Update appointment status
    appointment.status = 'canceled';
    await appointment.save();

    // Free up the time slot
    await AvailableSlot.findOneAndUpdate(
      {
        medecin: appointment.medecin,
        datetime: appointment.datetime,
        isBooked: true
      },
      { isBooked: false }
    );

    res.json({
      success: true,
      message: 'Appointment canceled successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while canceling appointment'
    });
  }
};