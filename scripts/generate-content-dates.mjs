// Generates learning/.content-dates.json — a { relPath: firstCommitISODate } manifest
// for every file under learning/. Runs automatically before "build" and "dev" (see
// package.json's predev/prebuild scripts) so it's always fresh, never a manual step.
//
// Why this exists instead of just sorting by file mtime: Vercel builds from a fresh git
// checkout, and `git checkout` resets every file's filesystem timestamp to checkout time —
// it does not preserve original commit dates. A naive fs.stat().mtime sort would look
// correct locally and be meaningless (everything the same timestamp) in production. The
// actual "date created" signal has to come from git history, computed once at build time,
// not read live from the filesystem at request time (the deployed function doesn't have
// .git bundled into it at all).

import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const learningDir = path.join(repoRoot, "learning");

function listTrackedFiles() {
  const out = execFileSync("git", ["ls-files", "learning"], { cwd: repoRoot, encoding: "utf-8" });
  return out.split("\n").filter(Boolean);
}

function firstCommitDate(relPath) {
  try {
    const out = execFileSync(
      "git",
      ["log", "--diff-filter=A", "--follow", "--format=%aI", "--", relPath],
      { cwd: repoRoot, encoding: "utf-8" }
    ).trim();
    if (!out) return null;
    const lines = out.split("\n");
    return lines[lines.length - 1]; // oldest = last line, git log defaults newest-first
  } catch {
    return null;
  }
}

const files = listTrackedFiles();
const dates = {};
for (const relToRepo of files) {
  const relToLearning = path.relative(learningDir, path.join(repoRoot, relToRepo));
  const date = firstCommitDate(relToRepo);
  if (date) dates[relToLearning] = date;
}

writeFileSync(path.join(learningDir, ".content-dates.json"), JSON.stringify(dates, null, 2));
console.log(`generate-content-dates: wrote ${Object.keys(dates).length} entries`);
