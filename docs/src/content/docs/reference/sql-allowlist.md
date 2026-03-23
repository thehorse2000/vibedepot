---
title: SQL Allowlist Reference
description: Complete list of allowed and blocked SQL statements for VibeDepot app databases.
---

Apps with the `storage.db` permission can execute SQL against a per-app SQLite database. For security, only a specific set of SQL statements is allowed.

## Allowed Statements

The following SQL statement types are permitted:

| Statement | Use Case |
|---|---|
| `SELECT` | Read data from tables |
| `INSERT` | Add new rows |
| `UPDATE` | Modify existing rows |
| `DELETE` | Remove rows |
| `CREATE TABLE` | Create new tables |
| `CREATE INDEX` | Create indexes for performance |
| `ALTER TABLE` | Modify table structure |
| `DROP TABLE` | Remove tables |
| `DROP INDEX` | Remove indexes |
| `PRAGMA table_info` | Get column information for a table |
| `PRAGMA table_list` | List all tables in the database |
| `BEGIN` | Start a transaction |
| `COMMIT` | Commit a transaction |
| `ROLLBACK` | Roll back a transaction |

## Blocked Statements

The following are explicitly blocked:

| Statement | Reason |
|---|---|
| `ATTACH` | Would allow attaching external database files |
| `DETACH` | Related to external database access |
| `LOAD_EXTENSION` | Would allow loading native code |
| `PRAGMA` (most) | Could modify database configuration unsafely |

Any `PRAGMA` statement **except** `PRAGMA table_info` and `PRAGMA table_list` is blocked.

## Validation Logic

SQL is validated before execution using two checks:

1. **Blocklist check** — If the statement matches a blocked pattern, it's rejected immediately.
2. **Allowlist check** — If the statement doesn't start with an allowed keyword, it's rejected.

Both checks are case-insensitive and match at the start of the SQL string (after whitespace).

## Examples

### Allowed

```javascript
// Table creation
await window.vibeDepot.db.run(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

// Insert with parameters
await window.vibeDepot.db.run(
  'INSERT INTO tasks (title) VALUES (?)',
  ['Buy groceries']
);

// Select query
const tasks = await window.vibeDepot.db.query(
  'SELECT * FROM tasks WHERE done = ?',
  [0]
);

// Update
await window.vibeDepot.db.run(
  'UPDATE tasks SET done = 1 WHERE id = ?',
  [1]
);

// Delete
await window.vibeDepot.db.run(
  'DELETE FROM tasks WHERE done = 1'
);

// Table introspection
const columns = await window.vibeDepot.db.query(
  'PRAGMA table_info(tasks)'
);

// Index creation
await window.vibeDepot.db.run(
  'CREATE INDEX idx_tasks_done ON tasks(done)'
);
```

### Blocked

```javascript
// These will throw DB_ERROR:

// Attaching external databases
await window.vibeDepot.db.run("ATTACH '/path/to/other.db' AS other");
// Error: Blocked SQL statement

// Loading native extensions
await window.vibeDepot.db.run("SELECT load_extension('something')");
// Error: Blocked SQL statement

// Modifying database configuration
await window.vibeDepot.db.run("PRAGMA journal_mode = DELETE");
// Error: Blocked SQL statement

// Arbitrary PRAGMA (not table_info or table_list)
await window.vibeDepot.db.run("PRAGMA cache_size = 10000");
// Error: Blocked SQL statement
```

## Database Configuration

Each app's SQLite database is pre-configured with:

- **WAL mode** (`PRAGMA journal_mode = WAL`) — Set automatically when the database is first opened. Provides better concurrent read/write performance.
- **Location** — `~/.vibedepot/app-data/{appId}/database.sqlite`
- **Engine** — better-sqlite3 (synchronous, high-performance)

## Source

The SQL validation logic is in `shell/src/main/appDatabase.ts`.
