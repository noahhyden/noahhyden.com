# noahhyden.com

Source for [noahhyden.com](https://noahhyden.com) — a portfolio built in Claude's
design canvas ("Lusitanian portfolio design system").

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home (renamed from `Home.dc.html`) |
| `About.dc.html` | About |
| `Projects.dc.html` | Projects — pulls public repos **live from the GitHub API** |
| `Writing.dc.html` | Writing |
| `Design Language.dc.html` | Design-system reference (not linked from the nav) |

Each page is a design-canvas document: an `<x-dc>` template rendered client-side by
`support.js`, which loads React, ReactDOM, and Babel from the unpkg CDN at runtime.
So the site **does make external requests at runtime** (unpkg for the runtime, the
GitHub API for the projects list) — this is intentional, not a build step.

`screenshots/`, `uploads/`, and `.thumbnail` are canvas artifacts kept with the
export; they aren't part of the served site.

## Deploy

Plain static hosting — no build command.

- **Cloudflare Pages**: connect this repo, framework preset "None", build command
  empty, output directory `/`.
- **GitHub Pages**: serve from the repo root on the default branch; add a `CNAME`
  file containing `noahhyden.com` if using a custom domain here.

A browser with internet access (unpkg + GitHub API) is required to render.

## Editing

The `.dc.html` files are the design-canvas sources — re-import them into Claude to
keep editing the design.
