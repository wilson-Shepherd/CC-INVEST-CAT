import express from 'express';
import { notify } from '../controllers/dcNotificationController.js';

const router = express.Router();

router.post('/notify', notify);

export default router;
