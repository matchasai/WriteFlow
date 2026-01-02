import express from 'express';
import { subscribe } from '../controllers/newsletterController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validateSubscription } from '../middleware/validator.js';

const router = express.Router();

router.post('/subscribe', validateSubscription, asyncHandler(subscribe));

export default router;
