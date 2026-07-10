/**
 * Papers - the working papers from the von-neumann project (vn.noahhyden.com).
 * That repo is the source of truth: each paper lives under papers/<slug>/ with a
 * paper.json describing it, and CI typesets the PDF and publishes it beside the
 * live site at https://vn.noahhyden.com/papers/<slug>.pdf.
 *
 * This page mirrors that list. `getData` runs at BUILD time: it reads the paper
 * metadata straight from the von-neumann repo on GitHub, so the shipped page is
 * static HTML with the papers baked in and makes zero runtime requests. We check
 * von-neumann for updates here; von-neumann never reaches back to this site. If
 * the build-time fetch fails, we prerender the same graceful fallback the
 * projects page uses.
 */
import type { Child } from "pimas-ui/dom";
import type { PageMeta } from "../design.js";
import { Shell } from "../components/Shell.js";
import { ArrowIcon } from "../components/icons.js";

export const meta: PageMeta = {
  path: "/papers/",
  title: "Papers",
  description:
    "Working papers from the von-neumann project: longer-form write-ups, each typeset in LaTeX and published as a PDF.",
};

/** The live von-neumann site papers are published beside. */
const VN_SITE = "https://vn.noahhyden.com";
const VN_REPO = "https://github.com/noahhyden/von-neumann";

interface Author {
  name: string;
  affiliation: string;
  orcid: string;
}

interface Paper {
  slug: string;
  title: string;
  authors: Author[];
  abstract: string;
  date: string;
  keywords: string[];
  citeCount: number;
  /** The typeset PDF, published beside the live von-neumann site. */
  pdf: string;
  /** The paper's source directory in the von-neumann repo. */
  source: string;
}

const GH_HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "noahhyden.com-build",
};

/** Sanitize upstream prose to the repo's typography rules: no em-dash (U+2014),
 * and fold the LaTeX double-hyphen (`--`, used for en/em dashes in the source)
 * down to a single spaced hyphen so the abstract reads cleanly as HTML. */
function clean(s: string): string {
  return String(s)
    .replace(/—/g, "-")
    .replace(/\s*--\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Runs at build time (Node). Reads every paper from the von-neumann repo. */
export async function getData(): Promise<{ papers: Paper[]; error: boolean }> {
  try {
    // 1. List papers/<slug>/ directories in the repo.
    const listRes = await fetch(
      "https://api.github.com/repos/noahhyden/von-neumann/contents/papers",
      { headers: GH_HEADERS },
    );
    if (!listRes.ok) throw new Error("contents status " + listRes.status);
    const entries = await listRes.json();
    const slugs: string[] = (Array.isArray(entries) ? entries : [])
      .filter((e) => e.type === "dir" && e.name !== "scripts" && e.name !== "node_modules")
      .map((e) => e.name);

    // 2. Read each paper's paper.json (raw), in parallel.
    const papers = (
      await Promise.all(
        slugs.map(async (slug) => {
          const res = await fetch(
            `https://raw.githubusercontent.com/noahhyden/von-neumann/main/papers/${slug}/paper.json`,
            { headers: { "User-Agent": "noahhyden.com-build" } },
          );
          if (!res.ok) return null;
          const p = await res.json();
          if (!p || !p.title) return null; // scaffold-only dir, skip
          const paper: Paper = {
            slug: p.slug || slug,
            title: clean(p.title),
            authors: (p.authors || []).map((a: Author) => ({
              name: (a.name || "").trim(),
              affiliation: (a.affiliation || "").trim(),
              orcid: (a.orcid || "").trim(),
            })),
            abstract: clean(p.abstract || ""),
            date: p.date || "",
            keywords: (p.keywords || []).map((k: string) => k.trim()),
            citeCount: Array.isArray(p.cites) ? p.cites.length : 0,
            pdf: `${VN_SITE}/papers/${p.slug || slug}.pdf`,
            source: `${VN_REPO}/tree/main/papers/${p.slug || slug}`,
          };
          return paper;
        }),
      )
    ).filter((p): p is Paper => p !== null);

    // Newest first.
    papers.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return { papers, error: false };
  } catch {
    return { papers: [], error: true };
  }
}

function Authors(props: { authors: Author[] }) {
  const parts: Child[] = [];
  props.authors.forEach((a, i) => {
    const label = a.affiliation ? `${a.name} (${a.affiliation})` : a.name;
    parts.push(i > 0 ? <span>, </span> : null);
    parts.push(<span>{label}</span>);
    if (a.orcid) {
      parts.push(
        <a className="ln" href={`https://orcid.org/${a.orcid}`} target="_blank" rel="noopener" style="color:var(--ocean); border-bottom:1px solid var(--line); margin-left:6px;">
          ORCID {a.orcid}
        </a>,
      );
    }
  });
  return <span>{parts}</span>;
}

function PaperArticle(props: { p: Paper }) {
  const p = props.p;
  return (
    <article style="border-top:1px solid var(--line); padding:36px 0 40px;">
      <div style="font-family:var(--mono); font-size:12px; letter-spacing:.06em; color:var(--granite); margin:0 0 14px;">
        <span style="color:var(--falu);">{p.date}</span>
        <span style="margin:0 10px; color:var(--line);">/</span>
        paper
        {p.citeCount > 0 ? (
          <span>
            <span style="margin:0 10px; color:var(--line);">/</span>
            {String(p.citeCount)} references
          </span>
        ) : null}
      </div>

      <h2 style="font-family:var(--serif); font-weight:600; font-size:29px; line-height:1.18; letter-spacing:-.015em; color:var(--ink); margin:0 0 12px; max-width:34ch;">
        {p.title}
      </h2>

      <p style="font-family:var(--sans); font-size:14px; line-height:1.5; color:var(--granite); margin:0 0 20px;">
        <Authors authors={p.authors} />
      </p>

      <p style="font-family:var(--sans); font-size:15.5px; line-height:1.7; color:var(--ink); margin:0 0 20px; max-width:74ch;">
        {p.abstract}
      </p>

      {p.keywords.length > 0 ? (
        <div style="display:flex; flex-wrap:wrap; gap:8px; margin:0 0 24px;">
          {p.keywords.map((k) => (
            <span style="font-family:var(--mono); font-size:11px; letter-spacing:.02em; color:var(--granite); background:var(--surface); border:1px solid var(--line); border-radius:2px; padding:4px 9px;">
              {k}
            </span>
          ))}
        </div>
      ) : null}

      <div style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
        <a className="btn" href={p.pdf} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:14px; padding:11px 20px; border-radius:2px; background:var(--laurel); color:var(--ground);">
          Read the typeset PDF <ArrowIcon size={15} />
        </a>
        <a className="ln" href={p.source} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:13px; color:var(--ocean); border-bottom:1px solid var(--line); padding-bottom:2px;">
          Source on GitHub
        </a>
      </div>
    </article>
  );
}

function ErrorBlock() {
  return (
    <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:28px; display:flex; gap:14px; align-items:flex-start;">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--falu)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="flex:none; margin-top:1px;"><circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="13" /><line x1="12" y1="16" x2="12" y2="16.5" /></svg>
      <div>
        <div style="font-family:var(--serif); font-weight:600; font-size:19px; margin-bottom:6px;">Couldn&rsquo;t reach the von-neumann repo at build time</div>
        <p style="font-family:var(--sans); font-size:15px; line-height:1.55; color:var(--granite); margin:0 0 14px;">The paper list usually bakes in at build. The papers themselves are always live on the project site.</p>
        <a className="btn" href={`${VN_SITE}/#/papers`} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--sans); font-weight:500; font-size:14px; padding:10px 18px; border-radius:2px; background:var(--falu); color:var(--ground);">Open the papers on vn.noahhyden.com &rarr;</a>
      </div>
    </div>
  );
}

export default function Papers(props: { papers?: Paper[]; error?: boolean }) {
  const papers = props.papers ?? [];
  const error = props.error ?? false;
  const hasPapers = !error && papers.length > 0;
  const isEmpty = !error && papers.length === 0;
  const count = papers.length;

  return (
    <Shell active="papers">
      <header style="max-width:1080px; margin:0 auto; padding:80px clamp(20px,5vw,40px) 40px;">
        <div style="display:flex; align-items:baseline; justify-content:space-between; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="font-family:var(--mono); font-size:12px; letter-spacing:.18em; text-transform:uppercase; color:var(--granite); margin:0 0 22px;">Papers - from the von-neumann project</div>
            <h1 style="font-family:var(--serif); font-weight:500; font-size:clamp(34px,7vw,52px); line-height:1.05; letter-spacing:-.022em; margin:0; max-width:20ch;">Working papers.</h1>
          </div>
          <a href={`${VN_SITE}`} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:13px; color:var(--falu); border-bottom:1px solid var(--falu); padding-bottom:2px;">vn.noahhyden.com &rarr;</a>
        </div>
        <p style="font-family:var(--sans); font-size:17px; line-height:1.6; color:var(--granite); margin:24px 0 0; max-width:64ch;">
          Longer-form write-ups from <a className="ln" href={VN_SITE} target="_blank" rel="noopener" style="color:var(--ink); border-bottom:1px solid var(--line);">the von-neumann project</a>, each developing a single result in depth. Every paper is typeset in LaTeX and its bibliography is drawn from the same source list that powers the project&rsquo;s live models, so a claim in a paper and a claim on a live surface point at the identical reference. Read straight off that repo at build time, newest first.
        </p>
      </header>

      <main style="max-width:1080px; margin:0 auto; padding:8px clamp(20px,5vw,40px) 40px;">
        {error ? <ErrorBlock /> : null}
        {hasPapers ? (
          <div>
            <div style="font-family:var(--mono); font-size:12px; letter-spacing:.06em; color:var(--granite); margin:0 0 4px;">
              {count === 1 ? "1 paper" : `${count} papers`}
            </div>
            {papers.map((p) => <PaperArticle p={p} />)}
            <div style="border-top:1px solid var(--line); padding-top:24px; margin-top:4px;">
              <a href={`${VN_SITE}/#/papers`} target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:9px; font-family:var(--sans); font-weight:500; font-size:15px; padding:13px 24px; border-radius:2px; border:1px solid var(--granite); color:var(--ink);">
                See the papers on vn.noahhyden.com <ArrowIcon size={16} />
              </a>
            </div>
          </div>
        ) : null}
        {isEmpty ? (
          <div style="border:1px solid var(--line); border-radius:3px; background:var(--surface); padding:40px; text-align:center;">
            <p style="font-family:var(--sans); font-size:16px; color:var(--granite); margin:0;">No papers published yet - check back soon.</p>
          </div>
        ) : null}
      </main>
    </Shell>
  );
}
