import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import connectDB from "./config/db.js";
import { initSockets } from "./sockets/socket.js";
import { startECGSimulation, stopECGSimulation } from "./controllers/ecgController.js";
import ECG from "./models/ECG.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import DoctorRouter from "./routes/doctorRoutes.js";
import AvailabilityRouter from "./routes/availabilityRoutes.js";
import BookingRouter from "./routes/bookingRoutes.js";
import AppointmentRouter from "./routes/appointments.js";
// import bcrypt from 'bcryptjs'
// import User from "./models/User.js"


console.log('hello')

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

app.use(express.json());

app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/doctors', DoctorRouter);
app.use('/api/available-slots', AvailabilityRouter);
app.use('/api/bookings', BookingRouter);
app.use('/api/appointments', AppointmentRouter);


connectDB();

// Initialize socket once
initSockets(server);

// Start ECG simulation
// startECGSimulation();

// app.post("/api/start-ecg", (req, res) => {
//   startECGSimulation();
//   res.json({ success: true, message: "ECG simulation started" });
// });

app.post("/api/ecg/start", (req, res) => {
  startECGSimulation();
  res.json({ success: true, message: "ECG simulation started" });
});

// When user leaves Analyze page
app.post("/api/ecg/stop", (req, res) => {
  stopECGSimulation();
  res.json({ success: true, message: "ECG simulation stopped" });
});

// In your main server file
app.post("/api/ecg", async (req, res) => {
  try {
    console.log("📥 Received ECG save request:", req.body);
    
    const { signal, patientId, bpm } = req.body;

    if (!signal || !patientId) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing signal or patientId" 
      });
    }

    const newECG = new ECG({
      idECG: Date.now(),
      signal,
      bpm: bpm || null,
      patient: patientId
    });

    await newECG.save();
    console.log("✅ ECG saved successfully");
    res.status(201).json({ success: true, message: "ECG saved!" });
  } catch (err) {
    console.error("❌ Error saving ECG:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test route
app.get("/", (req, res) => res.json({ message: "Server running ✅" }));

// const createAdmin = async () => {
//   try {
//     const hashedPassword = await bcrypt.hash("admin1234", 10);

//     const admin = new User({
//       username: "admin",
//       email: "admin@school.com",
//       password: hashedPassword,
//       role: "admin",
//       isVerified: true,
//       isApproved: true,
//       status: "approved"
//     });

//     await admin.save();
//     console.log("✅ Admin account created successfully!");
//   } catch (error) {
//     console.error("❌ Error creating admin account:", error);
//   }
// };

// createAdmin();

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
