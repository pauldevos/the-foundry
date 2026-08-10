import Link from "next/link";

const COMPANIES = [
  {
    slug: "fff-enterprises",
    name: "FFF Enterprises",
    vertical: "Pharma Distribution",
    role: "Director of AI / ML",
    status: "Active",
    context:
      "Srihari Aravindakshan (Databricks SA). Built AgentBricks on Databricks — Supervisor Agent + 5 sub-agents reduced OS&D investigation from 10+ days to 1–3 minutes.",
    tags: ["Databricks", "Agentic AI", "UC", "MLflow"],
  },
  {
    slug: "optum",
    name: "Optum",
    vertical: "Healthcare",
    role: "Director of AI",
    status: "Active",
    context:
      "UnitedHealth Group subsidiary. Healthcare AI at scale — prior authorization, clinical decision support, formulary lookup, compliance-heavy RAG.",
    tags: ["RAG", "Healthcare", "Compliance", "LLMs"],
  },
  {
    slug: "hi-fly-labs",
    name: "Hi Fly Labs",
    vertical: "Technology",
    role: "AI Director",
    status: "Active",
    context: "Databricks Apps focus. Likely building internal AI applications on top of the Databricks platform.",
    tags: ["Databricks Apps", "Platforms"],
  },
  {
    slug: "beautique-consulting",
    name: "Beautique Consulting",
    vertical: "Consulting",
    role: "Director / Principal AI",
    status: "Prep Phase",
    context: "AI consulting firm. Broad generalist AI strategy and implementation.",
    tags: ["Strategy", "Consulting"],
  },
  {
    slug: "supply-chain",
    name: "Supply Chain (TBD)",
    vertical: "Logistics / Supply Chain",
    role: "AI Director",
    status: "Prep Phase",
    context: "Unnamed supply chain company. Likely: shipment exception handling, demand forecasting, vendor contract RAG.",
    tags: ["RAG", "Agentic AI", "Production"],
  },
];

const statusColor: Record<string, string> = {
  Active: "border-emerald-800 text-emerald-400",
  "Prep Phase": "border-amber-800 text-amber-500",
};

export default function InterviewsPage() {
  return (
    <div>
      <h1 className="mb-2 font-serif text-2xl text-stone-100">Interviews</h1>
      <p className="mb-6 text-sm text-stone-400">
        Company-specific prep — architecture context, likely questions, and study material links.
      </p>

      <div className="space-y-3">
        {COMPANIES.map((co) => (
          <Link
            key={co.slug}
            href={`/interviews/${co.slug}`}
            className="block rounded-lg border border-stone-800 bg-stone-900 p-4 hover:border-amber-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-stone-100">{co.name}</p>
                <p className="mt-0.5 text-xs text-stone-400">
                  {co.vertical} · {co.role}
                </p>
                <p className="mt-2 text-sm text-stone-300">{co.context}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {co.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-stone-700 px-2 py-0.5 font-mono text-xs text-stone-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor[co.status] ?? "border-stone-700 text-stone-400"}`}
              >
                {co.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
