import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { getChapterById, searchCourseNotes } from "../utils/courseNotes";

interface SearchBarProps {
  onSelectNode: (nodeId: string) => void;
}

export function SearchBar({ onSelectNode }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchCourseNotes(query), [query]);

  const handleSelect = (nodeId: string, title: string) => {
    onSelectNode(nodeId);
    setQuery(title);
    setOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
        <Search size={18} className="shrink-0 text-slate-400" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="搜索课程笔记，例如 TCP、ARP、信道利用率"
        />
      </div>

      {open && query.trim() ? (
        <div className="absolute left-0 right-0 top-12 z-20 max-h-96 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {results.length ? (
            results.map((node) => {
              const chapter = getChapterById(node.chapterId);

              return (
                <button
                  key={node.id}
                  type="button"
                  className="block w-full border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(node.id, node.title);
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-900">
                      {node.title}
                    </span>
                    <span className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[11px] text-slate-500">
                      H{node.level}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-blue-700">
                    {chapter?.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                    {node.preview}
                  </p>
                </button>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500">无结果</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
