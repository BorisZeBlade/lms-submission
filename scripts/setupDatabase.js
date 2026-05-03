const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

function getDatabaseConfig() {
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/lms_submissions';
  const url = new URL(connectionString);
  return {
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    host: url.hostname,
    port: Number(url.port || 5432),
    database: url.pathname.replace('/', ''),
  };
}

async function main() {
  const config = getDatabaseConfig();
  const adminClient = new Client({ ...config, database: 'postgres' });

  await adminClient.connect();
  const exists = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [config.database]);

  if (exists.rowCount === 0) {
    await adminClient.query(`CREATE DATABASE ${config.database}`);
    console.log(`Database ${config.database} created.`);
  } else {
    console.log(`Database ${config.database} already exists.`);
  }

  await adminClient.end();

  const appClient = new Client(config);
  await appClient.connect();

  const schema = fs.readFileSync(path.join(__dirname, '..', 'database', 'schema.sql'), 'utf8');
  const seed = fs.readFileSync(path.join(__dirname, '..', 'database', 'seed.sql'), 'utf8');

  await appClient.query(schema);
  await appClient.query(seed);
  await appClient.end();

  console.log('Database schema and seed data are ready.');
}

main().catch((error) => {
  console.error('Database setup failed:', error.message);
  process.exit(1);
});
