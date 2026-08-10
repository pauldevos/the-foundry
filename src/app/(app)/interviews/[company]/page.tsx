import Link from "next/link";
import { notFound } from "next/navigation";

// Static company content — add entries here as prep matures for each company
const COMPANY_DATA: Record<string, CompanyPrep> = {
  "fff-enterprises": {
    name: "FFF Enterprises",
    vertical: "Pharma Distribution",
    role: "Director of AI / ML",
    contact: "Srihari Aravindakshan — Databricks Solutions Architect",
    status: "Active",
    overview:
      "FFF Enterprises is one of the largest US distributors of specialty pharmaceuticals, plasma products, and biologics. Their BioSupply portal handles order fulfillment, shortage management, and overage/shortage/damage (OS&D) claims across thousands of healthcare providers. They're a serious Databricks shop — presented their AgentBricks platform at Databricks Data + AI Summit 2026.",
    architecture: {
      title: "AgentBricks — Their Production AI Architecture",
      problem:
        "OS&D investigation (tracing overage/shortage/damage in pharmaceutical shipments) required cross-referencing SAP order data, warehouse picks, Salesforce CRM, FedEx shipping records, and video surveillance footage. Manual process: 10+ days. Every delayed resolution = delayed patient care.",
      flow: [
        {
          step: "1",
          label: "BioSupply Portal",
          detail: "Customer submits OS&D claim via web portal → triggers Salesforce case creation",
        },
        {
          step: "2",
          label: "Salesforce → Databricks",
          detail: "Case payload routed into Databricks via Salesforce connector. Raw data lands in Bronze layer (Unity Catalog).",
        },
        {
          step: "3",
          label: "Bronze → Silver → Gold (Unity Catalog)",
          detail: "Medallion architecture in UC. Bronze = raw ingestion. Silver = cleaned, joined facts. Gold = aggregated tables ready for agent consumption.",
        },
        {
          step: "4",
          label: "Supervisor Agent",
          detail: "Orchestrates investigation. Receives claim context, decides which sub-agents to invoke, aggregates results. Built on Databricks Model Serving with MLflow-tracked model.",
        },
        {
          step: "5",
          label: "5 Sub-Agents",
          detail:
            "SAP Agent (order/invoice data), Warehouse Agent (pick records, inventory logs), Salesforce Agent (CRM history, prior claims), FedEx Agent (shipping + tracking events), Video Agent (warehouse footage review via computer vision). Each returns structured findings.",
        },
        {
          step: "6",
          label: "Confidence Gate",
          detail: "Supervisor checks confidence scores across sub-agent responses. Low-confidence claims → escalate to human review. High-confidence → auto-resolve.",
        },
        {
          step: "7",
          label: "Summary Agent",
          detail: "Synthesizes findings into a resolution narrative. Writes back to Salesforce case with structured outcome + evidence citations.",
        },
        {
          step: "8",
          label: "Outcome",
          detail: "10+ days → 1–3 minutes. End-to-end automated OS&D resolution with full audit trail in Unity Catalog.",
        },
      ],
    },
    databricksServices: [
      {
        name: "Databricks Supervisor Agent",
        role: "Orchestrates the multi-agent OS&D investigation",
        link: "Declarative Automation Bundles deploy the agent pipeline",
      },
      {
        name: "Unity Catalog",
        role: "Bronze/Silver/Gold medallion tables, model registry, AI Search indexes",
        link: "UC governs all data access — sub-agents query via OBO (On-Behalf-Of) auth",
      },
      {
        name: "MLflow",
        role: "Tracks all agent models; @champion alias promoted to production via CI",
        link: "MLflow 3 traces → system.agent_traces (Delta) for full observability",
      },
      {
        name: "Databricks AI Search",
        role: "Vector search over historical OS&D cases, product catalog, shipping records",
        link: "Formerly called Vector Search — now AI Search endpoint → index naming",
      },
      {
        name: "Model Serving",
        role: "Hosts Supervisor Agent and sub-agent models as REST endpoints",
        link: "Provisioned throughput for predictable latency on high-volume claims",
      },
      {
        name: "Declarative Automation Bundles (DABs)",
        role: "CI/CD for the entire AgentBricks pipeline — bundle.yml deploys to dev/staging/prod",
        link: "Formerly Databricks Asset Bundles — official name now is Declarative Automation Bundles",
      },
    ],
    interviewAngles: [
      {
        question: "Why did you choose the Supervisor + sub-agent pattern over a single monolithic agent?",
        angle:
          "Decomposition enables specialization: each sub-agent is optimized for its data source (structured SAP vs. unstructured video). The Supervisor can route in parallel, reducing latency. And the confidence gate gives you a human-in-the-loop escape valve without redesigning the whole system.",
      },
      {
        question: "How do you handle agent failures in production?",
        angle:
          "Sub-agent failures return a low-confidence signal rather than crashing the pipeline. The Supervisor treats a missing sub-agent result as an incomplete investigation and routes to human review. DABs handle deployment rollback — if a new model version degrades accuracy, promote the previous @champion alias via MLflow.",
      },
      {
        question: "What's your eval strategy for the Supervisor Agent?",
        angle:
          "Two layers: (1) component-level — each sub-agent is evaluated against labeled historical claims (precision/recall on extracted fields). (2) end-to-end — ground truth from past manually-resolved cases, measuring time-to-resolution and agreement rate between AI decision and human resolution. MLflow tracks all eval runs.",
      },
      {
        question: "How does Unity Catalog governance play into this?",
        angle:
          "UC is the control plane for everything: data access (row-level security on patient/PHI-adjacent data), model lineage (every promoted model tracks its training dataset version), and AI Search indexes (who can query which index). OBO auth means the agent acts with the calling user's permissions, not a service account — critical for compliance.",
      },
      {
        question: "What's next for this platform as Director?",
        angle:
          "Three vectors: (1) Expand beyond OS&D — same architecture applies to demand forecasting and shortage prediction. (2) Improve the Video Agent — current CV model has ~82% accuracy on surveillance footage; fine-tuning on pharma-specific packaging. (3) Generative AI in the customer portal — Genie Agents for self-service claim status queries.",
      },
    ],
    studyMaterials: [
      { label: "Databricks 5-Dim Reference Guide", href: "/databricks-5dim.html", external: false },
      { label: "Agentic AI Deck", href: "/decks", external: false },
      { label: "Databricks Platform Notes", href: "/notes", external: false },
    ],
  },
  optum: null,
  "hi-fly-labs": null,
  "beautique-consulting": null,
  "supply-chain": null,
};

type CompanyPrep = {
  name: string;
  vertical: string;
  role: string;
  contact: string;
  status: string;
  overview: string;
  architecture: {
    title: string;
    problem: string;
    flow: { step: string; label: string; detail: string }[];
  };
  databricksServices: { name: string; role: string; link: string }[];
  interviewAngles: { question: string; angle: string }[];
  studyMaterials: { label: string; href: string; external: boolean }[];
} | null;

export default async function CompanyInterviewPage({
  params,
}: PageProps<"/interviews/[company]">) {
  const { company } = await params;

  if (!(company in COMPANY_DATA)) notFound();
  const data = COMPANY_DATA[company];

  if (!data) {
    return (
      <div>
        <Link href="/interviews" className="mb-6 inline-block text-sm text-slate-500 hover:text-amber-400">
          ← Interviews
        </Link>
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-8 text-center">
          <p className="font-serif text-xl text-slate-200">Prep coming soon</p>
          <p className="mt-2 text-sm text-slate-400">
            Company-specific content will be built as the interview progresses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/interviews" className="mb-4 inline-block text-sm text-slate-500 hover:text-amber-400">
        ← Interviews
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-slate-200">{data.name}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {data.vertical} · {data.role}
            </p>
            <p className="mt-1 font-mono text-xs text-slate-500">{data.contact}</p>
          </div>
          <span className="shrink-0 rounded-full border border-emerald-800 px-3 py-1 text-xs font-medium text-emerald-400">
            {data.status}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">{data.overview}</p>
      </div>

      {/* Architecture */}
      <section className="mb-8">
        <h2 className="mb-1 font-mono text-xs uppercase tracking-wide text-amber-400">
          {data.architecture.title}
        </h2>
        <p className="mb-4 text-sm text-slate-400">{data.architecture.problem}</p>
        <div className="space-y-2">
          {data.architecture.flow.map((item) => (
            <div
              key={item.step}
              className="flex gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3"
            >
              <span className="shrink-0 font-mono text-xs text-amber-600 mt-0.5">{item.step}</span>
              <div>
                <p className="text-sm font-medium text-slate-200">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Databricks Services */}
      <section className="mb-8">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">
          Databricks Services in Use
        </h2>
        <div className="space-y-2">
          {data.databricksServices.map((svc) => (
            <div
              key={svc.name}
              className="rounded-lg border border-slate-700 bg-slate-900 p-3"
            >
              <p className="text-sm font-medium text-slate-200">{svc.name}</p>
              <p className="mt-0.5 text-xs text-slate-300">{svc.role}</p>
              <p className="mt-0.5 text-xs text-slate-500">{svc.link}</p>
            </div>
          ))}
        </div>
        <Link
          href="/databricks-5dim.html"
          className="mt-3 inline-block text-xs text-amber-400 hover:underline"
        >
          Open Databricks 5-Dim Reference Guide →
        </Link>
      </section>

      {/* Interview Angles */}
      <section className="mb-8">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">
          Likely SA Questions + Angles
        </h2>
        <div className="space-y-3">
          {data.interviewAngles.map((qa, i) => (
            <details key={i} className="rounded-lg border border-slate-700 bg-slate-900">
              <summary className="cursor-pointer p-4 text-sm text-stone-200 hover:text-amber-400">
                {qa.question}
              </summary>
              <p className="border-t border-slate-700 px-4 pb-4 pt-3 text-sm leading-relaxed text-slate-300">
                {qa.angle}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Study Materials */}
      <section>
        <h2 className="mb-3 font-mono text-xs uppercase tracking-wide text-amber-400">
          Prep Materials
        </h2>
        <div className="flex flex-wrap gap-2">
          {data.studyMaterials.map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="rounded-lg border border-stone-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:border-amber-500 hover:text-amber-400"
            >
              {m.label}
            </Link>
          ))}
          <Link
            href="/topics/platforms"
            className="rounded-lg border border-stone-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:border-amber-500 hover:text-amber-400"
          >
            Platforms Topic →
          </Link>
          <Link
            href="/topics/agentic-ai"
            className="rounded-lg border border-stone-700 bg-slate-900 px-3 py-2 text-sm text-slate-300 hover:border-amber-500 hover:text-amber-400"
          >
            Agentic AI Topic →
          </Link>
        </div>
      </section>
    </div>
  );
}
