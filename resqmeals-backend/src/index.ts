import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { initializeSocket } from './socket';
import authRoutes from './routes/auth.routes';
import donationRoutes from './routes/donation.routes';
import chatRoutes from './routes/chat.routes';
import verificationRoutes from './routes/verification.routes';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Simple request logger
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Main Authentication Routes
// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/verify', verificationRoutes);

const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'ResQMeals API is running' });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
