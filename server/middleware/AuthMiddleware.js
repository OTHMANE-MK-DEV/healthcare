import jwt from "jsonwebtoken";

// Verify JWT token
export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies?.jwt || req.headers["authorization"]?.split(" ")[1]; 
    if (!token) {
      return res.status(401).json({ message: "You are not authenticated!" });
    }

    jwt.verify(token, process.env.JWT_KEY, (err, payload) => {
      if (err) return res.status(403).json({ message: "Token is not valid!" });
      req.user = payload; // payload contains userId, username, role, etc.
      next();
    });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Check if user has a specific role
export const verifyRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authenticated!" });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ message: "You do not have permission!" });
    }
    next();
  };
};

// Example: allow both medecins and patients
export const verifyRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "You are not authenticated!" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have permission!" });
    }
    next();
  };
};


// import { verifyToken, verifyRole, verifyRoles } from "../middleware/auth.js";

// router.get("/patients", verifyToken, verifyRole("medecin"), getAllPatients);
// router.post("/rdv", verifyToken, verifyRoles(["patient", "medecin"]), createRdv);