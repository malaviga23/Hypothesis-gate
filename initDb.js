const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function promptPassword(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function initializeDatabase() {
  console.log('========================================================');
  console.log('  HYPOTHESIS GATE - MySQL Database Setup & Initialization');
  console.log('========================================================\n');

  let host = process.env.DB_HOST || 'localhost';
  let user = process.env.DB_USER || 'root';
  let port = parseInt(process.env.DB_PORT || '3306', 10);
  let password = process.env.DB_PASSWORD;

  // If password is not provided in .env or is a placeholder, prompt user
  if (password === undefined || password === 'your_mysql_password') {
    password = await promptPassword('Enter MySQL root password (press Enter if no password): ');
  }

  console.log(`\nConnecting to MySQL server at ${host}:${port} as '${user}'...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password,
      port,
      multipleStatements: true
    });
    console.log(' Connection established successfully!\n');
  } catch (err) {
    console.error('\n Failed to connect to MySQL:');
    console.error(`Error Code:    ${err.code || 'UNKNOWN'}`);
    console.error(`Error Number:  ${err.errno || 'N/A'}`);
    console.error(`Message:       ${err.message || err.sqlMessage}\n`);
    
    console.log('Troubleshooting Guide:');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log(' • The password for user "' + user + '" was incorrect.');
      console.log(' • If your MySQL root account has a different password, re-run "npm run db:init" and enter it.');
    } else if (err.code === 'ECONNREFUSED') {
      console.log(' • MySQL server is not reachable on ' + host + ':' + port + '.');
      console.log(' • Verify that the MySQL Windows service (e.g., MySQL80) is running in services.msc.');
    } else {
      console.log(' • Please verify MySQL installation and configuration.');
    }
    console.log('\nYou can also edit backend/.env directly and run "npm run db:init" again.\n');
    process.exit(1);
  }

  try {
    console.log('Applying database schema from database.sql...');
    const schemaSql = fs.readFileSync(path.resolve(__dirname, 'database.sql'), 'utf8');

    await connection.query(schemaSql);
    console.log(' Database "hypothesis_gate" and tables created successfully!\n');

    // Save verified credentials to .env
    const envContent = [
      `PORT=${process.env.PORT || 5000}`,
      `DB_HOST=${host}`,
      `DB_USER=${user}`,
      `DB_PASSWORD=${password}`,
      `DB_NAME=hypothesis_gate`,
      `DB_PORT=${port}`,
      `JWT_SECRET=${process.env.JWT_SECRET || 'hypothesis_gate_jwt_secure_key_2026_xyz'}`,
      `CLIENT_URL=${process.env.CLIENT_URL || 'http://localhost:5173'}`
    ].join('\n') + '\n';

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(' Verified configuration saved to backend/.env\n');

    // Run seed
    console.log('Seeding initial demo data...');
    // Release temp connection before calling seed
    await connection.end();

    // Reload dotenv for seed
    dotenv.config({ path: envPath, override: true });
    const seed = require('./seed');
    await seed();

    console.log('\n Database setup and demo seeding complete!');
    console.log('========================================================\n');
  } catch (err) {
    console.error('Error executing database setup:', err);
    if (connection) await connection.end();
    process.exit(1);
  }
}

if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
