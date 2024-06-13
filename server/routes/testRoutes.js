import express from 'express';
import { getUsers } from '../controllers/testController.js';

const router = express.Router();

router.get('/test/users', getUsers);

export default router;
