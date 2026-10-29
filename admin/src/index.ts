import { verifyAccess } from "./access";
import { handleContact } from "./contact";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ACCESS_TEAM_DOMAIN: string;
  MEDIA?: R2Bucket;
  /** Fine-grained PAT, repo-scoped, with Actions: write. Never leaves the Worker. */
  GITHUB_TOKEN?: string;
  /** Contact form. Without these the form still stores enquiries; it just does not email. */
  TURNSTILE_SECRET?: string;
  RESEND_API_KEY?: string;
  CONTACT_TO?: string;
  CONTACT_FROM?: string;
  GITHUB_REPO?: string;
  SITE_REF?: string;
}

type Target = "staging" | "production";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

/** Columns the editor owns. Everything DOCA type exists in both languages. */
const FIELDS = [
  "slug", "title", "title_ro",
  "status_en", "status_ro",
  "type_en", "type_ro",
  "location_en", "location_ro",
  "year",
  "description_en", "description_ro",
  "home", "home_index", "sort_index", "index_only",
] as const;

const BOOLS = new Set(["home", "index_only"]);

/**
 * The original schema's `type`, `location` and `status` columns are NOT NULL with no
 * default, and predate the per-language columns. The bilingual editor only sends the _en
 * variants, so an INSERT omitting them failed with a NOT NULL constraint — editing worked,
 * adding did not.
 *
 * They are now derived from the English values on every write rather than being separately
 * editable, so they cannot drift. They remain only as a fallback for readers that predate
 * the bilingual columns.
 */
function withLegacyColumns(b: Record<string, unknown>): Record<string, unknown> {
  const out = { ...b };
  if ("type_en" in b) out.type = b.type_en ?? "";
  if ("location_en" in b) out.location = b.location_en ?? "";
  return out;
}

const WRITABLE = [...FIELDS, "type", "location"] as const;

/**
 * Publishing means rebuilding the site, and a Worker cannot build Astro. GitHub Actions
 * does the build and the Pages upload; this just asks it to start.
 *
 * Cloudflare deploy hooks would be simpler but only exist for Git-connected Pages projects,
 * and both of ours are direct-upload.
 */
async function dispatchBuild(env: Env, target: Target): Promise<{ ok: boolean; error?: string }> {
  if (!env.GITHUB_TOKEN) return { ok: false, error: "GITHUB_TOKEN is not configured" };
  const repo = env.GITHUB_REPO ?? "doca-ad/doca-ad.github.io";

  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "user-agent": "doca-admin",
    },
    body: JSON.stringify({
      event_type: "publish",
      client_payload: { target, ref: env.SITE_REF ?? "main" },
    }),
  });

  if (res.status !== 204) {
    return { ok: false, error: `GitHub returned ${res.status}: ${(await res.text()).slice(0, 200)}` };
  }

  /**
   * A dispatch returns 204 even when nothing runs.
   *
   * repository_dispatch only triggers workflows defined on the DEFAULT branch — if the
   * workflow is missing there, GitHub accepts the request and silently does nothing. That
   * once made the Publish button report success while doing nothing at all, which is worse
   * than failing. Confirm a run actually started.
   */
  await new Promise((r) => setTimeout(r, 3000));
  const since = new Date(Date.now() - 120_000).toISOString();
  const runs = await fetch(
    `https://api.github.com/repos/${repo}/actions/runs?event=repository_dispatch&created=>${since}&per_page=1`,
    {
      headers: {
        authorization: `Bearer ${env.GITHUB_TOKEN}`,
        accept: "application/vnd.github+json",
        "user-agent": "doca-admin",
      },
    }
  );
  if (runs.ok) {
    const body = (await runs.json()) as { total_count?: number };
    if (!body.total_count) {
      return {
        ok: false,
        error:
          "GitHub accepted the request but no build started. The deploy workflow must exist " +
          "on the repository's default branch for this to work.",
      };
    }
  }
  return { ok: true };
}

async function audit(env: Env, actor: string, action: string, entity: string, id?: string, detail?: string) {
  await env.DB.prepare(
    `INSERT INTO audit_log (actor, action, entity, entity_id, detail) VALUES (?,?,?,?,?)`
  ).bind(actor, action, entity, id ?? null, detail ?? null).run();
}

async function readContent(env: Env) {
  const projects = await env.DB.prepare(
    `SELECT * FROM projects ORDER BY sort_index ASC`
  ).all<Record<string, unknown>>();
  const images = await env.DB.prepare(
    `SELECT id, project_id, r2_key, alt_en, alt_ro, width, height, position
     FROM project_images ORDER BY project_id, position ASC`
  ).all<{ project_id: string } & Record<string, unknown>>();

  const byProject = new Map<string, unknown[]>();
  for (const img of images.results ?? []) {
    const list = byProject.get(img.project_id) ?? [];
    list.push(img);
    byProject.set(img.project_id, list);
  }

  return {
    generatedAt: new Date().toISOString(),
    projects: (projects.results ?? []).map((p) => ({
      ...p,
      home: Boolean(p.home),
      index_only: Boolean(p.index_only),
      images: byProject.get(p.id as string) ?? [],
    })),
  };
}

/** Is anything waiting to go out? Drives the "unpublished changes" hint in the editor. */
async function publishState(env: Env) {
  const rows = await env.DB.prepare(`SELECT target, last_at, last_actor FROM publish_state`).all<{
    target: Target; last_at: string | null; last_actor: string | null;
  }>();
  const edited = await env.DB.prepare(
    `SELECT MAX(updated_at) AS t FROM projects`
  ).first<{ t: string | null }>();

  const state: Record<string, unknown> = { lastEdit: edited?.t ?? null };
  for (const r of rows.results ?? []) {
    state[r.target] = {
      at: r.last_at,
      by: r.last_actor,
      stale: !r.last_at || (edited?.t ? edited.t > r.last_at : false),
    };
  }
  return state;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Public: the Pages build fetches this and has no Access session.
    if (pathname === "/api/content" && request.method === "GET") {
      return json(await readContent(env));
    }

    // Public: the contact form posts here from the website, which is a different origin.
    if (pathname === "/api/contact") {
      const origin = request.headers.get("origin") ?? "";
      const allowed = ["https://docastudio.ro", "https://staging.docastudio.ro"];
      const cors: Record<string, string> = {
        "access-control-allow-origin": allowed.includes(origin) ? origin : allowed[0],
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "vary": "origin",
      };
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
      if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

      const result = await handleContact(request, env);
      return new Response(JSON.stringify(result.body), {
        status: result.status,
        headers: { ...cors, "content-type": "application/json; charset=utf-8" },
      });
    }

    // Public media. The build fetches these to generate AVIF derivatives, and they are the
    // same photographs the public site already shows, so there is nothing to gate.
    if (pathname.startsWith("/media/") && (request.method === "GET" || request.method === "HEAD")) {
      if (!env.MEDIA) return new Response("R2 not configured", { status: 503 });
      const key = decodeURIComponent(pathname.slice("/media/".length));
      if (!key || key.includes("..")) return new Response("Bad key", { status: 400 });

      const object = await env.MEDIA.get(key);
      if (!object) return new Response("Not found", { status: 404 });

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=31536000, immutable");
      // The site serves its own optimised derivatives; these originals exist for the build.
      // Keep them out of search results so crawlers do not spend R2 reads on them.
      headers.set("x-robots-tag", "noindex, noimageindex");
      return new Response(request.method === "HEAD" ? null : object.body, { headers });
    }

    // Everything below requires a valid Access session.
    //
    // The UI shell is gated too, rather than relying on an Access application being
    // correctly bound to the hostname. Defence in depth: if that binding is missing the
    // admin does not render, instead of being quietly public.
    const identity = await verifyAccess(request, env.ACCESS_TEAM_DOMAIN);

    if (!pathname.startsWith("/api/")) {
      if (!identity) {
        return new Response(
          `<!doctype html><meta charset="utf-8"><title>Sign in required</title>` +
            `<style>body{font:15px/1.6 system-ui;margin:0;display:grid;place-items:center;` +
            `height:100vh;color:#282c34}div{max-width:30rem;padding:0 1.5rem;text-align:center}` +
            `p{color:#6b7280}</style>` +
            `<div><h1>Sign in required</h1><p>This page is only available through ` +
            `Cloudflare Access. Open <a href="https://admin.docastudio.ro/">` +
            `admin.docastudio.ro</a>.</p></div>`,
          { status: 401, headers: { "content-type": "text/html; charset=utf-8" } }
        );
      }
      return env.ASSETS.fetch(request);
    }

    if (!identity) {
      return json({ error: "Not authenticated. Reach this through Cloudflare Access." }, 401);
    }

    if (pathname === "/api/me") return json(identity);
    if (pathname === "/api/state") return json(await publishState(env));

    // --- projects -------------------------------------------------------------------
    if (pathname === "/api/projects" && request.method === "POST") {
      const raw = (await request.json()) as Record<string, unknown>;
      if (!raw.id || !raw.title) return json({ error: "id and title are required" }, 400);
      const b = withLegacyColumns(raw);

      const cols = WRITABLE.filter((f) => f in b);
      await env.DB.prepare(
        `INSERT INTO projects (id, ${cols.join(",")}) VALUES (?${",?".repeat(cols.length)})`
      ).bind(b.id, ...cols.map((f) => (BOOLS.has(f) ? (b[f] ? 1 : 0) : (b[f] as never)))).run();

      await audit(env, identity.email, "create", "project", String(b.id));
      return json({ ok: true }, 201);
    }

    const projectMatch = pathname.match(/^\/api\/projects\/([A-Za-z0-9_-]+)$/);
    if (projectMatch) {
      const id = projectMatch[1];

      if (request.method === "PUT") {
        const b = withLegacyColumns((await request.json()) as Record<string, unknown>);
        const cols = WRITABLE.filter((f) => f in b);
        if (!cols.length) return json({ error: "nothing to update" }, 400);

        await env.DB.prepare(
          `UPDATE projects SET ${cols.map((f) => `${f} = ?`).join(", ")},
           updated_at = datetime('now') WHERE id = ?`
        ).bind(...cols.map((f) => (BOOLS.has(f) ? (b[f] ? 1 : 0) : (b[f] as never))), id).run();

        await audit(env, identity.email, "update", "project", id, cols.join(","));
        return json({ ok: true });
      }

      if (request.method === "DELETE") {
        // Remove the objects too, or R2 fills with photographs nothing references.
        if (env.MEDIA) {
          const imgs = await env.DB.prepare(
            `SELECT r2_key FROM project_images WHERE project_id = ?`
          ).bind(id).all<{ r2_key: string }>();
          for (const img of imgs.results ?? []) {
            if (!img.r2_key.startsWith("repo:")) await env.MEDIA.delete(img.r2_key).catch(() => {});
          }
        }
        await env.DB.prepare(`DELETE FROM project_images WHERE project_id = ?`).bind(id).run();
        await env.DB.prepare(`DELETE FROM projects WHERE id = ?`).bind(id).run();
        await audit(env, identity.email, "delete", "project", id);
        return json({ ok: true });
      }
    }

    // --- images ---------------------------------------------------------------------
    if (pathname === "/api/images" && request.method === "POST") {
      if (!env.MEDIA) return json({ error: "R2 is not configured" }, 503);

      const form = await request.formData();
      const file = form.get("file");
      const projectId = String(form.get("project_id") ?? "");
      if (!(file instanceof File) || !projectId) {
        return json({ error: "file and project_id are required" }, 400);
      }
      if (!file.type.startsWith("image/")) {
        return json({ error: `${file.name} is not an image` }, 400);
      }
      if (file.size > 25 * 1024 * 1024) {
        return json({ error: `${file.name} is larger than 25MB` }, 413);
      }

      const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
      const key = `${projectId}/${crypto.randomUUID()}-${safeName}`;
      await env.MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type } });

      const row = await env.DB.prepare(
        `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM project_images WHERE project_id = ?`
      ).bind(projectId).first<{ next: number }>();
      const imageId = crypto.randomUUID();
      await env.DB.prepare(
        `INSERT INTO project_images (id, project_id, r2_key, position) VALUES (?,?,?,?)`
      ).bind(imageId, projectId, key, row?.next ?? 0).run();

      await audit(env, identity.email, "upload", "image", projectId, key);
      return json({ ok: true, id: imageId, key }, 201);
    }

    if (pathname === "/api/images/order" && request.method === "PUT") {
      const { ids } = (await request.json()) as { ids?: string[] };
      if (!Array.isArray(ids)) return json({ error: "ids[] required" }, 400);
      const stmt = env.DB.prepare(`UPDATE project_images SET position = ? WHERE id = ?`);
      await env.DB.batch(ids.map((id, i) => stmt.bind(i, id)));
      await audit(env, identity.email, "reorder", "image", undefined, `${ids.length} images`);
      return json({ ok: true });
    }

    const imageMatch = pathname.match(/^\/api\/images\/([A-Za-z0-9-]+)$/);
    if (imageMatch && request.method === "DELETE") {
      const id = imageMatch[1];
      const row = await env.DB.prepare(
        `SELECT r2_key FROM project_images WHERE id = ?`
      ).bind(id).first<{ r2_key: string }>();
      if (row && env.MEDIA && !row.r2_key.startsWith("repo:")) {
        await env.MEDIA.delete(row.r2_key).catch(() => {});
      }
      await env.DB.prepare(`DELETE FROM project_images WHERE id = ?`).bind(id).run();
      await audit(env, identity.email, "delete", "image", id);
      return json({ ok: true });
    }

    // --- publishing -----------------------------------------------------------------
    //
    // Deliberately NOT fired on save: editing five fields would mean five rebuilds.
    if (pathname === "/api/publish" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as { target?: string };
      const target: Target = body.target === "production" ? "production" : "staging";

      const result = await dispatchBuild(env, target);
      await audit(env, identity.email, "publish", "site", target, result.ok ? "ok" : result.error);
      if (!result.ok) return json({ error: result.error }, 502);

      await env.DB.prepare(
        `UPDATE publish_state SET last_at = datetime('now'), last_actor = ? WHERE target = ?`
      ).bind(identity.email, target).run();
      return json({ ok: true, target });
    }

    if (pathname === "/api/enquiries" && request.method === "GET") {
      const rows = await env.DB.prepare(
        `SELECT id, name, email, message, locale, mail_state, mail_error, read_at, created_at
         FROM enquiries ORDER BY created_at DESC LIMIT 200`
      ).all();
      return json(rows.results ?? []);
    }

    const enquiryMatch = pathname.match(/^\/api\/enquiries\/([A-Za-z0-9-]+)$/);
    if (enquiryMatch) {
      const id = enquiryMatch[1];
      if (request.method === "PUT") {
        await env.DB.prepare(`UPDATE enquiries SET read_at = datetime('now') WHERE id = ?`)
          .bind(id).run();
        return json({ ok: true });
      }
      if (request.method === "DELETE") {
        await env.DB.prepare(`DELETE FROM enquiries WHERE id = ?`).bind(id).run();
        await audit(env, identity.email, "delete", "enquiry", id);
        return json({ ok: true });
      }
    }

    if (pathname === "/api/audit" && request.method === "GET") {
      const rows = await env.DB.prepare(
        `SELECT actor, action, entity, entity_id, detail, at FROM audit_log ORDER BY id DESC LIMIT 50`
      ).all();
      return json(rows.results ?? []);
    }

    return json({ error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
