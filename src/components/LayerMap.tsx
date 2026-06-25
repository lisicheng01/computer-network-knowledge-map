import {
  Background,
  BackgroundVariant,
  ReactFlow,
  type Edge,
  type EdgeMouseHandler,
  type Node,
  type NodeMouseHandler,
} from "@xyflow/react";
import { useMemo } from "react";
import type { ReactNode } from "react";
import type {
  KnowledgeContext,
  Layer,
  LayerEdge as NetworkLayerEdge,
} from "../types/knowledge";

interface LayerMapProps {
  layers: Layer[];
  edges: NetworkLayerEdge[];
  selectedContext: KnowledgeContext;
  onSelectLayer: (layerId: string) => void;
  onSelectEdge: (edgeId: string) => void;
}

type LayerFlowNode = Node<{ label: ReactNode }>;

export function LayerMap({
  layers,
  edges,
  selectedContext,
  onSelectLayer,
  onSelectEdge,
}: LayerMapProps) {
  const orderedLayers = useMemo(
    () => [...layers].sort((a, b) => b.order - a.order),
    [layers],
  );

  const flowNodes = useMemo<LayerFlowNode[]>(
    () =>
      orderedLayers.map((layer, index) => {
        const selected =
          selectedContext.kind === "layer" && selectedContext.id === layer.id;

        return {
          id: layer.id,
          position: { x: 28, y: index * 118 },
          data: {
            label: (
              <div className="text-left">
                <div className="text-sm font-semibold text-slate-900">
                  {layer.title}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  PDU: {layer.pdu}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  地址: {layer.addressing}
                </div>
              </div>
            ),
          },
          draggable: false,
          selectable: true,
          style: {
            width: 240,
            minHeight: 76,
            borderRadius: 8,
            border: selected ? "1px solid #2563eb" : "1px solid #cbd5e1",
            background: selected ? "#eff6ff" : "#ffffff",
            boxShadow: selected
              ? "0 0 0 3px rgba(37, 99, 235, 0.18)"
              : "0 1px 2px rgba(15, 23, 42, 0.08)",
          },
        };
      }),
    [orderedLayers, selectedContext],
  );

  const flowEdges = useMemo<Edge[]>(
    () =>
      edges.map((edge) => {
        const selected =
          selectedContext.kind === "edge" && selectedContext.id === edge.id;

        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "smoothstep",
          label: edge.title,
          animated: false,
          selectable: true,
          style: {
            stroke: selected ? "#2563eb" : "#94a3b8",
            strokeWidth: selected ? 3 : 2,
          },
          labelStyle: {
            fill: selected ? "#1d4ed8" : "#475569",
            fontSize: 11,
            fontWeight: selected ? 700 : 500,
          },
          labelBgStyle: {
            fill: selected ? "#eff6ff" : "#ffffff",
            fillOpacity: 0.95,
          },
          labelBgPadding: [6, 4],
          labelBgBorderRadius: 4,
        };
      }),
    [edges, selectedContext],
  );

  const handleNodeClick: NodeMouseHandler = (_, node) => {
    onSelectLayer(node.id);
  };

  const handleEdgeClick: EdgeMouseHandler = (_, edge) => {
    onSelectEdge(edge.id);
  };

  return (
    <ReactFlow
      nodes={flowNodes}
      edges={flowEdges}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      nodesConnectable={false}
      nodesDraggable={false}
      elementsSelectable
      panOnDrag={false}
      panOnScroll={false}
      preventScrolling={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      fitView
      fitViewOptions={{ padding: 0.16 }}
      proOptions={{ hideAttribution: true }}
    >
      <Background
        color="#dbe3ef"
        gap={22}
        size={1}
        variant={BackgroundVariant.Dots}
      />
    </ReactFlow>
  );
}
