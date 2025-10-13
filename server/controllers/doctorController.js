// controllers/doctorController.js
import Medecin from '../models/Medecin.js';
import User from '../models/User.js';

// Get all doctors
export const getDoctors = async (req, res) => {
  try {
    const { specialite } = req.query;
    
    let query = {};
    if (specialite) {
      query.specialite = new RegExp(specialite, 'i');
    }

    const doctors = await Medecin.find(query)
      .populate('user', 'username email avatar isVerified')
      .select('-__v');

    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Medecin.findById(doctorId)
      .populate('user', 'username email avatar isVerified')
      .select('-__v');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update doctor profile
export const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { nom, prenom, adresse, specialite, experience } = req.body;

    const doctor = await Medecin.findByIdAndUpdate(
      doctorId,
      { nom, prenom, adresse, specialite, experience },
      { new: true, runValidators: true }
    ).populate('user', 'username email avatar');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get doctor statistics
export const getDoctorStats = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const [
      totalAppointments,
      confirmedAppointments,
      completedAppointments,
      availableSlots
    ] = await Promise.all([
      Rdv.countDocuments({ medecin: doctorId }),
      Rdv.countDocuments({ medecin: doctorId, status: 'confirmed' }),
      Rdv.countDocuments({ medecin: doctorId, status: 'completed' }),
      AvailableSlot.countDocuments({ medecin: doctorId, isBooked: false })
    ]);

    res.json({
      totalAppointments,
      confirmedAppointments,
      completedAppointments,
      availableSlots,
      upcomingAppointments: confirmedAppointments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};