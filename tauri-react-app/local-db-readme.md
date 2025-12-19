# Local Database for Tauri

## Recommended: SQLite with @tauri-apps/plugin-sql

SQLite is the best choice for Tauri applications - fast, lightweight, and file-based with official Tauri support.

### Key Features
- Single-file database (~600KB footprint)
- Excellent performance with concurrent reads
- Official Tauri plugin support
- Works seamlessly with both Rust and JavaScript

### Installation

```bash
npm install @tauri-apps/plugin-sql
cargo add tauri-plugin-sql
```

### Basic Usage

```typescript
import Database from '@tauri-apps/plugin-sql';

// Load/create database
const db = await Database.load('sqlite:mydatabase.db');

// Create table
await db.execute('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)');

// Insert data
await db.execute('INSERT INTO users (name) VALUES (?)', ['John']);

// Query data
const result = await db.select('SELECT * FROM users');
```

### Alternative Options
- **Sled**: Rust-native embedded database, excellent for key-value storage
- **RocksDB**: High-performance key-value store (heavier)
- **IndexedDB**: Browser-based storage with familiar web APIs
