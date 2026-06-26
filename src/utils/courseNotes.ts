import courseNotesJson from "../data/courseNotes.json";
import type {
  CourseChapter,
  CourseNoteNode,
  CourseNotesData,
} from "../types/courseNotes";

export const courseNotesData = courseNotesJson as CourseNotesData;

const nodeMap = new Map(
  courseNotesData.nodes.map((node) => [node.id, node] as const),
);
const chapterMap = new Map(
  courseNotesData.chapters.map((chapter) => [chapter.id, chapter] as const),
);

function isCourseNoteNode(
  node: CourseNoteNode | undefined,
): node is CourseNoteNode {
  return Boolean(node);
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function getChapterById(chapterId: string) {
  return chapterMap.get(chapterId);
}

export function getNodeById(nodeId?: string) {
  return nodeId ? nodeMap.get(nodeId) : undefined;
}

export function getDefaultNodeForChapter(chapterId: string) {
  const chapter = getChapterById(chapterId);

  if (!chapter) {
    return undefined;
  }

  return (
    chapter.topicIds.map(getNodeById).find(Boolean) ??
    getNodeById(chapter.rootNodeId)
  );
}

export function getChildNodes(nodeId: string) {
  const node = getNodeById(nodeId);
  return node ? node.children.map(getNodeById).filter(isCourseNoteNode) : [];
}

export function getChapterTopNodes(chapter: CourseChapter) {
  return chapter.topicIds.map(getNodeById).filter(isCourseNoteNode);
}

export function getNodesForChapter(chapterId: string) {
  const chapter = getChapterById(chapterId);
  return chapter ? chapter.nodeIds.map(getNodeById).filter(isCourseNoteNode) : [];
}

export function getNodePath(nodeId: string) {
  const path: CourseNoteNode[] = [];
  let current = getNodeById(nodeId);

  while (current) {
    path.unshift(current);
    current = current.parentId ? getNodeById(current.parentId) : undefined;
  }

  return path;
}

export function getNearbyNodes(nodeId: string, limit = 5) {
  const node = getNodeById(nodeId);

  if (!node) {
    return [];
  }

  const chapterNodes = getNodesForChapter(node.chapterId).filter(
    (candidate) => candidate.level >= 2,
  );
  const currentIndex = chapterNodes.findIndex(
    (candidate) => candidate.id === nodeId,
  );

  if (currentIndex < 0) {
    return chapterNodes.slice(0, limit);
  }

  const start = Math.max(0, currentIndex - Math.floor(limit / 2));
  return chapterNodes.slice(start, start + limit);
}

export function searchCourseNotes(query: string, limit = 20) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return [];
  }

  return courseNotesData.nodes
    .map((node) => {
      const title = normalize(node.title);
      const body = normalize(`${node.body} ${node.preview}`);
      let score = 0;

      if (title === normalizedQuery) score += 100;
      if (title.includes(normalizedQuery)) score += 50;
      if (body.includes(normalizedQuery)) score += 10;

      return { node, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.node.order - b.node.order)
    .slice(0, limit)
    .map((result) => result.node);
}
