import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer: Buffer, fileType?: string): Promise<any> => {
    try {
        const base64String = fileBuffer.toString('base64');
        const dataUri = `data:${fileType || 'application/octet-stream'};base64,${base64String}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            resource_type: 'auto',
            use_filename: true,
            unique_filename: false,
            overwrite: true
        });

        return result;
    } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};