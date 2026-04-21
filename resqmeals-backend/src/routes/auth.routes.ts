import express from 'express';
import { register, login, updateProfile, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Define auth routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticateToken as express.RequestHandler, getMe as express.RequestHandler);
router.put('/profile', authenticateToken as express.RequestHandler, updateProfile as express.RequestHandler);

export default router;
