import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_NAME,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
});

export default pool;
