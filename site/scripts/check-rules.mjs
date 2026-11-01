/** An AGENTS.d rule is ONE line of at most 255 chars, listed in CLAUDE.md, governing files that still exist; see AGENTS.d/020. */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const RULE_RE = /^AGENTS\.d\/\d{3}-[a-z0-9-]+\.md$/;
const MAX_CHARS = 255;

const git = (...args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8" });
// --others too: a rule file added but not yet committed is exactly the one a sweep most needs checked.
const rules = git("ls-files", "--cached", "--others", "--exclude-standard")
  .split("\n")
  .filter((f) => RULE_RE.test(f));

// Markdown is never scanned by check-comments.mjs, so this guard is the only thing holding rule prose to one line.
const bodyOf = (text) =>
  text.replace(/^---\n[\s\S]*?\n---\n/, "").trimStart().replace(/^#+ .*\n/, "").trim();

const appliesTo = (text) => {
  const block = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!block) return [];
  return [...block[1].matchAll(/^\s*-\s*"?([^"\n]+?)"?\s*$/gm)].map((m) => m[1]);
};

// A guard that scans nothing must fail: a passing report over zero files is the shape that hides a broken glob.
if (rules.length === 0) {
  console.error("check-rules: no AGENTS.d rule files matched - refusing to pass vacuously");
  process.exit(1);
}

const tooLong = [];
const governNothing = [];
for (const rel of rules) {
  const text = readFileSync(join(REPO, rel), "utf8");
  const lines = bodyOf(text).split("\n").filter((l) => l.trim());
  const longest = Math.max(0, ...lines.map((l) => l.length));
  if (lines.length !== 1 || longest > MAX_CHARS) tooLong.push({ rel, n: lines.length, longest });
  for (const pattern of appliesTo(text)) {
    const hit = git("ls-files", "--cached", "--others", "--exclude-standard", "--", pattern).trim();
    if (hit === "") governNothing.push({ rel, pattern });
  }
}

// A rule absent from the CLAUDE.md index is a rule no agent loads; a listed rule that no longer exists is rot.
const index = readFileSync(join(REPO, "CLAUDE.md"), "utf8");
const unlisted = rules.filter((f) => !index.includes(f));
const listed = [...new Set([...index.matchAll(/AGENTS\.d\/\d{3}-[a-z0-9-]+\.md/g)].map((m) => m[0]))];
const stale = listed.filter((f) => !rules.includes(f));

console.log(`check-rules: scanned ${rules.length} rule file(s), ${listed.length} indexed in CLAUDE.md`);
for (const { rel, n, longest } of tooLong.sort((a, b) => b.longest - a.longest)) {
  console.log(`  FAIL ${rel}: ${n} body line(s), longest ${longest} chars`);
}
for (const { rel, pattern } of governNothing) {
  console.log(`  FAIL ${rel}: applies_to "${pattern}" matches no tracked file`);
}
for (const f of unlisted) console.log(`  FAIL ${f}: not listed in the CLAUDE.md rule index`);
for (const f of stale) console.log(`  FAIL ${f}: listed in CLAUDE.md but the file is gone`);

if (tooLong.length || governNothing.length || unlisted.length || stale.length) {
  console.log(`\nA rule is one line of at most ${MAX_CHARS} chars: keep the trap and its consequence, drop the rationale.`);
  process.exit(1);
}
console.log(`  OK - every body is 1 line and <= ${MAX_CHARS} chars, indexed, and governs tracked files`);
