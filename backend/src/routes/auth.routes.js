import { Router } from "express";
import { pool } from "../config/database.js";

const router = Router();

async function verifySupabaseUser(token) {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/auth/v1/user`,
    {
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Invalid or expired authentication session.");
  }

  return response.json();
}

router.post("/profile", async (req, res) => {
  const client = await pool.connect();

  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const authUser = await verifySupabaseUser(token);

    const {
      role,
      fullName,
      signup,
      license,
      vehicleType,
      registration,
      make,
      model,
      color,
    } = req.body;

    const normalizedRole =
      authUser.user_metadata?.role || role;

    if (!["rider", "driver"].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account role.",
      });
    }

    if (role && role !== normalizedRole) {
      return res.status(403).json({
        success: false,
        message: "Account role does not match.",
      });
    }

    const phone = authUser.phone;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Verified phone number is missing.",
      });
    }

    const name =
      fullName?.trim() ||
      authUser.user_metadata?.full_name ||
      "RideFlow User";

    if (
      signup &&
      normalizedRole === "driver" &&
      (!license?.trim() ||
        !vehicleType ||
        !registration?.trim() ||
        !make?.trim() ||
        !model?.trim() ||
        !color?.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete all driver and vehicle details.",
      });
    }

    await client.query("BEGIN");

    // Find an existing profile by Supabase ID or phone.
    const existing = await client.query(
      `
      SELECT id, role
      FROM public.users
      WHERE auth_user_id = $1 OR phone = $2
      LIMIT 1
      `,
      [authUser.id, phone]
    );

    let user;

    if (existing.rows.length) {
      const oldUser = existing.rows[0];

      if (oldUser.role !== normalizedRole) {
        throw new Error(
          `This phone number is already registered as a ${oldUser.role}.`
        );
      }

      const updated = await client.query(
        `
        UPDATE public.users
        SET
          auth_user_id = $1,
          full_name = $2,
          phone = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING id, full_name, phone, role
        `,
        [authUser.id, name, phone, oldUser.id]
      );

      user = updated.rows[0];
    } else {
      // Synthetic email preserves compatibility if email is NOT NULL.
      const email = `phone_${phone.replace(/\D/g, "")}@rideflow.local`;

      const inserted = await client.query(
        `
        INSERT INTO public.users (
          auth_user_id,
          full_name,
          email,
          phone,
          password_hash,
          role
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, full_name, phone, role
        `,
        [
          authUser.id,
          name,
          email,
          phone,
          "SUPABASE_PHONE_AUTH",
          normalizedRole,
        ]
      );

      user = inserted.rows[0];
    }

    // Save driver and vehicle information during registration.
    if (normalizedRole === "driver" && signup) {
      let driverResult = await client.query(
        `
        SELECT id
        FROM public.drivers
        WHERE user_id = $1
        LIMIT 1
        `,
        [user.id]
      );

      let driverId;

      if (driverResult.rows.length) {
        driverId = driverResult.rows[0].id;

        await client.query(
          `
          UPDATE public.drivers
          SET license_number = $1, updated_at = NOW()
          WHERE id = $2
          `,
          [license.trim(), driverId]
        );
      } else {
        const createdDriver = await client.query(
          `
          INSERT INTO public.drivers (
            user_id,
            license_number,
            license_verified,
            is_available
          )
          VALUES ($1, $2, false, false)
          RETURNING id
          `,
          [user.id, license.trim()]
        );

        driverId = createdDriver.rows[0].id;
      }

      const existingVehicle = await client.query(
        `
        SELECT id
        FROM public.vehicles
        WHERE registration_number = $1
        LIMIT 1
        `,
        [registration.trim().toUpperCase()]
      );

      if (existingVehicle.rows.length) {
        await client.query(
          `
          UPDATE public.vehicles
          SET
            driver_id = $1,
            vehicle_type = $2,
            make = $3,
            model = $4,
            color = $5
          WHERE id = $6
          `,
          [
            driverId,
            vehicleType,
            make.trim(),
            model.trim(),
            color.trim(),
            existingVehicle.rows[0].id,
          ]
        );
      } else {
        await client.query(
          `
          INSERT INTO public.vehicles (
            driver_id,
            vehicle_type,
            registration_number,
            make,
            model,
            color
          )
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            driverId,
            vehicleType,
            registration.trim().toUpperCase(),
            make.trim(),
            model.trim(),
            color.trim(),
          ]
        );
      }
    }

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "RideFlow profile saved successfully.",
      profile: user,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Profile save error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Unable to save profile.",
    });
  } finally {
    client.release();
  }
});

export default router;