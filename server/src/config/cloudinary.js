import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Non configurare qui Cloudinary, ma in ogni funzione

export const uploadImage = async (fileData) => {
  try {
    // Configura Cloudinary direttamente nella funzione
    const cloudConfig = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };

    console.log('Configuring Cloudinary for upload with:', {
      cloud_name: cloudConfig.cloud_name ? 'present' : 'missing',
      api_key: cloudConfig.api_key ? 'present' : 'missing',
      api_secret: cloudConfig.api_secret ? 'present' : 'missing'
    });

    cloudinary.config(cloudConfig);

    // Se è un buffer, carica usando promise e stream
    if (Buffer.isBuffer(fileData)) {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'profile-images',
            transformation: [
              { width: 400, height: 400, crop: "fill" },
              { quality: 'auto' }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload stream error:', error);
              return reject(error);
            }
            resolve(result);
          }
        );
        uploadStream.end(fileData);
      });
    }
    // Se è una stringa (URL o data URI), usa il metodo standard
    else {
      return await cloudinary.uploader.upload(fileData, {
        folder: 'profile-images',
        transformation: [
          { width: 400, height: 400, crop: "fill" },
          { quality: 'auto' }
        ]
      });
    }
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
};

export const deleteImage = async (publicId) => {
  try {
    // Configura Cloudinary direttamente nella funzione
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};

export const testCloudinaryConnection = async () => {
  try {
    // Configura Cloudinary direttamente nella funzione
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection test:', result);
    return true;
  } catch (error) {
    console.error('Cloudinary connection error:', error);
    return false;
  }
};

export default cloudinary;
