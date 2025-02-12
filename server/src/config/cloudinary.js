import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: 'profile-images',
      transformation: [
        { width: 400, height: 400, crop: "fill" },
        { quality: 'auto' }
      ]
    });
    return result;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
// Funzione di test
export const testCloudinaryConnection = async () => {
    try {
      const result = await cloudinary.api.ping();
      console.log('Cloudinary connection test:', result);
      return true;
    } catch (error) {
      console.error('Cloudinary connection error:', error);
      return false;
    }
  };

export default cloudinary;
