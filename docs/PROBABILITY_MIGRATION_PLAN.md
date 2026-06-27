# 概率论与数理统计复习网页迁移计划

本文档基于 `docs/REUSE_BLUEPRINT.md` 的项目骨架，规划一个面向“概率论与数理统计”期末考试的复习面板。目标不是照搬计算机网络知识页，而是复用其静态网页框架、章节导航、目录树、搜索、右侧阅读器和 JSON 驱动方式，重新组织概率论课程的复习数据。

## 1. 页面定位

新项目定位为：

```text
概率论与数理统计期末考试复习面板
```

它应服务于考前复习，而不是做成百科式知识库。页面重点是：

- 快速定位章节。
- 快速查公式。
- 快速按题型复习解题步骤。
- 快速查看易错点。
- 为错题整理预留入口。
- 用标签筛选高频、必考、易错内容。

## 2. 复用的项目框架

可以复用当前项目的基本技术框架：

- React + TypeScript + Vite。
- Tailwind CSS 三栏布局。
- 本地 JSON 数据驱动。
- Markdown 笔记解析脚本。
- 顶部搜索框。
- 左侧章节导航。
- 中间目录 / 筛选 / 题型列表。
- 右侧内容阅读器。
- GitHub Pages 静态部署。

建议继续保留“无后端、无数据库、无登录”的静态页面模式。所有学习数据都放在仓库内，由 Markdown 或 JSON 生成。

## 3. 推荐页面结构

建议保留固定 Header + 三栏布局，但内容调整为概率论复习面板。

```text
[Header：项目标题 / 搜索框 / 标签筛选 / 数据统计]

[左栏：章节导航]
[中栏：章节目录 + 公式卡片 + 题型模板 + 易错点 + 错题入口]
[右栏：当前条目详情 / Markdown 正文 / 解题模板]
```

### Header

显示：

- 标题：概率论与数理统计期末复习面板。
- 搜索框：搜索章节、公式、题型、易错点、错题标题。
- 标签筛选：高频 / 必考 / 易错。
- 统计：章节数、公式数、题型数、易错点数、错题数。

### 左栏

显示课程章节，例如：

1. 随机事件与概率
2. 随机变量及其分布
3. 多维随机变量及其分布
4. 随机变量的数字特征
5. 大数定律与中心极限定理
6. 数理统计基础
7. 参数估计
8. 假设检验

### 中栏

建议做成当前章节的复习工作区，而不只是 Markdown 目录。

可以使用 Tab：

- 章节目录
- 公式卡片
- 题型模板
- 易错点
- 错题入口

### 右栏

根据中栏选择显示详情：

- 章节 Markdown 正文。
- 公式卡片：公式、条件、适用场景、常见陷阱。
- 题型模板：识别特征、解题步骤、常用公式、易错点。
- 易错点：错误说法、正确说法、反例或判断依据。
- 错题入口：错题标题、来源、关联知识点、订正笔记。

## 4. 核心模块

### 章节导航

复用 `ChapterNav` 的思想：

- 左侧只负责切换章节。
- 点击章节后，中栏显示该章相关目录、公式、题型和易错点。
- 默认选中该章第一个复习条目。

章节数据可以继续从 Markdown 的 `#` 标题生成，也可以在 JSON 中显式维护。

### 公式卡片

公式卡片是概率论复习的核心模块。

每张公式卡片建议包含：

- 公式名称。
- 公式内容。
- 使用条件。
- 适用题型。
- 相关概念。
- 常见变形。
- 易错点。
- 标签：高频 / 必考 / 易错。

示例：

```text
全概率公式
条件：事件组构成完备事件组，且各事件概率非零。
用途：把复杂事件拆成若干互斥情形求和。
易错：不要漏掉完备事件组条件。
```

### 题型模板

题型模板用于考前直接复习“看到题该怎么做”。

每个题型模板建议包含：

- 题型名称。
- 识别特征。
- 解题步骤。
- 常用公式。
- 典型陷阱。
- 关联公式和章节。

示例题型：

- 古典概型计数题。
- 条件概率与贝叶斯公式题。
- 离散型随机变量分布列题。
- 连续型随机变量密度函数题。
- 二维随机变量边缘分布题。
- 期望与方差计算题。
- 参数估计题。
- 假设检验题。

### 易错点

易错点应短、明确、适合临考前快速扫。

每个易错点建议包含：

- 错误表述。
- 正确表述。
- 判断依据。
- 关联公式或题型。
- 反例或提醒。

示例：

```text
错误：两个事件互不相容就一定相互独立。
正确：互不相容且概率都非零时，一般不独立。
依据：P(AB)=0，但 P(A)P(B)>0。
```

### 错题入口

第一版不做登录和数据库，错题入口可以是静态 JSON 或 Markdown。

错题入口只做：

- 展示错题列表。
- 按章节和标签过滤。
- 点击查看错因、订正、关联知识点。

错题数据可以先手动维护在：

```text
src/data/wrongQuestions.json
```

不做：

- 在线新增错题。
- 用户账号。
- 云同步。
- 数据库保存。

### 高频 / 必考 / 易错标签筛选

标签筛选用于跨模块过滤。

标签建议：

- `high-frequency`：高频。
- `must-know`：必考。
- `error-prone`：易错。

筛选范围：

- Markdown 节点。
- 公式卡片。
- 题型模板。
- 易错点。
- 错题入口。

第一版可以只支持单选标签，后续再扩展多选。

## 5. 概率论数据 schema

建议把课程 Markdown 数据和考试复习结构数据分开。

```text
src/data/probabilityNotes.json       # 从 Markdown 生成的章节与正文
src/data/probabilityReview.json      # 手工维护的公式、题型、易错、错题
```

### 总数据结构

```ts
export interface ProbabilityReviewData {
  chapters: ProbabilityChapter[];
  formulas: FormulaCard[];
  templates: ProblemTemplate[];
  pitfalls: Pitfall[];
  wrongQuestions: WrongQuestion[];
}
```

### 章节

```ts
export interface ProbabilityChapter {
  id: string;
  order: number;
  title: string;
  summary: string;
  noteNodeIds: string[];
  formulaIds: string[];
  templateIds: string[];
  pitfallIds: string[];
  wrongQuestionIds: string[];
}
```

### 通用标签

```ts
export type ReviewTag = "high-frequency" | "must-know" | "error-prone";

export type ReviewItemType =
  | "note"
  | "formula"
  | "template"
  | "pitfall"
  | "wrong-question";
```

### 公式卡片

```ts
export interface FormulaCard {
  id: string;
  chapterId: string;
  title: string;
  formula: string;
  conditions: string[];
  useCases: string[];
  variants?: string[];
  pitfalls: string[];
  relatedFormulaIds?: string[];
  relatedTemplateIds?: string[];
  tags: ReviewTag[];
}
```

示例：

```json
{
  "id": "total-probability",
  "chapterId": "chapter-1",
  "title": "全概率公式",
  "formula": "P(B)=\\sum_i P(A_i)P(B|A_i)",
  "conditions": ["A_i 构成完备事件组", "P(A_i)>0"],
  "useCases": ["按互斥情形拆分事件 B 的概率"],
  "pitfalls": ["不要漏掉完备事件组条件", "不要把条件概率写反"],
  "relatedTemplateIds": ["conditional-probability-template"],
  "tags": ["high-frequency", "must-know", "error-prone"]
}
```

### 题型模板

```ts
export interface ProblemTemplate {
  id: string;
  chapterId: string;
  title: string;
  recognition: string[];
  steps: string[];
  formulas: string[];
  commonMistakes: string[];
  relatedFormulaIds?: string[];
  relatedPitfallIds?: string[];
  tags: ReviewTag[];
}
```

示例：

```json
{
  "id": "density-normalization-template",
  "chapterId": "chapter-2",
  "title": "连续型随机变量密度函数归一化题",
  "recognition": ["题目给出含未知常数的密度函数"],
  "steps": ["判断密度函数非负区间", "利用积分为 1 求常数", "再按题目要求求概率或分布函数"],
  "formulas": ["\\int_{-\\infty}^{+\\infty} f(x)dx=1"],
  "commonMistakes": ["积分区间不要写错", "求分布函数时要分段"],
  "relatedFormulaIds": ["density-normalization"],
  "tags": ["high-frequency", "must-know"]
}
```

### 易错点

```ts
export interface Pitfall {
  id: string;
  chapterId: string;
  title: string;
  wrongStatement: string;
  correctStatement: string;
  reason: string;
  example?: string;
  relatedFormulaIds?: string[];
  relatedTemplateIds?: string[];
  tags: ReviewTag[];
}
```

### 错题

```ts
export interface WrongQuestion {
  id: string;
  chapterId: string;
  title: string;
  source: string;
  questionSummary: string;
  wrongReason: string;
  correction: string;
  relatedFormulaIds?: string[];
  relatedTemplateIds?: string[];
  relatedPitfallIds?: string[];
  tags: ReviewTag[];
}
```

## 6. 数据如何组织到页面

建议保留两条数据链路。

### Markdown 笔记链路

```text
source_notes/概率论笔记/*.md
        ↓
scripts/buildProbabilityNotesData.js
        ↓
src/data/probabilityNotes.json
        ↓
章节目录 / Markdown 阅读器
```

用途：

- 展示课程正文。
- 支持按标题和正文搜索。
- 作为章节目录树来源。

### 复习卡片链路

```text
src/data/probabilityReview.json
        ↓
src/utils/probabilityReview.ts
        ↓
公式卡片 / 题型模板 / 易错点 / 错题入口 / 标签筛选
```

用途：

- 高频公式复习。
- 考试题型步骤复习。
- 易错点快速排查。
- 错题索引。

## 7. 推荐组件拆分

可以从当前组件迁移并重命名。

```text
src/components/
  Layout.tsx
  ChapterNav.tsx
  SearchBar.tsx
  MarkdownViewer.tsx
  ReviewStats.tsx
  ReviewTabs.tsx
  FormulaCardList.tsx
  FormulaCardView.tsx
  ProblemTemplateList.tsx
  ProblemTemplateView.tsx
  PitfallList.tsx
  PitfallView.tsx
  WrongQuestionList.tsx
  WrongQuestionView.tsx
  TagFilter.tsx
```

### 可直接复用思想

- `Layout`：保留固定 Header + 三栏独立滚动。
- `ChapterNav`：保留章节切换与高亮。
- `SearchBar`：保留搜索结果下拉和点击定位。
- `MarkdownViewer`：保留右侧正文阅读能力。
- `CourseStats`：改名为 `ReviewStats`，统计公式、题型、易错和错题数量。

### 需要新增

- `ReviewTabs`：中栏切换“目录 / 公式 / 题型 / 易错 / 错题”。
- `TagFilter`：顶部或中栏筛选高频、必考、易错。
- 公式、题型、易错、错题的列表和详情组件。

## 8. 第一版最小可用版本任务清单

第一版只做可用，不追求完整题库和复杂交互。

1. 建立新项目或复制当前项目骨架  
   复制 React、TypeScript、Vite、Tailwind、三栏布局、章节导航、搜索框、Markdown 阅读器和 GitHub Pages 配置。

2. 准备概率论 Markdown 笔记  
   放入 `source_notes/概率论笔记/`，统一标题层级：`#` 为章，`##` 为大节，`###` 为知识点，`####` 及以下为子知识点。

3. 改造 Markdown 解析脚本  
   从 `scripts/buildNotesData.js` 派生 `scripts/buildProbabilityNotesData.js`，修改 `notesDir`、`chapterFiles` 和输出文件名。

4. 生成 `probabilityNotes.json`  
   检查章节标题、目录层级、节点正文和搜索预览是否正常。

5. 新增 `probabilityReview.json`  
   第一版手动维护少量高频内容：
   - 10 张公式卡片。
   - 8 个题型模板。
   - 10 个易错点。
   - 3 到 5 个错题入口示例。

6. 实现复习数据类型  
   新增 `src/types/probabilityReview.ts`，定义章节、公式、题型、易错、错题和标签类型。

7. 实现复习数据工具函数  
   新增 `src/utils/probabilityReview.ts`，提供：
   - `getChapterById`
   - `getFormulaById`
   - `getTemplateById`
   - `getPitfallById`
   - `getWrongQuestionById`
   - `searchProbabilityReview`
   - `filterByTag`

8. 改造中栏为复习工作区  
   增加 Tab：
   - 章节目录
   - 公式卡片
   - 题型模板
   - 易错点
   - 错题入口

9. 实现右侧详情区  
   点击不同类型条目后，右侧展示对应详情；搜索结果点击后也定位到右侧详情。

10. 实现标签筛选  
    第一版支持单选：
    - 全部
    - 高频
    - 必考
    - 易错

11. 替换项目文案  
    将页面标题、搜索示例、README、`package.json`、部署 base 改为概率论项目。

12. 构建验证  
    运行：

    ```bash
    npm run build
    npm run dev
    ```

    验证章节切换、搜索、标签筛选、公式卡片、题型模板、易错点、错题入口和右侧滚动回顶部。

## 9. 第一版建议内容范围

不要一开始做全量内容，建议先覆盖最常考的骨架。

### 公式卡片第一批

- 加法公式
- 条件概率公式
- 乘法公式
- 全概率公式
- 贝叶斯公式
- 分布函数定义
- 密度函数归一化
- 期望公式
- 方差公式
- 协方差与相关系数

### 题型模板第一批

- 古典概型计数题
- 条件概率与贝叶斯公式题
- 分布列求解题
- 密度函数归一化题
- 分布函数分段题
- 二维随机变量边缘分布题
- 期望方差计算题
- 参数估计基础题

### 易错点第一批

- 互不相容与相互独立混淆
- 条件概率方向写反
- 完备事件组条件遗漏
- 密度函数积分区间写错
- 分布函数右连续性忽略
- 二维分布边缘化积分限错误
- 方差不能直接等于期望平方
- 独立不等于不相关的适用范围混淆
- 样本均值与总体均值混淆
- 单侧检验与双侧检验临界域混淆

## 10. 明确不做的内容

第一版不做以下能力：

- 不做登录系统。
- 不做数据库。
- 不做云端同步。
- 不做在线新增、编辑、删除错题。
- 不做复杂知识图谱。
- 不做 AI 出题。
- 不做自动批改。
- 不做用户学习进度跟踪。
- 不做多用户权限管理。

这些能力会明显增加实现和维护成本，不符合“期末考试复习面板”的第一版目标。

## 11. 验收标准

第一版完成后应满足：

- 页面标题和文案全部是概率论与数理统计。
- 左侧能切换概率论章节。
- 中栏能在目录、公式、题型、易错、错题之间切换。
- 右侧能显示当前条目的详细内容。
- 搜索能覆盖标题、正文、公式、题型、易错点和错题标题。
- 高频 / 必考 / 易错标签筛选可用。
- 所有数据来自本地 JSON 或 Markdown 生成文件。
- 不依赖后端、数据库或登录系统。
- `npm run build` 通过。
