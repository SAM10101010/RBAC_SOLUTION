// Script to initialize the database
import { initializeDatabase } from './lib/db-postgres';

async function initDatabase() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

initDatabase();