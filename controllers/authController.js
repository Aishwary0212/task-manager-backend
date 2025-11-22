const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//Generate jwt token
const generateToken =(userId)=>{
    return jwt.sign({id:userId},process.env.JWT_SECRET,{
        expiresIn:'7d',
    });
}

const registerUser = async (req, res) => {
    console.log("REGISTER BODY:", req.body);


    try {
        console.log("REGISTER HIT:", req.body);

        const { name, email, password, profileImageUrl, adminInviteToken } = req.body;
        // Check if user already exists
        const userExists = await User.findOne({ email });
        if(userExists){
            return  res.status(400).json({ message: 'User already exists' });
        }

        // Determine user role: Admin if Correct token is provided else member
        let role = "member";
        if(adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN){
            role = "admin";
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
          name,
          email,
          password: hashedPassword,
          profileImageUrl,
          role,
        });
        
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            profileImageUrl: newUser.profileImageUrl,
            token: generateToken(newUser._id),
        });
        
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
        console.log(error.message);
        console.log("REGISTER ERROR:", error);

    }
 };
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Return user data with jwt
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImageUrl: user.profileImageUrl,
            token: generateToken(user._id),
        });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    } 
 };
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
 };
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profileImageUrl: updatedUser.profileImageUrl,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
 };

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};