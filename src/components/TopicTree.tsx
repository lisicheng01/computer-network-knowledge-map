import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { KnowledgeContext, KnowledgeNode } from "../types/knowledge";
import {
  getContextSummary,
  getContextTitle,
  getKnowledgeById,
  getTopicsForContext,
} from "../utils/knowledge";
import { typeLabels } from "../utils/labels";

interface TopicTreeProps {
  context: KnowledgeContext;
  selectedKnowledgeId?: string;
  onSelectKnowledge: (knowledgeId: string) => void;
}

interface TreeItemProps {
  node: KnowledgeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedKnowledgeId?: string;
  onToggle: (knowledgeId: string) => void;
  onSelectKnowledge: (knowledgeId: string) => void;
}

function getChildNodes(node: KnowledgeNode): KnowledgeNode[] {
  return (node.children ?? [])
    .map((id) => getKnowledgeById(id))
    .filter((child): child is KnowledgeNode => Boolean(child));
}

function TreeItem({
  node,
  depth,
  expandedIds,
  selectedKnowledgeId,
  onToggle,
  onSelectKnowledge,
}: TreeItemProps) {
  const children = getChildNodes(node);
  const hasChildren = children.length > 0;
  const expanded = expandedIds.has(node.id);
  const selected = selectedKnowledgeId === node.id;

  return (
    <div>
      <div
        className={[
          "flex items-start gap-2 border-l-2 py-2 pr-2 transition-colors",
          selected
            ? "border-blue-500 bg-blue-50"
            : "border-transparent hover:bg-slate-50",
        ].join(" ")}
        style={{ paddingLeft: 12 + depth * 18 }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800"
            onClick={() => onToggle(node.id)}
            aria-label={expanded ? "收起知识点" : "展开知识点"}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <span className="mt-0.5 h-6 w-6 shrink-0" />
        )}

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => onSelectKnowledge(node.id)}
        >
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-slate-900">
              {node.title}
            </span>
            <span className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[11px] leading-none text-slate-500">
              {typeLabels[node.type]}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {node.summary}
          </p>
        </button>
      </div>

      {hasChildren && expanded ? (
        <div className="transition-all duration-150 ease-out">
          {children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedKnowledgeId={selectedKnowledgeId}
              onToggle={onToggle}
              onSelectKnowledge={onSelectKnowledge}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TopicTree({
  context,
  selectedKnowledgeId,
  onSelectKnowledge,
}: TopicTreeProps) {
  const topics = useMemo(() => getTopicsForContext(context), [context]);
  const contextTitle = getContextTitle(context);
  const contextSummary = getContextSummary(context);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedIds(
      new Set(
        topics
          .filter((topic) => getChildNodes(topic).length > 0)
          .map((topic) => topic.id),
      ),
    );
  }, [topics]);

  const handleToggle = (knowledgeId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(knowledgeId)) {
        next.delete(knowledgeId);
      } else {
        next.add(knowledgeId);
      }

      return next;
    });
  };

  return (
    <div className="min-h-full p-4">
      <div className="mb-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="text-xs font-semibold uppercase tracking-normal text-blue-700">
          {context.kind === "layer" ? "协议层" : "跨层关系"}
        </div>
        <h3 className="mt-1 text-lg font-semibold text-slate-900">
          {contextTitle}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{contextSummary}</p>
      </div>

      <div className="space-y-1">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <TreeItem
              key={topic.id}
              node={topic}
              depth={0}
              expandedIds={expandedIds}
              selectedKnowledgeId={selectedKnowledgeId}
              onToggle={handleToggle}
              onSelectKnowledge={onSelectKnowledge}
            />
          ))
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            当前范围暂无知识点。
          </div>
        )}
      </div>
    </div>
  );
}
