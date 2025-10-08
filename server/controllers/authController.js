import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import User from "../models/User.js"
import Patient from "../models/Patient.js"
import Medecin from "../models/Medecin.js"
import crypto from 'crypto';


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


export const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username/email and password are required'
      });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [
        { username: emailOrUsername },
        { email: emailOrUsername }
      ]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Check if account is approved (for doctors)
    if (user.role === 'medecin' && !user.isApproved) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending admin approval. Please wait for approval email.'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token (using your existing JWT_KEY)
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role 
      },
      process.env.JWT_KEY, // Using your existing JWT_KEY
      { expiresIn: '7d' }
    );

    // Set token in HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Get user profile based on role
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === 'medecin') {
      profile = await Medecin.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isApproved: user.isApproved
        },
        profile: profile ? {
          id: profile._id,
          nom: profile.nom,
          prenom: profile.prenom,
          CIN: profile.CIN,
          ...(user.role === 'patient' && {
            sexe: profile.sexe,
            age: profile.age,
            contact: profile.contact
          })
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Logout controller
export const logoutUser = (req, res) => {
  res.clearCookie('jwt');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user profile based on role
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    } else if (user.role === 'medecin') {
      profile = await Medecin.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          isApproved: user.isApproved
        },
        profile
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send password reset email
const sendPasswordResetEmail = async (email, token, username) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Reset Your Password - Healthcare Suptech',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #84cc16, #65a30d); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Password Reset Request</h1>
        </div>
        <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e293b;">Hello ${username},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">
            You requested to reset your password. Click the button below to create a new password.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #84cc16; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;
                      display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #64748b; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, 
            please ignore this email.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px;">
              If the button doesn't work, copy and paste this link in your browser:<br>
              <a href="${resetUrl}" style="color: #84cc16;">${resetUrl}</a>
            </p>
          </div>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Forgot password controller
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token and expiry
    const resetToken = generateResetToken();
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Save reset token to user
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(email, resetToken, user.username);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Reset password controller
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find user by valid reset token
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};