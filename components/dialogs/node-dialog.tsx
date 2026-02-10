"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NodeType = "source" | "consumer" | "both";

interface NodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; type: NodeType }) => void;
  onDelete?: () => void;
  initialData?: { name: string; type: NodeType };
  mode: "create" | "edit";
}

export function NodeDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  initialData,
  mode,
}: NodeDialogProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [type, setType] = useState<NodeType>(initialData?.type ?? "source");

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? "");
      setType(initialData?.type ?? "source");
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New Node" : "Edit Node"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new node with a name and type"
              : "Edit the node settings"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Node name..."
              autoFocus
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as NodeType)}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="consumer">Consumer</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="gap-2">
            {mode === "edit" && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  onDelete();
                  onOpenChange(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button type="submit" className="bg-primary hover:bg-primary/80">
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
