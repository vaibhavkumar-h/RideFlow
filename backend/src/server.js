
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool, testDatabaseConnection } from "./config/database.js";
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// API Routes
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);

// Root health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RideFlow API is running!",
    environment: process.env.NODE_ENV || "development",
  });
});

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    const database = await testDatabaseConnection();

    res.status(200).json({
      success: true,
      message: "RideFlow backend connected to Supabase!",
      database: database.database,
      serverTime: database.server_time,
      postgis: "Enabled",
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Render dynamically assigns the PORT
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`RideFlow API running on port ${PORT}`);
      console.log("Supabase PostgreSQL connected successfully!");
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`${signal} received. Shutting down RideFlow API...`);

      server.close(async () => {
        try {
          await pool.end();
          console.log("Database connections closed.");
          process.exit(0);
        } catch (error) {
          console.error("Shutdown error:", error.message);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (error) {
    console.error("Unable to connect to Supabase:", error.message);
    process.exit(1);
  }
}

startServer();
