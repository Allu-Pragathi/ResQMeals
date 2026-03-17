import express from 'express';
import { 
    getAllDonations, 
    createDonation, 
    getMyDonations, 
    acceptDonation, 
    updateDonationStatus 
} from '../controllers/donation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Apply auth middleware to all routes below
router.use(authenticateToken as express.RequestHandler);

// Define logistics endpoints
router.get('/', getAllDonations as express.RequestHandler);
router.post('/', createDonation as express.RequestHandler);
router.get('/me', getMyDonations as express.RequestHandler);
router.patch('/:id/accept', acceptDonation as express.RequestHandler);
router.patch('/:id/status', updateDonationStatus as express.RequestHandler);

export default router;
