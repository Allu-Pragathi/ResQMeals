import express from 'express';
import { sendVerificationOtp, confirmVerificationOtp } from '../controllers/verification.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticateToken as express.RequestHandler);

router.post('/send-otp', sendVerificationOtp as express.RequestHandler);
router.post('/confirm-otp', confirmVerificationOtp as express.RequestHandler);

export default router;
