import type { CourseChapter } from "../types/courseNotes";

interface ChapterNavProps {
  chapters: CourseChapter[];
  selectedChapterId: string;
  onSelectChapter: (chapterId: string) => void;
}

export function ChapterNav({
  chapters,
  selectedChapterId,
  onSelectChapter,
}: ChapterNavProps) {
  return (
    <nav className="space-y-2 p-3">
      {chapters.map((chapter) => {
        const selected = chapter.id === selectedChapterId;

        return (
          <button
            key={chapter.id}
            type="button"
            onClick={() => onSelectChapter(chapter.id)}
            className={[
              "block w-full rounded-md border px-3 py-3 text-left transition-colors",
              selected
                ? "border-blue-300 bg-blue-50 text-blue-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
            ].join(" ")}
          >
            <span className="block text-xs font-semibold text-slate-500">
              第{chapter.order}章
            </span>
            <span className="mt-1 block text-sm font-semibold leading-5">
              {chapter.title.replace(/^第.+?章\s*/, "")}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
