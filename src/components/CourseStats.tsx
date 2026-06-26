import { courseNotesData } from "../utils/courseNotes";

export function CourseStats() {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
      <span>
        章节{" "}
        <strong className="font-semibold text-slate-900">
          {courseNotesData.chapters.length}
        </strong>
      </span>
      <span className="h-3 w-px bg-slate-300" />
      <span>
        目录节点{" "}
        <strong className="font-semibold text-slate-900">
          {courseNotesData.nodes.length}
        </strong>
      </span>
    </div>
  );
}
