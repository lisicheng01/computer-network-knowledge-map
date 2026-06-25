import rawData from "../data/networkKnowledge.json";
import type {
  KnowledgeContext,
  KnowledgeDataset,
  KnowledgeDisplayMode,
  KnowledgeExamDepth,
  KnowledgeImportance,
  KnowledgeNode,
  KnowledgeTeachingTemplate,
  Layer,
  LayerEdge,
} from "../types/knowledge";

export const defaultKnowledgeMeta = {
  importance: "medium",
  examDepth: "掌握",
  displayMode: "full",
  reviewPriority: 99,
} as const;

export const importanceLevels: KnowledgeImportance[] = [
  "high",
  "medium",
  "low",
];

export const examDepthLevels: KnowledgeExamDepth[] = [
  "必会",
  "掌握",
  "了解",
];

export const displayModes: KnowledgeDisplayMode[] = [
  "full",
  "compact",
  "summary",
];

export const teachingTemplates: KnowledgeTeachingTemplate[] = [
  "concept",
  "protocol",
  "mechanism",
  "formula",
  "comparison",
  "process",
  "exam",
];

const teachingTemplateByType = {
  concept: "concept",
  protocol: "protocol",
  mechanism: "mechanism",
  formula: "formula",
  comparison: "comparison",
  "exam-template": "exam",
} satisfies Record<string, KnowledgeTeachingTemplate>;

export interface KnowledgeDisplayMeta {
  importance: KnowledgeImportance;
  examDepth: KnowledgeExamDepth;
  displayMode: KnowledgeDisplayMode;
  reviewPriority: number;
}

export interface KnowledgeStats {
  total: number;
  importance: Record<KnowledgeImportance, number>;
  examDepth: Record<KnowledgeExamDepth, number>;
  displayMode: Record<KnowledgeDisplayMode, number>;
}

export const knowledgeData = rawData as KnowledgeDataset;

const layerById = new Map<string, Layer>(
  knowledgeData.layers.map((layer) => [layer.id, layer]),
);

const edgeById = new Map<string, LayerEdge>(
  knowledgeData.edges.map((edge) => [edge.id, edge]),
);

const knowledgeById = new Map<string, KnowledgeNode>(
  knowledgeData.knowledge.map((node) => [node.id, node]),
);

export function getLayerById(id: string): Layer | undefined {
  return layerById.get(id);
}

export function getEdgeById(id: string): LayerEdge | undefined {
  return edgeById.get(id);
}

export function getKnowledgeById(id: string): KnowledgeNode | undefined {
  return knowledgeById.get(id);
}

export function getKnowledgeDisplayMeta(
  knowledge: KnowledgeNode,
): KnowledgeDisplayMeta {
  return {
    importance: knowledge.importance ?? defaultKnowledgeMeta.importance,
    examDepth: knowledge.examDepth ?? defaultKnowledgeMeta.examDepth,
    displayMode: knowledge.displayMode ?? defaultKnowledgeMeta.displayMode,
    reviewPriority:
      typeof knowledge.reviewPriority === "number"
        ? knowledge.reviewPriority
        : defaultKnowledgeMeta.reviewPriority,
  };
}

export function getTeachingTemplate(
  knowledge: KnowledgeNode,
): KnowledgeTeachingTemplate {
  return (
    knowledge.teachingTemplate ??
    teachingTemplateByType[knowledge.type] ??
    "concept"
  );
}

export function getKnowledgeStats(nodes = knowledgeData.knowledge): KnowledgeStats {
  const stats: KnowledgeStats = {
    total: nodes.length,
    importance: { high: 0, medium: 0, low: 0 },
    examDepth: { 必会: 0, 掌握: 0, 了解: 0 },
    displayMode: { full: 0, compact: 0, summary: 0 },
  };

  for (const node of nodes) {
    const meta = getKnowledgeDisplayMeta(node);
    stats.importance[meta.importance] += 1;
    stats.examDepth[meta.examDepth] += 1;
    stats.displayMode[meta.displayMode] += 1;
  }

  return stats;
}

export function getKnowledgeNodesByIds(ids: string[]): KnowledgeNode[] {
  return ids
    .map((id) => knowledgeById.get(id))
    .filter((node): node is KnowledgeNode => Boolean(node));
}

export function getTopicsForContext(context: KnowledgeContext): KnowledgeNode[] {
  const source =
    context.kind === "layer"
      ? getLayerById(context.id)
      : getEdgeById(context.id);

  return source ? getKnowledgeNodesByIds(source.topicIds) : [];
}

export function getDefaultKnowledgeForContext(
  context: KnowledgeContext,
): KnowledgeNode | undefined {
  const source =
    context.kind === "layer"
      ? getLayerById(context.id)
      : getEdgeById(context.id);

  if (!source) {
    return undefined;
  }

  return getKnowledgeById(source.overviewId) ?? getKnowledgeById(source.topicIds[0]);
}

export function getContextTitle(context: KnowledgeContext): string {
  const source =
    context.kind === "layer"
      ? getLayerById(context.id)
      : getEdgeById(context.id);

  return source?.title ?? "未选择";
}

export function getContextSummary(context: KnowledgeContext): string {
  const source =
    context.kind === "layer"
      ? getLayerById(context.id)
      : getEdgeById(context.id);

  return source?.summary ?? "";
}

export function searchKnowledge(query: string): KnowledgeNode[] {
  const normalized = query.trim().toLocaleLowerCase();

  if (!normalized) {
    return [];
  }

  return knowledgeData.knowledge
    .filter((node) => {
      const searchable = [
        node.title,
        node.summary,
        ...node.keywords,
      ]
        .join(" ")
        .toLocaleLowerCase();

      return searchable.includes(normalized);
    })
    .slice(0, 12);
}

export function getKnowledgeLabel(id: string): string {
  return getKnowledgeById(id)?.title ?? id;
}

function topicContainsKnowledge(topicId: string, targetId: string): boolean {
  if (topicId === targetId) {
    return true;
  }

  const topic = getKnowledgeById(topicId);

  if (!topic?.children?.length) {
    return false;
  }

  return topic.children.some((childId) => topicContainsKnowledge(childId, targetId));
}

export function findContextForKnowledge(
  knowledgeId: string,
): KnowledgeContext | undefined {
  const layer = knowledgeData.layers.find(
    (item) =>
      item.overviewId === knowledgeId ||
      item.topicIds.some((topicId) => topicContainsKnowledge(topicId, knowledgeId)),
  );

  if (layer) {
    return { kind: "layer", id: layer.id };
  }

  const edge = knowledgeData.edges.find(
    (item) =>
      item.overviewId === knowledgeId ||
      item.topicIds.some((topicId) => topicContainsKnowledge(topicId, knowledgeId)),
  );

  if (edge) {
    return { kind: "edge", id: edge.id };
  }

  return undefined;
}
