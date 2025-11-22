import { Request, Response } from 'express';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/auth';

/**
 * Get activity logs for a specific patient (for doctors)
 */
export const getPatientActivities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { patientId } = req.params;
    const doctorId = req.user?.userId;
    const doctorRole = req.user?.role;

    // Only doctors can view patient activities
    if (doctorRole !== 'doctor') {
      res.status(403).json({
        success: false,
        message: 'Only doctors can view patient activities',
      });
      return;
    }

    if (!patientId) {
      res.status(400).json({
        success: false,
        message: 'Patient ID is required',
      });
      return;
    }

    // Get activities for the patient
    const activities = await Activity.find({ userId: patientId })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'firstname lastname email');

    res.status(200).json({
      success: true,
      message: 'Patient activities retrieved successfully',
      data: {
        activities: activities.map((activity) => ({
          id: activity._id,
          type: activity.activityType,
          description: activity.description,
          date: activity.createdAt,
          metadata: activity.metadata,
          ipAddress: activity.ipAddress,
        })),
        total: activities.length,
      },
    });
  } catch (error: any) {
    console.error('Get patient activities error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Get activity logs for current user
 */
export const getMyActivities = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const { limit = 50, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get activities for the user
    const activities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Activity.countDocuments({ userId });

    res.status(200).json({
      success: true,
      message: 'Activities retrieved successfully',
      data: {
        activities: activities.map((activity) => ({
          id: activity._id,
          type: activity.activityType,
          description: activity.description,
          date: activity.createdAt,
          metadata: activity.metadata,
        })),
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    console.error('Get my activities error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

