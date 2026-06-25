import { useEffect, useRef, type ReactNode } from "react";
import type { KnowledgeBodyBlock, KnowledgeNode } from "../types/knowledge";
import {
  getKnowledgeById,
  getKnowledgeDisplayMeta,
  getKnowledgeLabel,
  getLayerById,
  getTeachingTemplate,
} from "../utils/knowledge";
import {
  displayModeLabels,
  fieldLabels,
  getLayerDisplayLabel,
  importanceLabels,
  teachingTemplateLabels,
  typeLabels,
} from "../utils/labels";

interface KnowledgeCardProps {
  knowledge?: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

const inlineLinkPattern = /\[\[([^\]|]+)\|([^\]]+)\]\]/g;
const warnedMissingInlineLinks = new Set<string>();

const referenceTypeLabels = {
  textbook: "教材",
  rfc: "RFC",
  external: "外部",
  note: "笔记",
};

const importanceStyles = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-blue-200 bg-blue-50 text-blue-700",
  low: "border-slate-200 bg-slate-50 text-slate-600",
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="border-t border-slate-200 pt-4">
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <div className="mt-2 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  );
}

function renderInlineKnowledgeContent(
  content: string,
  onSelectKnowledge: (knowledgeId: string) => void,
  keyPrefix: string,
): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(inlineLinkPattern)) {
    const [raw, label, knowledgeId] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(content.slice(lastIndex, index));
    }

    if (getKnowledgeById(knowledgeId)) {
      parts.push(
        <button
          key={`${keyPrefix}-${index}-${knowledgeId}`}
          type="button"
          className="inline rounded-sm px-1 font-medium text-blue-700 underline decoration-blue-300 underline-offset-2 hover:bg-blue-50 hover:text-blue-900"
          onClick={() => onSelectKnowledge(knowledgeId)}
        >
          {label}
        </button>,
      );
    } else {
      if (!warnedMissingInlineLinks.has(knowledgeId)) {
        console.warn(
          `[InlineKnowledgeLink] knowledgeId not found: ${knowledgeId}`,
        );
        warnedMissingInlineLinks.add(knowledgeId);
      }

      parts.push(
        <span
          key={`${keyPrefix}-${index}-${knowledgeId}`}
          className="rounded-sm px-1 text-slate-400 underline decoration-slate-300 underline-offset-2"
          title={`未找到知识点: ${knowledgeId}`}
        >
          {label}
        </span>,
      );
    }

    lastIndex = index + raw.length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
}

function TextList({
  items,
  ordered = false,
  limit,
}: {
  items: string[];
  ordered?: boolean;
  limit?: number;
}) {
  if (!items.length) {
    return <p className="text-slate-400">暂无</p>;
  }

  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;
  const hiddenCount = items.length - visibleItems.length;
  const Tag = ordered ? "ol" : "ul";

  return (
    <Tag
      className={[
        "space-y-1",
        ordered ? "list-decimal pl-5" : "list-disc pl-5",
      ].join(" ")}
    >
      {visibleItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
      {hiddenCount > 0 ? (
        <li className="text-slate-400">另有 {hiddenCount} 项，完整模式中展开。</li>
      ) : null}
    </Tag>
  );
}

function BodyBlocks({
  body,
  knowledgeId,
  onSelectKnowledge,
}: {
  body?: KnowledgeBodyBlock[];
  knowledgeId: string;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  if (!body?.length) {
    return null;
  }

  return (
    <Section title="正文导读">
      <div className="space-y-3">
        {body.map((block, index) => {
          const blockType = block.type ?? (block.items?.length ? "list" : "paragraph");

          if (blockType === "list") {
            return (
              <ul
                key={`${knowledgeId}-body-${index}`}
                className="list-disc space-y-1 pl-5"
              >
                {(block.items ?? []).map((item, itemIndex) => (
                  <li key={`${knowledgeId}-body-${index}-${itemIndex}`}>
                    {renderInlineKnowledgeContent(
                      item,
                      onSelectKnowledge,
                      `${knowledgeId}-body-${index}-${itemIndex}`,
                    )}
                  </li>
                ))}
              </ul>
            );
          }

          if (!block.content) {
            return null;
          }

          return (
            <p key={`${knowledgeId}-body-${index}`}>
              {renderInlineKnowledgeContent(
                block.content,
                onSelectKnowledge,
                `${knowledgeId}-body-${index}`,
              )}
            </p>
          );
        })}
      </div>
    </Section>
  );
}

function DetailsSection({
  knowledge,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  if (!knowledge.details?.length) {
    return null;
  }

  return (
    <Section title={fieldLabels.details}>
      <div className="space-y-2">
        {knowledge.details.map((detail) => (
          <details
            key={detail.id}
            className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <summary className="cursor-pointer text-sm font-medium text-slate-800">
              {detail.title}
            </summary>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {renderInlineKnowledgeContent(
                detail.content,
                onSelectKnowledge,
                `${knowledge.id}-detail-${detail.id}`,
              )}
            </p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function ReferencesSection({ knowledge }: { knowledge: KnowledgeNode }) {
  if (!knowledge.references?.length) {
    return null;
  }

  return (
    <Section title={fieldLabels.references}>
      <div className="space-y-2">
        {knowledge.references.map((reference) => (
          <div
            key={`${reference.type}-${reference.target}`}
            className="rounded-md border border-slate-200 bg-white px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-500">
                {referenceTypeLabels[reference.type]}
              </span>
              <span className="font-medium text-slate-800">
                {reference.title}
              </span>
            </div>
            <div className="mt-1 break-all text-xs text-slate-500">
              {reference.target}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function RelatedSection({
  knowledge,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  return (
    <Section title={fieldLabels.related}>
      {knowledge.related.length ? (
        <div className="flex flex-wrap gap-2">
          {knowledge.related.map((id) => (
            <button
              key={id}
              type="button"
              className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:border-blue-300 hover:bg-blue-100"
              onClick={() => onSelectKnowledge(id)}
            >
              {getKnowledgeLabel(id)}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">暂无</p>
      )}
    </Section>
  );
}

function ExamTemplatesSection({ knowledge }: { knowledge: KnowledgeNode }) {
  return (
    <Section title={fieldLabels.examTemplates}>
      {knowledge.examTemplates.length ? (
        <div className="space-y-4">
          {knowledge.examTemplates.map((template) => (
            <div
              key={template.title}
              className="border-l-2 border-blue-300 pl-3"
            >
              <div className="font-medium text-slate-900">{template.title}</div>
              <div className="mt-1 text-slate-600">规则: {template.rule}</div>
              <TextList items={template.steps} ordered />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">暂无</p>
      )}
    </Section>
  );
}

function FieldPills({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-slate-400">暂无</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function InputOutputGrid({ knowledge }: { knowledge: KnowledgeNode }) {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          {fieldLabels.input}
        </h4>
        <div className="mt-2 text-sm leading-6 text-slate-600">
          <TextList items={knowledge.input} />
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-slate-800">
          {fieldLabels.output}
        </h4>
        <div className="mt-2 text-sm leading-6 text-slate-600">
          <TextList items={knowledge.output} />
        </div>
      </div>
    </div>
  );
}

function stripInlineLinks(text: string): string {
  return text.replace(inlineLinkPattern, "$1");
}

function getUnderstandingGuide(knowledge: KnowledgeNode): string {
  const firstBodyText = knowledge.body
    ?.map((block) => block.content ?? block.items?.[0])
    .find(Boolean);

  return stripInlineLinks(
    firstBodyText ?? knowledge.summary ?? knowledge.mechanism[0] ?? "待补充",
  );
}

function getExamGuide(knowledge: KnowledgeNode): string {
  const firstTemplate = knowledge.examTemplates[0];

  return (
    knowledge.examRules[0] ??
    (firstTemplate ? `${firstTemplate.title}：${firstTemplate.rule}` : "待补充")
  );
}

function LearningGuide({
  knowledge,
  layerTitle,
}: {
  knowledge: KnowledgeNode;
  layerTitle: string;
}) {
  const items = [
    ["核心问题", knowledge.solves || "待补充"],
    ["所在位置", layerTitle || "待补充"],
    ["理解抓手", getUnderstandingGuide(knowledge)],
    ["考试抓手", getExamGuide(knowledge)],
  ];

  return (
    <section className="rounded-lg border border-blue-200 bg-blue-50 p-3">
      <h4 className="text-sm font-semibold text-blue-900">学习导读</h4>
      <div className="mt-3 grid gap-2 text-sm leading-6">
        {items.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[76px_1fr] gap-2">
            <span className="font-medium text-blue-800">{label}</span>
            <span className="text-slate-700">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function RelatedNameList({ ids }: { ids: string[] }) {
  return <TextList items={ids.map((id) => getKnowledgeLabel(id))} />;
}

function ComparisonTable({ knowledge }: { knowledge: KnowledgeNode }) {
  const rows = [
    ["比较对象", knowledge.related.length ? knowledge.related.map(getKnowledgeLabel).join(" / ") : "待补充"],
    ["判断规则", knowledge.examRules[0] ?? "待补充"],
    ["边界条件", knowledge.pitfalls[0] ?? "待补充"],
  ];

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[96px_1fr] border-b border-slate-200 text-sm last:border-b-0"
        >
          <div className="bg-slate-50 px-3 py-2 font-medium text-slate-700">
            {label}
          </div>
          <div className="px-3 py-2 text-slate-600">{value}</div>
        </div>
      ))}
    </div>
  );
}

function ConceptTemplate({
  knowledge,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  return (
    <>
      <Section title="核心问题">
        <p>{knowledge.solves}</p>
      </Section>
      <Section title={fieldLabels.definition}>
        <p>{knowledge.definition}</p>
      </Section>
      <Section title="它不是什么">
        <TextList items={knowledge.pitfalls.slice(0, 2)} />
      </Section>
      <Section title="边界 / 判别规则">
        <TextList items={knowledge.examRules} />
      </Section>
      <Section title="对比对象">
        <RelatedNameList ids={knowledge.related} />
      </Section>
      <Section title={fieldLabels.examRules}>
        <TextList items={knowledge.examRules} />
      </Section>
      <Section title={fieldLabels.pitfalls}>
        <TextList items={knowledge.pitfalls} />
      </Section>
      <RelatedSection knowledge={knowledge} onSelectKnowledge={onSelectKnowledge} />
    </>
  );
}

function ProtocolTemplate({
  knowledge,
  layerTitle,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  layerTitle: string;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  return (
    <>
      <Section title="核心问题">
        <p>{knowledge.solves}</p>
      </Section>
      <Section title={fieldLabels.layer}>
        <p>{layerTitle}</p>
      </Section>
      <Section title="服务对象">
        <TextList items={knowledge.input} />
      </Section>
      <Section title="PDU / 报文名称">
        <FieldPills items={knowledge.fieldsOrStates} />
      </Section>
      <Section title="关键字段">
        <FieldPills items={knowledge.fieldsOrStates} />
      </Section>
      <Section title="工作过程">
        <TextList items={knowledge.mechanism} ordered />
      </Section>
      <Section title={fieldLabels.solves}>
        <p>{knowledge.solves}</p>
      </Section>
      <Section title="不解决什么问题">
        <TextList items={knowledge.pitfalls.slice(0, 3)} />
      </Section>
      <InputOutputGrid knowledge={knowledge} />
      <Section title={fieldLabels.examRules}>
        <TextList items={knowledge.examRules} />
      </Section>
      <Section title={fieldLabels.pitfalls}>
        <TextList items={knowledge.pitfalls} />
      </Section>
      <RelatedSection knowledge={knowledge} onSelectKnowledge={onSelectKnowledge} />
    </>
  );
}

function MechanismTemplate({
  knowledge,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  return (
    <>
      <Section title="核心问题">
        <p>{knowledge.solves}</p>
      </Section>
      <Section title="为什么需要它">
        <p>{knowledge.definition}</p>
      </Section>
      <Section title="参与者">
        <FieldPills items={knowledge.fieldsOrStates} />
      </Section>
      <InputOutputGrid knowledge={knowledge} />
      <Section title="时间顺序 / 机制流程">
        <TextList items={knowledge.mechanism} ordered />
      </Section>
      <Section title="异常或失败处理">
        <TextList items={knowledge.pitfalls} />
      </Section>
      <Section title={fieldLabels.fieldsOrStates}>
        <FieldPills items={knowledge.fieldsOrStates} />
      </Section>
      <Section title={fieldLabels.examRules}>
        <TextList items={knowledge.examRules} />
      </Section>
      <Section title={fieldLabels.pitfalls}>
        <TextList items={knowledge.pitfalls} />
      </Section>
      <RelatedSection knowledge={knowledge} onSelectKnowledge={onSelectKnowledge} />
    </>
  );
}

function FormulaTemplate({
  knowledge,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  return (
    <>
      <Section title="核心问题">
        <p>{knowledge.solves}</p>
      </Section>
      <Section title={fieldLabels.formulas}>
        <TextList items={knowledge.formulas ?? []} />
      </Section>
      <Section title="变量含义">
        <FieldPills items={knowledge.fieldsOrStates} />
      </Section>
      <Section title="单位">
        <TextList items={knowledge.input} />
      </Section>
      <Section title="适用条件">
        <TextList items={knowledge.examRules} />
      </Section>
      <Section title="不适用情况">
        <TextList items={knowledge.pitfalls.slice(0, 3)} />
      </Section>
      <Section title="标准题型步骤">
        <TextList
          items={knowledge.examTemplates[0]?.steps ?? knowledge.mechanism}
          ordered
        />
      </Section>
      <Section title="易错换算">
        <TextList items={knowledge.pitfalls} />
      </Section>
      <ExamTemplatesSection knowledge={knowledge} />
      <RelatedSection knowledge={knowledge} onSelectKnowledge={onSelectKnowledge} />
    </>
  );
}

function ComparisonTemplate({
  knowledge,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  return (
    <>
      <Section title="一句话区别">
        <p>{knowledge.definition}</p>
      </Section>
      <Section title="对比表">
        <ComparisonTable knowledge={knowledge} />
      </Section>
      <Section title="判断规则">
        <TextList items={knowledge.examRules} />
      </Section>
      <Section title="典型题陷阱">
        <TextList items={knowledge.pitfalls} />
      </Section>
      <Section title="反例 / 边界">
        <TextList items={knowledge.fieldsOrStates} />
      </Section>
      <Section title={fieldLabels.examRules}>
        <TextList items={knowledge.examRules} />
      </Section>
      <RelatedSection knowledge={knowledge} onSelectKnowledge={onSelectKnowledge} />
    </>
  );
}

function ProcessTemplate({
  knowledge,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  return (
    <>
      <Section title="初始状态">
        <TextList items={knowledge.input} />
      </Section>
      <Section title="参与者">
        <FieldPills items={knowledge.fieldsOrStates} />
      </Section>
      <Section title="时间线">
        <TextList items={knowledge.mechanism} ordered />
      </Section>
      <Section title="每一步发生在哪一层">
        <p>{getLayerDisplayLabel(knowledge.layer)}</p>
      </Section>
      <InputOutputGrid knowledge={knowledge} />
      <Section title="每一跳地址变化">
        <TextList items={knowledge.fieldsOrStates} />
      </Section>
      <Section title="最终结果">
        <TextList items={knowledge.output} />
      </Section>
      <Section title="对应考点">
        <TextList items={knowledge.examRules} />
      </Section>
      <Section title={fieldLabels.pitfalls}>
        <TextList items={knowledge.pitfalls} />
      </Section>
      <RelatedSection knowledge={knowledge} onSelectKnowledge={onSelectKnowledge} />
    </>
  );
}

function ExamTemplateView({
  knowledge,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  return (
    <>
      <Section title="题型识别">
        <p>{knowledge.definition}</p>
      </Section>
      <Section title="核心公式 / 规则">
        <TextList
          items={[
            ...(knowledge.formulas ?? []),
            ...knowledge.examRules.slice(0, 2),
          ]}
        />
      </Section>
      <Section title="解题步骤">
        <TextList items={knowledge.mechanism} ordered />
      </Section>
      <Section title="单位换算">
        <TextList items={knowledge.input} />
      </Section>
      <Section title={fieldLabels.pitfalls}>
        <TextList items={knowledge.pitfalls} />
      </Section>
      <ExamTemplatesSection knowledge={knowledge} />
      <RelatedSection knowledge={knowledge} onSelectKnowledge={onSelectKnowledge} />
    </>
  );
}

function TemplateSections({
  knowledge,
  layerTitle,
  onSelectKnowledge,
}: {
  knowledge: KnowledgeNode;
  layerTitle: string;
  onSelectKnowledge: (knowledgeId: string) => void;
}) {
  const template = getTeachingTemplate(knowledge);

  if (template === "protocol") {
    return (
      <ProtocolTemplate
        knowledge={knowledge}
        layerTitle={layerTitle}
        onSelectKnowledge={onSelectKnowledge}
      />
    );
  }

  if (template === "mechanism") {
    return (
      <MechanismTemplate
        knowledge={knowledge}
        onSelectKnowledge={onSelectKnowledge}
      />
    );
  }

  if (template === "formula") {
    return (
      <FormulaTemplate
        knowledge={knowledge}
        onSelectKnowledge={onSelectKnowledge}
      />
    );
  }

  if (template === "comparison") {
    return (
      <ComparisonTemplate
        knowledge={knowledge}
        onSelectKnowledge={onSelectKnowledge}
      />
    );
  }

  if (template === "process") {
    return (
      <ProcessTemplate
        knowledge={knowledge}
        onSelectKnowledge={onSelectKnowledge}
      />
    );
  }

  if (template === "exam") {
    return (
      <ExamTemplateView
        knowledge={knowledge}
        onSelectKnowledge={onSelectKnowledge}
      />
    );
  }

  return (
    <ConceptTemplate
      knowledge={knowledge}
      onSelectKnowledge={onSelectKnowledge}
    />
  );
}

export function KnowledgeCard({
  knowledge,
  onSelectKnowledge,
}: KnowledgeCardProps) {
  const cardScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cardScrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [knowledge?.id]);

  if (!knowledge) {
    return (
      <div
        ref={cardScrollRef}
        data-scroll-panel="right"
        className="h-full min-h-0 overflow-y-auto p-5 text-sm text-slate-500"
      >
        请选择左侧层、层间连线或中间知识点。
      </div>
    );
  }

  const layerTitle =
    getLayerById(knowledge.layer)?.title ?? getLayerDisplayLabel(knowledge.layer);
  const meta = getKnowledgeDisplayMeta(knowledge);
  const isSummary = meta.displayMode === "summary";
  const teachingTemplate = getTeachingTemplate(knowledge);

  return (
    <div
      ref={cardScrollRef}
      data-scroll-panel="right"
      className="h-full min-h-0 overflow-y-auto"
    >
      <article className="space-y-5 p-5">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold uppercase text-blue-700">
              {fieldLabels.type}: {typeLabels[knowledge.type]}
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {fieldLabels.layer}: {layerTitle}
            </span>
            <span
              className={[
                "rounded-md border px-2 py-1 text-xs font-medium",
                importanceStyles[meta.importance],
              ].join(" ")}
            >
              {fieldLabels.importance}: {importanceLabels[meta.importance]}
            </span>
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
              {fieldLabels.examDepth}: {meta.examDepth}
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
              {fieldLabels.displayMode}: {displayModeLabels[meta.displayMode]}
            </span>
            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600">
              {fieldLabels.reviewPriority}: {meta.reviewPriority}
            </span>
            <span className="rounded-md border border-blue-200 bg-white px-2 py-1 text-xs font-medium text-blue-700">
              教学模板: {teachingTemplateLabels[teachingTemplate]}
            </span>
          </div>

          <h3 className="text-2xl font-semibold tracking-normal text-slate-950">
            {knowledge.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {knowledge.summary}
          </p>
        </div>

        {isSummary ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            该知识点为低频扩展，普通复习掌握摘要即可。
          </div>
        ) : null}

        <LearningGuide knowledge={knowledge} layerTitle={layerTitle} />

        <BodyBlocks
          body={knowledge.body}
          knowledgeId={knowledge.id}
          onSelectKnowledge={onSelectKnowledge}
        />

        <TemplateSections
          knowledge={knowledge}
          layerTitle={layerTitle}
          onSelectKnowledge={onSelectKnowledge}
        />

        <DetailsSection
          knowledge={knowledge}
          onSelectKnowledge={onSelectKnowledge}
        />
        <ReferencesSection knowledge={knowledge} />
      </article>
    </div>
  );
}
