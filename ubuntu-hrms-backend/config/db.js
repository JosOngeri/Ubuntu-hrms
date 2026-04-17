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

  // Recruitment: Jobs table
  await query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      department VARCHAR(100),
      location VARCHAR(100),
      employmentType VARCHAR(50),
      status VARCHAR(20) DEFAULT 'open',
      postedBy INTEGER,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Recruitment: Job Applications table
  await query(`
    CREATE TABLE IF NOT EXISTS job_applications (
      id SERIAL PRIMARY KEY,
      jobId INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      applicantName VARCHAR(255) NOT NULL,
      applicantEmail VARCHAR(255) NOT NULL,
      applicantPhone VARCHAR(50),
      cvPath VARCHAR(255),
      status VARCHAR(20) DEFAULT 'pending',
      appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Professional Profile table for job applications
  await query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      userId INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      fullName VARCHAR(255),
      skills TEXT[],
      certifications TEXT[],
      workHistory JSONB,
      education JSONB,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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