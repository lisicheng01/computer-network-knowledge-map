import { useEffect, useMemo, useState } from "react";
import { ChapterNav } from "./components/ChapterNav";
import { CourseStats } from "./components/CourseStats";
import { Layout } from "./components/Layout";
import { MarkdownViewer } from "./components/MarkdownViewer";
import { NotesTree } from "./components/NotesTree";
import { SearchBar } from "./components/SearchBar";
import {
  courseNotesData,
  getChapterById,
  getDefaultNodeForChapter,
  getNodeById,
} from "./utils/courseNotes";

const initialChapterId = courseNotesData.chapters[0]?.id ?? "";

function getInitialNodeId() {
  return getDefaultNodeForChapter(initialChapterId)?.id ?? "";
}

function scrollRightPanelToTop() {
  const rightPanel = document.querySelector<HTMLElement>(
    '[data-scroll-panel="right"]',
  );
  rightPanel?.scrollTo({ top: 0, behavior: "auto" });
}

export default function App() {
  const [selectedChapterId, setSelectedChapterId] = useState(initialChapterId);
  const [selectedNode, setSelectedNode] = useState(getInitialNodeId);
  const [hoverNode, setHoverNode] = useState<string | undefined>();

  const selectedChapter = useMemo(
    () =>
      getChapterById(selectedChapterId) ??
      courseNotesData.chapters[0],
    [selectedChapterId],
  );
  const selectedNote = getNodeById(selectedNode);
  const hoverNote = getNodeById(hoverNode);
  const displayedNote = hoverNote ?? selectedNote;

  useEffect(() => {
    scrollRightPanelToTop();
  }, [displayedNote?.id, Boolean(hoverNote)]);

  const selectChapter = (chapterId: string) => {
    const defaultNode = getDefaultNodeForChapter(chapterId);

    setSelectedChapterId(chapterId);
    setSelectedNode(defaultNode?.id ?? "");
    setHoverNode(undefined);
  };

  const selectNode = (nodeId: string) => {
    const node = getNodeById(nodeId);

    if (!node) {
      return;
    }

    setSelectedChapterId(node.chapterId);
    setSelectedNode(node.id);
    setHoverNode(undefined);
  };

  const previewNode = (nodeId?: string) => {
    if (!nodeId || nodeId === selectedNode) {
      setHoverNode(undefined);
      return;
    }

    setHoverNode(nodeId);
  };

  return (
    <Layout
      searchBar={<SearchBar onSelectNode={selectNode} />}
      stats={<CourseStats />}
      chapterNav={
        <ChapterNav
          chapters={courseNotesData.chapters}
          selectedChapterId={selectedChapterId}
          onSelectChapter={selectChapter}
        />
      }
      notesTree={
        selectedChapter ? (
          <NotesTree
            chapter={selectedChapter}
            selectedNodeId={selectedNode}
            hoverNodeId={hoverNode}
            onSelectNode={selectNode}
            onHoverNode={previewNode}
          />
        ) : null
      }
      rightPanel={
        <MarkdownViewer
          node={displayedNote}
          preview={Boolean(hoverNote)}
          onSelectNode={selectNode}
        />
      }
    />
  );
}
