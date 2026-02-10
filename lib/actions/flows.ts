"use server";

import { db } from "@/lib/db";
import { flows } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function getFlows() {
  return db.select().from(flows).all();
}

export async function createFlow(data: {
  sourceNodeId: string;
  targetNodeId: string;
  label?: string;
  constancy?: number;
  quantity?: number;
}) {
  const id = uuidv4();
  await db.insert(flows).values({
    id,
    sourceNodeId: data.sourceNodeId,
    targetNodeId: data.targetNodeId,
    label: data.label ?? "",
    constancy: data.constancy ?? 0.5,
    quantity: data.quantity ?? 1,
  });
  return db.select().from(flows).where(eq(flows.id, id)).get();
}

export async function updateFlow(
  id: string,
  data: { label?: string; constancy?: number; quantity?: number }
) {
  await db.update(flows).set(data).where(eq(flows.id, id));
  return db.select().from(flows).where(eq(flows.id, id)).get();
}

export async function deleteFlow(id: string) {
  await db.delete(flows).where(eq(flows.id, id));
}
