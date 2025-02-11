import express from "express";
import { login, logout, register, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
 
const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);

export default router;

console.log("Register route hit");
router.route("/register").post(singleUpload,register);
console.log("Login route hit");
router.route("/login").post(login);
console.log("Logout route hit");
router.route("/logout").get(logout);
console.log("Profile update route hit");
router.route("/profile/update").post(isAuthenticated,singleUpload,updateProfile);