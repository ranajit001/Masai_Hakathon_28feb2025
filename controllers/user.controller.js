import { UserModel } from '../models/user.model.js';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import  nodemailer from 'nodemailer';
import dotnv from 'dotenv';
import cloudinary from '../configs/cloudinary.js';
dotnv.config()

import path from 'path';
import { fileURLToPath } from "url";




const generateToken = (user) => jwt.sign({_id:user._id, email: user.email, role:user.role }, process.env.JWT_SECRET);


//signup
const register = async (req, res) => {
    const { name, email, password, profilePic, role } = req.body;
    try {
        // Check if email or username already exists
        const emailExists = await UserModel.findOne({ email });
        // const usernameExists = await UserModel.findOne({ username });
        
        if (emailExists) return res.status(400).json({ message: 'This email already exists.' });
        // if (usernameExists) return res.status(400).json({ message: 'This username already exists.' });
        
        // Hash password
        const hash = await argon2.hash(password);
        
        // Create user with hashed password
        const user = await UserModel.create({ 
            name, 
            // username,
            email, 
            password: hash,
            profilePic: profilePic || "",
            role: role || "user"
        });
        
        res.status(201).json({ 
            name: user.name,
            // username: user.username,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
        console.log(`from user signup ${error}`);
    }
};


//login
const login = async (req, res) => {
    try {
        const { email, password } = req.body; 

        // Search for user by either email or username
        const user = await UserModel.findOne({email});

        if (!user) {   
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const verify = await argon2.verify(user.password, password);
        if (!verify) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
       
        const token = generateToken(user); 
        // const refreshToken = generateRefreshToken(user);  

        res.json({
            name: user.name,
           
            email: user.email,
            role: user.role,
            profilePic: user.profilePic,
            token
        });

    } catch (error) {
        console.log("Error in Userlogin:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

    

//generate new acess token if valid refresh token
// const newAcsToken = async (req, res) => {
//     try {
//         // Extract token
//         const refreshToken = req.headers.authorization?.split(' ')[1]; 
//         if (!refreshToken) return res.sendStatus(401); // No token provided

//         // Verify refresh token
//         const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        
//         // Generate new access token
//         const accessToken = generateAccessToken({ id: decoded.userId, role: decoded.role });
//         res.status(200).json({ accessToken });

//     } catch (error) {
//         console.error("Token refresh error:", error.message);

//         if (error.name === "TokenExpiredError") {
//             return res.status(401).json({ message: "Session expired, please log in again" });
//         } else if (error.name === "JsonWebTokenError") {
//             return res.status(401).json({ message: "Invalid token, please log in again" });
//         }

//         res.status(500).json({ message: "Internal server error" });
//     }
// };




//forgot passs token url getting route
// UserRouter.post("/forget_password", UserEmailforPasswordResetToken)


const sendResetEmail =   async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the email exists
        const user = await UserModel.findOne({email});

        if (!user) {
            return res.status(404).send("User with this email or Username does not exist");
        }

        // Generate reset token (valid for 20 minutes)
        const resetToken = jwt.sign({id:user._id, email: user.email, role:user.role },process.env.JWT_SECRET, {expiresIn: "10m"});

        const resetLink = `http://localhost:${process.env.PORT}/users/reset_password/${resetToken}`;
        // Configure mail transport
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODE_MAILER_ADMIN_EMAIL,
                pass: process.env.NODE_MAILER_ADMIN_PASS,
            },
        });

        // Send email with the reset link
        await transporter.sendMail({
            from: `"👋ECHOSPERE Support Team  <${process.env.NODE_MAILER_ADMIN_EMAI}>`,
            to: user.email, // Send to the user requesting the reset
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${resetLink}, valid for 10 munite`,
            // html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p><p>This link will expire in 10 minutes.</p>`,
        });

        res.status(200).send("Password reset link sent to your email.");
    } catch (error) {
        console.error("Error in forget_password:", error.message);
        res.status(500).send("Internal server error.");
    }
};



// // this will be shown to clien after clicking on the email sended limk 
// // BROWSER is always GET req
//     //GET req
// UserRouter.get("/reset_password/:token",UserPasswoedResetWebPage);
// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newPassget = (req, res) => {
    let token = req.params.token;
    const filePath = path.join(__dirname, "../public/ResetPassword.html");
    res.sendFile(filePath);
};




//   new pasword capturing route
const newPassPost = async (req, res) => {
    // Extract new password from request body
    const { password } = req.body;

    try {
        const token = req.params.token; // Ensure token is passed in the request URL
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Hash the new password using Argon2
        const hashPass = await argon2.hash(password);

        // Update user password in the database
        const updatedUser = await UserModel.findOneAndUpdate(
            { email: decoded.email }, // Email from decoded token
            { password: hashPass },
            { new: true }
        );

        if (updatedUser) {
            return res.status(200).json({ message: "Password reset successful! Please login." });
        } else {
            return res.status(404).json({ message: "User not found. Please try again later." });
        }

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};


//profile image updating route
const updateProfileImag = async(req,res)=>{
    try {
        const {profilePic} = req.body;
        const email = req.body.email;

        if(!profilePic)
                return res.status(400).send('Profile pic is required...');

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await UserModel.findOneAndUpdate(
            { email },  //searching citeria
           {profilePic:uploadResponse.secure_url},  //have o update
            { new: true } // gives updated response
        );

        res.status(200).send(updatedUser)
    } catch (e) {
        console.log('error in update profile controller',e);
        res.status(400).send('server error...')
    }
}





  export {
    register,
    login,
    sendResetEmail,
    newPassget,
    newPassPost,
    updateProfileImag
};