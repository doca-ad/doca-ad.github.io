# DOCA Architecture & Design — site

Portfolio site for DOCA Architecture & Design (Bucharest). Vite 5 + React 18 + TypeScript +
Tailwind 3 + shadcn/ui + framer-motion. Client-side SPA, react-router v6.

> An Astro migration is planned (see "Roadmap"). Until it lands, treat the SPA constraints
> below as real: metadata, routing and images all have workarounds that Astro will remove.

## Deploying — ALWAYS STAGING FIRST

**Never deploy straight to production.** DOCA review changes on staging before they go public.
The standing instruction from the site owner is: ship to staging, get sign-off, then promote.

```bash
npm run deploy:staging    # build:staging + upload -> https://staging.docastudio.ro
npm run verify:staging    # every route must be 200 (or 302 to Access), never 404
```

**Use `build:staging`, never plain `build`, for anything deployed to a staging host.** It adds
`robots.txt: Disallow /` and `X-Robots-Tag: noindex`. Cloudflare only auto-noindexes *preview*
deployments; staging is the *production* deployment of its own project, so without this it is a
fully indexable duplicate of docastudio.ro competing for the same queries.

Verify before telling anyone it is ready:

```bash
for u in / /projects /info /contact; do
  printf "%-11s " "$u"; curl -s -o /dev/null -w "%{http_code}\n" "https://staging.docastudio.ro$u"
done                                            # every route must be 200, not 404
```

Production promotion is a **separate, explicit decision** — ask the user first, every time.

## Hosting

| Environment | Pages project       | Production branch | Domain                  | Auth |
|-------------|---------------------|-------------------|-------------------------|------|
| Staging     | `doca-staging`      | `staging`         | `staging.docastudio.ro` | Cloudflare Access, 3 emails |
| Production  | `doca-ad-github-io` | `main`            | `docastudio.ro`         | public |
| Admin (planned) | Worker          | —                 | `admin.docastudio.ro`   | Cloudflare Access |

- Cloudflare account `4619edab308cab4c20177a04b6149f84`. DNS for `docastudio.ro` is on
  Cloudflare nameservers in that same account.
- **Production is still served by GitHub Pages** (`.github/workflows/jekyll-gh-pages.yml`)
  until the cutover. The `doca-ad-github-io` Pages project exists but **every git-triggered
  build has failed for over a month** — unresolved. Prefer direct upload, or replace the git
  integration with `cloudflare/wrangler-action`.
- Access identities: `sstefan.diaconescu@gmail.com`, `vlad.capitanu@gmail.com`,
  `calincapitanu@gmail.com` (one-time PIN).
  The doubled leading `s` in `sstefan...` is **correct, verified with the owner**. Do not
  "fix" it — changing it locks Ștefan out of staging and admin.

## Gotchas that have already cost time

**A `404.html` in `dist/` silently breaks SPA routing on Cloudflare Pages.** It takes
precedence over the `_redirects` rewrite, so deep links return HTTP 404 *while rendering the
correct page* — invisible in a browser, fatal for indexing. Routing relies on
`public/_redirects` (`/* /index.html 200`). Do not reintroduce a 404.html.

**Pages custom domains only ever serve the production deployment.** A custom domain cannot be
pointed at a preview branch. That is why staging is its own Pages project rather than a branch
of the production one.

**React 18 does not hoist metadata.** Writing `<title>`/`<meta>` inside page JSX renders dead
elements into `<body>` and every route silently shares `index.html`'s title. This was live for
months and kept the site out of Google. Always use `src/components/Seo.tsx`
(`react-helmet-async`). Do not put a static `<link rel="canonical">` in `index.html` — it
shadows Helmet's and makes every page canonical to `/`.

**`wrangler pages project create` needs `--force`** once per project, because wrangler now
delegates to the unified Workers platform and that path fails. Never pass `--force` to
anything else.

**Images are unoptimized.** 85 JPEGs, ~75MB, largest 6.8MB, no WebP/AVIF, no `srcset`. This is
the biggest outstanding quality problem; the Astro image pipeline is the planned fix.

## Layout

```
src/
  components/
    Seo.tsx              per-page metadata (see gotcha above)
    Landing.tsx          home landing slide; "statement" is live, "material" is kept unused
    ScrollCue.tsx        down chevron — MUST match the hamburger: h-6 w-6, strokeWidth 2
    ProjectCarousel.tsx  home vertical scroll-snap sequence; `landing` prop prepends slide 0
    Navigation.tsx       fixed header, centred logo, slide-out menu
  data/projects.ts       ALL content lives here, hardcoded, with static image imports
  pages/                 Index / Projects / Info / Contact / NotFound
scripts/gen-sitemap.mjs  builds dist/sitemap.xml from the route table — keep ROUTES in sync
public/_redirects        SPA rewrite — do not delete
```

Adding a route means touching `src/App.tsx` **and** `scripts/gen-sitemap.mjs`.

## Conventions

- Tailwind only; semantic tokens from `src/index.css` (`text-primary`, `background-subtle`,
  `accent-hover`), not raw hex.
- Design language is deliberate: **solemn, simple, well dressed.** Restraint over flourish.
  Match the existing quietness when adding UI.
- Typography is `Archivo Narrow Variable`, self-hosted via `@fontsource-variable`. It replaced
  a bare `Arial Narrow` stack that was not self-hosted and rendered differently per OS.
- The logo is black on transparent. Every raster variant in `public/` is baked onto a solid
  background on purpose — iOS composites alpha on black, and Google rendered the transparent
  PNG unreadably. `src/assets/doca-logo.svg` uses `currentColor` for in-page use.

## Roadmap

Full plan, decisions and rationale:
`~/tmp/claude/context/doca-website-2026-10-21-redesign-and-selfservice-plan.md`

Phase 2 Astro migration (SEO, i18n, image pipeline) · Phase 3 DOCA's visual asks ·
Phase 4 EN/RO · Phase 5 self-service admin on Cloudflare D1 + R2 + Access · Phase 6 quality pass.
