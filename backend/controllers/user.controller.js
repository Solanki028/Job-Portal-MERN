import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "cloudinary";

// ✅ Correct Cloudinary Configuration
 

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dsoeem7bp",
    api_key: process.env.CLOUDINARY_API_KEY || "865115572852146",
    api_secret: process.env.CLOUDINARY_API_SECRET || "Cvyi22TWIfjvcClv7UUJf"
});

console.log("Signature Test:", cloudinary.v2.utils.api_sign_request(
    { timestamp: Math.floor(Date.now() / 1000) },
    process.env.CLOUDINARY_API_SECRET
));

// 🔹 Register Function
export const register = async (req, res) => {
    try {
        console.log("📌 Request Body:", req.body);
        console.log("📌 Request File:", req.file);

        const { fullname, email, phoneNumber, password, role } = req.body;

        // ✅ Check if all required fields are present
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({ message: "All fields are required.", success: false });
        }

        // ✅ Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: "Profile photo is required.", success: false });
        }

        // ✅ Convert file to Data URI
        const fileUri = getDataUri(req.file);
        if (!fileUri || !fileUri.content) {
            return res.status(400).json({ message: "Failed to process the uploaded file.", success: false });
        }

        console.log("📌 Generated Data URI:", fileUri.content.substring(0, 100) + "...");

        // ✅ Upload to Cloudinary
        let cloudResponse;
        try {
            cloudResponse = await cloudinary.v2.uploader.upload(fileUri.content, {
                resource_type: "image",
                folder: "user_profiles", // ✅ Ensure folder name is correct
                use_filename: true,
                unique_filename: false,
                overwrite: true,
            });

            console.log("✅ Cloudinary Upload Success:", cloudResponse.secure_url);
        } catch (error) {
            console.error("❌ Cloudinary Upload Error:", error);
            return res.status(500).json({ message: "Failed to upload file to Cloudinary.", success: false });
        }

        // ✅ Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email.", success: false });
        }

        // ✅ Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // ✅ Create new user
        const newUser = await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: cloudResponse.secure_url,
            },
        });

        console.log("✅ User Created:", newUser);

        return res.status(201).json({ message: "Account created successfully.", success: true });

    } catch (error) {
        console.error("❌ Error in Register Function:", error);
        return res.status(500).json({ message: "Internal server error.", success: false });
    }
};


    

export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: 'strict' }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        
        const file = req.file;
        
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content);



        let skillsArray;
        if(skills){
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if(fullname) user.fullname = fullname
        if(email) user.email = email
        if(phoneNumber)  user.phoneNumber = phoneNumber
        if(bio) user.profile.bio = bio
        if(skills) user.profile.skills = skillsArray
      
        // resume comes later here...
        if(cloudResponse){
            user.profile.resume = cloudResponse.secure_url // save the cloudinary url
            user.profile.resumeOriginalName = file.originalname // Save the original file name
        }


        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message:"Profile updated successfully.",
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}