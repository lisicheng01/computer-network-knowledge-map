export interface CourseChapter {
  id: string;
  order: number;
  title: string;
  filename: string;
  rootNodeId: string;
  topicIds: string[];
  nodeIds: string[];
  summary: string;
}

export interface CourseNoteNode {
  id: string;
  chapterId: string;
  parentId?: string;
  title: string;
  level: number;
  order: number;
  sourceFile: string;
  startLine: number;
  endLine: number;
  markdown: string;
  body: string;
  preview: string;
  children: string[];
}

export interface CourseNotesData {
  source: string;
  generatedBy: string;
  chapters: CourseChapter[];
  nodes: CourseNoteNode[];
}
