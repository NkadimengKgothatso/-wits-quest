/**
 * SQLite Connection Module (sql.js / WASM-based)
 * 
 * Why sql.js: better-sqlite3 requires native C++ build tools (Python + MSVC).
 * sql.js is SQLite compiled to WebAssembly — zero native deps, works everywhere.
 * 
 * How it works:
 *   1. On startup we read the .db file from disk (if it exists) into a Buffer.
 *   2. sql.js loads that Buffer into an in-memory SQLite database.
 *   3. Every write operation calls `persist()` which exports the full DB
 *      back to disk. Reads are instant because they hit memory.
 */

import initSqlJs, { type Database } from 'sql.js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve the path to the SQLite file next to the source
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, '..', '..', 'wits_quest.db');

let db: Database | null = null;

/**
 * Initialise the database connection.
 * Call this once at server startup before any queries.
 */
export async function initDB(): Promise<Database> {
  const SQL = await initSqlJs();

  // If a database file already exists, load it into memory
  if (existsSync(DB_PATH)) {
    const fileBuffer = readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
    console.log(`[DB] Loaded existing database from ${DB_PATH}`);
  } else {
    db = new SQL.Database();
    console.log(`[DB] Created new in-memory database (will save to ${DB_PATH})`);
  }

  // Enable WAL-equivalent journal mode and foreign keys
  db.run('PRAGMA foreign_keys = ON;');

  return db;
}

/**
 * Get the current database instance. Throws if not initialised.
 */
export function getDB(): Database {
  if (!db) throw new Error('[DB] Database not initialised. Call initDB() first.');
  return db;
}

/**
 * Persist the in-memory database to disk.
 * Call this after any INSERT / UPDATE / DELETE.
 */
export function persist(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);

  // Ensure the directory exists
  const dir = dirname(DB_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(DB_PATH, buffer);
}

/**
 * Convenience: run a SQL statement that modifies data, then persist.
 */
export function runAndPersist(sql: string, params?: unknown[]): void {
  const d = getDB();
  if (params) {
    d.run(sql, params as any[]);
  } else {
    d.run(sql);
  }
  persist();
}

/**
 * Convenience: run a read-only query and return all rows as objects.
 */
export function queryAll<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[] {
  const d = getDB();
  const stmt = d.prepare(sql);
  if (params) stmt.bind(params as any[]);

  const rows: T[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T);
  }
  stmt.free();
  return rows;
}

/**
 * Convenience: run a read-only query and return the first row or undefined.
 */
export function queryOne<T = Record<string, unknown>>(sql: string, params?: unknown[]): T | undefined {
  const rows = queryAll<T>(sql, params);
  return rows[0];
}
