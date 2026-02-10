import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const dbPath = process.env.DB_PATH || "cash-flows.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Disable FK checks during migration to avoid issues with DROP
sqlite.pragma("foreign_keys = OFF");

// Check if existing tables have correct schema or broken FK integrity; recreate if needed
let needsRecreate = false;

const tableInfo = sqlite.pragma("table_info(nodes)") as { name: string }[];
if (tableInfo.length > 0 && !tableInfo.some((col) => col.name === "board_id")) {
  needsRecreate = true;
}

if (!needsRecreate && tableInfo.length > 0) {
  const fkErrors = sqlite.pragma("foreign_key_check") as unknown[];
  if (fkErrors.length > 0) {
    needsRecreate = true;
  }
}

if (needsRecreate) {
  sqlite.exec(`
    DROP TABLE IF EXISTS flows;
    DROP TABLE IF EXISTS nodes;
    DROP TABLE IF EXISTS boards;
  `);
}

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS boards (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS nodes (
    id TEXT PRIMARY KEY NOT NULL,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    position_x REAL DEFAULT 0 NOT NULL,
    position_y REAL DEFAULT 0 NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS flows (
    id TEXT PRIMARY KEY NOT NULL,
    board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    source_node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id TEXT NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    constancy REAL DEFAULT 50 NOT NULL,
    share REAL DEFAULT 100 NOT NULL,
    label TEXT DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

// Enable FK checks after migration
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
