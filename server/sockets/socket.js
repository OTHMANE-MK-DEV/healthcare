// sockets/socket.js
import { Server } from "socket.io";

let io;

export const initSockets = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });

  console.log("🔌 Socket.IO initialized");
  return io;
};

export const broadcastECG = (data) => {
  if (io) {
    io.emit("ecgUpdate", data);
    // Uncomment to see data being sent:
    // console.log("Broadcasting:", data.type || 'live data');
  }
};