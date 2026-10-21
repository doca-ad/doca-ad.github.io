/**
 * Cloudflare Access JWT verification.
 *
 * Access sits in front of this Worker, but the Worker must not simply trust the
 * Cf-Access-Authenticated-User-Email header: anything that reached the origin directly
 * could set it. We verify the signed assertion against the team's public keys instead,
 * and check the audience matches this application.
 */
interface Jwk { kid: string; kty: string; alg: string; use: string; e: string; n: string }

const keyCache = new Map<string, { keys: Jwk[]; at: number }>();
const CACHE_MS = 60 * 60 * 1000;

async function fetchKeys(teamDomain: string): Promise<Jwk[]> {
  const cached = keyCache.get(teamDomain);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.keys;

  const res = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`);
  if (!res.ok) throw new Error(`Access certs unavailable: ${res.status}`);
  const { keys } = (await res.json()) as { keys: Jwk[] };
  keyCache.set(teamDomain, { keys, at: Date.now() });
  return keys;
}

const b64urlToBytes = (s: string) => {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=");
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};

export interface AccessIdentity { email: string }

export async function verifyAccess(
  request: Request,
  teamDomain: string
): Promise<AccessIdentity | null> {
  const token =
    request.headers.get("Cf-Access-Jwt-Assertion") ??
    (request.headers.get("Cookie") ?? "").match(/CF_Authorization=([^;]+)/)?.[1];
  if (!token) return null;

  const [headerB64, payloadB64, sigB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !sigB64) return null;

  let header: { kid?: string };
  let payload: { email?: string; exp?: number; iss?: string };
  try {
    header = JSON.parse(new TextDecoder().decode(b64urlToBytes(headerB64)));
    payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(payloadB64)));
  } catch {
    return null;
  }

  if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
  if (payload.iss !== `https://${teamDomain}`) return null;

  const jwk = (await fetchKeys(teamDomain)).find((k) => k.kid === header.kid);
  if (!jwk) return null;

  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );

  const ok = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlToBytes(sigB64),
    new TextEncoder().encode(`${headerB64}.${payloadB64}`)
  );

  return ok && payload.email ? { email: payload.email } : null;
}
