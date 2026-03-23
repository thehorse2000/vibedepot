---
title: Working with Storage
description: How to use key-value storage and SQLite databases in your VibeDepot app.
---

VibeDepot provides two storage mechanisms for apps: **key-value (KV) storage** for simple data and **SQLite databases** for structured, queryable data.

## Key-Value Storage

KV storage is the simplest way to persist data. It stores JSON-serializable values keyed by string names. The `storage.kv` permission is auto-granted to all apps.

### Save Data

```javascript
// Store a string
await window.vibeDepot.storage.set('username', 'Alice');

// Store an object
await window.vibeDepot.storage.set('preferences', {
  theme: 'dark',
  fontSize: 14,
  language: 'en'
});

// Store an array
await window.vibeDepot.storage.set('history', [
  { query: 'hello', timestamp: Date.now() }
]);
```

### Read Data

```javascript
const username = await window.vibeDepot.storage.get('username');
// => 'Alice'

const prefs = await window.vibeDepot.storage.get('preferences');
// => { theme: 'dark', fontSize: 14, language: 'en' }

const missing = await window.vibeDepot.storage.get('nonexistent');
// => null
```

### Delete Data

```javascript
const deleted = await window.vibeDepot.storage.delete('username');
// => true (existed and was deleted)

const notFound = await window.vibeDepot.storage.delete('nonexistent');
// => false (didn't exist)
```

### List Keys

```javascript
const keys = await window.vibeDepot.storage.keys();
// => ['preferences', 'history']
```

### Clear All Data

```javascript
await window.vibeDepot.storage.clear();
```

### How It Works

KV storage is backed by a JSON file at `~/.vibedepot/app-data/{appId}/store.json`. Each app has isolated storage — apps cannot read each other's data.

### When to Use KV Storage

- User preferences and settings
- Small amounts of structured data
- Conversation history (when simple)
- Draft saving / auto-save
- Caching API responses

## SQLite Database

For structured data with complex queries, use the SQLite database. This requires the `storage.db` permission.

### Manifest Setup

```json
{
  "permissions": ["ai", "storage.kv", "storage.db"]
}
```

### Create a Table

```javascript
await window.vibeDepot.db.run(`
  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);
```

### Insert Data

```javascript
const result = await window.vibeDepot.db.run(
  'INSERT INTO notes (title, content) VALUES (?, ?)',
  ['Meeting Notes', 'Discussed the roadmap for Q2.']
);

console.log(result.lastInsertRowid); // => 1
console.log(result.changes);         // => 1
```

### Query Data

```javascript
const notes = await window.vibeDepot.db.query(
  'SELECT * FROM notes WHERE title LIKE ?',
  ['%Meeting%']
);
// => [{ id: 1, title: 'Meeting Notes', content: '...', created_at: '...' }]
```

### Update and Delete

```javascript
// Update
await window.vibeDepot.db.run(
  'UPDATE notes SET content = ? WHERE id = ?',
  ['Updated content.', 1]
);

// Delete
await window.vibeDepot.db.run('DELETE FROM notes WHERE id = ?', [1]);
```

### Transactions

Execute multiple statements atomically:

```javascript
await window.vibeDepot.db.transaction([
  {
    sql: 'INSERT INTO notes (title, content) VALUES (?, ?)',
    params: ['Note 1', 'Content 1']
  },
  {
    sql: 'INSERT INTO notes (title, content) VALUES (?, ?)',
    params: ['Note 2', 'Content 2']
  }
]);
```

If any statement fails, the entire transaction is rolled back.

### SQL Allowlist

For security, VibeDepot only allows specific SQL statements:

**Allowed:**
`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE`, `DROP TABLE`, `DROP INDEX`, `PRAGMA table_info`, `PRAGMA table_list`, `BEGIN`, `COMMIT`, `ROLLBACK`

**Blocked:**
`ATTACH`, `DETACH`, `LOAD_EXTENSION`, and most `PRAGMA` statements.

See the [SQL Allowlist Reference](/reference/sql-allowlist/) for the complete list.

### How It Works

Each app gets its own SQLite database at `~/.vibedepot/app-data/{appId}/database.sqlite`. Databases use WAL (Write-Ahead Logging) mode for better concurrent access.

### When to Use SQLite

- Large datasets that need indexing
- Relational data with foreign keys
- Complex queries (joins, aggregations, full-text search)
- Data that needs atomic transactions

## KV vs SQLite

| Feature | KV Storage | SQLite |
|---|---|---|
| Permission | `storage.kv` (auto-granted) | `storage.db` (consent required) |
| Data format | JSON values | SQL tables |
| Queries | Key lookup only | Full SQL |
| Transactions | No | Yes |
| Best for | Settings, small data | Large/relational data |

## Next Steps

- [Configuring Permissions](/guides/permissions/) — Permission declaration and enforcement
- [Bridge API Reference](/reference/bridge-api/) — Complete storage and database API
- [SQL Allowlist Reference](/reference/sql-allowlist/) — Allowed SQL statements
