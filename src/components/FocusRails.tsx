import type {
  KnowledgeContext,
  KnowledgeNode,
  Layer,
  LayerEdge,
} from "../types/knowledge";
import { getKnowledgeDisplayMeta } from "../utils/knowledge";
import { importanceLabels, typeLabels } from "../utils/labels";
import type { StudyTab } from "./StudyPanel";

interface FocusNavigationRailProps {
  layers: Layer[];
  edges: LayerEdge[];
  selectedContext: KnowledgeContext;
  onSelectContext: (context: KnowledgeContext) => void;
}

interface CollapsedTreeRailProps {
  contextTitle: string;
  activeTab: StudyTab;
  selectedKnowledge?: KnowledgeNode;
  nearbyNodes: KnowledgeNode[];
  onActivateTree: () => void;
  onSelectKnowledge: (knowledgeId: string) => void;
}

interface CollapsedKnowledgePreviewProps {
  knowledge?: KnowledgeNode;
  onActivateCard: () => void;
}

const studyTabLabels: Record<StudyTab, string> = {
  tree: "知识树",
  path: "学习路径",
  exam: "题型模板",
};

export function FocusNavigationRail({
  layers,
  edges,
  selectedContext,
  onSelectContext,
}: FocusNavigationRailProps) {
  const orderedLayers = [...layers].sort((a, b) => b.order - a.order);
  const getEdgeBetween = (sourceId: string, targetId: string) =>
    edges.find(
      (edge) =>
        (edge.source === sourceId && edge.target === targetId) ||
        (edge.source === targetId && edge.target === sourceId),
    );

  return (
    <nav className="flex min-h-full flex-col gap-1.5 p-2">
      <div className="mb-1 px-1 text-[11px] font-semibold text-slate-400">
        协议层
      </div>
      {orderedLayers.map((layer, index) => {
        const selected =
          selectedContext.kind === "layer" && selectedContext.id === layer.id;
        const nextLayer = orderedLayers[index + 1];
        const edge = nextLayer ? getEdgeBetween(layer.id, nextLayer.id) : undefined;
        const edgeSelected =
          edge &&
          selectedContext.kind === "edge" &&
          selectedContext.id === edge.id;

        return (
          <div key={layer.id} className="space-y-1.5">
            <button
              type="button"
              className={[
                "flex min-h-[50px] w-full items-center justify-center rounded-md border px-1 text-center text-xs font-medium leading-4 transition-colors",
                selected
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-slate-50",
              ].join(" ")}
              onClick={() => onSelectContext({ kind: "layer", id: layer.id })}
            >
              {layer.title}
            </button>
            {edge ? (
              <button
                type="button"
                className={[
                  "flex min-h-[38px] w-full items-center justify-center rounded-md border border-dashed px-1 text-center text-[11px] font-medium leading-4 transition-colors",
                  edgeSelected
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200 hover:bg-white",
                ].join(" ")}
                title={edge.title}
                onClick={() => onSelectContext({ kind: "edge", id: edge.id })}
              >
                {edge.title}
              </button>
            ) : null}
          </div>
        );
      })}
    </nav>
  );
}

export function CollapsedTreeRail({
  contextTitle,
  activeTab,
  selectedKnowledge,
  nearbyNodes,
  onActivateTree,
  onSelectKnowledge,
}: CollapsedTreeRailProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="block min-h-full w-full p-3 text-left hover:bg-slate-50"
      onClick={onActivateTree}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivateTree();
        }
      }}
    >
      <div className="text-xs font-semibold text-blue-700">
        {studyTabLabels[activeTab]}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-900">
        {contextTitle}
      </div>
      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-2">
        <div className="text-[11px] text-slate-500">当前知识点</div>
        <div className="mt-1 line-clamp-2 text-sm font-medium text-slate-800">
          {selectedKnowledge?.title ?? "暂未选择"}
        </div>
      </div>
      <div className="mt-3 space-y-1">
        {nearbyNodes.slice(0, 5).map((node) => (
          <span
            key={node.id}
            role="button"
            tabIndex={0}
            className={[
              "block rounded border px-2 py-1.5 text-xs leading-5 transition-colors",
              selectedKnowledge?.id === node.id
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200",
            ].join(" ")}
            onClick={(event) => {
              event.stopPropagation();
              onActivateTree();
              onSelectKnowledge(node.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onActivateTree();
                onSelectKnowledge(node.id);
              }
            }}
          >
            {node.title}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CollapsedKnowledgePreview({
  knowledge,
  onActivateCard,
}: CollapsedKnowledgePreviewProps) {
  const meta = knowledge ? getKnowledgeDisplayMeta(knowledge) : undefined;

  return (
    <div className="flex min-h-full flex-col p-4">
      <div className="min-h-0 flex-1">
        <div className="text-xs font-semibold text-blue-700">知识卡片</div>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-950">
          {knowledge?.title ?? "暂未选择知识点"}
        </h3>
        {knowledge ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600">
                {typeLabels[knowledge.type]}
              </span>
              {meta ? (
                <span className="rounded border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                  {importanceLabels[meta.importance]}
                </span>
              ) : null}
            </div>
            <p className="mt-3 line-clamp-5 text-sm leading-6 text-slate-600">
              {knowledge.summary}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-slate-500">
            从知识树、学习路径、题型模板或搜索中选择一个知识点。
          </p>
        )}
      </div>
      <button
        type="button"
        className="mt-4 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        onClick={onActivateCard}
      >
        展开阅读
      </button>
    </div>
  );
}
