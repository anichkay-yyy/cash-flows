"use server";

import { db } from "@/lib/db";
import { nodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

type UINodeType = "source" | "consumer" | "middleware";
type DBNodeType = "source" | "consumer" | "both";

function toDbType(type: UINodeType): DBNodeType {
  return type === "middleware" ? "both" : type;
}

function toUiType(type: DBNodeType): UINodeType {
  return type === "both" ? "middleware" : type;
}

function mapNodeType<T extends { type: DBNodeType }>(node: T) {
  return { ...node, type: toUiType(node.type) };
}

export async function getNodes(boardId: string) {
  const rows = await db.select().from(nodes).where(eq(nodes.boardId, boardId)).all();
  return rows.map(mapNodeType);
}

export async function createNode(data: {
  boardId: string;
  name: string;
  type: UINodeType;
  positionX: number;
  positionY: number;
}) {
  const id = uuidv4();
  await db.insert(nodes).values({
    id,
    boardId: data.boardId,
    name: data.name,
    type: toDbType(data.type),
    positionX: data.positionX,
    positionY: data.positionY,
  });
  const row = await db.select().from(nodes).where(eq(nodes.id, id)).get();
  return row ? mapNodeType(row) : undefined;
}

export async function updateNode(
  id: string,
  data: { name?: string; type?: UINodeType }
) {
  const dbData = data.type ? { ...data, type: toDbType(data.type) } : data;
  await db.update(nodes).set(dbData).where(eq(nodes.id, id));
  const row = await db.select().from(nodes).where(eq(nodes.id, id)).get();
  return row ? mapNodeType(row) : undefined;
}

export async function updateNodePosition(
  id: string,
  positionX: number,
  positionY: number
) {
  await db.update(nodes).set({ positionX, positionY }).where(eq(nodes.id, id));
}

export async function deleteNode(id: string) {
  await db.delete(nodes).where(eq(nodes.id, id));
}
