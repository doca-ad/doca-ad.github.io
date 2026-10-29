import type { Env } from "./index";

const MAX = { name: 120, email: 160, message: 4000 };
const WINDOW_S = 3600;
const PER_WINDOW = 5;

export interface ContactResult { status: number; body: Record<string, unknown> }

const bad = (msg: string, status = 400): ContactResult => ({ status, body: { error: msg } });

/** Deliberately permissive: the goal is to reject typos, not to police valid addresses. */
const looksLikeEmail = (v: string) => /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(v);

/**
 * Turnstile, when configured.
 *
 * A public write endpoint with no challenge fills with spam within days. If no secret is
 * set the form still works — it just leans on the honeypot and the throttle — so the
 * feature is not blocked on dashboard setup.
 */
async function passesTurnstile(env: Env, token: string | undefined, ip: string | null) {
  if (!env.TURNSTILE_SECRET) return { ok: true, skipped: true };
  if (!token) return { ok: false, skipped: false };

  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form,
  });
  const data = (await res.json()) as { success?: boolean };
  return { ok: Boolean(data.success), skipped: false };
}

/** Hash the IP rather than storing it: we need a throttle key, not a record of who wrote in. */
async function hashIp(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function throttled(env: Env, ip: string): Promise<boolean> {
  const key = await hashIp(ip);
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    `SELECT count, window_s FROM enquiry_throttle WHERE ip_hash = ?`
  ).bind(key).first<{ count: number; window_s: number }>();

  if (!row || now - row.window_s > WINDOW_S) {
    await env.DB.prepare(
      `INSERT INTO enquiry_throttle (ip_hash, count, window_s) VALUES (?,1,?)
       ON CONFLICT(ip_hash) DO UPDATE SET count = 1, window_s = excluded.window_s`
    ).bind(key, now).run();
    return false;
  }
  if (row.count >= PER_WINDOW) return true;
  await env.DB.prepare(`UPDATE enquiry_throttle SET count = count + 1 WHERE ip_hash = ?`)
    .bind(key).run();
  return false;
}

/**
 * Email is attempted after the enquiry is safely stored, and its outcome is recorded.
 * docastudio.ro has no MX and office@doca-ad.ro is on a self-hosted domain with its own
 * SPF, so sending "as" the site would fail SPF and land in spam. Delivery therefore goes
 * through whatever relay is configured; until one is, enquiries simply wait in the admin.
 */
async function deliver(env: Env, e: { id: string; name: string; email: string; message: string }) {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO) return { state: "skipped", error: null };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM ?? "DOCA website <onboarding@resend.dev>",
        to: [env.CONTACT_TO],
        reply_to: e.email,
        subject: `Website enquiry — ${e.name}`,
        text: `${e.message}\n\n—\nFrom: ${e.name} <${e.email}>\nhttps://admin.docastudio.ro/`,
      }),
    });
    if (!res.ok) return { state: "failed", error: `${res.status}: ${(await res.text()).slice(0, 180)}` };
    return { state: "sent", error: null };
  } catch (err) {
    return { state: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}

export async function handleContact(request: Request, env: Env): Promise<ContactResult> {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return bad("Malformed request");
  }

  // Honeypot: a real person never fills a field they cannot see.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return { status: 200, body: { ok: true } };   // look successful; drop it
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const locale = body.locale === "ro" ? "ro" : "en";

  if (!name || !email || !message) return bad("Please fill in every field.");
  if (name.length > MAX.name || email.length > MAX.email || message.length > MAX.message) {
    return bad("That is longer than we can accept.");
  }
  if (!looksLikeEmail(email)) return bad("That email address does not look right.");

  const ip = request.headers.get("cf-connecting-ip");
  const check = await passesTurnstile(env, body.token as string | undefined, ip);
  if (!check.ok) return bad("Could not verify you are human. Please try again.", 403);

  if (ip && (await throttled(env, ip))) {
    return bad("You have sent several messages already. Please email us directly.", 429);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO enquiries (id, name, email, message, locale, ip_country, user_agent)
     VALUES (?,?,?,?,?,?,?)`
  ).bind(
    id, name, email, message, locale,
    (request as Request & { cf?: { country?: string } }).cf?.country ?? null,
    (request.headers.get("user-agent") ?? "").slice(0, 200)
  ).run();

  const sent = await deliver(env, { id, name, email, message });
  await env.DB.prepare(`UPDATE enquiries SET mail_state = ?, mail_error = ? WHERE id = ?`)
    .bind(sent.state, sent.error, id).run();

  return { status: 200, body: { ok: true } };
}
