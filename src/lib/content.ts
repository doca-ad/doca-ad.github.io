import { projects as localProjects, type Project } from "@/data/projects";
import { PROJECT_DESCRIPTIONS_RO } from "@/data/translations.ro";
import type { ProjectStatus } from "@/data/status";

const CONTENT_API =
  import.meta.env.CONTENT_API ?? "https://doca-admin.calincapitanu.workers.dev/api/content";

/**
 * Every image under src/assets, keyed by path, so D1 rows can point at repo assets.
 * Images stay in the repo until R2 is enabled; a row's r2_key is "repo:<path>" for those.
 */
const ASSETS = import.meta.glob<{ default: ImageMetadata }>("/src/assets/**/*.{jpg,jpeg,png}", {
  eager: true,
});

const assetFor = (path: string): ImageMetadata | null =>
  ASSETS[`/src/assets/${path}`]?.default ?? null;

interface ApiImage { id: string; r2_key: string; alt_en: string; alt_ro: string; position: number }
interface ApiProject {
  id: string; slug: string; title: string; status: ProjectStatus; type: string;
  location: string; year: string; description_en: string; description_ro: string;
  home: boolean; home_index: number | null; images: ApiImage[];
}

/** Local data, shaped like the API result, used when the admin is unreachable. */
function fromLocal(): Project[] {
  return localProjects;
}

/**
 * Content comes from D1 so DOCA can edit it, but a build must never fail because the admin
 * Worker is briefly unavailable - a deploy would then ship an empty site. On any error we
 * fall back to the checked-in data, which is also what keeps `npm run build` working offline.
 */
export async function loadProjects(): Promise<Project[]> {
  try {
    const res = await fetch(CONTENT_API, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`content API ${res.status}`);
    const data = (await res.json()) as { projects: ApiProject[] };
    if (!Array.isArray(data.projects) || data.projects.length === 0) {
      throw new Error("content API returned no projects");
    }

    const mapped: Project[] = data.projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      type: p.type,
      location: p.location,
      year: p.year,
      description: p.description_en,
      home: p.home,
      homeIndex: p.home_index ?? undefined,
      images: p.images
        .map((img) => {
          const path = img.r2_key.startsWith("repo:") ? img.r2_key.slice(5) : null;
          const url = path ? assetFor(path) : null;
          return url ? { id: img.id, url, alt: img.alt_en || undefined } : null;
        })
        .filter((i): i is NonNullable<typeof i> => i !== null),
    }));

    // Descriptions from D1 win; the checked-in RO file remains the fallback.
    for (const p of data.projects) {
      if (p.description_ro) PROJECT_DESCRIPTIONS_RO[p.id] = p.description_ro;
    }

    console.log(`[content] ${mapped.length} projects from the admin API`);
    return mapped;
  } catch (err) {
    console.warn(
      `[content] falling back to checked-in data: ${err instanceof Error ? err.message : err}`
    );
    return fromLocal();
  }
}
