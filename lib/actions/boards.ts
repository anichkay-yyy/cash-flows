"use server";

import { db } from "@/lib/db";
import { boards } from "@/lib/db/schema";
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
