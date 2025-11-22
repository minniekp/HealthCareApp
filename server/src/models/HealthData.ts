 import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthData extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  steps: number;
  waterIntake: number; // in ml
  sleepHours: number;
  createdAt: Date;
  updatedAt: Date;
}

const healthDataSchema = new Schema<IHealthData>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    steps: {
      type: Number,
      default: 0,
      min: [0, 'Steps cannot be negative'],
    },
    waterIntake: {
      type: Number,
      default: 0,
      min: [0, 'Water intake cannot be negative'],
    },
    sleepHours: {
      type: Number,
      default: 0,
      min: [0, 'Sleep hours cannot be negative'],
      max: [24, 'Sleep hours cannot exceed 24'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one record per user per date
healthDataSchema.index({ userId: 1, date: 1 }, { unique: true });

const HealthData = mongoose.model<IHealthData>('HealthData', healthDataSchema);

export default HealthData;

