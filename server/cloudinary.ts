
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'svatba2025',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate configuration
const validateConfig = () => {
  const config = cloudinary.config();
  if (!config.api_key || !config.api_secret) {
    console.warn('⚠️ Cloudinary API credentials not configured. Upload functionality may not work.');
    console.warn('Please set CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET environment variables.');
  }
};

validateConfig();

export default cloudinary;
