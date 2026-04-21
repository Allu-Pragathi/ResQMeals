import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendOtpEmail } from '../utils/mailer';
import { sendOtpSms } from '../utils/sms';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const sendVerificationOtp = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { method } = req.body; // 'EMAIL' or 'PHONE'
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const target = method === 'EMAIL' ? user.email : user.phone;
        if (!target) {
            res.status(400).json({ error: `${method === 'EMAIL' ? 'Email' : 'Phone'} not found in your profile.` });
            return;
        }

        // Check for resend cooldown (30 seconds)
        const lastOtp = await prisma.otp.findFirst({
            where: { userId, type: 'VERIFICATION' },
            orderBy: { createdAt: 'desc' }
        });

        if (lastOtp && (Date.now() - lastOtp.createdAt.getTime() < 30000)) {
            res.status(429).json({ error: 'Please wait 30 seconds before requesting another code.' });
            return;
        }

        const otpCode = generateOTP();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otpCode, salt);

        // Delete old verification OTPs for this user
        await prisma.otp.deleteMany({ where: { userId, type: 'VERIFICATION' } });

        await prisma.otp.create({
            data: {
                userId,
                code: hashedOtp,
                type: 'VERIFICATION',
                email: method === 'EMAIL' ? user.email : null,
                phone: method === 'PHONE' ? user.phone : null,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
                attempts: 0
            }
        });

        // Send OTP
        let sent = false;
        if (method === 'EMAIL') {
            const result = await sendOtpEmail(user.email, otpCode, 'PROFILE_VERIFICATION' as any);
            sent = !!result;
        } else {
            const result = await sendOtpSms(user.phone!, otpCode);
            sent = !!result;
        }

        if (!sent) {
            res.status(500).json({ error: `Could not deliver verification code to your ${method === 'EMAIL' ? 'email' : 'phone'}. Please check your connection or contact support.` });
            return;
        }

        res.status(200).json({ message: `Verification code sent to your ${method === 'EMAIL' ? 'email' : 'phone'}.` });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ error: 'Failed to send verification code' });
    }
};

export const confirmVerificationOtp = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { code, method } = req.body;
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const otpRecord = await prisma.otp.findFirst({
            where: { userId, type: 'VERIFICATION' },
            orderBy: { createdAt: 'desc' }
        });

        if (!otpRecord) {
            res.status(400).json({ error: 'No verification code found. Please request a new one.' });
            return;
        }

        // Check expiry
        if (new Date() > otpRecord.expiresAt) {
            res.status(400).json({ error: 'Code has expired. Please request a new one.' });
            return;
        }

        // Check attempts
        if (otpRecord.attempts >= 3) {
            res.status(400).json({ error: 'Maximum attempts reached. Please request a new code.' });
            return;
        }

        // Verify code
        const isMatch = await bcrypt.compare(code, otpRecord.code);
        if (!isMatch) {
            await prisma.otp.update({
                where: { id: otpRecord.id },
                data: { attempts: { increment: 1 } }
            });
            res.status(400).json({ error: 'Invalid code. Please try again.' });
            return;
        }

        // Success: Mark user as verified
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { 
                isVerified: true,
                verificationMethod: method
            }
        });

        // Clean up OTPs
        await prisma.otp.deleteMany({ where: { userId, type: 'VERIFICATION' } });

        res.status(200).json({ 
            message: 'Profile verified successfully!',
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                isVerified: true,
                verificationMethod: updatedUser.verificationMethod
            }
        });
    } catch (error) {
        console.error('Confirm OTP error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
};
