export type KnowledgeType =
  | "concept"
  | "protocol"
  | "mechanism"
  | "formula"
  | "comparison"
  | "exam-template";

export interface ExamTemplate {
  title: string;
  rule: string;
  steps: string[];
}

export type KnowledgeImportance = "high" | "medium" | "low";
export type KnowledgeExamDepth = "必会" | "掌握" | "了解";
export type KnowledgeDisplayMode = "full" | "compact" | "summary";
export type KnowledgeTeachingTemplate =
  | "concept"
  | "protocol"
  | "mechanism"
  | "formula"
  | "comparison"
  | "process"
  | "exam";

export interface KnowledgeBodyBlock {
  type: "paragraph" | "list";
  content?: string;
  items?: string[];
}

export interface KnowledgeDetail {
  id: string;
  title: string;
  content: string;
}

export interface KnowledgeReference {
  title: string;
  type: "textbook" | "rfc" | "external" | "note";
  target: string;
}

export interface Layer {
  id: string;
  title: string;
  order: number;
  summary: string;
  pdu: string;
  addressing: string;
  solves: string;
  overviewId: string;
  topicIds: string[];
  learningPath?: string[];
  examPath?: string[];
}

export interface LayerEdge {
  id: string;
  source: string;
  target: string;
  title: string;
  summary: string;
  overviewId: string;
  topicIds: string[];
}

export interface KnowledgeNode {
  id: string;
  title: string;
  layer: string;
  type: KnowledgeType;
  summary: string;
  keywords: string[];
  importance?: KnowledgeImportance;
  examDepth?: KnowledgeExamDepth;
  displayMode?: KnowledgeDisplayMode;
  teachingTemplate?: KnowledgeTeachingTemplate;
  reviewPriority?: number;
  body?: KnowledgeBodyBlock[];
  definition: string;
  solves: string;
  input: string[];
  output: string[];
  mechanism: string[];
  fieldsOrStates: string[];
  formulas?: string[];
  examRules: string[];
  pitfalls: string[];
  related: string[];
  examTemplates: ExamTemplate[];
  details?: KnowledgeDetail[];
  references?: KnowledgeReference[];
  children?: string[];
}

export interface KnowledgeDataset {
  layers: Layer[];
  edges: LayerEdge[];
  knowledge: KnowledgeNode[];
}

export interface KnowledgeContext {
  kind: "layer" | "edge";
  id: string;
}
