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
      const b = (await request.json()) as Record<string, unknown>;
      if (!b.id || !b.title) return json({ error: "id and title are required" }, 400);

      const cols = FIELDS.filter((f) => f in b);
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
        const b = (await request.json()) as Record<string, unknown>;
        const cols = FIELDS.filter((f) => f in b);
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

    if (pathname === "/api/audit" && request.method === "GET") {
      const rows = await env.DB.prepare(
        `SELECT actor, action, entity, entity_id, detail, at FROM audit_log ORDER BY id DESC LIMIT 50`
      ).all();
      return json(rows.results ?? []);
    }

    return json({ error: "Not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
