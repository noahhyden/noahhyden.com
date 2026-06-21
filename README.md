# noahhyden.com

Source for [noahhyden.com](https://noahhyden.com), a single static page.

`index.html` is fully self-contained (inline CSS, no external requests, no build
step), so it can be served as-is from Cloudflare Pages or GitHub Pages.

Status: first-pass scaffold. Design is being reworked.

## Deploy

- **Cloudflare Pages**: connect this repo, framework preset "None", build command
  empty, output directory `/`.
- **GitHub Pages**: serve from the repo root on the default branch; add a `CNAME`
  file containing `noahhyden.com` if using a custom domain here.

## TODO before launch

- Replace the Cal.com booking placeholder (appears twice in `index.html`).
- Replace the contact email placeholder.
