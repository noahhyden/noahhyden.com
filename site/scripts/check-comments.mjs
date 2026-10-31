/** Absolute one-line comment guard: any multi-line block comment or run of `//` lines fails; no baseline. */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const EXT = new Set(['.ts', '.tsx', '.mjs'])
const SKIP = ['node_modules/', 'dist/', 'islands/', 'site/.cache/', '.claude/']
const PRAGMAS = ['eslint-disable', 'eslint-enable', '@ts-expect-error', '@ts-ignore', '@ts-nocheck', 'prettier-ignore', 'biome-ignore', '/// <reference', 'istanbul ignore', 'c8 ignore', 'SPDX-', 'Copyright', '!/usr/bin']
const GENERATED = /DO NOT EDIT|AUTO-?GENERATED|THIS FILE IS GENERATED|@generated/i

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

const candidates = execFileSync('git', ['ls-files'], { cwd: repoRoot, encoding: 'utf8' }).split('\n')
const files = candidates.filter((f) => f && EXT.has(extname(f)) && !f.endsWith('.d.ts') && !SKIP.some((s) => f.startsWith(s)))
if (files.length === 0) {
  console.error('check-comments: no candidate files matched - refusing to pass vacuously')
  process.exit(1)
}
const found = {}
for (const f of files) {
  if (!existsSync(join(repoRoot, f))) continue
  const v = violations(readFileSync(join(repoRoot, f), 'utf8'))
  if (v.length) found[f] = v
}
const total = Object.values(found).reduce((a, v) => a + v.length, 0)
console.log(`check-comments: scanned ${files.length} file(s), ${total} violation(s)`)
if (total) {
  for (const [f, v] of Object.entries(found)) for (const x of v) console.log(`  FAIL ${f}:${x.line}  comment spans ${x.span} lines`)
  console.log('\nExplanation in code is ONE line. Move the rest into an AGENTS.d rule (one line, 255 chars).')
  process.exit(1)
}
console.log('  OK')
