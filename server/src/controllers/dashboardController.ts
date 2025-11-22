import { Request, Response } from 'express';
import User from '../models/User';
import Activity from '../models/Activity';
import { AuthRequest } from '../middleware/auth';

/**
 * Get patient dashboard data
 */
export const getPatientDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Only patients can access patient dashboard
    if (userRole !== 'patient') {
      res.status(403).json({
        success: false,
        message: 'Only patients can access patient dashboard',
      });
      return;
    }

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Get recent activities for the patient
    const recentActivities = await Activity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('activityType description createdAt');

    // Get activity counts
    const activityCounts = await Activity.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get last login
    const lastLogin = await Activity.findOne({
      userId,
      activityType: 'login',
    })
      .sort({ createdAt: -1 })
      .select('createdAt');

    // Dummy data for now (can be replaced with real data from other models)
    const dashboardData = {
      stats: {
        upcomingAppointments: 3,
        medicalRecords: 12,
        activePrescriptions: 5,
        healthScore: 85,
      },
      recentActivities: recentActivities.map((activity) => ({
        type: activity.activityType,
        description: activity.description,
        date: activity.createdAt,
      })),
      lastLogin: lastLogin?.createdAt || null,
      activityCounts: activityCounts.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    res.status(200).json({
      success: true,
      message: 'Patient dashboard data retrieved successfully',
      data: dashboardData,
    });
  } catch (error: any) {
    console.error('Patient dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Get doctor dashboard data
 */
export const getDoctorDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const doctorId = req.user?.userId;
    const userRole = req.user?.role;

    if (!doctorId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Only doctors can access doctor dashboard
    if (userRole !== 'doctor') {
      res.status(403).json({
        success: false,
        message: 'Only doctors can access doctor dashboard',
      });
      return;
    }

    // Get all patients (in real app, this would be filtered by doctor assignment)
    const patients = await User.find({ role: 'patient' })
      .select('firstname lastname email DOB gender createdAt')
      .sort({ createdAt: -1 });

    // Get patient activity logs
    const patientIds = patients.map((p) => p._id);
    const patientActivities = await Activity.find({
      userId: { $in: patientIds },
      userRole: 'patient',
    })
      .populate('userId', 'firstname lastname email')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get stats
    const totalPatients = patients.length;
    const activePatients = await Activity.distinct('userId', {
      userRole: 'patient',
      activityType: 'login',
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    });

    // Get upcoming appointments count (dummy for now)
    const upcomingAppointments = 8;

    // Get recent patient activities grouped by patient
    const activitiesByPatient = patientActivities.reduce(
      (acc, activity) => {
        const patientId = (activity.userId as any)?._id?.toString();
        if (!acc[patientId]) {
          acc[patientId] = [];
        }
        acc[patientId].push({
          type: activity.activityType,
          description: activity.description,
          date: activity.createdAt,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    // Format patients with their latest activity
    const patientsWithActivities = patients.map((patient) => {
      const patientId = patient._id.toString();
      const activities = activitiesByPatient[patientId] || [];
      const lastActivity = activities[0] || null;
      const lastLogin = activities.find((a) => a.type === 'login') || null;

      return {
        id: patient._id,
        firstname: patient.firstname,
        lastname: patient.lastname,
        email: patient.email,
        age: new Date().getFullYear() - new Date(patient.DOB).getFullYear(),
        gender: patient.gender,
        lastLogin: lastLogin?.date || null,
        lastActivity: lastActivity?.date || null,
        activityCount: activities.length,
        status: patient.status || (lastLogin ? 'active' : 'inactive'),
      };
    });

    const dashboardData = {
      stats: {
        totalPatients,
        activePatients: activePatients.length,
        upcomingAppointments,
        pendingReviews: 8,
      },
      patients: patientsWithActivities,
      recentActivities: patientActivities.slice(0, 20).map((activity) => ({
        patientId: (activity.userId as any)?._id,
        patientName: (activity.userId as any)
          ? `${(activity.userId as any).firstname} ${(activity.userId as any).lastname}`
          : 'Unknown',
        type: activity.activityType,
        description: activity.description,
        date: activity.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
      message: 'Doctor dashboard data retrieved successfully',
      data: dashboardData,
    });
  } catch (error: any) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userRole = req.user?.role;

    // Only admins can access admin dashboard
    if (userRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can access admin dashboard',
      });
      return;
    }
    // Get total users
    const totalUsers = await User.countDocuments();
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });

    // Get recent registrations
    const recentRegistrations = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstname lastname email role createdAt');

    // Get activity stats
    const totalActivities = await Activity.countDocuments();
    const recentActivities = await Activity.find()
      .populate('userId', 'firstname lastname email role')
      .sort({ createdAt: -1 })
      .limit(20);

    // Get activity by type
    const activitiesByType = await Activity.aggregate([
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get all users with their last login activity
    const allUsers = await User.find()
      .select('firstname lastname email DOB gender role createdAt')
      .sort({ createdAt: -1 });

    const userIds = allUsers.map((u) => u._id);
    const lastLoginActivities = await Activity.find({
      userId: { $in: userIds },
      activityType: 'login',
    })
      .sort({ createdAt: -1 })
      .select('userId createdAt');

    // Create a map of last login by user ID
    const lastLoginMap = new Map();
    lastLoginActivities.forEach((activity) => {
      const userId = activity.userId.toString();
      if (!lastLoginMap.has(userId)) {
        lastLoginMap.set(userId, activity.createdAt);
      }
    });

    // Format users with last login
    const usersList = allUsers.map((user) => {
      const lastLogin = lastLoginMap.get(user._id.toString());
      const today = new Date();
      const birthDate = new Date(user.DOB);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        age,
        gender: user.gender,
        role: user.role,
        lastLogin: lastLogin || null,
        registeredAt: user.createdAt,
        status: user.status || (lastLogin ? 'active' : 'inactive'),
      };
    });

    const dashboardData = {
      stats: {
        totalUsers,
        totalPatients,
        totalDoctors,
        totalActivities,
      },
      users: usersList,
      recentRegistrations: recentRegistrations.map((user) => ({
        id: user._id,
        name: `${user.firstname} ${user.lastname}`,
        email: user.email,
        role: user.role,
        registeredAt: user.createdAt,
      })),
      recentActivities: recentActivities.map((activity) => ({
        userId: (activity.userId as any)?._id,
        userName: (activity.userId as any)
          ? `${(activity.userId as any).firstname} ${(activity.userId as any).lastname}`
          : 'Unknown',
        userRole: (activity.userId as any)?.role || activity.userRole,
        type: activity.activityType,
        description: activity.description,
        date: activity.createdAt,
      })),
      activitiesByType: activitiesByType.map((item) => ({
        type: item._id,
        count: item.count,
      })),
      usersByRole: usersByRole.map((item) => ({
        role: item._id,
        count: item.count,
      })),
    };

    res.status(200).json({
      success: true,
      message: 'Admin dashboard data retrieved successfully',
      data: dashboardData,
    });
  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

