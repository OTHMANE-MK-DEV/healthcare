// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.DATABASE_URL.CLOUDINARY_CLOUD_NAME || 'dgur7uize',
  api_key: '244898456698714',
  api_secret: process.env.DATABASE_URL.CLOUDINARY_API_SECRET || '6t85o5lmKQhu60g1heNOMjSimwE',
});

export default cloudinary;
