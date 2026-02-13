"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type CashNodeData = {
  label: string;
  nodeType: "source" | "consumer" | "middleware";
};

const typeColors: Record<string, { bg: string; border: string }> = {
  source: { bg: "bg-[#284CAC]/20", border: "border-[#284CAC]" },
  consumer: { bg: "bg-red-900/20", border: "border-red-700" },
  middleware: { bg: "bg-purple-900/20", border: "border-purple-600" },
};

const typeLabels: Record<string, string> = {
  source: "Source",
  consumer: "Consumer",
  middleware: "Middleware",
};

function CustomNode({ data }: NodeProps) {
  const nodeData = data as unknown as CashNodeData;
  const colors = typeColors[nodeData.nodeType] || typeColors.source;

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 ${colors.border} ${colors.bg} backdrop-blur-sm min-w-[120px] cursor-grab active:cursor-grabbing`}
    >
      {(nodeData.nodeType === "consumer" || nodeData.nodeType === "middleware") && (
        <Handle
          type="target"
          position={Position.Left}
          className="!w-3 !h-3 !bg-[#284CAC] !border-2 !border-[#284CAC]/50"
        />
      )}
      <div className="text-center">
        <div className="text-sm font-medium text-foreground">
          {nodeData.label}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {typeLabels[nodeData.nodeType]}
        </div>
      </div>
      {(nodeData.nodeType === "source" || nodeData.nodeType === "middleware") && (
        <Handle
          type="source"
          position={Position.Right}
          className="!w-3 !h-3 !bg-[#284CAC] !border-2 !border-[#284CAC]/50"
        />
      )}
    </div>
  );
}

export default memo(CustomNode);
