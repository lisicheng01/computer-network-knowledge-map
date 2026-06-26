import type { ReactNode } from "react";

interface LayoutProps {
  searchBar: ReactNode;
  stats: ReactNode;
  chapterNav: ReactNode;
  notesTree: ReactNode;
  rightPanel: ReactNode;
}

export function Layout({
  searchBar,
  stats,
  chapterNav,
  notesTree,
  rightPanel,
}: LayoutProps) {
  return (
    <div className="flex h-screen min-w-[1180px] flex-col overflow-hidden bg-slate-100 text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-5">
          <div className="w-[320px] shrink-0">
            <h1 className="text-xl font-semibold tracking-normal text-slate-950">
              计算机网络课程复习页
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              课程笔记 / 章节目录 / Markdown 正文
            </p>
          </div>
          <div className="max-w-3xl flex-1">{searchBar}</div>
          <div className="ml-auto">{stats}</div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden p-5">
        <div
          className="grid h-full min-h-0 gap-4 overflow-hidden"
          style={{
            gridTemplateColumns: "220px 390px minmax(0, 1fr)",
          }}
        >
          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                章节
              </h2>
              <p className="mt-1 text-xs text-slate-500">课程笔记六章</p>
            </div>
            <div
              data-scroll-panel="left"
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {chapterNav}
            </div>
          </section>

          <section
            className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white"
          >
            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                本章目录
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                按 Markdown 标题层级生成
              </p>
            </div>
            <div
              data-scroll-panel="middle"
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {notesTree}
            </div>
          </section>

          <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="shrink-0 border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-800">
                课程笔记正文
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                点击目录阅读正文，悬停临时预览
              </p>
            </div>
            <div
              data-scroll-panel="right"
              className="min-h-0 flex-1 overflow-y-auto"
            >
              {rightPanel}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
