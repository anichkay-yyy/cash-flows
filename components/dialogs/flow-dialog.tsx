"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface FlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    label: string;
    constancy: number;
    share: number;
  }) => void;
  onDelete?: () => void;
  initialData?: { label: string; constancy: number; share: number };
  mode: "create" | "edit";
}

export function FlowDialog({
  open,
  onOpenChange,
  onSubmit,
  onDelete,
  initialData,
  mode,
}: FlowDialogProps) {
  const [label, setLabel] = useState(initialData?.label ?? "");
  const [constancy, setConstancy] = useState(initialData?.constancy ?? 50);
  const [share, setShare] = useState(initialData?.share ?? 100);

  useEffect(() => {
    if (open) {
      setLabel(initialData?.label ?? "");
      setConstancy(initialData?.constancy ?? 50);
      setShare(initialData?.share ?? 100);
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      label,
      constancy,
      share,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "New Flow" : "Edit Flow"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="flow-label">Label</Label>
            <Input
              id="flow-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Flow label..."
              autoFocus
              className="bg-background border-border"
            />
          </div>
          <div className="space-y-2">
            <Label>Constancy: {constancy}%</Label>
            <Slider
              value={[constancy]}
              onValueChange={([v]) => setConstancy(v)}
              min={0}
              max={100}
              step={1}
              className="py-2"
            />
          </div>
          <div className="space-y-2">
            <Label>Share: {share}%</Label>
            <Slider
              value={[share]}
              onValueChange={([v]) => setShare(v)}
              min={0}
              max={100}
              step={1}
              className="py-2"
            />
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
