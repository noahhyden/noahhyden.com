/** One-line comment guard with a shrink-only per-file baseline; usage: check | --report | --update | --init | --dir <base> [--baseline <file>]. */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const EXT = new Set(['.ts', '.tsx', '.mjs'])
const SKIP = ['node_modules/', 'dist/', 'islands/', 'site/.cache/', '.claude/']
const PRAGMAS = ['eslint-disable', 'eslint-enable', '@ts-expect-error', '@ts-ignore', '@ts-nocheck', 'prettier-ignore', 'biome-ignore', '/// <reference', 'istanbul ignore', 'c8 ignore', 'SPDX-', 'Copyright', '!/usr/bin']
const GENERATED = /DO NOT EDIT|AUTO-?GENERATED|THIS FILE IS GENERATED|@generated/i

const args = process.argv.slice(2)
const opt = (name) => (args.includes(name) ? resolve(args[args.indexOf(name) + 1]) : null)
const dirBase = opt('--dir')
const base = dirBase ?? repoRoot
const baselinePath = opt('--baseline') ?? (dirBase ? null : join(repoRoot, 'site/scripts/comment-baseline.json'))

const hasPragma = (lines) => lines.some((l) => PRAGMAS.some((p) => l.includes(p)))

/** Each violation is { line, span } for a multi-line block comment or a run of `//` lines. */
function violations(text) {
  if (GENERATED.test(text.split('\n').slice(0, 40).join('\n'))) return []
  const lines = text.split('\n')
  const out = []
  let run = []
  const flushRun = () => {
    if (run.length > 1 && !hasPragma(run.map((n) => lines[n - 1]))) out.push({ line: run[0], span: run.length })
    run = []
  }
  let jsxRun = []
  const flushJsx = () => {
    if (jsxRun.length > 1 && !hasPragma(jsxRun.map((n) => lines[n - 1]))) out.push({ line: jsxRun[0], span: jsxRun.length })
    jsxRun = []
  }
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i].trim()
    if (s.startsWith('//')) {
      if (run.length && run.at(-1) !== i) flushRun()
      run.push(i + 1)
      continue
    }
    flushRun()
    // JSX: only a line that STARTS with `{/*` counts (own-line comment). Mid-line, attribute and template-literal `{/*` are skipped on purpose: a false positive fails CI on legitimate code.
    const jsx = s.startsWith('{/*')
    if (jsx && s.includes('*/')) {
      if (jsxRun.length && jsxRun.at(-1) !== i) flushJsx()
      jsxRun.push(i + 1)
      continue
    }
    flushJsx()
    if ((s.startsWith('/*') || jsx) && !s.slice(2).includes('*/')) {
      let j = i
      while (j < lines.length && !lines[j].includes('*/')) j++
      const block = lines.slice(i, j + 1)
      if (!hasPragma(block)) out.push({ line: i + 1, span: block.length })
      i = j
    }
  }
  flushRun()
  flushJsx()
  return out
}

function walk(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) { if (e.name !== 'node_modules' && e.name !== '.git' && e.name !== '.next') walk(p, acc) }
    else acc.push(relative(base, p))
  }
  return acc
}

const candidates = dirBase ? walk(base) : execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' }).split('\n')
const files = candidates.filter((f) => f && EXT.has(extname(f)) && !f.endsWith('.d.ts') && (dirBase || !SKIP.some((s) => f.startsWith(s))))
const found = {}
for (const f of files) {
  if (!existsSync(join(base, f))) continue
  const v = violations(readFileSync(join(base, f), 'utf8'))
  if (v.length) found[f] = v
}
const counts = Object.fromEntries(Object.entries(found).map(([f, v]) => [f, v.length]))
const total = Object.values(counts).reduce((a, b) => a + b, 0)
const readBaseline = () => (baselinePath && existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')).files : {})
const save = (files) => writeFileSync(baselinePath, `${JSON.stringify({ files: Object.fromEntries(Object.entries(files).sort()) }, null, 2)}\n`)

if (args.includes('--report')) {
  const spans = Object.entries(found).flatMap(([f, v]) => v.map((x) => ({ f, ...x })))
  const biggest = spans.sort((a, b) => b.span - a.span)[0]
  const byDir = {}
  for (const [f, n] of Object.entries(counts)) {
    const d = f.split('/').slice(0, -1).slice(0, 2).join('/') || '(root)'
    byDir[d] = (byDir[d] ?? 0) + n
  }
  const top = (o, n) => Object.entries(o).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, n)
  const lines = spans.reduce((a, x) => a + x.span, 0)
  console.log(`Scanned ${files.length} files. Violations: ${total} across ${Object.keys(counts).length} files, ${lines} comment lines in total.\n`)
  console.log('Ten worst files:')
  for (const [f, n] of top(counts, 10)) console.log(`  ${n}  ${f}`)
  console.log(`\nBiggest single block: ${biggest?.span} lines at ${biggest?.f}:${biggest?.line}`)
  console.log('\nViolations by directory:')
  for (const [d, n] of top(byDir, 12)) console.log(`  ${n}  ${d}  (${((n / total) * 100).toFixed(1)}%)`)
  process.exit(0)
}

if (args.includes('--init') || args.includes('--update')) {
  const old = readBaseline()
  if (args.includes('--init')) {
    if (existsSync(baselinePath)) { console.error('check-comments: baseline exists; use --update to ratchet it down'); process.exit(1) }
    save(counts)
    console.log(`check-comments: baseline created - ${total} violation(s) in ${Object.keys(counts).length} file(s)`)
    process.exit(0)
  }
  const grew = Object.entries(counts).filter(([f, n]) => n > (old[f] ?? 0))
  if (grew.length) { console.error(`check-comments: refusing to raise the baseline:\n${grew.map(([f, n]) => `  ${f}: ${n} > ${old[f] ?? 0}`).join('\n')}`); process.exit(1) }
  save(counts)
  console.log(`check-comments: baseline ratcheted down to ${total} violation(s) in ${Object.keys(counts).length} file(s)`)
  process.exit(0)
}

if (baselinePath && !existsSync(baselinePath)) { console.error(`check-comments: missing ${baselinePath}; create it once with --init`); process.exit(2) }
const baseline = readBaseline()
const over = Object.entries(counts).filter(([f, n]) => n > (baseline[f] ?? 0))
console.log(`check-comments: scanned ${files.length} file(s), ${total} violation(s), baseline ${Object.values(baseline).reduce((a, b) => a + b, 0)}`)
if (over.length) {
  for (const [f, n] of over) {
    console.log(`  FAIL ${f}: ${n} > ${baseline[f] ?? 0} allowed`)
    for (const v of found[f].slice(0, 4)) console.log(`      ${f}:${v.line}  comment spans ${v.span} lines`)
  }
  console.log('\nExplanation in code is ONE line. Move the rest into an AGENTS.d rule (one line, 255 chars).')
  process.exit(1)
}
if (Object.entries(baseline).some(([f, n]) => (counts[f] ?? 0) < n)) console.log('  A count went DOWN: run `npm run check:comments:update` to lock it in.')
console.log('  OK')
