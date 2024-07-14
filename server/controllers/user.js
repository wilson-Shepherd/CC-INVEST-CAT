import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import SpotAccount from "../models/SpotAccount.js";
import FuturesAccount from "../models/FuturesAccount.js";
import { signJWT } from "../utils/jwt.js";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = new User({ username, email, password });
    await user.save();

    const spotAccount = new SpotAccount({ userId: user._id });
    await spotAccount.save();

    const futuresAccount = new FuturesAccount({ userId: user._id });
    await futuresAccount.save();

    const token = await signJWT(user._id);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: "Username or email already exists" });
    } else if (error.name === "ValidationError" && error.errors.password) {
      res.status(400).json({ message: "Password requirements not met" });
    } else {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = await signJWT(user._id);
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User with this email does not exist" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_KEY, {
      expiresIn: "1h",
    });

<<<<<<< HEAD
    const resetUrl = `http://localhost:5173/reset-password/${token}`;
=======
    const resetUrl = `http://www.cc-invest-cat.com/reset-password/${token}`;
>>>>>>> demo

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL,
      subject: "咖資貓密碼重置",
      text: `您收到此郵件是因為您（或其他人）要求重置您賬戶的密碼。\n\n
            請點擊以下鏈接，或將其粘貼到您的瀏覽器中以完成此過程：\n\n
            ${resetUrl}\n\n
            如果您沒有提出此要求，請忽略此郵件，您的密碼將保持不變。\n`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).json({ message: "Error sending email" });
      }
      res.status(200).json({ message: "Email sent successfully" });
    });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is invalid or has expired" });
    }

    user.password = password;

    await user.save();
    res.status(200).json({ message: "Password has been reset" });
  } catch {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
