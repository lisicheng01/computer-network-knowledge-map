import { KnowledgeCard } from "./components/KnowledgeCard";
import { KnowledgeStats } from "./components/KnowledgeStats";
import { Layout, type FocusMode } from "./components/Layout";
import { SearchBar } from "./components/SearchBar";
import { StudyPanel, type StudyTab } from "./components/StudyPanel";
import {
  CollapsedKnowledgePreview,
  CollapsedTreeRail,
  FocusNavigationRail,
} from "./components/FocusRails";
import type { KnowledgeContext, KnowledgeNode } from "./types/knowledge";
import {
  findContextForKnowledge,
  getContextTitle,
  getDefaultKnowledgeForContext,
  getKnowledgeById,
  getKnowledgeNodesByIds,
  getLayerById,
  getTeachingTemplate,
  getTopicsForContext,
  knowledgeData,
} from "./utils/knowledge";
import { useMemo, useState } from "react";

const initialContext: KnowledgeContext = {
  kind: "layer",
  id: "application",
};

function getInitialKnowledgeId() {
  return getDefaultKnowledgeForContext(initialContext)?.id ?? "";
}

function getNodePath(ids?: string[]): KnowledgeNode[] {
  return getKnowledgeNodesByIds(ids ?? []);
}

function collectNodes(nodes: KnowledgeNode[], visited = new Set<string>()) {
  const result: KnowledgeNode[] = [];

  for (const node of nodes) {
    if (visited.has(node.id)) {
      continue;
    }

    visited.add(node.id);
    result.push(node);
    result.push(...collectNodes(getNodePath(node.children), visited));
  }

  return result;
}

function getCollapsedTreeNodes(
  context: KnowledgeContext,
  activeTab: StudyTab,
): KnowledgeNode[] {
  if (context.kind === "layer") {
    const layer = getLayerById(context.id);

    if (activeTab === "path") {
      const pathNodes = getNodePath(layer?.learningPath);
      if (pathNodes.length) {
        return pathNodes;
      }
    }

    if (activeTab === "exam") {
      const examNodes = getNodePath(layer?.examPath);
      if (examNodes.length) {
        return examNodes;
      }
    }
  }

  const contextNodes = collectNodes(getTopicsForContext(context));

  if (activeTab === "exam") {
    const examNodes = contextNodes.filter(
      (node) =>
        getTeachingTemplate(node) === "exam" || node.examTemplates.length > 0,
    );

    if (examNodes.length) {
      return examNodes;
    }
  }

  return contextNodes;
}

function getNearbyNodes(
  nodes: KnowledgeNode[],
  selectedKnowledge?: KnowledgeNode,
) {
  if (!selectedKnowledge) {
    return nodes.slice(0, 5);
  }

  const selectedIndex = nodes.findIndex((node) => node.id === selectedKnowledge.id);

  if (selectedIndex < 0) {
    return nodes.slice(0, 5);
  }

  const start = Math.max(0, selectedIndex - 2);
  return nodes.slice(start, start + 5);
}

export default function App() {
  const [selectedContext, setSelectedContext] =
    useState<KnowledgeContext>(initialContext);
  const [selectedKnowledgeId, setSelectedKnowledgeId] = useState(
    getInitialKnowledgeId,
  );
  const [focusMode, setFocusMode] = useState<FocusMode>("middle");
  const [activeStudyTab, setActiveStudyTab] = useState<StudyTab>("tree");

  const selectedKnowledge = selectedKnowledgeId
    ? getKnowledgeById(selectedKnowledgeId)
    : undefined;

  const nearbyNodes = useMemo(() => {
    return getNearbyNodes(
      getCollapsedTreeNodes(selectedContext, activeStudyTab),
      selectedKnowledge,
    );
  }, [activeStudyTab, selectedContext, selectedKnowledge]);

  const selectContext = (context: KnowledgeContext) => {
    setSelectedContext(context);
    const defaultKnowledge = getDefaultKnowledgeForContext(context);

    if (defaultKnowledge) {
      setSelectedKnowledgeId(defaultKnowledge.id);
    }
  };

  const selectKnowledge = (knowledgeId: string) => {
    setSelectedKnowledgeId(knowledgeId);
  };

  const selectContextFromNavigation = (context: KnowledgeContext) => {
    setFocusMode("middle");
    selectContext(context);
  };

  const selectKnowledgeFromCollapsedTree = (knowledgeId: string) => {
    setFocusMode("middle");
    selectKnowledge(knowledgeId);
  };

  const selectKnowledgeForCard = (knowledgeId: string) => {
    const nextContext = findContextForKnowledge(knowledgeId);

    if (nextContext) {
      setSelectedContext(nextContext);
    }

    setFocusMode("card");
    setSelectedKnowledgeId(knowledgeId);
  };

  return (
    <Layout
      focusMode={focusMode}
      onFocusModeChange={setFocusMode}
      searchBar={<SearchBar onSelectKnowledge={selectKnowledgeForCard} />}
      stats={<KnowledgeStats />}
      navigationRail={
        <FocusNavigationRail
          layers={knowledgeData.layers}
          edges={knowledgeData.edges}
          selectedContext={selectedContext}
          onSelectContext={selectContextFromNavigation}
        />
      }
      topicTree={
        <StudyPanel
          context={selectedContext}
          selectedKnowledgeId={selectedKnowledgeId}
          activeTab={activeStudyTab}
          onActiveTabChange={(tab) => {
            setFocusMode("middle");
            setActiveStudyTab(tab);
          }}
          onSelectKnowledge={selectKnowledge}
        />
      }
      knowledgeCard={
        <KnowledgeCard
          knowledge={selectedKnowledge}
          onSelectKnowledge={selectKnowledgeForCard}
        />
      }
      collapsedTreeRail={
        <CollapsedTreeRail
          contextTitle={getContextTitle(selectedContext)}
          activeTab={activeStudyTab}
          selectedKnowledge={selectedKnowledge}
          nearbyNodes={nearbyNodes}
          onActivateTree={() => setFocusMode("middle")}
          onSelectKnowledge={selectKnowledgeFromCollapsedTree}
        />
      }
      collapsedKnowledgePreview={
        <CollapsedKnowledgePreview
          knowledge={selectedKnowledge}
          onActivateCard={() => setFocusMode("card")}
        />
      }
    />
  );
}
