import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const boards = sqliteTable("boards", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", { enum: ["source", "consumer", "both"] }).notNull(),
  positionX: real("position_x").notNull().default(0),
  positionY: real("position_y").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const flows = sqliteTable("flows", {
  id: text("id").primaryKey(),
  boardId: text("board_id")
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  sourceNodeId: text("source_node_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),
  targetNodeId: text("target_node_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),
  constancy: real("constancy").notNull().default(50),
  share: real("share").notNull().default(100),
  label: text("label").default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Flow = typeof flows.$inferSelect;
export type NewFlow = typeof flows.$inferInsert;
