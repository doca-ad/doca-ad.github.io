import { STATUS_LABELS, INDEX_ONLY_STATUSES } from "@/data/status";
import { translateType, type Locale } from "@/i18n/ui";
import type { ResolvedProject } from "./images";

export interface LocalizedProject {
  id: string;
  slug: string;
  href: string;
  title: string;
  type: string;
  status: string;
  location: string;
  year: string;
  description: string;
  indexOnly: boolean;
  home: boolean;
  homeIndex?: number;
  images: ResolvedProject["images"];
}

const COUNTRY_CODES: Record<string, string> = { Romania: "RO", România: "RO" };

/**
 * DOCA asked for country abbreviations. Applied after the per-language value is chosen, so
 * it works whether they typed "Bucharest, Romania" or "București, România".
 */
function abbreviateCountry(location: string): string {
  const parts = location.split(",").map((p) => p.trim());
  if (parts.length < 2) return location;
  const last = parts[parts.length - 1];
  return [...parts.slice(0, -1), COUNTRY_CODES[last] ?? last].join(", ");
}

/**
 * Flatten a project to one language, once, at build time.
 *
 * Admin-authored fields win. The lookup maps are only a fallback for the checked-in data,
 * which predates the per-language columns — so a project DOCA have never touched still
 * renders correctly in Romanian.
 */
export function localizeProject(
  p: ResolvedProject,
  locale: Locale,
  descriptionRo?: string
): LocalizedProject {
  const ro = locale === "ro";

  const status = (ro ? p.status_ro : p.status_en)
    || (p.status ? STATUS_LABELS[p.status]?.[locale] : "")
    || "";

  const type = (ro ? p.type_ro : p.type_en) || translateType(p.type, locale);
  const location = (ro ? p.location_ro : p.location_en) || p.location;

  return {
    id: p.id,
    slug: p.slug,
    href: locale === "ro" ? `/ro/projects/${p.slug}` : `/projects/${p.slug}`,
    title: (ro && p.title_ro) || p.title,
    type,
    status,
    location: abbreviateCountry(location),
    year: p.year,
    description: (ro ? descriptionRo : p.description) || p.description,
    // index_only is now an explicit flag; fall back to the old status-derived rule for
    // checked-in data, and treat a project with no photographs as index-only regardless.
    indexOnly:
      p.index_only ?? (INDEX_ONLY_STATUSES.includes(p.status) || p.images.length === 0),
    home: p.home,
    homeIndex: p.homeIndex,
    images: p.images,
  };
}
