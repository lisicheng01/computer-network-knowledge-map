# 课程复习网页复用蓝图

本文档总结当前“计算机网络课程复习页”的项目结构，目标是把这套结构复用到其他课程，例如“概率论与数理统计”。

## 1. 当前项目技术栈

- React：页面组件与交互状态管理。
- TypeScript：组件 props、课程数据结构、工具函数类型约束。
- Vite：本地开发、生产构建、GitHub Pages 静态部署。
- Tailwind CSS：布局、颜色、间距、滚动容器、按钮状态。
- lucide-react：搜索图标。
- Node.js 脚本：从课程 Markdown 解析生成前端 JSON 数据。
- GitHub Actions + GitHub Pages：推送到 `main` 后自动构建并部署。

补充说明：`package.json` 里仍保留 `@xyflow/react` 依赖，以及旧版知识网络组件和数据文件，但当前课程复习页入口 `src/App.tsx` 不再使用 React Flow 和旧版 `networkKnowledge.json`。

## 2. 页面整体结构

当前页面是固定 Header + 三栏主体布局：

```text
[Header：标题 / 搜索框 / 课程统计]

[左栏：章节导航] [中栏：本章目录树] [右栏：Markdown 正文阅读器]
```

核心布局文件是 `src/components/Layout.tsx`。

- 外层：`h-screen flex flex-col overflow-hidden`，保证页面占满视口。
- Header：固定在顶部，不随三栏滚动。
- 主体：`gridTemplateColumns: "220px 390px minmax(0, 1fr)"`。
- 三个滚动容器：
  - `data-scroll-panel="left"`：左侧章节栏。
  - `data-scroll-panel="middle"`：中间目录树。
  - `data-scroll-panel="right"`：右侧正文阅读区。

## 3. 核心组件作用

当前实际使用的组件如下。

### `src/App.tsx`

应用总入口，负责把数据、状态和组件串起来。

主要状态：

- `selectedChapterId`：当前选中的章节。
- `selectedNode`：最后一次点击选中的 Markdown 标题节点。
- `hoverNode`：鼠标当前悬停的标题节点。

主要逻辑：

- 点击章节时，切换到该章的默认节点。
- 点击目录节点时，右侧显示该节点完整 Markdown 正文。
- 悬停目录节点时，右侧临时显示该节点预览。
- 鼠标离开后，恢复最后点击节点的完整正文。
- `displayedNote = hoverNote ?? selectedNote`。
- 右侧显示节点变化时，滚动容器回到顶部。

### `src/components/Layout.tsx`

页面壳组件，只负责布局：

- Header 区域：页面标题、搜索框、统计。
- 左栏：章节导航。
- 中栏：当前章节目录。
- 右栏：Markdown 正文。

它不直接关心课程数据，只接收 `searchBar`、`stats`、`chapterNav`、`notesTree`、`rightPanel` 这些 React 节点。

### `src/components/ChapterNav.tsx`

左侧章节导航。

输入：

- `chapters`
- `selectedChapterId`
- `onSelectChapter`

作用：

- 渲染所有章节按钮。
- 高亮当前章节。
- 点击后通知 `App.tsx` 切换章节。

### `src/components/NotesTree.tsx`

中间目录树。

输入：

- `chapter`
- `selectedNodeId`
- `hoverNodeId`
- `onSelectNode`
- `onHoverNode`

作用：

- 使用 `chapter.topicIds` 找到章内顶层小节。
- 递归渲染每个节点的 `children`。
- 点击节点触发正文切换。
- 悬停节点触发右侧预览。
- selected 样式优先于 hover 样式。

### `src/components/MarkdownViewer.tsx`

右侧 Markdown 阅读器。

输入：

- `node`
- `preview`
- `onSelectNode`

作用：

- `preview = true` 时显示标题、路径、简短预览和“点击查看完整内容”按钮。
- `preview = false` 时显示该节点完整正文。
- 渲染常见 Markdown 块：
  - 标题
  - 段落
  - 有序 / 无序列表
  - 引用块
  - 代码块
  - 表格
  - 图片
  - 链接
  - 行内代码、加粗、`==高亮==`、简单行内公式

当前 Markdown 渲染器是轻量自实现，不依赖 `react-markdown`。

### `src/components/SearchBar.tsx`

顶部搜索框。

作用：

- 根据输入调用 `searchCourseNotes(query)`。
- 搜索范围包括标题、正文和预览。
- 搜索结果显示标题、所属章节、标题级别和预览。
- 点击结果后调用 `onSelectNode(node.id)`，直接定位到右侧正文。

### `src/components/CourseStats.tsx`

顶部统计组件。

当前显示：

- 章节数量。
- 目录节点数量。

数据来自 `courseNotesData`，不是手写数字。

## 4. 数据文件结构

当前主数据文件是：

```text
src/data/courseNotes.json
```

它由脚本生成：

```text
scripts/buildNotesData.js
```

对应 TypeScript 类型在：

```text
src/types/courseNotes.ts
```

数据顶层结构：

```ts
interface CourseNotesData {
  source: string;
  generatedBy: string;
  chapters: CourseChapter[];
  nodes: CourseNoteNode[];
}
```

章节结构：

```ts
interface CourseChapter {
  id: string;
  order: number;
  title: string;
  filename: string;
  rootNodeId: string;
  topicIds: string[];
  nodeIds: string[];
  summary: string;
}
```

目录节点结构：

```ts
interface CourseNoteNode {
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
```

旧数据文件：

```text
src/data/networkKnowledge.json
```

这是旧版“知识百科卡片”数据。当前 `App.tsx` 不使用它。复制成新课程项目时可以不复制旧版知识数据和旧版知识卡片组件。

## 5. 数据如何从 Markdown 渲染到页面

当前数据链路如下：

```text
source_notes/课程笔记/*.md
        ↓
scripts/buildNotesData.js
        ↓
src/data/courseNotes.json
        ↓
src/utils/courseNotes.ts
        ↓
src/App.tsx
        ↓
ChapterNav / NotesTree / SearchBar / MarkdownViewer
```

Markdown 解析规则：

- `#` 作为章标题，生成该章 root 节点。
- `##` 作为大节，进入 `chapter.topicIds`，显示为目录树顶层。
- `###` 作为主要知识点。
- `####` 及以下作为子知识点。
- 每个标题节点的正文范围是：从当前标题下一行开始，到下一个“同级或更高级标题”之前。
- `children` 由标题层级栈生成。
- `preview` 由正文去 Markdown 标记后截断生成。

运行生成数据：

```bash
npm run build:notes
```

当前 `npm run build` 不自动重新生成课程数据。这样 GitHub Pages 构建只依赖已提交的 `src/data/courseNotes.json`。

## 6. 功能组织方式

### 搜索

文件：

- `src/components/SearchBar.tsx`
- `src/utils/courseNotes.ts`

核心函数：

```ts
searchCourseNotes(query, limit = 20)
```

搜索逻辑：

- 标题完全匹配权重最高。
- 标题包含关键词权重较高。
- 正文或预览包含关键词权重较低。
- 默认最多返回 20 条。

### 章节导航

文件：

- `src/components/ChapterNav.tsx`
- `src/utils/courseNotes.ts`

数据来源：

```ts
courseNotesData.chapters
```

点击章节后：

1. 更新 `selectedChapterId`。
2. 使用 `getDefaultNodeForChapter(chapterId)` 找到该章第一个顶层小节。
3. 更新 `selectedNode`。
4. 清空 `hoverNode`。

### 目录树

文件：

- `src/components/NotesTree.tsx`
- `src/utils/courseNotes.ts`

核心函数：

- `getChapterTopNodes(chapter)`
- `getChildNodes(nodeId)`

目录树不重新解析 Markdown，只使用 JSON 中已经生成好的 `topicIds` 和 `children`。

### 阅读器

文件：

- `src/components/MarkdownViewer.tsx`

显示逻辑：

- 有 `hoverNode`：显示预览。
- 没有 `hoverNode`：显示最后点击的 `selectedNode` 完整正文。
- 没有节点：显示默认提示。

右侧滚动回顶部逻辑在 `src/App.tsx` 中：

```ts
document
  .querySelector<HTMLElement>('[data-scroll-panel="right"]')
  ?.scrollTo({ top: 0, behavior: "auto" });
```

## 7. 可直接复制到新项目的文件

这些文件可以作为其他课程复习网页的基础骨架复制：

```text
src/App.tsx
src/components/Layout.tsx
src/components/ChapterNav.tsx
src/components/NotesTree.tsx
src/components/MarkdownViewer.tsx
src/components/SearchBar.tsx
src/components/CourseStats.tsx
src/types/courseNotes.ts
src/utils/courseNotes.ts
scripts/buildNotesData.js
src/index.css
tailwind.config.cjs
postcss.config.cjs
vite.config.ts
.github/workflows/deploy.yml
```

需要注意：

- `src/App.tsx` 和 `src/components/Layout.tsx` 里有“计算机网络课程复习页”等课程文案，复制后要替换。
- `scripts/buildNotesData.js` 里硬编码了当前 Markdown 文件名和 `source_notes/课程笔记` 路径，复制后要改成新课程文件。
- `vite.config.ts` 里 GitHub Pages 的 `base` 是 `/computer-network-knowledge-map/`，新仓库要替换。

不建议直接复制到新课程项目的旧版文件：

```text
src/components/FocusRails.tsx
src/components/KnowledgeCard.tsx
src/components/KnowledgeStats.tsx
src/components/LayerMap.tsx
src/components/StudyPanel.tsx
src/components/TopicTree.tsx
src/data/networkKnowledge.json
src/types/knowledge.ts
src/utils/knowledge.ts
src/utils/labels.ts
```

这些属于旧版计算机网络知识百科卡片系统，当前课程复习页不依赖它们。

## 8. 概率论与数理统计需要替换的文件

复制成“概率论与数理统计复习网页”时，优先替换这些内容。

### 必须替换

```text
source_notes/课程笔记/*.md
src/data/courseNotes.json
scripts/buildNotesData.js
```

替换点：

- Markdown 源文件换成概率论课程笔记。
- `chapterFiles` 改成概率论的章节文件名。
- `notesDir` 可以继续使用 `source_notes/课程笔记`，也可以改成 `source_notes/概率论笔记`。
- 重新运行 `npm run build:notes` 生成新的 `courseNotes.json`。

### 应该替换

```text
src/components/Layout.tsx
src/components/SearchBar.tsx
README.md
package.json
vite.config.ts
.github/workflows/deploy.yml
```

替换点：

- 页面标题：从“计算机网络课程复习页”改成“概率论与数理统计课程复习页”。
- 搜索 placeholder：改成概率论示例，如“搜索课程笔记，例如 随机变量、期望、中心极限定理”。
- `package.json` 的 `name`、`description`。
- `vite.config.ts` 的 GitHub Pages `base`。
- README 中项目名称、在线地址、课程说明。

### 一般不用改

```text
src/components/ChapterNav.tsx
src/components/NotesTree.tsx
src/components/MarkdownViewer.tsx
src/components/CourseStats.tsx
src/types/courseNotes.ts
src/utils/courseNotes.ts
src/index.css
```

只要概率论笔记仍然采用 `# / ## / ### / ####` 的 Markdown 标题层级，这些文件可以继续使用。

## 9. 推荐的概率论复习网页目录结构

建议新项目保留同样的结构，但删除旧计算机网络知识库残留文件：

```text
probability-review-page/
  .github/
    workflows/
      deploy.yml
  docs/
    REUSE_BLUEPRINT.md
  scripts/
    buildNotesData.js
  source_notes/
    概率论笔记/
      0-summary.md
      1-random-events-and-probability.md
      2-random-variables.md
      3-multidimensional-random-variables.md
      4-numerical-characteristics.md
      5-law-of-large-numbers-and-clt.md
      6-mathematical-statistics.md
      7-parameter-estimation.md
      8-hypothesis-testing.md
  src/
    components/
      ChapterNav.tsx
      CourseStats.tsx
      Layout.tsx
      MarkdownViewer.tsx
      NotesTree.tsx
      SearchBar.tsx
    data/
      courseNotes.json
    types/
      courseNotes.ts
    utils/
      courseNotes.ts
    App.tsx
    index.css
    main.tsx
  index.html
  package.json
  postcss.config.cjs
  tailwind.config.cjs
  tsconfig.json
  vite.config.ts
```

如果笔记章节较少，也可以不设置 `0-summary.md`，但要同步修改 `scripts/buildNotesData.js` 中的 `chapterFiles`。

## 10. 迁移步骤

1. 创建新项目骨架  
   复制当前项目的 Vite / React / Tailwind 配置、`src/main.tsx`、`src/index.css`、课程复习页组件、`types/courseNotes.ts`、`utils/courseNotes.ts` 和 `scripts/buildNotesData.js`。不要复制旧版 `networkKnowledge.json` 和旧版知识卡片组件。

2. 放入新课程 Markdown  
   把概率论与数理统计笔记放入 `source_notes/概率论笔记/`，并统一标题层级：`#` 为章、`##` 为大节、`###` 为知识点、`####` 及以下为子知识点。随后修改 `scripts/buildNotesData.js` 的 `notesDir` 和 `chapterFiles`。

3. 生成课程数据并替换文案  
   运行：

   ```bash
   npm run build:notes
   ```

   检查 `src/data/courseNotes.json` 中章节标题、节点数量、预览是否正常。然后替换 `Layout.tsx`、`SearchBar.tsx`、`package.json`、`README.md`、`vite.config.ts` 中的课程名、搜索示例、仓库名和部署 base。

4. 构建和部署验证  
   本地运行：

   ```bash
   npm install
   npm run build
   npm run dev
   ```

   验证左侧章节、中间目录、右侧正文、悬停预览、搜索跳转、右侧滚动回顶部都正常。推送到 GitHub 前确认 `.gitignore` 不上传 `node_modules`、`dist`、缓存文件；如果使用 GitHub Pages，确认 workflow 和 `vite.config.ts` 的 `base` 与新仓库名一致。
