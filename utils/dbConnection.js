// utils/dbConnection.js - MongoDB connection with Lambda reuse
import mongoose from "mongoose";

let cachedConnection = null;
let connectionPromise = null;

export const connectDB = async () => {
  // Return cached connection if available (Lambda reuse)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  // If already connecting, wait for that promise
  if (connectionPromise) {
    console.log("⏳ Waiting for existing connection...");
    return connectionPromise;
  }

  // Check if already connecting (state 2 = connecting)
  if (mongoose.connection.readyState === 2) {
    console.log("⏳ MongoDB connection in progress...");
    connectionPromise = new Promise((resolve, reject) => {
      mongoose.connection.once("connected", () => {
        cachedConnection = mongoose.connection;
        connectionPromise = null;
        resolve(cachedConnection);
      });
      mongoose.connection.once("error", (err) => {
        connectionPromise = null;
        reject(err);
      });
    });
    return connectionPromise;
  }

  // Create new connection
  connectionPromise = (async () => {
    try {
      // Check if MONGODB_URI is set
      if (
        !process.env.MONGODB_URI ||
        process.env.MONGODB_URI === "REPLACE_WITH_YOUR_MONGODB_URI"
      ) {
        const errorMsg = !process.env.MONGODB_URI
          ? "MONGODB_URI environment variable is not set"
          : "MONGODB_URI is set to placeholder value. Please set the actual connection string.";
        console.error("❌", errorMsg);
        throw new Error(errorMsg);
      }

      // Log connection attempt (without exposing full URI)
      const uriPreview = process.env.MONGODB_URI.substring(0, 20) + "...";
      console.log("🔌 Attempting to connect to MongoDB:", uriPreview);

      const connection = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000, // Increased to 10s
        socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        maxPoolSize: 1, // Limit connections for Lambda
        minPoolSize: 1, // Keep at least 1 connection
      });

      cachedConnection = connection;
      console.log("✅ Connected to MongoDB");

      // Handle connection events
      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB connection error:", err);
        cachedConnection = null;
        connectionPromise = null;
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB disconnected");
        cachedConnection = null;
        connectionPromise = null;
      });

      connectionPromise = null;
      return connection;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error);
      cachedConnection = null;
      connectionPromise = null;
      // Don't throw in Lambda - let it retry on next invocation
      if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
        throw error;
      }
      return null;
    }
  })();

  return connectionPromise;
};
