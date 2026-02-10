import { sqliteTable, text, real, integer } from "drizzle-orm/sqlite-core";

export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
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
  sourceNodeId: text("source_node_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),
  targetNodeId: text("target_node_id")
    .notNull()
    .references(() => nodes.id, { onDelete: "cascade" }),
  constancy: real("constancy").notNull().default(0.5),
  quantity: real("quantity").notNull().default(1),
  label: text("label").default(""),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type Node = typeof nodes.$inferSelect;
export type NewNode = typeof nodes.$inferInsert;
export type Flow = typeof flows.$inferSelect;
export type NewFlow = typeof flows.$inferInsert;
