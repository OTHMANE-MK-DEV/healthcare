// controllers/appointmentController.js
import Rdv from '../models/Rdv.js';
import AvailableSlot from '../models/AvailableSlot.js';
import Patient from '../models/Patient.js';

// Get appointments for a doctor
export const getDoctorAppointments = async (req, res) => {
  try {
    const { medecinId } = req.params;
    const { status, date, startDate, endDate } = req.query;

    let query = { medecin: medecinId };

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

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

    const appointments = await Rdv.find(query)
      .populate('patient', 'nom prenom email contact age')
      .populate('medecin', 'nom prenom specialite')
      .sort({ datetime: 1 });

    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get appointment by ID
export const getAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Rdv.findById(appointmentId)
      .populate('patient', 'nom prenom email contact age dateNaissance sexe')
      .populate('medecin', 'nom prenom specialite experience');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new appointment
export const createAppointment = async (req, res) => {
  try {
    const { patientId, medecinId, datetime, motif } = req.body;

    // Check if slot is available
    const slot = await AvailableSlot.findOne({
      medecin: medecinId,
      datetime: new Date(datetime),
      isBooked: false
    });

    if (!slot) {
      return res.status(400).json({ message: 'Time slot not available' });
    }

    // Generate unique appointment ID
    const lastAppointment = await Rdv.findOne().sort({ idRdv: -1 });
    const nextId = lastAppointment ? lastAppointment.idRdv + 1 : 1001;

    const appointment = new Rdv({
      idRdv: nextId,
      patient: patientId,
      medecin: medecinId,
      datetime: new Date(datetime),
      motif,
      status: 'scheduled'
    });

    // Mark slot as booked
    slot.isBooked = true;
    await slot.save();

    await appointment.save();
    
    const populatedAppointment = await Rdv.findById(appointment._id)
      .populate('patient', 'nom prenom email contact age')
      .populate('medecin', 'nom prenom specialite');

    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'confirmed', 'canceled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const appointment = await Rdv.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate('patient', 'nom prenom email contact age')
     .populate('medecin', 'nom prenom specialite');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // If canceled, free up the time slot
    if (status === 'canceled') {
      await AvailableSlot.findOneAndUpdate(
        {
          medecin: appointment.medecin._id,
          datetime: appointment.datetime
        },
        { isBooked: false }
      );
    }

    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment
export const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { datetime, motif, status } = req.body;

    const appointment = await Rdv.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Handle datetime change
    if (datetime && new Date(datetime).getTime() !== new Date(appointment.datetime).getTime()) {
      // Free old slot
      await AvailableSlot.findOneAndUpdate(
        {
          medecin: appointment.medecin,
          datetime: appointment.datetime
        },
        { isBooked: false }
      );

      // Check new slot availability
      const newSlot = await AvailableSlot.findOne({
        medecin: appointment.medecin,
        datetime: new Date(datetime),
        isBooked: false
      });

      if (!newSlot) {
        return res.status(400).json({ message: 'New time slot not available' });
      }

      // Book new slot
      newSlot.isBooked = true;
      await newSlot.save();
      appointment.datetime = new Date(datetime);
    }

    if (motif) appointment.motif = motif;
    if (status) appointment.status = status;

    await appointment.save();
    
    const updatedAppointment = await Rdv.findById(appointmentId)
      .populate('patient', 'nom prenom email contact age')
      .populate('medecin', 'nom prenom specialite');

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete appointment
export const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Rdv.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Free up the time slot
    await AvailableSlot.findOneAndUpdate(
      {
        medecin: appointment.medecin,
        datetime: appointment.datetime
      },
      { isBooked: false }
    );

    await Rdv.findByIdAndDelete(appointmentId);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPatientFromUser = async (req, res, next) => {
  try {
    // Assuming req.user contains the authenticated user
    const patient = await Patient.findOne({ user: req.user._id });
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient profile not found' 
      });
    }
    
    req.patient = patient;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Error finding patient profile',
      error: error.message 
    });
  }
};

/**
 * @route   GET /api/patient/appointments
 * @desc    Get all appointments for the authenticated patient
 * @access  Private (Patient only)
 */
export const getPatientAppointments = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user.userId });

    // Find all appointments for this patient and populate doctor details
    const appointments = await Rdv.find({ patient: patient._id })
      .populate({
        path: 'medecin',
        select: 'nom prenom specialite experience CIN adresse'
      })
      .sort({ datetime: -1 }); // Sort by date, newest first


    // Transform the data to match the frontend expectations
    const formattedAppointments = appointments.map(apt => ({
      _id: apt._id,
      idRdv: apt.idRdv,
      datetime: apt.datetime,
      status: apt.status,
      motif: apt.motif || 'No reason provided',
      notified: apt.notified,
      medecin: {
        _id: apt.medecin._id,
        nom: apt.medecin.nom,
        prenom: apt.medecin.prenom,
        specialite: apt.medecin.specialite,
        experience: apt.medecin.experience
      },
      createdAt: apt.createdAt
    }));

    res.status(200).json({
      success: true,
      count: formattedAppointments.length,
      data: formattedAppointments
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching appointments',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/patient/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private (Patient only)
 */
export const cancelPatientAppointment = async (req, res) => {
  try {
    const appointmentId = req.params.id;

    const patient = await Patient.findOne({ user: req.user.userId});
    
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient profile not found' 
      });
    }

    // Find the appointment
    const appointment = await Rdv.findById(appointmentId)
      .populate('medecin', 'nom prenom specialite');

    // Check if appointment exists
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Verify that this appointment belongs to the authenticated patient
    if (appointment.patient.toString() !== patient._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this appointment'
      });
    }

    // Check if appointment is already canceled
    if (appointment.status === 'canceled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already canceled'
      });
    }

    // Check if appointment is already completed
    if (appointment.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed appointment'
      });
    }

    // Check if appointment is in the past
    const now = new Date();
    if (new Date(appointment.datetime) < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel past appointments'
      });
    }

    // Update appointment status to canceled
    appointment.status = 'canceled';
    await appointment.save();

    // Optional: Send notification to doctor about cancellation
    // You can implement email/notification logic here
    // await sendCancellationNotification(appointment);

    res.status(200).json({
      success: true,
      message: 'Appointment canceled successfully',
      data: {
        _id: appointment._id,
        idRdv: appointment.idRdv,
        datetime: appointment.datetime,
        status: appointment.status,
        motif: appointment.motif,
        medecin: {
          _id: appointment.medecin._id,
          nom: appointment.medecin.nom,
          prenom: appointment.medecin.prenom,
          specialite: appointment.medecin.specialite
        }
      }
    });

  } catch (error) {
    console.error('Error canceling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling appointment',
      error: error.message
    });
  }
};