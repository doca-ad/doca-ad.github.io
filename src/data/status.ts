/**
 * Project status lives in its own module, deliberately free of image imports.
 *
 * React islands need the labels. If they pull them from data/projects.ts, that module's 85
 * image imports are dragged into the client graph and Vite emits every original JPEG
 * (~74MB) alongside the optimised AVIFs. Keep this file dependency-free.
 */
export type ProjectStatus =
  | "completed"
  | "in_progress"
  | "feasibility_study"
  | "competition"
  | "unbuilt"
  | "study";

/** Entries with no published content: listed for breadth, not clickable or expandable. */
export const INDEX_ONLY_STATUSES: ProjectStatus[] = ["in_progress", "feasibility_study"];

/**
 * Status is an enum key rather than free text because the site is bilingual: the label has
 * to be translatable. The admin surfaces these as a dropdown, never a text field.
 */
export const STATUS_LABELS: Record<ProjectStatus, { en: string; ro: string }> = {
  completed:         { en: "Completed",         ro: "Finalizat" },
  in_progress:       { en: "In progress",       ro: "În curs" },
  feasibility_study: { en: "Feasibility study", ro: "Studiu de fezabilitate" },
  competition:       { en: "Competition entry", ro: "Concurs" },
  unbuilt:           { en: "Unbuilt",           ro: "Neconstruit" },
  study:             { en: "Study",             ro: "Studiu" },
};
