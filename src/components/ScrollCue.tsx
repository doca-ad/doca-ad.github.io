import { ChevronDown } from "lucide-react";

interface ScrollCueProps {
  onClick?: () => void;
  /** Render light, for use over a dark full-bleed image. */
  variant?: "dark" | "light";
  label?: string;
}

/**
 * Scroll affordance for the home sequence.
 *
 * DOCA's brief: no larger than the menu glyph and the same stroke weight, so the
 * two read as one family. The hamburger is lucide <Menu className="h-6 w-6" /> at
 * the default strokeWidth of 2 — matched exactly here.
 */
const ScrollCue = ({ onClick, variant = "dark", label = "Scroll to next" }: ScrollCueProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className={`group flex items-center justify-center p-2 transition-opacity duration-300 hover:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current ${
      variant === "light" ? "text-white" : "text-text-primary"
    }`}
  >
    <ChevronDown
      className="h-6 w-6 motion-safe:animate-[nudge_2.4s_ease-in-out_infinite]"
      strokeWidth={2}
    />
  </button>
);

export default ScrollCue;
