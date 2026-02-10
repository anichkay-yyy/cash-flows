"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export type CashEdgeData = {
  label?: string;
  constancy?: number;
  quantity?: number;
  onDoubleClick?: (id: string) => void;
};

function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style,
}: EdgeProps) {
  const edgeData = data as unknown as CashEdgeData;
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const constancy = edgeData?.constancy ?? 0.5;
  const quantity = edgeData?.quantity ?? 1;
  const label = edgeData?.label;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: "#284CAC",
          strokeWidth: Math.max(1, quantity * 2),
          opacity: 0.4 + constancy * 0.6,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="absolute pointer-events-auto cursor-pointer nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onDoubleClick={() => edgeData?.onDoubleClick?.(id)}
        >
          <div className="bg-card border border-border rounded px-2 py-1 text-xs text-foreground">
            {label && <div className="font-medium">{label}</div>}
            <div className="text-muted-foreground">
              c:{constancy.toFixed(1)} q:{quantity.toFixed(1)}
            </div>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
