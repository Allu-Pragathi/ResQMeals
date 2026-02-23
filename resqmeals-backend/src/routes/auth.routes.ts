import express from 'express';
import { register, login } from '../controllers/auth.controller';

const router = express.Router();

// Define auth routes
router.post('/register', register);
router.post('/login', login);

export default router;
