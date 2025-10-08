import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from "../models/User.js"
import Patient from "../models/Patient.js"
import Medecin from "../models/Medecin.js"


// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate email verification token
const generateVerificationToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

// Send verification email
const sendVerificationEmail = async (email, token, username) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - Healthcare Suptech Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #84cc16, #65a30d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Welcome to Healthcare Suptech!</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e293b;">Hello ${username},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            Thank you for registering with Healthcare Suptech Platform. 
            Please verify your email address to complete your registration.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #84cc16; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;
                      display: inline-block; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account, 
            please ignore this email.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px;">
              If the button doesn't work, copy and paste this link in your browser:<br>
              <a href="${verificationUrl}" style="color: #84cc16;">${verificationUrl}</a>
            </p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// controllers/authController.js - Add this function
const sendAdminNotification = async (user) => {
  try {
    const medecin = await Medecin.findOne({ user: user._id });
    
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Set this in your .env
      subject: 'New Doctor Registration Requires Approval',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Doctor Registration</h1>
          </div>
          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1e293b;">Doctor Approval Required</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">
              A new doctor has registered and verified their email. Please review their information and approve or reject the account.
            </p>
            <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1e293b; margin-top: 0;">Doctor Information:</h3>
              <p><strong>Name:</strong> ${medecin.prenom} ${medecin.nom}</p>
              <p><strong>CIN:</strong> ${medecin.CIN}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Address:</strong> ${medecin.adresse}</p>
              <p><strong>Registration Date:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div style="text-align: center;">
              <a href="${process.env.ADMIN_URL}/admin/approvals" 
                 style="background: #f59e0b; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 8px; font-weight: bold;
                        display: inline-block; font-size: 16px;">
                Review Registration
              </a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(adminMailOptions);
  } catch (error) {
    console.error('Admin notification error:', error);
  }
};

// Main registration controller
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, ...userData } = req.body;

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

    // Determine approval status
    // Patients are auto-approved, doctors need admin approval
    const isAutoApproved = role === 'patient';
    const status = isAutoApproved ? 'approved' : 'pending';

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: role === 'doctor' ? 'medecin' : 'patient',
      isVerified: false,
      isApproved: isAutoApproved,
      status: status
    });

    await user.save();

    // Create role-specific profile
    let profile;
    if (role === 'doctor') {
      // Check if CIN already exists for doctor
      const existingMedecin = await Medecin.findOne({ CIN: userData.cin });
      if (existingMedecin) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Doctor with this CIN already exists'
        });
      }

      profile = new Medecin({
        CIN: userData.cin,
        nom: userData.nom,
        prenom: userData.prenom,
        adresse: userData.adresse,
        user: user._id,
        status: 'pending' // Doctor profiles start as pending
      });
    } else {
      // Check if CIN already exists for patient
      const existingPatient = await Patient.findOne({ CIN: userData.cin });
      if (existingPatient) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Patient with this CIN already exists'
        });
      }

      profile = new Patient({
        CIN: userData.cin,
        nom: userData.nom,
        prenom: userData.prenom,
        adresse: userData.adresse,
        sexe: userData.sexe,
        age: parseInt(userData.age),
        contact: userData.contact,
        dateNaissance: new Date(userData.dateNaissance),
        email: email,
        user: user._id,
        status: 'approved' // Patient profiles are auto-approved
      });
    }

    await profile.save();

    // Generate verification token and send email
    const verificationToken = generateVerificationToken(user._id);
    
    try {
      await sendVerificationEmail(email, verificationToken, username, role);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: role === 'doctor' 
        ? 'Registration successful! Please check your email to verify your account. After verification, your account will be reviewed by an administrator.'
        : 'Registration successful! Please check your email to verify your account.',
      data: {
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        needsVerification: true,
        needsApproval: role === 'doctor'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Email verification controller
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification link. Please check your email and try again.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found. The account may have been deleted.'
      });
    }

    if (user.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'Email is already verified. You can proceed to login.',
        needsApproval: user.role === 'medecin' && !user.isApproved
      });
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    // Send notification to admin if it's a doctor
    if (user.role === 'medecin') {
      await sendAdminNotification(user);
    }

    const message = user.role === 'medecin' 
      ? 'Email verified successfully! Your account is now pending admin approval. You will receive an email once your account is approved.'
      : 'Email verified successfully! Your account is now active and you can login.';

    res.status(200).json({
      success: true,
      message: message,
      needsApproval: user.role === 'medecin'
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Verification link has expired. Please request a new verification email.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token. Please check your email for the correct link.'
      });
    }

    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during email verification. Please try again later.'
    });
  }
};

// Resend verification email
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    const verificationToken = generateVerificationToken(user._id);
    await sendVerificationEmail(email, verificationToken, user.username);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully!'
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
