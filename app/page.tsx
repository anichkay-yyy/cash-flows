"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  copyBoard,
} from "@/lib/actions/boards";
import type { Board } from "@/lib/db/schema";

export default function Home() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "rename">("create");
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [boardName, setBoardName] = useState("");

  useEffect(() => {
    getBoards().then(setBoards).catch(console.error);
  }, []);

  const handleCreate = () => {
    setDialogMode("create");
    setEditingBoardId(null);
    setBoardName("");
    setDialogOpen(true);
  };

  const handleRename = (board: Board) => {
    setDialogMode("rename");
    setEditingBoardId(board.id);
    setBoardName(board.name);
    setDialogOpen(true);
  };

  const handleCopy = async (id: string) => {
    const copied = await copyBoard(id);
    if (copied) {
      setBoards((b) => [...b, copied]);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteBoard(id);
    setBoards((b) => b.filter((board) => board.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = boardName.trim();
    if (!name) return;

    if (dialogMode === "create") {
      const board = await createBoard(name);
      setDialogOpen(false);
      router.push(`/boards/${board.id}`);
    } else if (editingBoardId) {
      const updated = await updateBoard(editingBoardId, name);
      if (updated) {
        setBoards((b) =>
          b.map((board) => (board.id === editingBoardId ? updated : board))
        );
      }
      setDialogOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground">Boards</h1>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New board
          </Button>
        </div>

        {boards.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-4">No boards yet</p>
            <Button onClick={handleCreate} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create your first board
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="group relative bg-card border border-border rounded-lg p-5 cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => router.push(`/boards/${board.id}`)}
              >
                <h2 className="text-foreground font-medium truncate pr-16">
                  {board.name}
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(board.createdAt).toLocaleDateString()}
                </p>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(board);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(board.id);
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(board.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "create" ? "New board" : "Rename board"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "create"
                ? "Create a new board to organize your flows"
                : "Change the name of this board"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              placeholder="Board name"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              autoFocus
            />
            <Button type="submit">
              {dialogMode === "create" ? "Create" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
