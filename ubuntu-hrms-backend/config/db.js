const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();








const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  'postgres://postgres:postgres@127.0.0.1:5432/ubuntu_hrms';

const pool = new Pool({
  connectionString,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
  max: Number(process.env.PGPOOL_MAX || 10),
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL pool error:', error.message);
});

const query = (text, params) => pool.query(text, params);

const initDatabase = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'manager' CHECK (role IN ('admin', 'manager', 'supervisor', 'employee')),
      reset_token TEXT,
      reset_token_expire TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS employees (
      id BIGSERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT NOT NULL,
      biometric_device_id TEXT UNIQUE,
      mpesa_phone_number TEXT NOT NULL,
      employment_type TEXT NOT NULL CHECK (employment_type IN ('Daily', 'Contractor', 'Permanent')),
      wage_rate NUMERIC(12,2) NOT NULL CHECK (wage_rate >= 0),
      department TEXT NOT NULL,
      date_joined TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id BIGSERIAL PRIMARY KEY,
      employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      attendance_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Absent', 'Leave')),
      shift TEXT CHECK (shift IN ('Morning', 'Afternoon')),
      punch_state TEXT CHECK (punch_state IN ('checkIn', 'breakOut', 'breakIn', 'checkOut')),
      check_in TIMESTAMPTZ,
      break_out TIMESTAMPTZ,
      break_in TIMESTAMPTZ,
      check_out TIMESTAMPTZ,
      total_hours_worked NUMERIC(8,2),
      punch_history JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (employee_id, attendance_date)
    )
  `);

  await query(`
    UPDATE users SET updated_at = NOW() WHERE updated_at IS NULL
  `).catch(() => {});
};

const connectDB = async () => {
  await initDatabase();
  console.log('PostgreSQL connected');
};

const closeDB = async () => {
  await pool.end();
};

module.exports = {
  connectDB,
  closeDB,
  initDatabase,
  pool,
  query,
};