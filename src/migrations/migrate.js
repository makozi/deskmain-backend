import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationDir = path.join(__dirname, '../../migrations');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Get all SQL migration files
    const files = fs.readdirSync(migrationDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migrations found.');
      process.exit(0);
    }

    for (const file of files) {
      const filePath = path.join(migrationDir, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      try {
        console.log(`Running migration: ${file}`);
        await pool.query(sql);
        console.log(`✓ Migration completed: ${file}`);
      } catch (error) {
        if (error.code === '42P07') {
          // Table already exists, skip
          console.log(`⊘ Migration skipped (already exists): ${file}`);
        } else {
          throw error;
        }
      }
    }

    console.log('✓ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
