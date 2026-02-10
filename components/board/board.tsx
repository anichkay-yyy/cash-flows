"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node as RFNode,
  type Edge as RFEdge,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomNode from "./custom-node";
import CustomEdge from "./custom-edge";
import { Toolbar } from "./toolbar";
import { NodeDialog } from "@/components/dialogs/node-dialog";
import { FlowDialog } from "@/components/dialogs/flow-dialog";

import { getNodes } from "@/lib/actions/nodes";
import { getFlows } from "@/lib/actions/flows";
import {
  createNode,
  updateNode,
  updateNodePosition,
  deleteNode,
} from "@/lib/actions/nodes";
import { createFlow, updateFlow, deleteFlow } from "@/lib/actions/flows";

const nodeTypes = { cashNode: CustomNode };
const edgeTypes = { cashEdge: CustomEdge };

function BoardInner() {
  const [nodes, setNodes, onNodesChange] = useNodesState<RFNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFEdge>([]);
  const { getViewport } = useReactFlow();

  // Node dialog state
  const [nodeDialogOpen, setNodeDialogOpen] = useState(false);
  const [nodeDialogMode, setNodeDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeInitialData, setNodeInitialData] = useState<{
    name: string;
    type: "source" | "consumer" | "both";
  } | undefined>();

  // Flow dialog state
  const [flowDialogOpen, setFlowDialogOpen] = useState(false);
  const [flowDialogMode, setFlowDialogMode] = useState<"create" | "edit">(
    "create"
  );
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [flowInitialData, setFlowInitialData] = useState<{
    label: string;
    constancy: number;
    quantity: number;
  } | undefined>();
  const pendingConnection = useRef<Connection | null>(null);

  // Load data
  useEffect(() => {
    async function load() {
      const [dbNodes, dbFlows] = await Promise.all([getNodes(), getFlows()]);

      const rfNodes: RFNode[] = dbNodes.map((n) => ({
        id: n.id,
        type: "cashNode",
        position: { x: n.positionX, y: n.positionY },
        data: { label: n.name, nodeType: n.type },
      }));

      const rfEdges: RFEdge[] = dbFlows.map((f) => ({
        id: f.id,
        source: f.sourceNodeId,
        target: f.targetNodeId,
        type: "cashEdge",
        data: {
          label: f.label,
          constancy: f.constancy,
          quantity: f.quantity,
          onDoubleClick: handleEdgeDoubleClick,
        },
      }));

      setNodes(rfNodes);
      setEdges(rfEdges);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update edge callbacks when edges change
  useEffect(() => {
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        data: { ...e.data, onDoubleClick: handleEdgeDoubleClick },
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowDialogOpen]);

  const handleEdgeDoubleClick = useCallback(
    (edgeId: string) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;
      setEditingFlowId(edgeId);
      setFlowDialogMode("edit");
      setFlowInitialData({
        label: (edge.data as { label?: string })?.label ?? "",
        constancy: (edge.data as { constancy?: number })?.constancy ?? 0.5,
        quantity: (edge.data as { quantity?: number })?.quantity ?? 1,
      });
      setFlowDialogOpen(true);
    },
    [edges]
  );

  // Add node
  const handleAddNode = useCallback(() => {
    setNodeDialogMode("create");
    setEditingNodeId(null);
    setNodeInitialData(undefined);
    setNodeDialogOpen(true);
  }, []);

  const handleNodeSubmit = useCallback(
    async (data: { name: string; type: "source" | "consumer" | "both" }) => {
      if (nodeDialogMode === "create") {
        const viewport = getViewport();
        const x = (-viewport.x + window.innerWidth / 2) / viewport.zoom;
        const y = (-viewport.y + window.innerHeight / 2) / viewport.zoom;

        const newNode = await createNode({
          name: data.name,
          type: data.type,
          positionX: x,
          positionY: y,
        });
        if (newNode) {
          setNodes((nds) => [
            ...nds,
            {
              id: newNode.id,
              type: "cashNode",
              position: { x: newNode.positionX, y: newNode.positionY },
              data: { label: newNode.name, nodeType: newNode.type },
            },
          ]);
        }
      } else if (editingNodeId) {
        const updated = await updateNode(editingNodeId, data);
        if (updated) {
          setNodes((nds) =>
            nds.map((n) =>
              n.id === editingNodeId
                ? { ...n, data: { label: updated.name, nodeType: updated.type } }
                : n
            )
          );
        }
      }
    },
    [nodeDialogMode, editingNodeId, getViewport, setNodes]
  );

  const handleNodeDelete = useCallback(async () => {
    if (!editingNodeId) return;
    await deleteNode(editingNodeId);
    setNodes((nds) => nds.filter((n) => n.id !== editingNodeId));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== editingNodeId && e.target !== editingNodeId
      )
    );
  }, [editingNodeId, setNodes, setEdges]);

  // Node double click -> edit
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: RFNode) => {
      setEditingNodeId(node.id);
      setNodeDialogMode("edit");
      setNodeInitialData({
        name: (node.data as { label: string }).label,
        type: (node.data as { nodeType: "source" | "consumer" | "both" }).nodeType,
      });
      setNodeDialogOpen(true);
    },
    []
  );

  // Node drag stop -> save position
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: RFNode) => {
      updateNodePosition(node.id, node.position.x, node.position.y);
    },
    []
  );

  // Connect -> open flow dialog
  const onConnect = useCallback((connection: Connection) => {
    pendingConnection.current = connection;
    setFlowDialogMode("create");
    setEditingFlowId(null);
    setFlowInitialData(undefined);
    setFlowDialogOpen(true);
  }, []);

  const handleFlowSubmit = useCallback(
    async (data: { label: string; constancy: number; quantity: number }) => {
      if (flowDialogMode === "create" && pendingConnection.current) {
        const conn = pendingConnection.current;
        const newFlow = await createFlow({
          sourceNodeId: conn.source,
          targetNodeId: conn.target,
          label: data.label,
          constancy: data.constancy,
          quantity: data.quantity,
        });
        if (newFlow) {
          const newEdge: RFEdge = {
            id: newFlow.id,
            source: newFlow.sourceNodeId,
            target: newFlow.targetNodeId,
            type: "cashEdge",
            data: {
              label: newFlow.label,
              constancy: newFlow.constancy,
              quantity: newFlow.quantity,
              onDoubleClick: handleEdgeDoubleClick,
            },
          };
          setEdges((eds) => addEdge(newEdge, eds));
        }
        pendingConnection.current = null;
      } else if (editingFlowId) {
        const updated = await updateFlow(editingFlowId, data);
        if (updated) {
          setEdges((eds) =>
            eds.map((e) =>
              e.id === editingFlowId
                ? {
                    ...e,
                    data: {
                      label: updated.label,
                      constancy: updated.constancy,
                      quantity: updated.quantity,
                      onDoubleClick: handleEdgeDoubleClick,
                    },
                  }
                : e
            )
          );
        }
      }
    },
    [flowDialogMode, editingFlowId, handleEdgeDoubleClick, setEdges]
  );

  const handleFlowDelete = useCallback(async () => {
    if (!editingFlowId) return;
    await deleteFlow(editingFlowId);
    setEdges((eds) => eds.filter((e) => e.id !== editingFlowId));
  }, [editingFlowId, setEdges]);

  return (
    <div className="w-screen h-screen bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-background"
        defaultEdgeOptions={{ type: "cashEdge" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#27272a" />
        <Controls className="!bg-card !border-border !rounded-lg !shadow-lg" />
      </ReactFlow>
      <Toolbar onAddNode={handleAddNode} />

      <NodeDialog
        open={nodeDialogOpen}
        onOpenChange={setNodeDialogOpen}
        onSubmit={handleNodeSubmit}
        onDelete={nodeDialogMode === "edit" ? handleNodeDelete : undefined}
        initialData={nodeInitialData}
        mode={nodeDialogMode}
      />

      <FlowDialog
        open={flowDialogOpen}
        onOpenChange={(open) => {
          setFlowDialogOpen(open);
          if (!open) pendingConnection.current = null;
        }}
        onSubmit={handleFlowSubmit}
        onDelete={flowDialogMode === "edit" ? handleFlowDelete : undefined}
        initialData={flowInitialData}
        mode={flowDialogMode}
      />
    </div>
  );
}

export default function Board() {
  return (
    <ReactFlowProvider>
      <BoardInner />
    </ReactFlowProvider>
  );
}
