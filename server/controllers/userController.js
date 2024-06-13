import User from '../models/User.js';
import UserCrypto from '../models/UserCrypto.js';

export const createUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const newUser = new User({
      username,
      email,
      password,
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addUserCrypto = async (req, res) => {
  const { userId, cryptoSymbol } = req.body;

  try {
    const newUserCrypto = new UserCrypto({
      user: userId,
      cryptoSymbol,
    });

    await newUserCrypto.save();
    res.status(201).json(newUserCrypto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
