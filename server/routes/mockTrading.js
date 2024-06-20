import express from 'express';
import { getMockAccount } from '../controllers/mockTrading.js';

const router = express.Router();

router.get('/mockAccount/:userId', getMockAccount);

export default router;
