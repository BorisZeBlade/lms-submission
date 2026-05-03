const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/lms_submissions';
  const client = new Client({ connectionString });
  await client.connect();

  await client.query('TRUNCATE TABLE submissions RESTART IDENTITY CASCADE');
  const seed = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8');
  await client.query(seed);
  await client.end();

  console.log('Database was reset and seeded again.');
}

main().catch((error) => {
  console.error('Database reset failed:', error.message);
  process.exit(1);
});
