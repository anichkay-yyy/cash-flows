"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolbarProps {
  onAddNode: () => void;
}

export function Toolbar({ onAddNode }: ToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10">
      <Button
        onClick={onAddNode}
        size="icon"
        className="bg-primary hover:bg-primary/80 h-10 w-10 rounded-lg shadow-lg"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
