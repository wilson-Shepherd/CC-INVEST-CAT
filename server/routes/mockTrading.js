import express from 'express';
const router = express.Router();
import { createMockTrade, getMockAccount } from '../controllers/mockTrading.js';

router.post('/mockTrade', createMockTrade);
router.get('/mockAccount/:userId', getMockAccount);

export default router;
