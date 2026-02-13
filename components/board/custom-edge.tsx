"use client";

import { memo } from "react";
import {
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export type CashEdgeData = {
  label?: string;
  constancy?: number;
  share?: number;
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

  const constancy = edgeData?.constancy ?? 50;
  const share = edgeData?.share ?? 100;
  const label = edgeData?.label;

  // Animation speed: higher constancy = faster (lower duration)
  // constancy 0 -> 4s, constancy 100 -> 0.3s
  const animDuration = 4 - (constancy / 100) * 3.7;

  // strokeWidth based on share percentage: 1 at 0%, 4 at 100%
  const strokeWidth = 1 + (share / 100) * 3;

  const markerId = `arrow-${id}`;

  return (
    <>
      <defs>
        <marker
          id={markerId}
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="6"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M2,2 L10,6 L2,10" fill="none" stroke="#284CAC" strokeWidth="1.5" />
        </marker>
      </defs>
      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        style={{
          strokeWidth: 20,
          fill: "none",
          stroke: "transparent",
          pointerEvents: "stroke",
        }}
      />
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          stroke: "#284CAC",
          strokeWidth,
          opacity: 0.4 + (constancy / 100) * 0.6,
          fill: "none",
          strokeDasharray: "8 4",
          animation: `flowAnimation ${animDuration}s linear infinite`,
          markerEnd: `url(#${markerId})`,
          pointerEvents: "stroke",
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
              c:{constancy}% s:{share}%
            </div>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
