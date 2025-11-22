import express from 'express';
import {
  getProfile,
  updateProfile,
  getUserById,
  updateUserRole,
  updateUserStatus,
} from '../controllers/userController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.patch('/profile', updateProfile); // Support both PUT and PATCH

// User management routes (for doctors/admins)
router.get('/:userId', getUserById);
router.patch('/:userId/role', updateUserRole);
router.put('/:userId/role', updateUserRole);
router.patch('/:userId/status', updateUserStatus);
router.put('/:userId/status', updateUserStatus);

export default router;

