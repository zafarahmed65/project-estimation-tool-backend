// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";

import projectDetailsRoutes from "./routes/projectDetails.js";
import { errorHandler } from "./middleware/errorHandler.js";
import dropdownOptionsRoutes from "./routes/dropdownOptions.js";
import adminRoutes from "./routes/Admin.js";
import { connectDB } from "./utils/dbConnection.js";

// Configure Mongoose for Lambda
mongoose.set("strictQuery", false);
// Increase buffer timeout for Lambda cold starts
mongoose.set("bufferTimeoutMS", 30000); // 30 seconds

const app = express();
// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100,
    message: "Too many requests from this IP, please try again later.",
  })
);

// CORS
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       const normalized = origin.replace(/\/$/, "");
//       const allowed = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/$/, "");
//       if (normalized === allowed) return callback(null, true);
//       console.error(`CORS blocked: ${normalized}`);
//       callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,
//   })
// );

// app.use(
//   cors({
//     origin: ["https://project-estimation-tool-frontend-jm1n.vercel.app/", "http://localhost:3000"],
//     methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(
  cors({
    origin: [
      "https://project-estimation-tool-frontend.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "OPTIONS", "PUT"],
    methods: ["GET", "POST", "OPTIONS", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Standard middleware
app.use(express.json());
app.use(cookieParser());

// Ensure database connection before handling requests (for Lambda)
app.use(async (req, res, next) => {
  try {
    // Check if MONGODB_URI is configured
    if (!process.env.MONGODB_URI || process.env.MONGODB_URI === 'REPLACE_WITH_YOUR_MONGODB_URI') {
      console.error("❌ MONGODB_URI not configured properly");
      return res.status(503).json({
        success: false,
        message: "Database configuration error. MONGODB_URI is not set correctly.",
      });
    }

    // Always ensure connection is ready before handling requests
    const connection = await connectDB();
    
    // Wait for connection to be ready
    if (connection && mongoose.connection.readyState === 1) {
      next();
    } else {
      // If connection failed, return error with more details
      const state = mongoose.connection.readyState;
      const stateNames = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
      console.error(`❌ Connection state: ${stateNames[state] || state}`);
      return res.status(503).json({
        success: false,
        message: "Database connection unavailable. Please try again.",
        details: `Connection state: ${stateNames[state] || state}`
      });
    }
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return res.status(503).json({
      success: false,
      message: error.message || "Database connection failed. Please try again.",
    });
  }
});

// Routes
app.get("/", (_req, res) => res.send("Welcome to the react Backend!"));
app.use("/api/projects", projectDetailsRoutes);
app.use("/api/dropdown-options", dropdownOptionsRoutes);
app.use("/api/admin", adminRoutes);

// Error handler
app.use(errorHandler);

// Initialize database connection (for Lambda, connection is cached)
// This will be called on first Lambda invocation
connectDB().catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  // In Lambda, don't exit - let it retry on next invocation
  if (process.env.IS_OFFLINE || process.env.NODE_ENV === "development") {
    process.exit(1);
  }
});

// Only start HTTP server when running locally (not in Lambda)
// Lambda uses the handler function instead
const isOffline =
  process.env.IS_OFFLINE || process.env.NODE_ENV === "development";
if (isOffline) {
  const desiredPort = Number(process.env.PORT) || 3000;
  const server = app.listen(desiredPort, "0.0.0.0", () => {
    const { port } = server.address();
    console.log(`🚀 Server listening on port ${port}`);
  });
}

// Export app for Lambda handler
export default app;
