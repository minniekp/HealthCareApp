import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/User';
import HealthData from '../models/HealthData';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const seedHealthData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all patients
    const patients = await User.find({ role: 'patient' });

    if (patients.length === 0) {
      console.log('No patients found. Please run seedUsers.ts first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Clear existing health data (optional)
    await HealthData.deleteMany({});
    console.log('Cleared existing health data');

    const healthDataEntries = [];
    const now = new Date();

    // Generate health data for each patient for the last 30 days
    for (const patient of patients) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Generate realistic health data
        const steps = Math.floor(Math.random() * 5000) + 3000; // 3000-8000 steps
        const waterIntake = Math.floor(Math.random() * 1000) + 1500; // 1500-2500 ml
        const sleepHours = Math.random() * 3 + 6.5; // 6.5-9.5 hours

        healthDataEntries.push({
          userId: patient._id,
          date,
          steps,
          waterIntake,
          sleepHours: Math.round(sleepHours * 10) / 10, // Round to 1 decimal
        });
      }
    }

    // Insert health data in batches
    const batchSize = 100;
    for (let i = 0; i < healthDataEntries.length; i += batchSize) {
      const batch = healthDataEntries.slice(i, i + batchSize);
      await HealthData.insertMany(batch);
      console.log(`Inserted ${Math.min(i + batchSize, healthDataEntries.length)}/${healthDataEntries.length} health data entries`);
    }

    console.log('\n✅ Successfully seeded health data!');
    console.log('='.repeat(50));
    console.log(`Total health data entries created: ${healthDataEntries.length}`);
    console.log(`Entries per patient: 30 days`);
    console.log('\n' + '='.repeat(50));

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding health data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedHealthData();

