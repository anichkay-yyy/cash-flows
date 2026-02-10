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
    quantity: number;
  }) => void;
  onDelete?: () => void;
  initialData?: { label: string; constancy: number; quantity: number };
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
  const [constancy, setConstancy] = useState(initialData?.constancy ?? 0.5);
  const [quantity, setQuantity] = useState(
    String(initialData?.quantity ?? 1)
  );

  useEffect(() => {
    if (open) {
      setLabel(initialData?.label ?? "");
      setConstancy(initialData?.constancy ?? 0.5);
      setQuantity(String(initialData?.quantity ?? 1));
    }
  }, [open, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      label,
      constancy,
      quantity: parseFloat(quantity) || 1,
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
            <Label>Constancy: {constancy.toFixed(2)}</Label>
            <Slider
              value={[constancy]}
              onValueChange={([v]) => setConstancy(v)}
              min={0}
              max={1}
              step={0.01}
              className="py-2"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              step="0.1"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="bg-background border-border"
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
