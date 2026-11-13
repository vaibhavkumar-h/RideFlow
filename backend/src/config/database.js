
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL error:", error);
});

export async function testDatabaseConnection() {
  const result = await pool.query(`
    SELECT
      current_database() AS database,
      NOW() AS server_time,
      PostGIS_Full_Version() AS postgis_version
  `);

  return result.rows[0];
}
