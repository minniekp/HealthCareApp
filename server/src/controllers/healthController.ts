import { Response } from 'express';
import HealthData from '../models/HealthData';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/activityLogger';

/**
 * Get health data for a user
 */
export const getHealthData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { days = 30 } = req.query;
    const requesterRole = req.user?.role;
    const patientId = req.params.patientId;

    // Determine which user's data to fetch
    let targetUserId = userId;
    
    // If patientId is provided and requester is doctor/admin, fetch that patient's data
    if (patientId && (requesterRole === 'doctor' || requesterRole === 'admin')) {
      targetUserId = patientId;
    } else if (patientId && requesterRole === 'patient' && patientId !== userId) {
      // Patients can only view their own data
      res.status(403).json({
        success: false,
        message: 'You can only view your own health data',
      });
      return;
    }

    if (!targetUserId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const daysNumber = parseInt(days as string, 10);
    if (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 365) {
      res.status(400).json({
        success: false,
        message: 'Days must be between 1 and 365',
      });
      return;
    }

    // Calculate date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNumber);
    startDate.setHours(0, 0, 0, 0);

    // Fetch health data
    const healthData = await HealthData.find({
      userId: targetUserId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    })
      .sort({ date: 1 })
      .select('date steps waterIntake sleepHours');

    // Calculate statistics
    const totalSteps = healthData.reduce((sum, data) => sum + (data.steps || 0), 0);
    const totalWater = healthData.reduce((sum, data) => sum + (data.waterIntake || 0), 0);
    const totalSleep = healthData.reduce((sum, data) => sum + (data.sleepHours || 0), 0);
    const avgSteps = healthData.length > 0 ? Math.round(totalSteps / healthData.length) : 0;
    const avgWater = healthData.length > 0 ? Math.round(totalWater / healthData.length) : 0;
    const avgSleep = healthData.length > 0 ? parseFloat((totalSleep / healthData.length).toFixed(1)) : 0;

    res.status(200).json({
      success: true,
      message: 'Health data retrieved successfully',
      data: {
        healthData: healthData.map((data) => ({
          date: data.date,
          steps: data.steps,
          waterIntake: data.waterIntake,
          sleepHours: data.sleepHours,
        })),
        statistics: {
          totalSteps,
          totalWater,
          totalSleep: avgSleep,
          avgSteps,
          avgWater,
          avgSleep,
          daysCount: healthData.length,
        },
        period: {
          startDate,
          endDate,
          days: daysNumber,
        },
      },
    });
  } catch (error: any) {
    console.error('Get health data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Create or update health data for a user
 */
export const upsertHealthData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { date, steps, waterIntake, sleepHours } = req.body;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    if (!date) {
      res.status(400).json({
        success: false,
        message: 'Date is required',
      });
      return;
    }

    // Validate inputs
    if (steps !== undefined && (steps < 0 || !Number.isInteger(steps))) {
      res.status(400).json({
        success: false,
        message: 'Steps must be a non-negative integer',
      });
      return;
    }

    if (waterIntake !== undefined && waterIntake < 0) {
      res.status(400).json({
        success: false,
        message: 'Water intake cannot be negative',
      });
      return;
    }

    if (sleepHours !== undefined && (sleepHours < 0 || sleepHours > 24)) {
      res.status(400).json({
        success: false,
        message: 'Sleep hours must be between 0 and 24',
      });
      return;
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
      return;
    }

    // Normalize date to start of day
    dateObj.setHours(0, 0, 0, 0);

    // Find or create health data
    let healthData = await HealthData.findOne({
      userId,
      date: dateObj,
    });

    if (healthData) {
      // Update existing record
      if (steps !== undefined) healthData.steps = steps;
      if (waterIntake !== undefined) healthData.waterIntake = waterIntake;
      if (sleepHours !== undefined) healthData.sleepHours = sleepHours;
      await healthData.save();
    } else {
      // Create new record
      healthData = await HealthData.create({
        userId,
        date: dateObj,
        steps: steps || 0,
        waterIntake: waterIntake || 0,
        sleepHours: sleepHours || 0,
      });
    }

    // Log activity
    const userRole = req.user?.role;
    if (userRole && ['patient', 'doctor', 'admin'].includes(userRole)) {
      await logActivity(
        {
          userId: userId,
          userRole: userRole as 'patient' | 'doctor' | 'admin',
          activityType: 'other',
          description: 'Health data updated',
          metadata: {
            date: dateObj.toISOString(),
            steps,
            waterIntake,
            sleepHours,
          },
        },
        req
      );
    }

    res.status(200).json({
      success: true,
      message: 'Health data saved successfully',
      data: {
        healthData: {
          id: healthData._id,
          date: healthData.date,
          steps: healthData.steps,
          waterIntake: healthData.waterIntake,
          sleepHours: healthData.sleepHours,
        },
      },
    });
  } catch (error: any) {
    console.error('Upsert health data error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

