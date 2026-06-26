import { useMemo } from "react";
import type { KnowledgeContext, KnowledgeNode } from "../types/knowledge";
import {
  getEdgeById,
  getKnowledgeById,
  getLayerById,
  getTeachingTemplate,
  getTopicsForContext,
} from "../utils/knowledge";
import { teachingTemplateLabels, typeLabels } from "../utils/labels";
import { TopicTree } from "./TopicTree";

export type StudyTab = "tree" | "path" | "exam";

interface StudyPanelProps {
  context: KnowledgeContext;
  selectedKnowledgeId?: string;
  activeTab: StudyTab;
  onActiveTabChange: (tab: StudyTab) => void;
  onSelectKnowledge: (knowledgeId: string) => void;
  onHoverKnowledge?: (knowledgeId?: string) => void;
}

const tabs: Array<{ id: StudyTab; title: string }> = [
  { id: "tree", title: "知识树" },
  { id: "path", title: "学习路径" },
  { id: "exam", title: "题型模板" },
];

function getNodePath(ids?: string[]): KnowledgeNode[] {
  return (ids ?? [])
    .map((id) => getKnowledgeById(id))
    .filter((node): node is KnowledgeNode => Boolean(node));
}

function collectNodes(nodes: KnowledgeNode[], visited = new Set<string>()) {
  const result: KnowledgeNode[] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) {
      continue;
    }

    visited.add(node.id);
    result.push(node);
    result.push(
      ...collectNodes(
        getNodePath(node.children),
        visited,
      ),
    );
  }

  return result;
}

function getAutoExamNodes(context: KnowledgeContext): KnowledgeNode[] {
  return collectNodes(getTopicsForContext(context)).filter(
    (node) =>
      getTeachingTemplate(node) === "exam" || node.examTemplates.length > 0,
  );
}

function getPathNodes(context: KnowledgeContext): KnowledgeNode[] {
  if (context.kind === "layer") {
    const layer = getLayerById(context.id);
    const configuredPath = getNodePath(layer?.learningPath);

    if (configuredPath.length) {
      return configuredPath;
    }
  }

  return getTopicsForContext(context);
}

function getExamNodes(context: KnowledgeContext): KnowledgeNode[] {
  if (context.kind === "layer") {
    const layer = getLayerById(context.id);
    const configuredPath = getNodePath(layer?.examPath);

    if (configuredPath.length) {
      return configuredPath;
    }
  }

  const edge = context.kind === "edge" ? getEdgeById(context.id) : undefined;
  const configuredEdgeNodes = getNodePath(edge?.topicIds).filter(
    (node) =>
      getTeachingTemplate(node) === "exam" || node.examTemplates.length > 0,
  );

  return configuredEdgeNodes.length ? configuredEdgeNodes : getAutoExamNodes(context);
}

function StudyList({
  nodes,
  selectedKnowledgeId,
  onSelectKnowledge,
  onHoverKnowledge,
  emptyText,
}: {
  nodes: KnowledgeNode[];
  selectedKnowledgeId?: string;
  onSelectKnowledge: (knowledgeId: string) => void;
  onHoverKnowledge?: (knowledgeId?: string) => void;
  emptyText: string;
}) {
  if (!nodes.length) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {nodes.map((node, index) => {
        const selected = selectedKnowledgeId === node.id;
        const template = getTeachingTemplate(node);

        return (
          <button
            key={node.id}
            type="button"
            className={[
              "grid w-full grid-cols-[28px_1fr] gap-3 rounded-md border p-3 text-left transition-colors",
              selected
                ? "border-blue-300 bg-blue-50"
                : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50",
            ].join(" ")}
            onClick={() => onSelectKnowledge(node.id)}
            onMouseEnter={() => onHoverKnowledge?.(node.id)}
            onMouseLeave={() => onHoverKnowledge?.(undefined)}
            onFocus={() => onHoverKnowledge?.(node.id)}
            onBlur={() => onHoverKnowledge?.(undefined)}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-slate-900">
                  {node.title}
                </span>
                <span className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500">
                  {teachingTemplateLabels[template]}
                </span>
                <span className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500">
                  {typeLabels[node.type]}
                </span>
              </span>
              <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">
                {node.summary}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function StudyPanel({
  context,
  selectedKnowledgeId,
  activeTab,
  onActiveTabChange,
  onSelectKnowledge,
  onHoverKnowledge,
}: StudyPanelProps) {
  const pathNodes = useMemo(() => getPathNodes(context), [context]);
  const examNodes = useMemo(() => getExamNodes(context), [context]);

  return (
    <div className="min-h-full p-4">
      <div className="mb-4 grid grid-cols-3 rounded-md border border-slate-200 bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={[
              "rounded px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            ].join(" ")}
            onClick={() => onActiveTabChange(tab.id)}
          >
            {tab.title}
          </button>
        ))}
      </div>

      {activeTab === "tree" ? (
        <TopicTree
          context={context}
          selectedKnowledgeId={selectedKnowledgeId}
          onSelectKnowledge={onSelectKnowledge}
          onHoverKnowledge={onHoverKnowledge}
        />
      ) : null}

      {activeTab === "path" ? (
        <StudyList
          nodes={pathNodes}
          selectedKnowledgeId={selectedKnowledgeId}
          onSelectKnowledge={onSelectKnowledge}
          onHoverKnowledge={onHoverKnowledge}
          emptyText="当前范围暂无学习路径。"
        />
      ) : null}

      {activeTab === "exam" ? (
        <StudyList
          nodes={examNodes}
          selectedKnowledgeId={selectedKnowledgeId}
          onSelectKnowledge={onSelectKnowledge}
          onHoverKnowledge={onHoverKnowledge}
          emptyText="当前范围暂无题型模板。"
        />
      ) : null}
    </div>
  );
}
