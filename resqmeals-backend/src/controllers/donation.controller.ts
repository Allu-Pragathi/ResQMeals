import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

// Get all active donations
export const getAllDonations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const donations = await prisma.donation.findMany({
            include: {
                donor: { select: { name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({ donations });
    } catch (error) {
        console.error('Error fetching donations:', error);
        res.status(500).json({ error: 'Failed to fetch donations' });
    }
};

// Create a new donation (Donor only)
export const createDonation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'DONOR') {
            res.status(403).json({ error: 'Only donors can create donations.' });
            return;
        }

        const { foodType, quantity, expiry, location } = req.body;

        const newDonation = await prisma.donation.create({
            data: {
                foodType,
                quantity,
                expiry,
                location,
                status: 'Pending',
                donorId: req.user.userId,
            },
            include: {
                donor: { select: { name: true, phone: true } }
            }
        });

        res.status(201).json({ message: 'Donation created successfully', donation: newDonation });
    } catch (error) {
        console.error('Error creating donation:', error);
        res.status(500).json({ error: 'Failed to create donation' });
    }
};

// Get donations by a specific donor
export const getMyDonations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'DONOR') {
            res.status(403).json({ error: 'Only donors can view their own history this way.' });
            return;
        }

        const donations = await prisma.donation.findMany({
            where: { donorId: req.user.userId },
            orderBy: { createdAt: 'desc' },
        });

        res.status(200).json({ donations });
    } catch (error) {
        console.error('Error fetching my donations:', error);
        res.status(500).json({ error: 'Failed to fetch your donations' });
    }
};
