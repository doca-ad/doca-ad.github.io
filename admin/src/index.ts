import { verifyAccess } from "./access";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  ACCESS_TEAM_DOMAIN: string;
  MEDIA?: R2Bucket;
  /** Fine-grained PAT, repo-scoped, with Actions: write. Never leaves the Worker. */
  GITHUB_TOKEN?: string;
  GITHUB_REPO?: string;
  SITE_REF?: string;
}

type Target = "staging" | "production";

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
      client_payload: { target, ref: env.SITE_REF ?? "staging" },
    }),
  });

  if (res.status === 204) return { ok: true };
  return { ok: false, error: `GitHub returned ${res.status}: ${(await res.text()).slice(0, 200)}` };
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

const STATUSES = [
  "completed", "in_progress", "feasibility_study", "competition", "unbuilt", "study",
] as const;

interface ProjectRow {
  id: string; slug: string; title: string; status: string; type: string;
  location: string; year: string; description_en: string; description_ro: string;
  home: number; home_index: number | null; sort_index: number;
}

/** Shape the Astro build consumes. Public: it is the same content the site already shows. */
async function readContent(env: Env) {
  const projects = await env.DB.prepare(
    `SELECT * FROM projects ORDER BY sort_index ASC`
  ).all<ProjectRow>();
  const images = await env.DB.prepare(
    `SELECT project_id, id, r2_key, alt_en, alt_ro, width, height, position
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
      images: byProject.get(p.id) ?? [],
    })),
  };
}

async function audit(env: Env, actor: string, action: string, entity: string, id?: string, detail?: string) {
  await env.DB.prepare(
    `INSERT INTO audit_log (actor, action, entity, entity_id, detail) VALUES (?,?,?,?,?)`
  ).bind(actor, action, entity, id ?? null, detail ?? null).run();
}

/**
 * Saving refreshes STAGING only. Production is a deliberate click, so DOCA always see a
 * change on staging before the public site moves.
 */
function triggerRebuild(env: Env, ctx: ExecutionContext) {
  ctx.waitUntil(dispatchBuild(env, "staging").catch(() => {}));
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // Public read: the Pages build fetches this at build time and has no Access session.
    if (pathname === "/api/content" && request.method === "GET") {
      return json(await readContent(env), 200);
    }

    // Public media. The build fetches these to generate AVIF derivatives, and they are the
    // same photographs the public site already shows, so there is nothing to gate. Served
    // from the Worker rather than a public bucket domain to keep one hostname and let us
    // set our own cache policy.
    if (pathname.startsWith("/media/") && (request.method === "GET" || request.method === "HEAD")) {
      if (!env.MEDIA) return new Response("R2 not configured", { status: 503 });
      const key = decodeURIComponent(pathname.slice("/media/".length));
      if (!key || key.includes("..")) return new Response("Bad key", { status: 400 });

      const object = await env.MEDIA.get(key);
      if (!object) return new Response("Not found", { status: 404 });

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      // Keys are content-addressed (uuid in the name), so a hit can be cached hard.
      headers.set("cache-control", "public, max-age=31536000, immutable");
      return new Response(request.method === "HEAD" ? null : object.body, { headers });
    }

    // Everything below here requires a valid Access session.
    //
    // The UI shell is gated too, rather than relying on an Access application being
    // correctly bound to the hostname. Defence in depth: if that binding is missing or
    // misconfigured the admin simply does not render, instead of being quietly public.
    const identity = await verifyAccess(request, env.ACCESS_TEAM_DOMAIN);

    if (!pathname.startsWith("/api/")) {
      if (!identity) {
        return new Response(
          `<!doctype html><meta charset="utf-8"><title>Sign in required</title>` +
            `<style>body{font:15px/1.6 system-ui;margin:0;display:grid;place-items:center;` +
            `height:100vh;color:#282c34}div{max-width:30rem;padding:0 1.5rem;text-align:center}` +
            `p{color:#6b7280}</style>` +
            `<div><h1>Sign in required</h1><p>This page is only available through ` +
            `Cloudflare Access. If you reached it directly, open ` +
            `<a href="https://admin.docastudio.ro/">admin.docastudio.ro</a> instead.</p></div>`,
          { status: 401, headers: { "content-type": "text/html; charset=utf-8" } }
        );
      }
      return env.ASSETS.fetch(request);
    }

    if (!identity) {
      return json({ error: "Not authenticated. Reach this through Cloudflare Access." }, 401);
    }

    if (pathname === "/api/me") return json(identity);

    if (pathname === "/api/projects" && request.method === "POST") {
      const b = (await request.json()) as Partial<ProjectRow>;
      if (!b.id || !b.title || !b.type) return json({ error: "id, title and type are required" }, 400);
      if (b.status && !STATUSES.includes(b.status as (typeof STATUSES)[number])) {
        return json({ error: `status must be one of ${STATUSES.join(", ")}` }, 400);
      }
      await env.DB.prepare(
        `INSERT INTO projects (id,slug,title,status,type,location,year,description_en,description_ro,home,home_index,sort_index)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        b.id, b.slug ?? b.id, b.title, b.status ?? "completed", b.type,
        b.location ?? "", b.year ?? "", b.description_en ?? "", b.description_ro ?? "",
        b.home ? 1 : 0, b.home_index ?? null, b.sort_index ?? 0
      ).run();
      await audit(env, identity.email, "create", "project", b.id);
      await triggerRebuild(env, ctx);
      return json({ ok: true }, 201);
    }

    const match = pathname.match(/^\/api\/projects\/([A-Za-z0-9_-]+)$/);
    if (match) {
      const id = match[1];

      if (request.method === "PUT") {
        const b = (await request.json()) as Partial<ProjectRow>;
        if (b.status && !STATUSES.includes(b.status as (typeof STATUSES)[number])) {
          return json({ error: `status must be one of ${STATUSES.join(", ")}` }, 400);
        }
        const fields = [
          "slug", "title", "status", "type", "location", "year",
          "description_en", "description_ro", "home", "home_index", "sort_index",
        ].filter((f) => f in b);
        if (fields.length === 0) return json({ error: "nothing to update" }, 400);

        const set = fields.map((f) => `${f} = ?`).join(", ");
        const values = fields.map((f) => {
          const v = (b as Record<string, unknown>)[f];
          return f === "home" ? (v ? 1 : 0) : (v as string | number | null);
        });
        await env.DB.prepare(
          `UPDATE projects SET ${set}, updated_at = datetime('now') WHERE id = ?`
        ).bind(...values, id).run();
        await audit(env, identity.email, "update", "project", id, fields.join(","));
        await triggerRebuild(env, ctx);
        return json({ ok: true });
      }

      if (request.method === "DELETE") {
        await env.DB.prepare(`DELETE FROM project_images WHERE project_id = ?`).bind(id).run();
        await env.DB.prepare(`DELETE FROM projects WHERE id = ?`).bind(id).run();
        await audit(env, identity.email, "delete", "project", id);
        await triggerRebuild(env, ctx);
        return json({ ok: true });
      }
    }

    if (pathname === "/api/images" && request.method === "POST") {
      if (!env.MEDIA) {
        return json(
          { error: "R2 is not enabled on this account yet, so image upload is unavailable. Enable R2 in the Cloudflare dashboard and create the doca-media bucket." },
          503
        );
      }
      const form = await request.formData();
      const file = form.get("file");
      const projectId = String(form.get("project_id") ?? "");
      if (!(file instanceof File) || !projectId) {
        return json({ error: "file and project_id are required" }, 400);
      }
      const key = `${projectId}/${crypto.randomUUID()}-${file.name}`;
      await env.MEDIA.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
      });
      const row = await env.DB.prepare(
        `SELECT COALESCE(MAX(position), -1) + 1 AS next FROM project_images WHERE project_id = ?`
      ).bind(projectId).first<{ next: number }>();
      await env.DB.prepare(
        `INSERT INTO project_images (id, project_id, r2_key, position) VALUES (?,?,?,?)`
      ).bind(crypto.randomUUID(), projectId, key, row?.next ?? 0).run();
      await audit(env, identity.email, "upload", "image", projectId, key);
      await triggerRebuild(env, ctx);
      return json({ ok: true, key }, 201);
    }

    if (pathname === "/api/publish" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as { target?: string };
      const target: Target = body.target === "production" ? "production" : "staging";

      const result = await dispatchBuild(env, target);
      await audit(env, identity.email, "publish", "site", target, result.ok ? "ok" : result.error);
      if (!result.ok) return json({ error: result.error }, 502);
      return json({ ok: true, target });
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
