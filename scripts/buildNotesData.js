import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const notesDir = path.join(projectRoot, "source_notes", "课程笔记");
const outputFile = path.join(projectRoot, "src", "data", "courseNotes.json");

const chapterFiles = [
  "0-summary.md",
  "1-physical-layer.md",
  "2-data-link-layer.md",
  "3-network-layer.md",
  "4-transport-layer.md",
  "5-application-layer.md",
];

function readMarkdown(filename) {
  const filePath = path.join(notesDir, filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing note file: ${filePath}`);
  }

  return fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
}

function cleanHeadingTitle(rawTitle) {
  return rawTitle
    .replace(/\s+#+\s*$/, "")
    .replace(/[*_`~]/g, "")
    .trim();
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\$\$?([^$]+)\$\$?/g, "$1")
    .replace(/==([^=]+)==/g, "$1")
    .replace(/[#>*_\-|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function makePreview(markdown, title) {
  const text = stripMarkdown(markdown).replace(title, "").trim();

  if (!text) {
    return "本节主要来自课程笔记标题结构，点击查看对应正文。";
  }

  return text.length > 180 ? `${text.slice(0, 180)}...` : text;
}

function parseHeadings(markdown) {
  const lines = markdown.split("\n");
  const headings = [];
  let inFence = false;

  lines.forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }

    if (inFence) {
      return;
    }

    const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);

    if (match) {
      headings.push({
        level: match[1].length,
        title: cleanHeadingTitle(match[2]),
        lineIndex: index,
      });
    }
  });

  return { headings, lines };
}

function buildChapter(filename, chapterOrder) {
  const markdown = readMarkdown(filename);
  const { headings, lines } = parseHeadings(markdown);
  const rootHeading = headings.find((heading) => heading.level === 1);
  const chapterId = `chapter-${chapterOrder}`;
  const nodes = [];
  const nodeRefs = new Map();
  const stack = [];

  headings.forEach((heading, index) => {
    const nextBoundary = headings
      .slice(index + 1)
      .find((candidate) => candidate.level <= heading.level);
    const endLineIndex = nextBoundary ? nextBoundary.lineIndex : lines.length;
    const id =
      heading.level === 1
        ? `${chapterId}-root`
        : `${chapterId}-n${String(index).padStart(3, "0")}`;

    while (stack.length && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    const parent = stack[stack.length - 1];
    const sectionMarkdown = lines
      .slice(heading.lineIndex, endLineIndex)
      .join("\n")
      .trim();
    const bodyMarkdown = lines
      .slice(heading.lineIndex + 1, endLineIndex)
      .join("\n")
      .trim();

    const node = {
      id,
      chapterId,
      parentId: parent?.id,
      title: heading.title,
      level: heading.level,
      order: index + 1,
      sourceFile: filename,
      startLine: heading.lineIndex + 1,
      endLine: endLineIndex,
      markdown: sectionMarkdown,
      body: bodyMarkdown,
      preview: makePreview(bodyMarkdown || sectionMarkdown, heading.title),
      children: [],
    };

    if (parent) {
      parent.children.push(id);
    }

    nodeRefs.set(id, node);
    nodes.push(node);
    stack.push(node);
  });

  const rootNode = nodes.find((node) => node.level === 1) ?? nodes[0];
  const topicIds = nodes
    .filter((node) => node.parentId === rootNode?.id && node.level === 2)
    .map((node) => node.id);

  return {
    chapter: {
      id: chapterId,
      order: chapterOrder,
      title: rootHeading?.title ?? `第${chapterOrder}章`,
      filename,
      rootNodeId: rootNode?.id ?? "",
      topicIds,
      nodeIds: nodes.map((node) => node.id),
      summary: makePreview(rootNode?.body ?? markdown, rootNode?.title ?? ""),
    },
    nodes,
  };
}

function main() {
  if (!fs.existsSync(notesDir)) {
    throw new Error(`Notes directory does not exist: ${notesDir}`);
  }

  const chapters = [];
  const nodes = [];

  chapterFiles.forEach((filename, index) => {
    const parsed = buildChapter(filename, index + 1);
    chapters.push(parsed.chapter);
    nodes.push(...parsed.nodes);
  });

  const data = {
    source: "source_notes/课程笔记",
    generatedBy: "scripts/buildNotesData.js",
    chapters,
    nodes,
  };

  fs.writeFileSync(outputFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log(
    `Generated ${path.relative(projectRoot, outputFile)} with ${chapters.length} chapters and ${nodes.length} sections.`,
  );
}

main();
