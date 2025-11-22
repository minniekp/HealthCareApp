import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/User';
import Activity from '../models/Activity';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const seedActivities = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found. Please run seedUsers.ts first.');
      await mongoose.connection.close();
      process.exit(1);
    }

    // Clear existing activities (optional)
    await Activity.deleteMany({});
    console.log('Cleared existing activities');

    const activities = [];
    const now = new Date();

    // Generate activities for each user
    for (const user of users) {
      // Generate login activities (last 30 days)
      for (let i = 0; i < 10; i++) {
        const loginDate = new Date(now);
        loginDate.setDate(loginDate.getDate() - Math.floor(Math.random() * 30));
        loginDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        activities.push({
          userId: user._id,
          userRole: user.role,
          activityType: 'login',
          description: `User logged in successfully`,
          metadata: {
            email: user.email,
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: loginDate,
        });
      }

      // Generate logout activities
      for (let i = 0; i < 8; i++) {
        const logoutDate = new Date(now);
        logoutDate.setDate(logoutDate.getDate() - Math.floor(Math.random() * 30));
        logoutDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

        activities.push({
          userId: user._id,
          userRole: user.role,
          activityType: 'logout',
          description: `User logged out`,
          metadata: {
            email: user.email,
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt: logoutDate,
        });
      }

      // Generate profile update activities (for patients)
      if (user.role === 'patient') {
        for (let i = 0; i < 3; i++) {
          const updateDate = new Date(now);
          updateDate.setDate(updateDate.getDate() - Math.floor(Math.random() * 60));
          updateDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

          activities.push({
            userId: user._id,
            userRole: user.role,
            activityType: 'profile_update',
            description: `User updated profile information`,
            metadata: {
              email: user.email,
              fieldsUpdated: ['firstname', 'lastname'],
            },
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            createdAt: updateDate,
          });
        }

        // Generate appointment activities
        for (let i = 0; i < 5; i++) {
          const appointmentDate = new Date(now);
          appointmentDate.setDate(appointmentDate.getDate() - Math.floor(Math.random() * 90));
          appointmentDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

          activities.push({
            userId: user._id,
            userRole: user.role,
            activityType: 'appointment_created',
            description: `Appointment scheduled with doctor`,
            metadata: {
              email: user.email,
              appointmentDate: appointmentDate.toISOString(),
            },
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            createdAt: appointmentDate,
          });
        }

        // Generate record viewed activities
        for (let i = 0; i < 4; i++) {
          const viewDate = new Date(now);
          viewDate.setDate(viewDate.getDate() - Math.floor(Math.random() * 60));
          viewDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

          activities.push({
            userId: user._id,
            userRole: user.role,
            activityType: 'record_viewed',
            description: `User viewed medical records`,
            metadata: {
              email: user.email,
              recordType: 'lab_results',
            },
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            createdAt: viewDate,
          });
        }
      }
    }

    // Insert activities in batches
    const batchSize = 100;
    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
      await Activity.insertMany(batch);
      console.log(`Inserted ${Math.min(i + batchSize, activities.length)}/${activities.length} activities`);
    }

    console.log('\n✅ Successfully seeded activities!');
    console.log('='.repeat(50));
    console.log(`Total activities created: ${activities.length}`);
    console.log(`Activities per user: ~${Math.floor(activities.length / users.length)}`);

    // Show activity summary
    const activitySummary = await Activity.aggregate([
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    console.log('\nActivity Summary:');
    activitySummary.forEach((item) => {
      console.log(`  ${item._id}: ${item.count}`);
    });

    console.log('\n' + '='.repeat(50));

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding activities:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedActivities();

