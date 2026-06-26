import { KnowledgeCard } from "./components/KnowledgeCard";
import { KnowledgeStats } from "./components/KnowledgeStats";
import { Layout } from "./components/Layout";
import { SearchBar } from "./components/SearchBar";
import { StudyPanel, type StudyTab } from "./components/StudyPanel";
import {
  FocusNavigationRail,
  KnowledgeSummaryPreview,
} from "./components/FocusRails";
import type { KnowledgeContext } from "./types/knowledge";
import {
  findContextForKnowledge,
  getDefaultKnowledgeForContext,
  getKnowledgeById,
  knowledgeData,
} from "./utils/knowledge";
import { useState } from "react";

const initialContext: KnowledgeContext = {
  kind: "layer",
  id: "application",
};

function getInitialKnowledgeId() {
  return getDefaultKnowledgeForContext(initialContext)?.id ?? "";
}

export default function App() {
  const [selectedContext, setSelectedContext] =
    useState<KnowledgeContext>(initialContext);
  const [selectedNode, setSelectedNode] = useState(
    getInitialKnowledgeId,
  );
  const [hoverNode, setHoverNode] = useState<string | undefined>();
  const [activeStudyTab, setActiveStudyTab] = useState<StudyTab>("tree");

  const selectedKnowledge = selectedNode
    ? getKnowledgeById(selectedNode)
    : undefined;
  const hoverKnowledge = hoverNode ? getKnowledgeById(hoverNode) : undefined;

  const selectContext = (context: KnowledgeContext) => {
    setSelectedContext(context);
    const defaultKnowledge = getDefaultKnowledgeForContext(context);

    if (defaultKnowledge) {
      setSelectedNode(defaultKnowledge.id);
    }

    setHoverNode(undefined);
  };

  const selectKnowledge = (knowledgeId: string) => {
    setSelectedNode(knowledgeId);
    setHoverNode(undefined);
  };

  const selectContextFromNavigation = (context: KnowledgeContext) => {
    selectContext(context);
  };

  const previewKnowledge = (knowledgeId?: string) => {
    if (!knowledgeId || knowledgeId === selectedNode) {
      setHoverNode(undefined);
      return;
    }

    setHoverNode(knowledgeId);
  };

  const selectKnowledgeForCard = (knowledgeId: string) => {
    const nextContext = findContextForKnowledge(knowledgeId);

    if (nextContext) {
      setSelectedContext(nextContext);
    }

    setSelectedNode(knowledgeId);
    setHoverNode(undefined);
  };

  return (
    <Layout
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
          selectedKnowledgeId={selectedNode}
          activeTab={activeStudyTab}
          onActiveTabChange={(tab) => {
            setActiveStudyTab(tab);
            setHoverNode(undefined);
          }}
          onSelectKnowledge={selectKnowledge}
          onHoverKnowledge={previewKnowledge}
        />
      }
      rightPanel={
        hoverKnowledge ? (
          <KnowledgeSummaryPreview
            knowledge={hoverKnowledge}
            hint="点击查看完整内容"
          />
        ) : (
          <KnowledgeCard
            knowledge={selectedKnowledge}
            onSelectKnowledge={selectKnowledgeForCard}
          />
        )
      }
    />
  );
}
