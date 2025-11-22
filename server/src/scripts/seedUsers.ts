import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional - comment out if you want to keep existing data)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create dummy users
    const users = [
      {
        firstname: 'Dr. Sarah',
        lastname: 'Williams',
        email: 'doctor.sarah@healthcare.com',
        password: 'doctor123',
        DOB: new Date('1985-03-15'),
        gender: 'female' as const,
        role: 'doctor' as const,
      },
      {
        firstname: 'Dr. Michael',
        lastname: 'Brown',
        email: 'doctor.michael@healthcare.com',
        password: 'doctor123',
        DOB: new Date('1982-07-22'),
        gender: 'male' as const,
        role: 'doctor' as const,
      },
      {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        DOB: new Date('1995-05-20'),
        gender: 'male' as const,
        role: 'patient' as const,
      },
      {
        firstname: 'Jane',
        lastname: 'Smith',
        email: 'jane.smith@example.com',
        password: 'password123',
        DOB: new Date('1992-08-10'),
        gender: 'female' as const,
        role: 'patient' as const,
      },
      {
        firstname: 'Alice',
        lastname: 'Johnson',
        email: 'alice.johnson@example.com',
        password: 'password123',
        DOB: new Date('1988-12-25'),
        gender: 'female' as const,
        role: 'patient' as const,
      },
    ];

    // Create users one by one to trigger pre-save hooks (password hashing)
    // Note: insertMany() doesn't trigger pre-save hooks, so we use create() instead
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }

    console.log('\n✅ Successfully seeded users:');
    console.log('='.repeat(50));
    createdUsers.forEach((user) => {
      console.log(`\n📧 Email: ${user.email}`);
      console.log(`   Name: ${user.firstname} ${user.lastname}`);
      console.log(`   Role: ${user.role}`);
      console.log(
        `   Password: ${users.find((u) => u.email === user.email)?.password}`
      );
    });
    console.log('\n' + '='.repeat(50));
    console.log('\n✨ You can now login with any of these credentials!');

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error: any) {
    console.error('Error seeding users:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the seed function
seedUsers();
