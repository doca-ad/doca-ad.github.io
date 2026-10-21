import { writeFileSync } from "node:fs";

/**
 * Staging must never be indexed.
 *
 * Cloudflare Pages adds `x-robots-tag: noindex` to PREVIEW deployments only. The staging site
 * is the *production* deployment of its own project, so it gets no such header and would be a
 * fully indexable duplicate of docastudio.ro competing for the same queries.
 *
 * Belt and braces, independent of whether Cloudflare Access is configured.
 */
writeFileSync("dist/robots.txt", "User-agent: *\nDisallow: /\n");
writeFileSync("dist/_headers", "/*\n  X-Robots-Tag: noindex, nofollow\n");
console.log("staging: robots.txt Disallow + X-Robots-Tag noindex");
