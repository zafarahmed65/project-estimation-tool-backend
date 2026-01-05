// utils/dbConnection.js - MongoDB connection with Lambda reuse
import mongoose from 'mongoose';

let cachedConnection = null;

export const connectDB = async () => {
  // Return cached connection if available (Lambda reuse)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log('✅ Using cached MongoDB connection');
    return cachedConnection;
  }

  // Check if already connecting
  if (mongoose.connection.readyState === 2) {
    console.log('⏳ MongoDB connection in progress...');
    return new Promise((resolve) => {
      mongoose.connection.once('connected', () => {
        cachedConnection = mongoose.connection;
        resolve(cachedConnection);
      });
    });
  }

  // Create new connection
  try {
    mongoose.set('strictQuery', false);
    
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    cachedConnection = connection;
    console.log('✅ Connected to MongoDB');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
      cachedConnection = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
      cachedConnection = null;
    });

    return connection;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    cachedConnection = null;
    // Don't throw in Lambda - let it retry on next invocation
    if (process.env.IS_OFFLINE || process.env.NODE_ENV === 'development') {
      throw error;
    }
    return null;
  }
};

