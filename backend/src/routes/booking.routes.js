
import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

const VEHICLE_TYPES = {
  bike: "Bike",
  auto: "Auto",
  mini: "Mini",
  sedan: "Sedan",
  suv: "SUV",
};

const SERVICE_AREA = {
  minLat: 30.50,
  maxLat: 30.90,
  minLon: 76.50,
  maxLon: 77.00,
};

router.post("/", async (req, res) => {
  try {
    const {
      pickupName,
      dropoffName,
      pickupLat,
      pickupLon,
      dropoffLat,
      dropoffLon,
      vehicleType,
      distanceKm,
      durationMinutes,
      estimatedFare,
      rideTime,
    } = req.body;

    // Validate required text fields.
    if (
      typeof pickupName !== "string" ||
      typeof dropoffName !== "string" ||
      !pickupName.trim() ||
      !dropoffName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Pickup and destination names are required.",
      });
    }

    // Validate coordinates and numeric values.
    const numbers = [
      pickupLat,
      pickupLon,
      dropoffLat,
      dropoffLon,
      distanceKm,
      durationMinutes,
      estimatedFare,
    ];

    if (!numbers.every(
      (value) => typeof value === "number" && Number.isFinite(value)
    )) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates, distance, duration or fare.",
      });
    }

    // Validate Tricity service area.
    const insideArea = (lat, lon) =>
      lat >= SERVICE_AREA.minLat &&
      lat <= SERVICE_AREA.maxLat &&
      lon >= SERVICE_AREA.minLon &&
      lon <= SERVICE_AREA.maxLon;

    if (
      !insideArea(pickupLat, pickupLon) ||
      !insideArea(dropoffLat, dropoffLon)
    ) {
      return res.status(400).json({
        success: false,
        message: "RideFlow currently supports Chandigarh Tricity only.",
      });
    }

    if (
      pickupLat === dropoffLat &&
      pickupLon === dropoffLon
    ) {
      return res.status(400).json({
        success: false,
        message: "Pickup and destination must be different.",
      });
    }

    const normalizedVehicle = VEHICLE_TYPES[vehicleType];

    if (!normalizedVehicle) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle type.",
      });
    }

    if (
      distanceKm < 0 ||
      distanceKm > 500 ||
      durationMinutes < 0 ||
      durationMinutes > 1440 ||
      estimatedFare < 0 ||
      estimatedFare > 100000
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ride estimate.",
      });
    }

    const allowedPickupTimes = {
      now: 0,
      "15": 15,
      "30": 30,
      "60": 60,
    };

    if (!Object.hasOwn(allowedPickupTimes, String(rideTime))) {
      return res.status(400).json({
        success: false,
        message: "Invalid pickup time.",
      });
    }

    const minutesToWait =
      allowedPickupTimes[String(rideTime)];

    const result = await pool.query(
      `
      INSERT INTO public.bookings (
        user_id,
        pickup_address,
        dropoff_address,
        pickup_location,
        dropoff_location,
        vehicle_type,
        distance_km,
        estimated_duration_minutes,
        estimated_fare,
        scheduled_for,
        status
      )
      VALUES (
        NULL,
        $1,
        $2,
        extensions.ST_SetSRID(
          extensions.ST_MakePoint($3, $4), 4326
        )::extensions.geography,
        extensions.ST_SetSRID(
          extensions.ST_MakePoint($5, $6), 4326
        )::extensions.geography,
        $7,
        $8,
        $9,
        $10,
        NOW() + ($11 * INTERVAL '1 minute'),
        'pending'
      )
      RETURNING
        id,
        status,
        vehicle_type,
        distance_km,
        estimated_fare,
        scheduled_for,
        created_at
      `,
      [
        pickupName.trim(),
        dropoffName.trim(),
        pickupLon,
        pickupLat,
        dropoffLon,
        dropoffLat,
        normalizedVehicle,
        distanceKm,
        Math.round(durationMinutes),
        estimatedFare,
        minutesToWait,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Ride booking saved successfully!",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Booking creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save your booking.",
    });
  }
});

export default router;
