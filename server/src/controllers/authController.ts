import { Request, Response } from 'express';
import User from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { logActivity } from '../utils/activityLogger';

interface RegisterBody {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  DOB: string;
  gender: 'male' | 'female' | 'other';
}

interface LoginBody {
  email: string;
  password: string;
}

// Register new user
export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response
): Promise<void> => {
  try {
    const { firstname, lastname, email, password, DOB, gender } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !password || !DOB || !gender) {
      res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
      return;
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
      return;
    }

    // Validate DOB
    const dobDate = new Date(DOB);
    if (isNaN(dobDate.getTime())) {
      res.status(400).json({
        success: false,
        message: 'Invalid date of birth format',
      });
      return;
    }

    // Create new user
    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password,
      DOB: dobDate,
      gender,
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Remove password from response
    const userResponse = {
      id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      DOB: user.DOB,
      gender: user.gender,
      role: user.role,
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// Login user
export const login = async (
  req: Request<{}, {}, LoginBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
      return;
    }

    // Find user and include password field (status is included by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user) {
      console.log(
        `Login attempt failed: User not found for email ${email.toLowerCase()}`
      );
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Check if user is active - STRICT CHECK: only 'active' status allows login
    // This check happens BEFORE password validation to prevent any login attempts
    if (user.status !== 'active') {
      const statusValue = user.status || 'undefined';
      console.log(
        `[SECURITY] Login BLOCKED: User "${email.toLowerCase()}" has status "${statusValue}" (not active). Login attempt rejected.`
      );
      res.status(403).json({
        success: false,
        message: 'Your account is inactive. Please contact support for assistance.',
      });
      return; // CRITICAL: Stop execution here - do not proceed with login
    }
    
    console.log(`Login proceeding: User "${email.toLowerCase()}" has active status, proceeding with password validation.`);

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(
        `Login attempt failed: Invalid password for email ${email.toLowerCase()}`
      );
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Log login activity
    await logActivity(
      {
        userId: user._id.toString(),
        userRole: user.role,
        activityType: 'login',
        description: `User logged in successfully`,
        metadata: {
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
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// Refresh access token
export const refreshToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(token);

    // Find user with this refresh token
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid refresh token',
    });
  }
};

// Logout user
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role;

    if (userId) {
      // Get user before updating to log activity
      const user = await User.findById(userId);
      await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

      // Log logout activity
      if (user) {
        await logActivity(
          {
            userId: user._id.toString(),
            userRole: user.role,
            activityType: 'logout',
            description: `User logged out`,
            metadata: {
              email: user.email,
            },
          },
          req
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};
