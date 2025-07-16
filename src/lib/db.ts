import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// This function gets the database instance, creating it if it doesn't exist.
export async function getDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database,
  });
}

// This function creates the necessary tables if they don't exist.
export async function initializeDb() {
  console.log('Attempting to initialize the database...');
  const db = await getDb();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      url TEXT NOT NULL,
      title TEXT,
      favicon TEXT,
      summary TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  
  console.log('Database initialized successfully.');
  await db.close();
}