import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { geocodeAddress } from '../utils/geocoder';
import { sendDonationNotification, sendPickupOtpEmail } from '../utils/mailer';
import { MLService } from '../services/ml.service';
import { getIO } from '../socket';

const prisma = new PrismaClient();

// ML Task Endpoints
export const getMlForecast = async (req: AuthRequest, res: Response) => {
    try {
        const { lat, lng } = req.query;
        if (!lat || !lng) return res.status(400).json({ error: 'Lat/Lng required' });

        const forecast = await MLService.getForecast(Number(lat), Number(lng));
        res.json({ forecast });
    } catch (err) {
        res.status(500).json({ error: 'Forecast failed' });
    }
};

export const getNgoMatches = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string;
        const rankedNgos = await MLService.rankNGOs(id);
        res.json({ matches: rankedNgos });
    } catch (err) {
        res.status(500).json({ error: 'Matching failed' });
    }
};

export const getRouteRecommendation = async (req: AuthRequest, res: Response) => {
    try {
        const { startLat, startLng, stops } = req.body; // stops: [{id, lat, lng}]
        const optimized = MLService.optimizeRoute({ lat: Number(startLat), lng: Number(startLng) }, stops);
        res.json({ route: optimized });
    } catch (err) {
        res.status(500).json({ error: 'Routing failed' });
    }
};

// Get all active donations
export const getAllDonations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const donations = await prisma.donation.findMany({
            include: {
                donor: { select: { name: true, phone: true } },
                requests: {
                    include: {
                        ngo: { select: { name: true, address: true, latitude: true, longitude: true } }
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
        console.log('--- ATTEMPTING TO CREATE DONATION ---');
        console.log('User Raw Role from JWT:', req.user?.role);
        const role = req.user?.role?.toUpperCase();
        console.log('Normalized Role:', role);
        console.log('Allowed Roles:', ['DONOR', 'EVENTS']);

        const allowedRoles = ['DONOR', 'EVENTS'];
        if (!req.user || !role || !allowedRoles.includes(role)) {
            console.warn(`SECURITY BLOCK: User ${req.user?.userId} with role ${req.user?.role} attempted to donate.`);
            res.status(403).json({ 
                error: 'Only donors or event managers can create donations.',
                debugInfo: {
                    receivedRole: role || 'MISSING',
                    userId: req.user?.userId || 'MISSING'
                }
            });
            return;
        }

        const { foodType, quantity, expiry, location, radius } = req.body;
        const searchRadius = Number(radius) || 5;
        const donorId = req.user.userId;

        // Generate a 4-digit pickup OTP
        const pickupOtp = Math.floor(1000 + Math.random() * 9000).toString();

        console.log('Geocoding location:', location);
        const coords = await geocodeAddress(location);
        console.log('Geocoding result:', coords);

        const newDonation = await prisma.donation.create({
            data: {
                foodType,
                quantity,
                expiry,
                location,
                latitude: coords.latitude,
                longitude: coords.longitude,
                donorId,
                status: 'Pending',
                pickupOtp: pickupOtp,
                searchRadius: searchRadius
            },
            include: { donor: true }
        });

        console.log('Donation created in DB:', newDonation.id);

        // Send OTP email to donor for their reference
        if (newDonation.donor?.email) {
            console.log('Sending OTP email to donor...');
            // FIXED order: donorEmail, donorName, foodType, code
            await sendPickupOtpEmail(newDonation.donor.email, newDonation.donor.name, foodType, pickupOtp);
        }

        // Radius search and notify NGOs within 5KM
        if (coords.latitude !== null && coords.longitude !== null) {
            try {
                console.log('Searching for nearby NGOs...');
                const ngos: any[] = await prisma.$queryRaw`
                    SELECT id, email, name, latitude, longitude 
                    FROM "User" 
                    WHERE role = 'NGO' 
                    AND latitude IS NOT NULL 
                    AND longitude IS NOT NULL
                    AND (
                        6371 * acos(
                            cos(radians(${coords.latitude})) * cos(radians(latitude)) *
                            cos(radians(longitude) - radians(${coords.longitude})) +
                            sin(radians(${coords.latitude})) * sin(radians(latitude))
                        )
                    ) <= ${searchRadius}
                `;

                console.log(`Found ${ngos.length} nearby NGOs.`);

                for (const ngo of ngos) {
                    const dist = 6371 * Math.acos(
                        Math.cos(coords.latitude * Math.PI / 180) * Math.cos(ngo.latitude * Math.PI / 180) *
                        Math.cos((ngo.longitude - coords.longitude) * Math.PI / 180) +
                        Math.sin(coords.latitude * Math.PI / 180) * Math.sin(ngo.latitude * Math.PI / 180)
                    );
                    await sendDonationNotification(ngo.email, ngo.name, foodType, dist.toFixed(1));
                }
            } catch (spatialError) {
                console.error('Radius search failed:', spatialError);
            }
        }

        res.status(201).json({ 
            message: 'Donation created successfully and nearby NGOs notified.', 
            donation: newDonation 
        });

    } catch (error) {
        console.error('ACTUAL SERVER ERROR CREATING DONATION:', error);
        res.status(500).json({ error: 'Failed to create donation', details: error instanceof Error ? error.message : String(error) });
    }
};

export const verifyPickup = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { otp } = req.body;

        const donation = await prisma.donation.findUnique({
            where: { id: id }
        });

        if (!donation) {
            res.status(404).json({ error: 'Donation not found' });
            return;
        }

        if (donation.pickupOtp !== otp) {
            res.status(400).json({ error: 'Invalid Pickup OTP. Please ask the donor for the correct code.' });
            return;
        }

        const updated = await prisma.donation.update({
            where: { id: id },
            data: { 
                status: 'Picked',
                pickupOtp: null // OTP used
            }
        });

        try {
            const io = getIO();
            io.emit('status:updated', { id: updated.id, status: updated.status });
            io.to(`mission_${updated.id}`).emit('pickup:completed', { id: updated.id });
        } catch(e) { console.error('Socket emit error:', e); }

        res.status(200).json({ message: 'Pickup verified successfully!', donation: updated });
    } catch (err) {
        console.error('Verify pickup error:', err);
        res.status(500).json({ error: 'Failed to verify pickup' });
    }
};

// Update donation location (e.g., for tracking)
export const updateLocation = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { latitude, longitude } = req.body;

      if (!latitude || !longitude) {
        res.status(400).json({ error: 'Latitude and Longitude are required' });
        return;
      }

      const updated = await prisma.donation.update({
        where: { id: id },
        data: {
          currentLat: parseFloat(latitude),
          currentLng: parseFloat(longitude),
        },
      });

      res.status(200).json({ donation: updated });
    } catch (err: any) {
      console.error('Update location error:', err);
      res.status(500).json({ error: 'Failed to update location' });
    }
};

// Get a single donation by ID
export const getDonationById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const donation = await prisma.donation.findUnique({
            where: { id: id },
            include: { donor: { select: { name: true, phone: true } } }
        });
        if (!donation) {
            res.status(404).json({ error: 'Donation not found' });
            return;
        }
        res.status(200).json({ donation });
    } catch (err: any) {
        console.error('Get donation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get donations by a specific donor
export const getMyDonations = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const role = req.user?.role?.toUpperCase();
        const allowedRoles = ['DONOR', 'EVENTS'];
        if (!req.user || !role || !allowedRoles.includes(role)) {
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

        try {
            const io = getIO();
            io.emit('status:updated', { id: updatedDonation.id, status: updatedDonation.status });
            io.to(`mission_${updatedDonation.id}`).emit('ngo:accepted', { id: updatedDonation.id, ngoId: req.user!.userId });
        } catch(e) { console.error('Socket emit error:', e); }

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

        try {
            const io = getIO();
            io.emit('status:updated', { id: updatedDonation.id, status: updatedDonation.status });
            if (status === 'Delivered') {
                io.to(`mission_${updatedDonation.id}`).emit('delivery:completed', { id: updatedDonation.id });
            }
        } catch(e) { console.error('Socket emit error:', e); }

        res.status(200).json({ message: `Donation status updated to ${status}`, donation: updatedDonation });
    } catch (error) {
        console.error('Error updating donation status:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
};
