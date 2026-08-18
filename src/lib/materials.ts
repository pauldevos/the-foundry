export type ReferenceGuide = {
  title: string;
  href: string;
  topic: string;
  description: string;
};

export const databricksGuides: ReferenceGuide[] = [
  { title: "Databricks Apps", href: "/databricks-apps-5dim.html", topic: "01 · Runtime + integrations", description: "App identity, user authorization, resources, AppKit vs React, APIs, embedding, and runtime boundaries." },
  { title: "AI services", href: "/databricks-ai-services-5dim.html", topic: "02 · Search + agents", description: "AI Search, Knowledge Assistant, Genie, Agent Bricks, serving, evaluation, and external-stack tradeoffs." },
  { title: "Deployment + CI/CD", href: "/databricks-deployment-5dim.html", topic: "03 · Bundles + GitHub Actions", description: "Declarative Automation Bundles, OIDC, promotion, health checks, rollback, and app-specific failure modes." },
  { title: "VS Code development flow", href: "/databricks-dev-flow-5dim.html", topic: "04 · Connect + local debug", description: "CLI profiles, Databricks Connect, apps run-local, AppKit, AI assistants, tests, and Free Edition boundaries." },
  { title: "Identity + governance", href: "/databricks-security-5dim.html", topic: "05 · OAuth + Unity Catalog", description: "App service principals, OBO/user authorization, OAuth, Unity Catalog, secrets, network, and audit decisions." },
  { title: "Databricks study map", href: "/databricks-study.html", topic: "Start here", description: "The recommended sequence through all five deep dives and the three portfolio applications." },
];

// These guides are intentionally listed instead of discovered from public/.
// Their filenames are implementation detail; this is the readable library
// catalog used by the app.
export const referenceGuides: ReferenceGuide[] = [
  { title: "RAG overview", href: "/rag-overview.html", topic: "RAG", description: "High-level map of RAG concepts and choices." },
  { title: "RAG pipeline, layer by layer", href: "/rag-layers-5dim.html", topic: "RAG", description: "A five-dimension reference for the end-to-end pipeline." },
  { title: "Evals overview", href: "/evals-overview.html", topic: "Evals", description: "Core evaluation concepts and practice." },
  { title: "Agentic AI overview", href: "/agentic-ai-overview.html", topic: "Agentic AI", description: "Patterns, trade-offs, and operating model." },
  { title: "LLM core overview", href: "/llm-core-overview.html", topic: "LLM Core", description: "Models, prompting, reasoning, and adaptation." },
  { title: "Production overview", href: "/production-overview.html", topic: "Production", description: "Deployment, observability, and operating concerns." },
  { title: "Governance overview", href: "/governance-overview.html", topic: "Governance", description: "Safety, compliance, and controls." },
  { title: "Strategy overview", href: "/strategy-overview.html", topic: "Strategy", description: "Roadmaps, choices, and organizational framing." },
  { title: "Platforms overview", href: "/platforms-overview.html", topic: "Platforms", description: "A map of the tools and platform layer." },
  { title: "Databricks full platform reference", href: "/databricks-5dim.html", topic: "Databricks", description: "Broad platform reference for architecture and interview-ready depth." },
  { title: "LangGraph, five dimensions", href: "/langgraph-5dim.html", topic: "Agentic AI", description: "A focused framework reference." },
];
