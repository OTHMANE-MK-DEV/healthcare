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