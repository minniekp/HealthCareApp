import Activity from '../models/Activity';
import { Request } from 'express';

export interface ActivityLogData {
  userId: string;
  userRole: 'patient' | 'doctor' | 'admin';
  activityType: 'login' | 'logout' | 'profile_update' | 'appointment_created' | 'appointment_updated' | 'prescription_added' | 'record_viewed' | 'other';
  description: string;
  metadata?: Record<string, any>;
}

/**
 * Log user activity
 */
export const logActivity = async (
  data: ActivityLogData,
  req?: Request
): Promise<void> => {
  try {
    await Activity.create({
      userId: data.userId,
      userRole: data.userRole,
      activityType: data.activityType,
      description: data.description,
      metadata: data.metadata || {},
      ipAddress: req?.ip || req?.socket.remoteAddress,
      userAgent: req?.get('user-agent'),
    });
  } catch (error) {
    // Don't throw error - activity logging should not break the main flow
    console.error('Failed to log activity:', error);
  }
};

/**
 * Get client IP address from request
 */
export const getClientIp = (req: Request): string => {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
    req.socket.remoteAddress ||
    'unknown'
  );
};

