import User from "../models/user.js";
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
