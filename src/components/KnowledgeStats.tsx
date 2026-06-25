import {
  displayModes,
  examDepthLevels,
  getKnowledgeStats,
  importanceLevels,
} from "../utils/knowledge";
import {
  displayModeLabels,
  importanceLabels,
} from "../utils/labels";

export function KnowledgeStats() {
  const stats = getKnowledgeStats();

  return (
    <div className="min-w-[340px] rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-slate-500">知识统计</div>
          <div className="text-lg font-semibold leading-tight text-slate-900">
            总数 {stats.total}
          </div>
        </div>
        <div className="grid flex-1 grid-cols-3 gap-2 text-[11px] leading-5 text-slate-600">
          <div>
            {importanceLevels.map((level) => (
              <div key={level} className="flex justify-between gap-2">
                <span>{importanceLabels[level]}</span>
                <span className="font-semibold text-slate-800">
                  {stats.importance[level]}
                </span>
              </div>
            ))}
          </div>
          <div>
            {examDepthLevels.map((level) => (
              <div key={level} className="flex justify-between gap-2">
                <span>{level}</span>
                <span className="font-semibold text-slate-800">
                  {stats.examDepth[level]}
                </span>
              </div>
            ))}
          </div>
          <div>
            {displayModes.map((mode) => (
              <div key={mode} className="flex justify-between gap-2">
                <span>{displayModeLabels[mode]}</span>
                <span className="font-semibold text-slate-800">
                  {stats.displayMode[mode]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
