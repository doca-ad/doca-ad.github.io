import { getImage } from "astro:assets";
import type { Project, ProjectImage } from "@/data/projects";

/** Widths worth generating for a full-bleed portfolio image. */
const WIDTHS = [480, 768, 1024, 1440, 1920];

export interface ResolvedImage {
  id: string;
  src: string;
  srcSet: string;
  width: number;
  height: number;
  alt: string;
}

export interface ResolvedProject extends Omit<Project, "images"> {
  images: ResolvedImage[];
  /** Stable URL slug; also used by the language toggle to switch in place. */
  slug: string;
  /** Localised link target, set by the page that renders the list. */
  href?: string;
}

/**
 * Astro's <Image> is unavailable inside React islands, so images are optimised here at
 * build time and handed to the islands as plain strings.
 *
 * The originals are up to 6.8MB each; this emits AVIF at sensible widths with a srcSet so
 * the browser fetches a fraction of that.
 */
export async function resolveImage(image: ProjectImage, fallbackAlt: string): Promise<ResolvedImage> {
  // Repo assets arrive as ImageMetadata; images uploaded through the admin arrive as a URL
  // string served from R2, where the dimensions are not known until Astro fetches it.
  const isRemote = typeof image.url === "string";
  const intrinsic = isRemote ? null : (image.url as ImageMetadata);

  const widths = intrinsic
    ? (WIDTHS.filter((w) => w <= intrinsic.width).length
        ? WIDTHS.filter((w) => w <= intrinsic.width)
        : [intrinsic.width])
    : WIDTHS;

  const optimized = await getImage({
    src: image.url as never,
    format: "avif",
    widths,
    // Full-bleed on small screens, capped by the layout above that.
    sizes: "(max-width: 768px) 100vw, 1024px",
    ...(isRemote ? { inferSize: true } : {}),
  });

  return {
    id: image.id,
    src: optimized.src,
    srcSet: optimized.srcSet.attribute,
    width: intrinsic?.width ?? Number(optimized.attributes?.width ?? 0) ?? 0,
    height: intrinsic?.height ?? Number(optimized.attributes?.height ?? 0) ?? 0,
    alt: image.alt ?? fallbackAlt,
  };
}

export async function resolveProject(project: Project): Promise<ResolvedProject> {
  return {
    ...project,
    slug: slugify(project),
    images: await Promise.all(
      project.images.map((img) => resolveImage(img, `${project.title} — ${project.type}`))
    ),
  };
}

export async function resolveProjects(projects: Project[]): Promise<ResolvedProject[]> {
  return Promise.all(projects.map(resolveProject));
}

/** URL-safe slug for per-project routes. Must be stable: it is an indexed URL. */
export function slugify(project: Project): string {
  const base = project.title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  // Two projects share the title "ADR NORTH-WEST"; the type keeps them distinct.
  const kind = project.type.split("/")[0].trim().toLowerCase().replace(/\s+/g, "-");
  return `${base}-${kind}`;
}
