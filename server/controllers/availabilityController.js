import AvailableSlot from "../models/AvailableSlot.js";
import mongoose from "mongoose";

// @desc    Get available slots for a doctor on specific date
// @route   GET /api/availability/doctor/:doctorId/date/:date
// @access  Public
export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    // Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID'
      });
    }

    // Parse date and create range for the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const availableSlots = await AvailableSlot.find({
      medecin: doctorId,
      datetime: {
        $gte: startDate,
        $lte: endDate
      },
      isBooked: false
    }).sort({ datetime: 1 });

    // Format slots as time strings
    const timeSlots = availableSlots.map(slot => {
      const slotTime = new Date(slot.datetime);
      return slotTime.toTimeString().slice(0, 5); // Returns "HH:MM" format
    });

    res.json({
      success: true,
      date: date,
      doctorId: doctorId,
      availableSlots: timeSlots,
      count: timeSlots.length
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability'
    });
  }
};

// @desc    Get availability for all doctors on specific date
// @route   GET /api/availability/date/:date
// @access  Public
export const getAllDoctorsAvailability = async (req, res) => {
  try {
    const { date } = req.params;

    // Parse date and create range for the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const availableSlots = await AvailableSlot.find({
      datetime: {
        $gte: startDate,
        $lte: endDate
      },
      isBooked: false
    })
      .populate('medecin', 'nom prenom specialite experience')
      .sort({ datetime: 1 });

    // Group by doctor
    const availabilityByDoctor = availableSlots.reduce((acc, slot) => {
      const doctorId = slot.medecin._id.toString();
      const slotTime = new Date(slot.datetime).toTimeString().slice(0, 5);
      
      if (!acc[doctorId]) {
        acc[doctorId] = {
          doctor: {
            _id: slot.medecin._id,
            nom: slot.medecin.nom,
            prenom: slot.medecin.prenom,
            specialite: slot.medecin.specialite,
            experience: slot.medecin.experience
          },
          availableSlots: []
        };
      }
      
      acc[doctorId].availableSlots.push(slotTime);
      return acc;
    }, {});

    res.json({
      success: true,
      date: date,
      availability: Object.values(availabilityByDoctor),
      count: Object.keys(availabilityByDoctor).length
    });
  } catch (error) {
    console.error('Error fetching all doctors availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching availability'
    });
  }
};

// @desc    Check date availability (for calendar view)
// @route   GET /api/availability/date/:date/check
// @access  Public
export const checkDateAvailability = async (req, res) => {
  try {
    const { date } = req.params;

    // Parse date and create range for the day
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    // Count available slots per doctor for this date
    const availability = await AvailableSlot.aggregate([
      {
        $match: {
          datetime: {
            $gte: startDate,
            $lte: endDate
          },
          isBooked: false
        }
      },
      {
        $group: {
          _id: "$medecin",
          availableSlots: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "medecins",
          localField: "_id",
          foreignField: "_id",
          as: "doctor"
        }
      },
      {
        $unwind: "$doctor"
      },
      {
        $project: {
          doctorId: "$_id",
          nom: "$doctor.nom",
          prenom: "$doctor.prenom",
          specialite: "$doctor.specialite",
          availableSlots: 1
        }
      }
    ]);

    const hasAvailability = availability.length > 0;
    const availableDoctors = availability.length;

    res.json({
      success: true,
      date: date,
      hasAvailability,
      availableDoctors,
      doctors: availability
    });
  } catch (error) {
    console.error('Error checking date availability:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability'
    });
  }
};