// controllers/userController.js
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import Medecin from '../models/Medecin.js';
import bcrypt from 'bcryptjs';
import multer from 'multer'
import cloudinary from '../config/cloudinary.js'
import streamifier from 'streamifier'

// Multer setup for memory storage (handle multiple images)
const storage = multer.memoryStorage()

// Upload buffer to Cloudinary, returns secure_url
const uploadToCloudinary = (buffer, folder = 'avatars') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result.secure_url)
        else reject(error)
      }
    )
    streamifier.createReadStream(buffer).pipe(stream)
  })
}

// Get all users with pagination and filtering
export const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) filter.role = role;
    if (status) filter.status = status;

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get users with population
    const users = await User.find(filter)
      .select('-password')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};

// Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get profile data based on role
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: id });
    } else if (user.role === 'medecin') {
      profile = await Medecin.findOne({ user: id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    // With multer and FormData, fields are available directly on req.body
    // But you need to make sure multer is configured properly
    
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // If req.body is undefined, the issue is with multer configuration
    if (!req.body) {
      return res.status(400).json({
        success: false,
        message: 'Invalid form data'
      });
    }

    // Access fields directly from req.body
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const role = req.body.role;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const CIN = req.body.CIN;
    const nom = req.body.nom;
    const prenom = req.body.prenom;
    const adresse = req.body.adresse;
    const sexe = req.body.sexe;
    const age = req.body.age;
    const contact = req.body.contact;
    const dateNaissance = req.body.dateNaissance;
    const specialite = req.body.specialite;
    const experience = req.body.experience;

    // Check required fields
    if (!username || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, and role are required'
      });
    }

    // Rest of your code remains the same...
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Handle avatar upload
    let avatarUrl = null;
    if (req.file) {
      avatarUrl = await uploadToCloudinary(req.file.buffer, 'users/avatars');
    }

    // Parse numeric fields
    const parsedAge = age ? parseInt(age) : undefined;
    const parsedExperience = experience ? parseInt(experience) : undefined;

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      avatar: avatarUrl,
      isVerified: true,
      isApproved: role !== 'medecin',
      status: role === 'medecin' ? 'pending' : 'approved'
    });

    await user.save();

    // Create role-specific profile
    let profile = null;
    if (role === 'patient') {
      profile = new Patient({
        CIN,
        nom: nom || lastName,
        prenom: prenom || firstName,
        adresse,
        sexe,
        age: parsedAge,
        contact,
        dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
        email,
        user: user._id
      });
      await profile.save();
    } else if (role === 'medecin') {
      profile = new Medecin({
        CIN,
        nom: nom || lastName,
        prenom: prenom || firstName,
        adresse,
        specialite,
        experience: parsedExperience,
        user: user._id
      });
      await profile.save();
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user: userResponse,
        profile
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
};
// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      role,
      firstName,
      lastName,
      // Patient specific
      CIN,
      nom,
      prenom,
      adresse,
      sexe,
      age,
      contact,
      dateNaissance,
      // Medecin specific
      specialite,
      experience,
      isVerified,
      isApproved,
      status
    } = req.body;

    // Find user
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for duplicate email/username
    if (email !== user.email || username !== user.username) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: id } },
          { $or: [{ email }, { username }] }
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email or username already exists'
        });
      }
    }

    // Handle avatar upload
    if (req.file) {
      user.avatar = await uploadToCloudinary(req.file.buffer, 'users/avatars');
    }

    // Update user fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (isApproved !== undefined) user.isApproved = isApproved;
    if (status) user.status = status;

    await user.save();

    // Update role-specific profile
    if (user.role === 'patient') {
      let patient = await Patient.findOne({ user: id });
      if (!patient) {
        patient = new Patient({ user: id });
      }
      
      patient.CIN = CIN || patient.CIN;
      patient.nom = nom || lastName || patient.nom;
      patient.prenom = prenom || firstName || patient.prenom;
      patient.adresse = adresse || patient.adresse;
      patient.sexe = sexe || patient.sexe;
      patient.age = age ? parseInt(age) : patient.age;
      patient.contact = contact || patient.contact;
      patient.dateNaissance = dateNaissance ? new Date(dateNaissance) : patient.dateNaissance;
      patient.email = email || patient.email;

      await patient.save();
    } else if (user.role === 'medecin') {
      let medecin = await Medecin.findOne({ user: id });
      if (!medecin) {
        medecin = new Medecin({ user: id });
      }
      
      medecin.CIN = CIN || medecin.CIN;
      medecin.nom = nom || lastName || medecin.nom;
      medecin.prenom = prenom || firstName || medecin.prenom;
      medecin.adresse = adresse || medecin.adresse;
      medecin.specialite = specialite || medecin.specialite;
      medecin.experience = experience ? parseInt(experience) : medecin.experience;

      await medecin.save();
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete role-specific profile
    if (user.role === 'patient') {
      await Patient.findOneAndDelete({ user: id });
    } else if (user.role === 'medecin') {
      await Medecin.findOneAndDelete({ user: id });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

// Update user status (approve/reject)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isApproved, isVerified } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (status) user.status = status;
    if (isApproved !== undefined) user.isApproved = isApproved;
    if (isVerified !== undefined) user.isVerified = isVerified;

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: {
        user: userResponse
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};