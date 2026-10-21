import { ChevronDown, ChevronUp } from "lucide-react";

interface ScrollCueProps {
  direction: "up" | "down";
  onClick?: () => void;
  /** Render light, for use over a dark full-bleed image. */
  variant?: "dark" | "light";
  label: string;
}

/**
 * Scroll affordance for the home sequence.
 *
 * DOCA's brief: no larger than the menu glyph and the same stroke weight, so the two read
 * as one family. The hamburger is lucide <Menu className="h-6 w-6" /> at the default
 * strokeWidth of 2 — matched exactly here.
 */
const ScrollCue = ({ direction, onClick, variant = "dark", label }: ScrollCueProps) => {
  const Icon = direction === "up" ? ChevronUp : ChevronDown;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`pointer-events-auto flex items-center justify-center p-2 transition-opacity duration-300 hover:opacity-60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current ${
        variant === "light" ? "text-white" : "text-text-primary"
      }`}
    >
      <Icon
        className={`h-6 w-6 ${
          direction === "down"
            ? "motion-safe:animate-[nudge_2.4s_ease-in-out_infinite]"
            : ""
        }`}
        strokeWidth={2}
      />
    </button>
  );
};

export default ScrollCue;
