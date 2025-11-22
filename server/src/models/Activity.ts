import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: 'patient' | 'doctor' | 'admin';
  activityType: 'login' | 'logout' | 'profile_update' | 'appointment_created' | 'appointment_updated' | 'prescription_added' | 'record_viewed' | 'other';
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    userRole: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: [true, 'User role is required'],
    },
    activityType: {
      type: String,
      enum: ['login', 'logout', 'profile_update', 'appointment_created', 'appointment_updated', 'prescription_added', 'record_viewed', 'other'],
      required: [true, 'Activity type is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ userRole: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });

const Activity = mongoose.model<IActivity>('Activity', activitySchema);

export default Activity;

