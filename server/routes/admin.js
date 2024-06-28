import express from 'express';
import { getUserOrderFees, getFuturesUserRiskRates } from '../controllers/admin.js';
import authenticate from '../middlewares/authenticate.js';
import authorize from '../middlewares/authorization.js';

const router = express.Router();

router.use(authenticate);

router.get('/order-fees', authorize, getUserOrderFees);
router.get('/futures-risk-rates', authorize, getFuturesUserRiskRates);

export default router;
