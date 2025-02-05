import cloudinary from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const fileUri = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."; // Replace with a base64-encoded image
cloudinary.uploader.upload(fileUri, (error, result) => {
    if (error) {
        console.error("Cloudinary Upload Error:", error);
    } else {
        console.log("Cloudinary Upload Result:", result);
    }
});