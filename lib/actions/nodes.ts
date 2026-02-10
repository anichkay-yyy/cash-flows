"use server";

import { db } from "@/lib/db";
import { nodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function getNodes(boardId: string) {
  return db.select().from(nodes).where(eq(nodes.boardId, boardId)).all();
}

export async function createNode(data: {
  boardId: string;
  name: string;
  type: "source" | "consumer" | "both";
  positionX: number;
  positionY: number;
}) {
  const id = uuidv4();
  await db.insert(nodes).values({
    id,
    boardId: data.boardId,
    name: data.name,
    type: data.type,
    positionX: data.positionX,
    positionY: data.positionY,
  });
  return db.select().from(nodes).where(eq(nodes.id, id)).get();
}

export async function updateNode(
  id: string,
  data: { name?: string; type?: "source" | "consumer" | "both" }
) {
  await db.update(nodes).set(data).where(eq(nodes.id, id));
  return db.select().from(nodes).where(eq(nodes.id, id)).get();
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
