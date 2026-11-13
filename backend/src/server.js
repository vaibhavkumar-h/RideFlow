import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { pool, testDatabaseConnection } from "./config/database.js";
import bookingRoutes from "./routes/booking.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
}));

app.use(express.json());

app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RideFlow API is running!",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const database = await testDatabaseConnection();

    res.json({
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

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");

    app.listen(PORT, () => {
      console.log(`RideFlow API running at http://localhost:${PORT}`);
      console.log("Supabase PostgreSQL connected successfully!");
    });
  } catch (error) {
    console.error("Unable to connect to Supabase:", error.message);
    process.exit(1);
  }
}

startServer();