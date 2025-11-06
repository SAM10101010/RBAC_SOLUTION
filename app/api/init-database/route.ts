import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db-postgres';

export async function GET() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialized successfully!');
    
    return NextResponse.json({ message: 'Database initialized successfully!' });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return NextResponse.json({ error: 'Failed to initialize database' }, { status: 500 });
  }
}