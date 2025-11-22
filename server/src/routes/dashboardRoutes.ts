import express from 'express';
import {
  getPatientDashboard,
  getDoctorDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController';
import { getPatientActivities, getMyActivities } from '../controllers/activityController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All dashboard routes require authentication
router.use(authenticate);

// Dashboard routes
router.get('/patient', getPatientDashboard);
router.get('/doctor', getDoctorDashboard);
router.get('/admin', getAdminDashboard);

// Activity log routes
router.get('/activities/me', getMyActivities);
router.get('/activities/patient/:patientId', getPatientActivities);

export default router;

