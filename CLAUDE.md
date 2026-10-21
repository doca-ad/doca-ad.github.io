# DOCA Architecture & Design — site

Portfolio site for DOCA Architecture & Design (Bucharest). **Astro 7** (static output) with
React 18 islands, TypeScript, Tailwind 3, shadcn/ui, framer-motion.

Astro renders every route to real HTML at build time and hydrates only the interactive parts.
Islands are server-rendered too, so their markup is in the HTML for crawlers.

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
| Admin       | Worker `doca-admin` | —             | `admin.docastudio.ro`   | Cloudflare Access |

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

**Metadata belongs to `src/layouts/Base.astro`, never to a React component.** The pre-Astro
site wrote `<title>`/`<meta>` inside page JSX, which relies on React 19 metadata hoisting; on
React 18 those render into `<body>` and are ignored, so every route silently shared one title.
That was live for months and kept the site out of Google. Pass `title`/`description`/
`breadcrumb` as props to `Base`.

**Tailwind 3 is wired through `postcss.config.js`, which Astro picks up automatically.**
Do not add `@astrojs/tailwind` — it peers only up to Astro 5.

**Astro's `<Image>` does not work inside React islands.** Optimise in the `.astro` page with
`getImage()` via `src/lib/images.ts` and pass plain `src`/`srcSet` strings down as props.

**`wrangler pages project create` needs `--force`** once per project, because wrangler now
delegates to the unified Workers platform and that path fails. Never pass `--force` to
anything else.

**Source images are large** (85 JPEGs, ~75MB, largest 6.8MB) but are no longer shipped as-is:
`src/lib/images.ts` emits AVIF at several widths with a `srcSet`. Never reference a raw file
from `src/assets/` in markup — always go through `resolveProject`/`resolveImage`.

## Layout

```
src/
  layouts/Base.astro     html shell, head, SEO, Organization + BreadcrumbList JSON-LD
  pages/
    index.astro          home: landing slide + project sequence
    projects/index.astro project table
    projects/[slug].astro one real page per publishable project
    info.astro contact.astro 404.astro
  components/            React islands
    Landing.tsx          "statement" is live; "material" kept, needs a higher-res source
    ScrollCue.tsx        down chevron — MUST match the hamburger: h-6 w-6, strokeWidth 2
    ProjectCarousel.tsx  home vertical scroll-snap sequence
    ProjectsList.tsx     project table: status column, RO codes, index-only rows
    Navigation.tsx       fixed header, centred logo, slide-out menu
  lib/images.ts          build-time AVIF/srcSet + slugify for project URLs
  data/projects.ts       ALL content, hardcoded. status is an enum (translatable), not free text
```

Routes are files, and `@astrojs/sitemap` generates the sitemap — adding a page needs no
registration anywhere.

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


## Admin (`admin/`)

A Worker backed by **D1** (`doca-content`, id `04dc6c71-051c-4af9-8daa-79374d565c5e`).
DOCA edit project metadata and both languages; saving writes to D1 and fires a Pages deploy
hook, so the site rebuilds fully prerendered. D1 does not sleep when idle.

```bash
cd admin && npx wrangler deploy          # deploy the Worker
npx wrangler d1 execute doca-content --remote --command "SELECT ..."
```

**Never trust `Cf-Access-Authenticated-User-Email`.** Anything reaching the origin directly
can set that header; trusting it would let an unauthenticated request delete every project.
`admin/src/access.ts` verifies the signed Access JWT against the team's public keys instead.
Verified: a spoofed header gets 401.

`GET /api/content` is intentionally public — the Pages build has no Access session, and it
serves the same content the public site already shows. Everything mutating requires Access.

`src/lib/content.ts` fetches that API at build time and **falls back to the checked-in data on
any error**. Without the fallback, a momentary admin outage during a deploy would publish an
empty site. Keep it.

### Images
Uploads go to R2 (`doca-media`) and are served by the Worker at `/media/<key>` with an
immutable cache policy. The build FETCHES them and emits local AVIF derivatives, so nothing
is hotlinked and R2-hosted photos perform exactly like repo ones. `astro.config.mjs`
`image.remotePatterns` must list the admin origin or Astro refuses to optimise them.
Rows whose `r2_key` starts with `repo:` still resolve from `src/assets`; everything else is
an R2 key. Verified end to end.

### Outstanding manual steps
1. Add `admin.docastudio.ro` as a custom domain on the Worker and put an Access app in front
   of it, then set `workers_dev: false` and repoint `CONTENT_API`. The workers.dev URL
   currently serves the admin shell to anyone (mutations still 401).
3. Create a Pages deploy hook and set it as the `DEPLOY_HOOK` secret
   (`npx wrangler secret put DEPLOY_HOOK`) so saving actually republishes.
