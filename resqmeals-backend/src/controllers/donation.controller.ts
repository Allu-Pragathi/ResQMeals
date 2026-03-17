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
                requests: {
                    include: {
                        ngo: { select: { name: true } }
                    },
                    where: { status: 'Approved' },
                    take: 1
                }
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
        const allowedRoles = ['Donor', 'Events', 'DONOR']; // Case insensitive handling ideally, but following existing patterns
        if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Only donors or event managers can create donations.' });
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
        const allowedRoles = ['Donor', 'Events', 'DONOR'];
        if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Only donors or event managers can view their own history.' });
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

// NGO accepts a donation
export const acceptDonation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'NGO') {
            res.status(403).json({ error: 'Only NGOs can accept donations.' });
            return;
        }

        const id = req.params.id as string;
        if (!id) {
            res.status(400).json({ error: 'Donation ID is required' });
            return;
        }

        // Check if donation is still pending
        const donation = await prisma.donation.findUnique({
            where: { id },
        });

        if (!donation) {
            res.status(404).json({ error: 'Donation not found' });
            return;
        }

        if (donation.status !== 'Pending') {
            res.status(400).json({ error: 'Donation is already accepted or completed.' });
            return;
        }

        // Transaction: Update donation status and create a Request record
        const updatedDonation = await prisma.$transaction(async (tx) => {
            const d = await tx.donation.update({
                where: { id },
                data: { status: 'Accepted' },
            });

            await tx.request.create({
                data: {
                    donationId: id,
                    ngoId: req.user!.userId,
                    status: 'Approved', // NGOs immediately approve their own "acceptance" in this simplified model
                }
            });

            return d;
        });

        res.status(200).json({ message: 'Donation accepted successfully', donation: updatedDonation });
    } catch (error) {
        console.error('Error accepting donation:', error);
        res.status(500).json({ error: 'Failed to accept donation' });
    }
};

// Update donation status (Volunteer/NGO)
export const updateDonationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        if (!id) {
            res.status(400).json({ error: 'Donation ID is required' });
            return;
        }
        const { status } = req.body; // "Picked", "Delivered"

        const validStatuses = ['Picked', 'Delivered'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status update' });
            return;
        }

        const donation = await prisma.donation.findUnique({ where: { id } });
        if (!donation) {
            res.status(404).json({ error: 'Donation not found' });
            return;
        }

        const updatedDonation = await prisma.donation.update({
            where: { id },
            data: { status },
        });

        res.status(200).json({ message: `Donation status updated to ${status}`, donation: updatedDonation });
    } catch (error) {
        console.error('Error updating donation status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};
