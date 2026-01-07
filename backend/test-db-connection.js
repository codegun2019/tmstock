// Quick test database connection
const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'mstock',
    });

    console.log('✅ Database connection successful!');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    console.error('\nPlease check:');
    console.error('1. MySQL/MAMP is running');
    console.error('2. Database "mstock" exists');
    console.error('3. .env file has correct credentials');
    process.exit(1);
  }
}

testConnection();

