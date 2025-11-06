// This file should only be imported in server-side code
import { MongoClient, Db } from 'mongodb';

// Use environment variable for MongoDB URI
const uri = process.env.MONGODB_URI || "mongodb+srv://cricket-betting:your_actual_password_here@cluster0.kvpyeud.mongodb.net/?appName=Cluster0";
const dbName = "rbac";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    cachedClient = client;
    cachedDb = db;
    
    return { client, db };
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function initializeDatabase() {
  try {
    const { db } = await connectToDatabase();
    
    // Create users collection if it doesn't exist
    const collections = await db.listCollections().toArray();
    const usersCollectionExists = collections.some(collection => collection.name === 'users');
    const postsCollectionExists = collections.some(collection => collection.name === 'posts');
    
    if (!usersCollectionExists) {
      await db.createCollection('users');
      
      // Insert demo users if collection is empty
      const usersCollection = db.collection('users');
      const userCount = await usersCollection.countDocuments();
      
      if (userCount === 0) {
        await usersCollection.insertMany([
          {
            email: "admin@example.com",
            password: "password",
            name: "Admin User",
            role: "admin",
            createdAt: new Date().toISOString()
          },
          {
            email: "user@example.com",
            password: "password",
            name: "Regular User",
            role: "editor",
            createdAt: new Date().toISOString()
          },
          {
            email: "guest@example.com",
            password: "password",
            name: "Guest User",
            role: "viewer",
            createdAt: new Date().toISOString()
          }
        ]);
      }
    }
    
    if (!postsCollectionExists) {
      await db.createCollection('posts');
      
      // Insert demo posts if collection is empty
      const postsCollection = db.collection('posts');
      const postCount = await postsCollection.countDocuments();
      
      if (postCount === 0) {
        await postsCollection.insertMany([
          {
            title: "Getting Started with RBAC",
            content: "Learn the basics of Role-Based Access Control and how it secures your application.",
            authorId: "2", // This should match the user ID for "user@example.com"
            authorName: "Regular User",
            status: "published",
            createdAt: "2024-02-15",
            updatedAt: "2024-02-15",
          },
          {
            title: "Advanced Permission Management",
            content: "Dive deeper into granular permissions and fine-grained access control strategies.",
            authorId: "2", // This should match the user ID for "user@example.com"
            authorName: "Regular User",
            status: "published",
            createdAt: "2024-02-20",
            updatedAt: "2024-02-20",
          },
          {
            title: "Draft Post - Admin",
            content: "This is a draft post visible only to admins and the author.",
            authorId: "1", // This should match the user ID for "admin@example.com"
            authorName: "Admin User",
            status: "draft",
            createdAt: "2024-02-25",
            updatedAt: "2024-02-25",
          }
        ]);
      }
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}