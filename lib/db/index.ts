import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

const dbPath = process.env.DB_PATH || "cash-flows.db";
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

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

export const db = drizzle(sqlite, { schema });
