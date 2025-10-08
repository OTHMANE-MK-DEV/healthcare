import express from "express"
import { registerUser, resendVerificationEmail, verifyEmail } from "../controllers/authController.js";
const authRouter = express.Router();


authRouter.post('/register', registerUser);
authRouter.get('/verify-email', verifyEmail);
authRouter.post('/resend-verification', resendVerificationEmail);

export default authRouter;