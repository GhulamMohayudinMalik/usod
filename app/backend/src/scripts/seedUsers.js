#!/usr/bin/env node
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const users = [
  // Admins
  {
    username: 'GhulamMohayudin',
    email: 'GhulamMohayudin@usod.com',
    password: 'gm123',
    role: 'admin'
  },
  {
    username: 'Ali',
    email: 'AliSami@usod.com',
    password: 'ali123',
    role: 'admin'
  },
  // Regular users
  {
    username: 'Zuhaib',
    email: 'zuhaib@example.com',
    password: 'zuhaib123',
    role: 'user'
  },
  {
    username: 'GhulamMohayudin',
    email: 'GhulamMohayudin@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    username: 'AliSami',
    email: 'AliSami@example.com',
    password: 'user123',
    role: 'user'
  },
  {
    username: 'ZuhaibIqbal',
    email: 'ZuhaibIqbal@example.com',
    password: 'user123',
    role: 'user'
  }
];

async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/usod';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

async function seedUsers() {
  try {
    await connect();
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');
    
    // Hash passwords and create users
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: true
      });
      await user.save();
      console.log(`Created user: ${userData.username} (${userData.role})`);
    }
    
    console.log('\nSeeding completed!');
    console.log('Admin accounts:');
    console.log('  admin1 / admin123');
    console.log('  admin2 / admin123');
    console.log('\nUser accounts:');
    console.log('  john_doe / user123');
    console.log('  jane_smith / user123');
    console.log('  bob_wilson / user123');
    console.log('  alice_brown / user123');
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedUsers();
