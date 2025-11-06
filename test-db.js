// Simple script to test PostgreSQL connection
const { Pool } = require('pg');

// Use the same URI as in the application
const databaseUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_0e8gxVfTNSCp@ep-morning-mud-a45xdraw-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('Connecting to PostgreSQL...');
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    // Test query
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    client.release();
    
    // Test users table
    const usersResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`Users table has ${usersResult.rows[0].count} rows`);
    
  } catch (error) {
    console.error('Connection failed:', error);
  } finally {
    await pool.end();
    console.log('Connection closed');
  }
}

testConnection();