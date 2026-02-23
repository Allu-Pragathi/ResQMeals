import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import donationRoutes from './routes/donation.routes';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

// Main Authentication Routes
// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'ResQMeals API is running' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
