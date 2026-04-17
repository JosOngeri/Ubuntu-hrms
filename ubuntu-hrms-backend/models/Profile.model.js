const { Pool } = require('pg');
const pool = require('../config/db').pool;

const PROFILE_TABLE = 'profiles';

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${PROFILE_TABLE} (
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
};

const Profile = {
  async createOrUpdate(userId, data) {
    const res = await pool.query(
      `INSERT INTO ${PROFILE_TABLE} (userId, fullName, skills, certifications, workHistory, education, updatedAt)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (userId) DO UPDATE SET
         fullName = EXCLUDED.fullName,
         skills = EXCLUDED.skills,
         certifications = EXCLUDED.certifications,
         workHistory = EXCLUDED.workHistory,
         education = EXCLUDED.education,
         updatedAt = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, data.fullName, data.skills, data.certifications, data.workHistory, data.education]
    );
    return res.rows[0];
  },
  async findByUserId(userId) {
    const res = await pool.query(`SELECT * FROM ${PROFILE_TABLE} WHERE userId = $1`, [userId]);
    return res.rows[0];
  },
  async init() {
    await createTable();
  },
};

module.exports = Profile;
