import type { ReactNode } from "react";

export type FocusMode = "middle" | "card";

interface LayoutProps {
  focusMode: FocusMode;
  onFocusModeChange: (mode: FocusMode) => void;
  searchBar: ReactNode;
  stats: ReactNode;
  navigationRail: ReactNode;
  topicTree: ReactNode;
  knowledgeCard: ReactNode;
  collapsedTreeRail: ReactNode;
  collapsedKnowledgePreview: ReactNode;
}

export function Layout({
  focusMode,
  onFocusModeChange,
  searchBar,
  stats,
  navigationRail,
  topicTree,
  knowledgeCard,
  collapsedTreeRail,
  collapsedKnowledgePreview,
}: LayoutProps) {
  const gridTemplateColumns =
    focusMode === "middle"
      ? "128px minmax(0, 1fr) 320px"
      : "128px 260px minmax(0, 1fr)";

  return (
    <div className="flex h-screen min-w-[1180px] flex-col overflow-hidden bg-slate-100 text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-5">
          <div className="w-[320px] shrink-0">
            <h1 className="text-xl font-semibold tracking-normal text-ink">
              计算机网络知识网络
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              五层体系 / 跨层关系 / 408 复习
            </p>
          </div>
          <div className="max-w-3xl flex-1">{searchBar}</div>
          <div className="ml-auto">{stats}</div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-5">
        <div
          className="grid h-full min-h-0 gap-4 overflow-hidden"
          style={{ gridTemplateColumns }}
        >
          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                导航
              </h2>
              <p className="mt-1 text-xs text-slate-500">层 / 跨层</p>
            </div>
            <div
              data-scroll-panel="left"
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {navigationRail}
            </div>
          </section>

          <section
            className={[
              "flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-[opacity,transform] duration-200 ease-out",
              focusMode === "middle"
                ? "translate-x-0 opacity-100"
                : "-translate-x-1 opacity-95",
            ].join(" ")}
            onClick={() => onFocusModeChange("middle")}
          >
            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                {focusMode === "middle" ? "学习导航" : "导航摘要"}
              </h2>
              {focusMode === "middle" ? (
                <p className="mt-1 text-xs text-slate-500">
                  知识树 / 学习路径 / 题型模板
                </p>
              ) : null}
            </div>
            <div
              data-scroll-panel="middle"
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {focusMode === "middle" ? topicTree : collapsedTreeRail}
            </div>
          </section>

          <section
            className={[
              "flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white transition-[opacity,transform] duration-200 ease-out",
              focusMode === "card"
                ? "translate-x-0 opacity-100"
                : "translate-x-1 opacity-95",
            ].join(" ")}
          >
            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                {focusMode === "card" ? "知识卡片" : "卡片摘要"}
              </h2>
              {focusMode === "card" ? (
                <p className="mt-1 text-xs text-slate-500">
                  问题驱动、机制、题型与易错点
                </p>
              ) : null}
            </div>
            {focusMode === "card" ? (
              <div className="h-full min-h-0 flex-1 overflow-hidden">
                {knowledgeCard}
              </div>
            ) : (
              <div
                data-scroll-panel="right"
                className="min-h-0 flex-1 overflow-y-auto"
              >
                {collapsedKnowledgePreview}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
