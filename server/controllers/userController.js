import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import signInJWT from '../utils/signInJWT.js';

// 注册用户
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({
      username,
      email,
      password
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Username or email already exists' });
    } else if (error.name === 'ValidationError' && error.errors.password) {
      res.status(400).json({ message: 'Password requirements not met' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

// 登录用户
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = await signInJWT(user._id);
    res.json({ token });
  } catch (error) {
    console.error(error);
    if (error.name === 'MongoError') {
      res.status(400).json({ message: 'Invalid email or password' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};
