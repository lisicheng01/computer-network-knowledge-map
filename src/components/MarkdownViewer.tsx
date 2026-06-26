import type { ReactNode } from "react";
import type { CourseNoteNode } from "../types/courseNotes";
import { getChapterById, getNodePath } from "../utils/courseNotes";

interface MarkdownViewerProps {
  node?: CourseNoteNode;
  preview?: boolean;
  onSelectNode?: (nodeId: string) => void;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const tokenPattern =
    /(!?\[[^\]]*]\([^)]+\)|`[^`]+`|\*\*[^*]+\*\*|==[^=]+==|\$[^$]+\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${match.index}-${token}`;
    const linkMatch = /^\[([^\]]+)]\(([^)]+)\)$/.exec(token);
    const imageMatch = /^!\[([^\]]*)]\(([^)]+)\)$/.exec(token);

    if (imageMatch) {
      nodes.push(imageMatch[1] || "图片");
    } else if (linkMatch) {
      nodes.push(
        <a
          key={key}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-blue-700 underline decoration-blue-200 underline-offset-2 hover:text-blue-800"
        >
          {linkMatch[1]}
        </a>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.92em] text-slate-800"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("==")) {
      nodes.push(
        <mark key={key} className="rounded bg-yellow-100 px-1 text-slate-900">
          {token.slice(2, -2)}
        </mark>,
      );
    } else if (token.startsWith("$")) {
      nodes.push(
        <span key={key} className="font-mono text-slate-800">
          {token.slice(1, -1)}
        </span>,
      );
    } else {
      nodes.push(token);
    }

    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function isTableSeparator(cells: string[]) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()));
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSpecialLine(line: string) {
  const trimmed = line.trim();
  return (
    !trimmed ||
    trimmed.startsWith("```") ||
    /^#{1,6}\s+/.test(trimmed) ||
    /^!\[[^\]]*]\([^)]+\)$/.test(trimmed) ||
    /^>/.test(trimmed) ||
    /^\|/.test(trimmed) ||
    /^\s*([-+*]|\d+[.)])\s+/.test(line)
  );
}

function renderMarkdown(markdown: string) {
  const lines = markdown.split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const language = trimmed.replace(/^```/, "").trim();
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith("```")) {
        codeLines.push(lines[index]);
        index += 1;
      }

      index += 1;
      blocks.push(
        <pre
          key={`code-${index}`}
          className="my-4 overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-sm leading-6 text-slate-100"
        >
          {language ? (
            <div className="mb-2 text-xs text-slate-400">{language}</div>
          ) : null}
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const headingMatch = /^(#{1,6})\s+(.+?)\s*$/.exec(trimmed);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].replace(/\s+#+\s*$/, "");
      const Tag = `h${Math.min(level + 1, 6)}` as
        | "h2"
        | "h3"
        | "h4"
        | "h5"
        | "h6";
      const className =
        level <= 2
          ? "mb-3 mt-7 text-xl font-semibold text-slate-950"
          : "mb-2 mt-5 text-base font-semibold text-slate-900";

      blocks.push(
        <Tag key={`heading-${index}`} className={className}>
          {renderInline(title)}
        </Tag>,
      );
      index += 1;
      continue;
    }

    const imageMatch = /^!\[([^\]]*)]\(([^)]+)\)$/.exec(trimmed);
    if (imageMatch) {
      blocks.push(
        <figure key={`image-${index}`} className="my-5">
          <img
            src={imageMatch[2]}
            alt={imageMatch[1]}
            className="max-h-[520px] max-w-full rounded-lg border border-slate-200 bg-white object-contain"
            loading="lazy"
          />
          {imageMatch[1] ? (
            <figcaption className="mt-2 text-center text-xs text-slate-500">
              {imageMatch[1]}
            </figcaption>
          ) : null}
        </figure>,
      );
      index += 1;
      continue;
    }

    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].replace(/^>\s?/, ""));
        index += 1;
      }

      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="my-4 border-l-4 border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-7 text-slate-700"
        >
          {quoteLines.map((quoteLine, quoteIndex) => (
            <p key={quoteIndex}>{renderInline(quoteLine)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (trimmed.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }

      const rows = tableLines.map(splitTableRow);
      const [header, maybeSeparator, ...bodyRows] = rows;
      const hasSeparator = maybeSeparator && isTableSeparator(maybeSeparator);
      const rowsToRender = hasSeparator ? bodyRows : rows.slice(1);

      blocks.push(
        <div key={`table-${index}`} className="my-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {(hasSeparator ? header : rows[0]).map((cell, cellIndex) => (
                  <th
                    key={cellIndex}
                    className="border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-800"
                  >
                    {renderInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowsToRender.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="border border-slate-200 px-3 py-2 align-top text-slate-700"
                    >
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^\s*([-+*]|\d+[.)])\s+/.test(line)) {
      const items: { text: string; indent: number }[] = [];
      const ordered = /^\s*\d+[.)]\s+/.test(line);

      while (
        index < lines.length &&
        /^\s*([-+*]|\d+[.)])\s+/.test(lines[index])
      ) {
        const itemLine = lines[index];
        const indent = Math.floor((itemLine.match(/^\s*/)?.[0].length ?? 0) / 2);
        items.push({
          indent,
          text: itemLine.replace(/^\s*([-+*]|\d+[.)])\s+/, ""),
        });
        index += 1;
      }

      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={`list-${index}`}
          className={[
            "my-3 space-y-1 pl-6 text-sm leading-7 text-slate-700",
            ordered ? "list-decimal" : "list-disc",
          ].join(" ")}
        >
          {items.map((item, itemIndex) => (
            <li key={itemIndex} style={{ marginLeft: `${item.indent * 14}px` }}>
              {renderInline(item.text)}
            </li>
          ))}
        </ListTag>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && !isSpecialLine(lines[index])) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push(
      <p
        key={`paragraph-${index}`}
        className="my-3 text-sm leading-7 text-slate-700"
      >
        {renderInline(paragraphLines.join(" "))}
      </p>,
    );
  }

  return blocks;
}

export function MarkdownViewer({
  node,
  preview = false,
  onSelectNode,
}: MarkdownViewerProps) {
  if (!node) {
    return (
      <div className="p-6 text-sm leading-7 text-slate-500">
        请选择左侧章节和中间目录中的知识点。
      </div>
    );
  }

  const chapter = getChapterById(node.chapterId);
  const path = getNodePath(node.id)
    .filter((pathNode) => pathNode.level > 1)
    .map((pathNode) => pathNode.title);

  if (preview) {
    return (
      <article className="p-6">
        <div className="mb-4 inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          悬停预览
        </div>
        <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
          {node.title}
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          {chapter?.title}
          {path.length ? ` / ${path.join(" / ")}` : ""}
        </p>
        <p className="mt-5 text-sm leading-7 text-slate-700">{node.preview}</p>
        <button
          type="button"
          onClick={() => onSelectNode?.(node.id)}
          className="mt-6 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          点击查看完整内容
        </button>
      </article>
    );
  }

  return (
    <article className="mx-auto max-w-4xl px-7 py-6">
      <div className="mb-5 border-b border-slate-200 pb-5">
        <p className="text-xs font-medium text-blue-700">
          {chapter?.title ?? "课程笔记"}
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          {node.title}
        </h2>
        {path.length ? (
          <p className="mt-3 text-xs leading-5 text-slate-500">
            {path.join(" / ")}
          </p>
        ) : null}
      </div>

      {node.body ? (
        <div>{renderMarkdown(node.body)}</div>
      ) : (
        <p className="text-sm leading-7 text-slate-500">
          本标题下暂无独立正文，可从目录中选择其子标题继续阅读。
        </p>
      )}

      <footer className="mt-10 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500">
        来源：{node.sourceFile}，第 {node.startLine} - {node.endLine} 行
      </footer>
    </article>
  );
}
