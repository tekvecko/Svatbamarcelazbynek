
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
  if (!config.api_key || !config.api_secret || !config.cloud_name) {
    throw new Error('Cloudinary credentials are not properly configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
  }
  console.log('✅ Cloudinary configured successfully');
};

validateConfig();

// Generate signature for secure uploads
export const generateSignature = (params: Record<string, any>) => {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsWithTimestamp = {
    ...params,
    timestamp
  };
  
  const signature = cloudinary.utils.api_sign_request(paramsWithTimestamp, process.env.CLOUDINARY_API_SECRET!);
  
  return {
    signature,
    timestamp,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    folder: 'wedding-photos'
  };
};

export default cloudinary;
