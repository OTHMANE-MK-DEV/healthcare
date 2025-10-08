import express from "express"
import { forgotPassword, getCurrentUser, loginUser, logoutUser, registerUser, resendVerificationEmail, resetPassword, verifyEmail } from "../controllers/authController.js";
import { verifyToken } from "../middleware/AuthMiddleware.js";
const authRouter = express.Router();


authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/resend-verification', resendVerificationEmail);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password', resetPassword);

// Protected routes
authRouter.post('/logout', verifyToken, logoutUser);
authRouter.get('/me', verifyToken, getCurrentUser);

export default authRouter;