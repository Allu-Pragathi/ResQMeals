import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { geocodeAddress } from '../utils/geocoder';
import { sendOtpEmail } from '../utils/mailer';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-fallback';

// Helper to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role, address, phone } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            res.status(400).json({ error: 'User with this email already exists' });
            return;
        }

        // 1. Geocode the address before saving
        let lat = null;
        let lng = null;
        if (address) {
            const coords = await geocodeAddress(address);
            lat = coords.latitude;
            lng = coords.longitude;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user in database (unverified)
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                address,
                phone,
                latitude: lat,
                longitude: lng,
                isVerified: false
            },
        });

        // Generate Token immediately for auto-login after signup
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful! Verification can be completed in your profile.',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error during registration' });
    }
};



export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate Token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                latitude: user.latitude,
                longitude: user.longitude,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error during login' });
    }
};


export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.userId;
        const { name, email, password, address, phone } = req.body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (address) {
            updateData.address = address;
            const coords = await geocodeAddress(address);
            if (coords.latitude && coords.longitude) {
                updateData.latitude = coords.latitude;
                updateData.longitude = coords.longitude;
            }
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        console.log(`[DEBUG] Updating profile for userId: ${userId}`);
        console.log(`[DEBUG] Update data:`, updateData);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                address: updatedUser.address,
                phone: updatedUser.phone,
                latitude: updatedUser.latitude,
                longitude: updatedUser.longitude
            }
        });
    } catch (error: any) {
        console.error('Update profile error:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'This email is already in use by another account.' });
            return;
        }
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                phone: user.phone,
                latitude: user.latitude,
                longitude: user.longitude,
                isVerified: user.isVerified,
                verificationMethod: user.verificationMethod
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
