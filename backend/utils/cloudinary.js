import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

console.log("Cloudinary Config:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Your cloud name
    api_key: process.env.CLOUDINARY_API_KEY,       // Your API key
    api_secret: process.env.CLOUDINARY_API_SECRET, // Your API secret
});
export default cloudinary;