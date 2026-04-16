const { Pool } = require('pg');
const path = require('path');

const pool = require('../config/db').pool;

const JOB_TABLE = 'jobs';

const createTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ${JOB_TABLE} (
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
};

const Job = {
  async create(data) {
    const { title, description, department, location, employmentType, status = 'open', postedBy } = data;
    const res = await pool.query(
      `INSERT INTO ${JOB_TABLE} (title, description, department, location, employmentType, status, postedBy) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, department, location, employmentType, status, postedBy]
    );
    return res.rows[0];
  },
  async findAll({ onlyOpen = false } = {}) {
    const res = await pool.query(
      `SELECT * FROM ${JOB_TABLE} ${onlyOpen ? "WHERE status = 'open'" : ''} ORDER BY createdAt DESC`
    );
    return res.rows;
  },
  async findById(id) {
    const res = await pool.query(`SELECT * FROM ${JOB_TABLE} WHERE id = $1`, [id]);
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
      `UPDATE ${JOB_TABLE} SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
      values
    );
    return res.rows[0];
  },
  async delete(id) {
    await pool.query(`DELETE FROM ${JOB_TABLE} WHERE id = $1`, [id]);
    return true;
  },
  async init() {
    await createTable();
  },
};

module.exports = Job;
