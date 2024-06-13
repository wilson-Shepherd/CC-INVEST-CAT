import express from 'express';
import { createUser, addUserCrypto } from '../controllers/userController.js';

const router = express.Router();

router.post('/users', createUser);
router.post('/users/cryptos', addUserCrypto);

export default router;
