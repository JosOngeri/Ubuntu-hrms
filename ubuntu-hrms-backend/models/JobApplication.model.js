const { Pool } = require('pg');
const path = require('path');

const pool = require('../config/db').pool;

const JOB_APPLICATION_TABLE = 'job_applications';

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${JOB_APPLICATION_TABLE} (
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
};

const JobApplication = {
  async create(data) {
    const { jobId, applicantName, applicantEmail, applicantPhone, cvPath, status = 'pending' } = data;
    const res = await pool.query(
      `INSERT INTO ${JOB_APPLICATION_TABLE} (jobId, applicantName, applicantEmail, applicantPhone, cvPath, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [jobId, applicantName, applicantEmail, applicantPhone, cvPath, status]
    );
    return res.rows[0];
  },
  async findByJob(jobId) {
    const res = await pool.query(`SELECT * FROM ${JOB_APPLICATION_TABLE} WHERE jobId = $1 ORDER BY appliedAt DESC`, [jobId]);
    return res.rows;
  },
  async findById(id) {
    const res = await pool.query(`SELECT * FROM ${JOB_APPLICATION_TABLE} WHERE id = $1`, [id]);
    return res.rows[0];
  },
  async update(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;
    for (const key in data) {
      fields.push(`${key} = $${idx}`);
      values.push(data[key]);
      idx++;
    }
    values.push(id);
    const res = await pool.query(
      `UPDATE ${JOB_APPLICATION_TABLE} SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query(`DELETE FROM ${JOB_APPLICATION_TABLE} WHERE id = $1`, [id]);
    return true;
  },
  async init() {
    await createTable();
  },
};

module.exports = JobApplication;
