import heroMaterial from "@/assets/08/3.jpg";
import ScrollCue from "./ScrollCue";

/**
 * "statement" is the direction DOCA chose (2026-10-21).
 * "material" is kept deliberately: it is one prop away if they change their mind,
 * but it needs a higher-resolution source image before it could ship.
 */
export type LandingVariant = "statement" | "material";

interface LandingProps {
  variant: LandingVariant;
  onAdvance?: () => void;
}

/** Drawn from DOCA's own About copy, so the voice is theirs rather than invented. */
const STATEMENT = {
  lead: "Architecture at the scale of a person.",
  body:
    "We place the individual at the centre of the process — designing spaces that are not only functional, but sculptural.",
};

const Landing = ({ variant, onAdvance }: LandingProps) => {
  if (variant === "material") {
    return (
      <section
        className="relative h-screen w-full snap-start overflow-hidden"
        aria-label="DOCA Architecture & Design"
      >
        {/* Full-bleed material detail. No title, no caption: the crop belongs to no
            single project, so it carries the studio rather than one building. */}
        {/* Framed in on the boarding and the recessed door: the furniture visible
            through the window made the full frame read as "a house" rather than as
            material. CAVEAT: the source is only 1920x1080, so this 2.1x crop is soft
            on a 2x display — ask DOCA for a higher-resolution original before launch. */}
        <img
          src={heroMaterial}
          alt="Vertical timber cladding and a recessed entrance door, Hill's Pocket"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scale(2.1)", transformOrigin: "88% 50%" }}
          // React 18 does not map fetchPriority; pass the raw attribute. LCP hint.
          {...{ fetchpriority: "high" }}
        />
        {/* Only enough scrim to keep the cue legible. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-10 flex justify-center">
          <ScrollCue variant="light" onClick={onAdvance} label="Scroll to projects" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative flex h-screen snap-start flex-col justify-center px-8 pt-24 md:pt-32"
      aria-label="DOCA Architecture & Design"
    >
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-balance text-3xl font-light leading-[1.25] tracking-tight text-text-primary md:text-5xl md:leading-[1.2]">
          {STATEMENT.lead}
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-text-secondary md:mt-8 md:text-lg">
          {STATEMENT.body}
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-10 flex justify-center">
        <ScrollCue onClick={onAdvance} label="Scroll to projects" />
      </div>
    </section>
  );
};

export default Landing;
