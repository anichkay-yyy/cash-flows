"use client";

import { use } from "react";
import dynamic from "next/dynamic";

const Board = dynamic(() => import("@/components/board/board"), {
  ssr: false,
});

export default function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = use(params);
  return <Board boardId={boardId} />;
}
