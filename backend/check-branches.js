const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkBranches() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    const [rows] = await conn.execute('SELECT id, code, name FROM branches');
    console.log('Branches in database:');
    rows.forEach(r => console.log(`  ID: ${r.id}, Code: '${r.code || '(empty)'}', Name: ${r.name}`));
    
    // Check for duplicates
    const codes = rows.map(r => r.code || '');
    const duplicates = codes.filter((code, index) => codes.indexOf(code) !== index);
    if (duplicates.length > 0) {
      console.log('\n⚠️  Found duplicate codes:', duplicates);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await conn.end();
  }
}

checkBranches();

