const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

async function initMySQL() {
  console.log('--- Brightloop MySQL Database Initialization ---');
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306');
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'brightloop_subscriptions';

  try {
    console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);
    const connection = await mysql.createConnection({ host, port, user, password });
    console.log('Connection established.');

    console.log(`Ensuring database '${dbName}' exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    console.log('Applying schema.sql...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const schemaStatements = schemaSql.split(/;\s*[\r\n]+/).map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of schemaStatements) {
      if (stmt && !stmt.startsWith('--')) {
        await connection.query(stmt);
      }
    }

    console.log('Applying seed.sql...');
    const seedSql = fs.readFileSync(seedPath, 'utf8');
    const seedStatements = seedSql.split(/;\s*[\r\n]+/).map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of seedStatements) {
      if (stmt && !stmt.startsWith('--')) {
        await connection.query(stmt);
      }
    }

    console.log('Database successfully initialized and seeded with demo data!');
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  }
}

initMySQL();
