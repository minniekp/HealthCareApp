import express from 'express';
import { getHealthData, upsertHealthData } from '../controllers/healthController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All health routes require authentication
router.use(authenticate);

// Health data routes
router.get('/patient/:patientId', getHealthData);
router.get('/', getHealthData);
router.post('/', upsertHealthData);
router.put('/', upsertHealthData);

export default router;

