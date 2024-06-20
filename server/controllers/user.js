import User from '../models/user.js';
import MockAccount from '../models/mockAccount.js';
import bcrypt from 'bcryptjs';
import { signJWT } from '../utils/jwt.js';

export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({ username, email, password });
    await user.save();

    const mockAccount = new MockAccount({ userId: user._id });
    await mockAccount.save();

    const token = await signJWT(user._id);

    res.status(201).json({ message: 'User registered successfully', user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Username or email already exists' });
    } else if (error.name === 'ValidationError' && error.errors.password) {
      res.status(400).json({ message: 'Password requirements not met' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};

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

    const token = await signJWT(user._id);
    res.json({ message: 'Login successful', user, token });
  } catch (error) {
    console.error('Error logging in user:', error);
    if (error.name === 'MongoError') {
      res.status(400).json({ message: 'Invalid email or password' });
    } else {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
};
