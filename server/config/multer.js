import multer from "multer";

const storage = multer.memoryStorage(); // or diskStorage if you want to save it on server

export const uploadUserAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // limit: 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and WEBP are allowed."));
    }
  },
}).single("avatar"); // 👈 this must match the field name sent from frontend
