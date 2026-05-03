const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (error) => {
  console.error('Unexpected PostgreSQL error:', error);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
