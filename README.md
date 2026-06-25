# 计算机网络知识网络

## 项目简介

这是一个面向计算机网络期末 / 408 复习的本地静态交互式知识网络工具。它不是普通笔记，也不是简单思维导图，而是把计算机网络知识按以下维度组织起来：

- 五层体系
- 跨层关系
- 学习路径
- 题型模板
- 类型化知识卡片

当前知识库由本地 JSON 驱动，核心数据位于 `src/data/networkKnowledge.json`。项目不需要后端、数据库或登录系统。

## 在线访问

部署后访问地址：待补充

如果仓库名保持为 `computer-network-knowledge-map`，GitHub Pages 地址通常为：

```text
https://你的GitHub用户名.github.io/computer-network-knowledge-map/
```

## 核心功能

- 五层协议体系导航：应用层、传输层、网络层、数据链路层、物理层。
- 层间关系入口：应用层 ↔ 传输层、传输层 ↔ 网络层、网络层 ↔ 数据链路层、数据链路层 ↔ 物理层。
- 知识树：按当前层或跨层关系展示可展开的知识点结构。
- 学习路径：按层配置复习顺序，适合从基础到综合推进。
- 题型模板：集中展示计算题、过程题、对比题等考试导向节点。
- 类型化教学卡片：不同类型知识点使用不同展示结构。
- 内部知识链接：卡片正文中的知识点链接可直接跳转到对应卡片。
- 搜索：按标题、概要和关键词搜索知识点。
- 知识统计：自动统计总数、重要性、掌握深度和展示模式。
- Focus Layout：左侧固定定位导航，中间用于知识导航，右侧用于卡片阅读。

## 知识组织方式

知识点不是平铺列表，而是围绕层、跨层关系、学习路径和题型模板组织。当前数据中包含 5 个协议层、4 条层间关系和 113 个知识点。

知识卡片会根据 `type` 和 `teachingTemplate` 采用不同展示逻辑，主要包括：

- 概念型
- 协议型
- 机制型
- 公式型
- 对比型
- 过程型
- 题型型

每个知识点可包含定义、解决的问题、输入输出、机制流程、关键字段 / 状态、考试规则、易错点、关联知识点、题型模板、正文导读、详细说明和参考资料等字段。旧字段和新增字段都由 TypeScript 类型约束。

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- lucide-react
- GitHub Pages
- GitHub Actions

## 本地运行

```bash
cd "/Users/Zhuanz/Desktop/计算机网络知识网络"
npm install
npm run dev
```

默认开发服务由 Vite 启动。浏览器中打开终端输出的本地地址即可访问。

## 生产预览

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 5173
```

## GitHub Pages 部署

项目已配置 GitHub Actions：

```text
.github/workflows/deploy.yml
```

推送到 `main` 分支后，workflow 会自动：

1. 使用 Node 20。
2. 执行 `npm ci`。
3. 使用 GitHub Pages 环境变量构建：

   ```bash
   GITHUB_PAGES=true npm run build
   ```

4. 上传 `dist`。
5. 通过 `actions/deploy-pages` 发布到 GitHub Pages。

`vite.config.ts` 中 GitHub Pages 的 base 已配置为：

```ts
base: isGitHubPages ? "/computer-network-knowledge-map/" : "/"
```

如果仓库名从 `computer-network-knowledge-map` 改成其他名称，需要同步修改 `vite.config.ts` 中的 base。

## 项目结构

```text
src/
  App.tsx                 应用状态和主要交互入口
  components/             页面组件、Focus Layout、搜索、知识卡片和学习面板
  data/                   本地知识库 JSON
  types/                  知识数据 TypeScript 类型
  utils/                  数据读取、搜索、统计和显示标签工具
.github/workflows/        GitHub Pages 自动部署 workflow
vite.config.ts            Vite 与 GitHub Pages base 配置
package.json              依赖和 npm scripts
```

## 数据来源与维护

核心知识数据在：

```text
src/data/networkKnowledge.json
```

后续扩充知识点时，优先维护这个 JSON 文件。只要遵守现有 schema，并把新增知识点挂入对应的 `topicIds`、`learningPath`、`examPath` 或层间关系入口，组件逻辑通常不需要修改。

维护时建议重点检查：

- `id` 是否唯一。
- `related`、`children`、`topicIds`、`overviewId` 是否引用存在的知识点。
- 正文内部链接 `[[显示文本|knowledgeId]]` 是否指向存在的知识点。
- 高频核心节点是否包含考试规则、易错点和必要题型模板。

## 后续计划

- 增加更多题型例题。
- 优化知识点内容质量。
- 增加错题 / 收藏 / 复习状态。
- 优化移动端适配。
- 持续压缩首屏加载体积。

## 免责声明

本项目用于个人学习和复习辅助。知识内容仍需结合教材、课程课件和正式考试大纲校验，不应作为唯一复习依据。
