import "server-only";
import fs from "node:fs";
import path from "node:path";

export type TopicEntry = {
  slug: string;
  label: string;
  description: string;
  domains: string[];
  keywords: string[];
};

export type TopicsManifest = { topics: TopicEntry[] };

let cached: TopicsManifest | null = null;

export function getTopicsManifest(): TopicsManifest {
  if (cached) return cached;
  const file = path.join(process.cwd(), "learning", "topics.json");
  if (!fs.existsSync(file)) return { topics: [] };
  cached = JSON.parse(fs.readFileSync(file, "utf-8")) as TopicsManifest;
  return cached;
}

/** Returns true if content with the given topicSlug (and optional domain) belongs to this topic. */
export function contentMatchesTopic(
  topic: TopicEntry,
  topicSlug: string,
  domain?: string
): boolean {
  if (domain && topic.domains.includes(domain)) return true;
  const slug = topicSlug.toLowerCase();
  // topicSlug may be prefixed by a domain slug (e.g. "rag-pipeline-01-ingestion")
  if (topic.domains.some((d) => slug === d || slug.startsWith(d + "-"))) return true;
  return topic.keywords.some((kw) => slug.includes(kw.toLowerCase()));
}
