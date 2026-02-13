"use server";

import { db } from "@/lib/db";
import { boards, nodes, flows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function getBoards() {
  return db.select().from(boards).all();
}

export async function createBoard(name: string) {
  const id = uuidv4();
  await db.insert(boards).values({ id, name });
  return db.select().from(boards).where(eq(boards.id, id)).get()!;
}

export async function updateBoard(id: string, name: string) {
  await db.update(boards).set({ name }).where(eq(boards.id, id));
  return db.select().from(boards).where(eq(boards.id, id)).get();
}

export async function deleteBoard(id: string) {
  await db.delete(boards).where(eq(boards.id, id));
}

export async function copyBoard(id: string) {
  const board = await db.select().from(boards).where(eq(boards.id, id)).get();
  if (!board) return;

  const newBoardId = uuidv4();
  await db.insert(boards).values({
    id: newBoardId,
    name: `${board.name} (copy)`,
  });

  const oldNodes = await db.select().from(nodes).where(eq(nodes.boardId, id)).all();
  const nodeIdMap = new Map<string, string>();

  for (const node of oldNodes) {
    const newNodeId = uuidv4();
    nodeIdMap.set(node.id, newNodeId);
    await db.insert(nodes).values({
      id: newNodeId,
      boardId: newBoardId,
      name: node.name,
      type: node.type,
      positionX: node.positionX,
      positionY: node.positionY,
    });
  }

  const oldFlows = await db.select().from(flows).where(eq(flows.boardId, id)).all();

  for (const flow of oldFlows) {
    const newSource = nodeIdMap.get(flow.sourceNodeId);
    const newTarget = nodeIdMap.get(flow.targetNodeId);
    if (!newSource || !newTarget) continue;
    await db.insert(flows).values({
      id: uuidv4(),
      boardId: newBoardId,
      sourceNodeId: newSource,
      targetNodeId: newTarget,
      label: flow.label,
      constancy: flow.constancy,
      share: flow.share,
    });
  }

  return db.select().from(boards).where(eq(boards.id, newBoardId)).get()!;
}
