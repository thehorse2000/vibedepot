import Database from 'better-sqlite3';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

const databases = new Map<string, Database.Database>();

// Allowlist of safe SQL statement prefixes
const ALLOWED_STATEMENTS = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE\s+TABLE|CREATE\s+INDEX|ALTER\s+TABLE|DROP\s+TABLE|DROP\s+INDEX|PRAGMA\s+table_info|PRAGMA\s+table_list|BEGIN|COMMIT|ROLLBACK)\b/i;

// Blocklist of dangerous operations
const BLOCKED_PATTERNS = /\b(ATTACH|DETACH|LOAD_EXTENSION|PRAGMA\s+(?!table_info|table_list))\b/i;

function getDbDir(appId: string): string {
  const dir = join(app.getPath('userData'), 'app-data', appId);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getDbPath(appId: string): string {
  return join(getDbDir(appId), 'database.sqlite');
}

function validateSql(sql: string): void {
  if (BLOCKED_PATTERNS.test(sql)) {
    throw new Error(`Blocked SQL statement: ${sql.slice(0, 50)}...`);
  }
  if (!ALLOWED_STATEMENTS.test(sql)) {
    throw new Error(
      `SQL statement not allowed. Supported: SELECT, INSERT, UPDATE, DELETE, CREATE TABLE, CREATE INDEX, ALTER TABLE, DROP TABLE, DROP INDEX, PRAGMA table_info`
    );
  }
}

export function getDb(appId: string): Database.Database {
  let db = databases.get(appId);
  if (db) return db;

  const dbPath = getDbPath(appId);
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  databases.set(appId, db);
  return db;
}

export function closeDb(appId: string): void {
  const db = databases.get(appId);
  if (db) {
    db.close();
    databases.delete(appId);
  }
}

export function deleteDbFile(appId: string): void {
  closeDb(appId);
  const dbPath = getDbPath(appId);
  try {
    unlinkSync(dbPath);
    // Also remove WAL and SHM files if they exist
    try { unlinkSync(dbPath + '-wal'); } catch { /* ignore */ }
    try { unlinkSync(dbPath + '-shm'); } catch { /* ignore */ }
  } catch {
    // File may not exist
  }
}

export function runQuery(
  appId: string,
  sql: string,
  params?: unknown[]
): { changes: number; lastInsertRowid: number } {
  validateSql(sql);
  const db = getDb(appId);
  const stmt = db.prepare(sql);
  const result = stmt.run(...(params ?? []));
  return {
    changes: result.changes,
    lastInsertRowid: Number(result.lastInsertRowid),
  };
}

export function queryAll(
  appId: string,
  sql: string,
  params?: unknown[]
): unknown[] {
  validateSql(sql);
  const db = getDb(appId);
  const stmt = db.prepare(sql);
  return stmt.all(...(params ?? []));
}

export function execTransaction(
  appId: string,
  statements: Array<{ sql: string; params?: unknown[] }>
): void {
  for (const s of statements) {
    validateSql(s.sql);
  }
  const db = getDb(appId);
  const tx = db.transaction(() => {
    for (const { sql, params } of statements) {
      const stmt = db.prepare(sql);
      stmt.run(...(params ?? []));
    }
  });
  tx();
}
