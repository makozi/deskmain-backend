import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/database.js';
import logger from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Migration Runner
 * Executes SQL migration files in sequence with tracking
 */
class MigrationRunner {
  constructor() {
    this.migrationsDir = __dirname;
    this.migrationsTable = 'migrations';
  }

  /**
   * Initialize migrations table
   */
  async initMigrationsTable() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      logger.info('Migrations table initialized');
    } catch (error) {
      logger.error('Error initializing migrations table:', error);
      throw error;
    }
  }

  /**
   * Get list of migration files
   */
  getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsDir);
      return files
        .filter(file => file.endsWith('.sql') && /^\d{3}_/.test(file))
        .sort();
    } catch (error) {
      logger.error('Error reading migration files:', error);
      throw error;
    }
  }

  /**
   * Get executed migrations
   */
  async getExecutedMigrations() {
    try {
      const result = await db.query(
        `SELECT name FROM ${this.migrationsTable} ORDER BY name`
      );
      return result.rows.map(row => row.name);
    } catch (error) {
      // Table might not exist yet, return empty array
      return [];
    }
  }

  /**
   * Record migration execution
   */
  async recordMigration(name) {
    try {
      await db.query(
        `INSERT INTO ${this.migrationsTable} (name) VALUES ($1)`,
        [name]
      );
    } catch (error) {
      logger.error(`Error recording migration ${name}:`, error);
      throw error;
    }
  }

  /**
   * Execute a single migration file
   */
  async executeMigration(filename) {
    try {
      const filepath = path.join(this.migrationsDir, filename);
      const sql = fs.readFileSync(filepath, 'utf8');

      logger.info(`Executing migration: ${filename}`);

      // Split SQL into individual statements and execute
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        try {
          await db.query(statement);
        } catch (error) {
          // Skip "already exists" errors for idempotency
          if (error.code === '42P07' || error.message.includes('already exists')) {
            logger.info(`⊘ Skipped (already exists): ${filename}`);
          } else {
            throw error;
          }
        }
      }

      await this.recordMigration(filename);
      logger.info(`✓ Migration executed: ${filename}`);
    } catch (error) {
      logger.error(`Error executing migration ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Run all pending migrations
   */
  async runPendingMigrations() {
    try {
      logger.info('Starting migration process...');

      // Initialize migrations table
      await this.initMigrationsTable();

      // Get list of migration files
      const migrationFiles = this.getMigrationFiles();
      logger.info(`Found ${migrationFiles.length} migration files`);

      // Get executed migrations
      const executedMigrations = await this.getExecutedMigrations();
      logger.info(`Already executed: ${executedMigrations.length} migrations`);

      // Find pending migrations
      const pendingMigrations = migrationFiles.filter(
        file => !executedMigrations.includes(file)
      );

      if (pendingMigrations.length === 0) {
        logger.info('✓ All migrations are up to date');
        return;
      }

      logger.info(`Pending migrations: ${pendingMigrations.length}`);

      // Execute pending migrations in order
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      logger.info('✓ All migrations completed successfully');
    } catch (error) {
      logger.error('Migration process failed:', error);
      throw error;
    }
  }

  /**
   * Show migration status
   */
  async showStatus() {
    try {
      const migrationFiles = this.getMigrationFiles();
      const executedMigrations = await this.getExecutedMigrations();

      console.log('\n=== Migration Status ===\n');
      console.log(`Total migrations: ${migrationFiles.length}`);
      console.log(`Executed: ${executedMigrations.length}`);
      console.log(`Pending: ${migrationFiles.length - executedMigrations.length}\n`);

      console.log('Migrations:');
      migrationFiles.forEach(file => {
        const status = executedMigrations.includes(file) ? '✓ DONE' : '⊘ PENDING';
        console.log(`  ${status}  ${file}`);
      });

      console.log('\n');
    } catch (error) {
      logger.error('Error showing status:', error);
      throw error;
    }
  }
}

/**
 * CLI Handler
 */
async function main() {
  const runner = new MigrationRunner();
  const command = process.argv[2];

  try {
    switch (command) {
      case 'status':
        await runner.showStatus();
        break;
      case 'run':
      default:
        await runner.runPendingMigrations();
        break;
    }

    process.exit(0);
  } catch (error) {
    logger.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default MigrationRunner;
