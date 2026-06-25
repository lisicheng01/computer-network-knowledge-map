import type {
  KnowledgeDisplayMode,
  KnowledgeImportance,
  KnowledgeTeachingTemplate,
  KnowledgeType,
} from "../types/knowledge";

export const fieldLabels = {
  definition: "定义",
  summary: "概要",
  solves: "解决什么问题",
  layer: "所在层",
  input: "输入",
  output: "输出",
  mechanism: "机制流程",
  fieldsOrStates: "关键字段 / 状态",
  formulas: "关键公式",
  examRules: "考试规则",
  pitfalls: "易错点",
  related: "关联知识点",
  examTemplates: "题型模板",
  details: "详细说明",
  references: "参考资料",
  keywords: "关键词",
  type: "类型",
  importance: "重要性",
  examDepth: "掌握深度",
  displayMode: "展示模式",
  reviewPriority: "复习优先级",
} as const;

export const importanceLabels: Record<KnowledgeImportance, string> = {
  high: "高频核心",
  medium: "中频掌握",
  low: "低频扩展",
};

export const displayModeLabels: Record<KnowledgeDisplayMode, string> = {
  full: "完整",
  compact: "简要",
  summary: "摘要",
};

export const typeLabels: Record<KnowledgeType, string> = {
  concept: "概念",
  protocol: "协议",
  mechanism: "机制",
  formula: "公式",
  comparison: "对比",
  "exam-template": "题型模板",
};

export const teachingTemplateLabels: Record<KnowledgeTeachingTemplate, string> = {
  concept: "概念型",
  protocol: "协议型",
  mechanism: "机制型",
  formula: "公式型",
  comparison: "对比型",
  process: "过程型",
  exam: "题型型",
};

export const layerLabels: Record<string, string> = {
  application: "应用层",
  transport: "传输层",
  network: "网络层",
  "data-link": "数据链路层",
  physical: "物理层",
};

export function getLayerDisplayLabel(layerId: string): string {
  return layerId
    .split("/")
    .map((part) => layerLabels[part.trim()] ?? part.trim())
    .join(" / ");
}
