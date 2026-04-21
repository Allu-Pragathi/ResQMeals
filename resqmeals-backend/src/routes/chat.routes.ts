import express from 'express';
import { handleChat } from '../controllers/chat.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all routes below
router.use(authenticateToken as express.RequestHandler);

router.post('/message', handleChat as express.RequestHandler);

export default router;
