import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { logActivity } from '../utils/activityLogger';

interface UpdateProfileBody {
  firstname?: string;
  lastname?: string;
  DOB?: string;
  gender?: 'male' | 'female' | 'other';
  password?: string;
  currentPassword?: string;
}

/**
 * Get current user profile
 */
export const getProfile = async (
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

    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const userResponse = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      DOB: user.DOB,
      gender: user.gender,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        user: userResponse,
      },
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (
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

    const { firstname, lastname, DOB, gender, password, currentPassword } =
      req.body;

    // Get user with password field for password update
    const user = await User.findById(userId).select('+password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    // Track what fields are being updated
    const updatedFields: string[] = [];
    const oldValues: Record<string, any> = {};

    // Update firstname
    if (firstname !== undefined) {
      if (firstname.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'First name must be at least 2 characters long',
        });
        return;
      }
      if (firstname.trim().length > 50) {
        res.status(400).json({
          success: false,
          message: 'First name cannot exceed 50 characters',
        });
        return;
      }
      if (user.firstname !== firstname.trim()) {
        oldValues.firstname = user.firstname;
        user.firstname = firstname.trim();
        updatedFields.push('firstname');
      }
    }

    // Update lastname
    if (lastname !== undefined) {
      if (lastname.trim().length < 2) {
        res.status(400).json({
          success: false,
          message: 'Last name must be at least 2 characters long',
        });
        return;
      }
      if (lastname.trim().length > 50) {
        res.status(400).json({
          success: false,
          message: 'Last name cannot exceed 50 characters',
        });
        return;
      }
      if (user.lastname !== lastname.trim()) {
        oldValues.lastname = user.lastname;
        user.lastname = lastname.trim();
        updatedFields.push('lastname');
      }
    }

    // Update DOB
    if (DOB !== undefined) {
      const dobDate = new Date(DOB);
      if (isNaN(dobDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Invalid date of birth format',
        });
        return;
      }
      if (user.DOB.getTime() !== dobDate.getTime()) {
        oldValues.DOB = user.DOB;
        user.DOB = dobDate;
        updatedFields.push('DOB');
      }
    }

    // Update gender
    if (gender !== undefined) {
      if (!['male', 'female', 'other'].includes(gender)) {
        res.status(400).json({
          success: false,
          message: 'Invalid gender value',
        });
        return;
      }
      if (user.gender !== gender) {
        oldValues.gender = user.gender;
        user.gender = gender;
        updatedFields.push('gender');
      }
    }

    // Update password (requires current password)
    if (password !== undefined) {
      if (!currentPassword) {
        res.status(400).json({
          success: false,
          message: 'Current password is required to change password',
        });
        return;
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Current password is incorrect',
        });
        return;
      }

      // Validate new password
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
        return;
      }

      user.password = password; // Will be hashed by pre-save hook
      updatedFields.push('password');
    }

    // If no fields were updated
    if (updatedFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
      return;
    }

    // Save updated user
    await user.save();

    // Log profile update activity
    await logActivity(
      {
        userId: user._id.toString(),
        userRole: user.role,
        activityType: 'profile_update',
        description: `User updated profile: ${updatedFields.join(', ')}`,
        metadata: {
          updatedFields,
          oldValues,
          email: user.email,
        },
      },
      req
    );

    // Remove password from response
    const userResponse = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      DOB: user.DOB,
      gender: user.gender,
      role: user.role,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userResponse,
        updatedFields,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Get user by ID (for doctors to view patient details)
 */
export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const requesterRole = req.user?.role;

    // Only doctors and admins can view other users
    if (requesterRole !== 'doctor' && requesterRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only doctors and admins can view user details',
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    const user = await User.findById(userId).select('-password -refreshToken');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const userResponse = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      DOB: user.DOB,
      gender: user.gender,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: 'User details retrieved successfully',
      data: {
        user: userResponse,
      },
    });
  } catch (error: any) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Update user role (for doctors/admins to change patient to doctor)
 */
export const updateUserRole = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const requesterRole = req.user?.role;
    const requesterId = req.user?.userId;

    // Only doctors and admins can update user roles
    if (requesterRole !== 'doctor' && requesterRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only doctors and admins can update user roles',
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    if (!role || !['patient', 'doctor', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Valid role is required (patient, doctor, or admin)',
      });
      return;
    }

    // Prevent users from changing their own role
    if (userId === requesterId) {
      res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
      return;
    }

    // Only admins can assign admin role
    if (role === 'admin' && requesterRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can assign admin role',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const oldRole = user.role;

    // Update role
    user.role = role;
    await user.save();

    // Log role change activity
    await logActivity(
      {
        userId: user._id.toString(),
        userRole: user.role,
        activityType: 'other',
        description: `User role changed from ${oldRole} to ${role} by ${requesterRole}`,
        metadata: {
          oldRole,
          newRole: role,
          changedBy: requesterId,
          changedByRole: requesterRole,
          email: user.email,
        },
      },
      req
    );

    const userResponse = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      DOB: user.DOB,
      gender: user.gender,
      role: user.role,
      status: user.status,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        user: userResponse,
        oldRole,
        newRole: role,
      },
    });
  } catch (error: any) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

/**
 * Update user status (for admins to change user active/inactive status)
 */
export const updateUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    const requesterRole = req.user?.role;
    const requesterId = req.user?.userId;

    // Only admins can update user status
    if (requesterRole !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Only admins can update user status',
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        success: false,
        message: 'User ID is required',
      });
      return;
    }

    if (!status || !['active', 'inactive'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Valid status is required (active or inactive)',
      });
      return;
    }

    // Prevent users from changing their own status
    if (userId === requesterId) {
      res.status(400).json({
        success: false,
        message: 'You cannot change your own status',
      });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const oldStatus = user.status || 'active';

    // Update status
    user.status = status;
    await user.save();

    // Log status change activity
    await logActivity(
      {
        userId: user._id.toString(),
        userRole: user.role,
        activityType: 'other',
        description: `User status changed from ${oldStatus} to ${status} by admin`,
        metadata: {
          oldStatus,
          newStatus: status,
          changedBy: requesterId,
          changedByRole: requesterRole,
          email: user.email,
        },
      },
      req
    );

    const userResponse = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      DOB: user.DOB,
      gender: user.gender,
      role: user.role,
      status: user.status,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      message: `User status updated to ${status} successfully`,
      data: {
        user: userResponse,
        oldStatus,
        newStatus: status,
      },
    });
  } catch (error: any) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

