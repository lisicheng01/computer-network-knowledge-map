import type { CourseChapter, CourseNoteNode } from "../types/courseNotes";
import { getChapterTopNodes, getChildNodes } from "../utils/courseNotes";

interface NotesTreeProps {
  chapter: CourseChapter;
  selectedNodeId?: string;
  hoverNodeId?: string;
  onSelectNode: (nodeId: string) => void;
  onHoverNode: (nodeId?: string) => void;
}

interface TreeNodeProps {
  node: CourseNoteNode;
  depth: number;
  selectedNodeId?: string;
  hoverNodeId?: string;
  onSelectNode: (nodeId: string) => void;
  onHoverNode: (nodeId?: string) => void;
}

function TreeNode({
  node,
  depth,
  selectedNodeId,
  hoverNodeId,
  onSelectNode,
  onHoverNode,
}: TreeNodeProps) {
  const selected = node.id === selectedNodeId;
  const hovered = node.id === hoverNodeId && !selected;
  const children = getChildNodes(node.id);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelectNode(node.id)}
        onMouseEnter={() => onHoverNode(node.id)}
        onMouseLeave={() => onHoverNode(undefined)}
        className={[
          "block w-full rounded-md border px-3 py-2 text-left transition-colors",
          selected
            ? "border-blue-300 bg-blue-50 text-blue-900 shadow-sm"
            : hovered
              ? "border-slate-300 bg-slate-50 text-slate-900"
              : "border-transparent text-slate-700 hover:bg-slate-50",
        ].join(" ")}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        <span className="block text-[11px] font-medium text-slate-400">
          H{node.level} · {node.startLine}
        </span>
        <span className="mt-0.5 block text-sm font-medium leading-5">
          {node.title}
        </span>
      </button>

      {children.length ? (
        <ul className="mt-1 space-y-1">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              hoverNodeId={hoverNodeId}
              onSelectNode={onSelectNode}
              onHoverNode={onHoverNode}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function NotesTree({
  chapter,
  selectedNodeId,
  hoverNodeId,
  onSelectNode,
  onHoverNode,
}: NotesTreeProps) {
  const topNodes = getChapterTopNodes(chapter);

  return (
    <div className="p-3">
      <div className="mb-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
        <h3 className="text-sm font-semibold text-slate-800">
          {chapter.title}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          按课程笔记 Markdown 标题层级生成目录。
        </p>
      </div>

      <ul className="space-y-1">
        {topNodes.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            selectedNodeId={selectedNodeId}
            hoverNodeId={hoverNodeId}
            onSelectNode={onSelectNode}
            onHoverNode={onHoverNode}
          />
        ))}
      </ul>
    </div>
  );
}
