import type { ResolvedImage } from "@/lib/images";

/**
 * "statement" is the direction DOCA chose (2026-10-21).
 * "material" is kept deliberately: it is one prop away if they change their mind,
 * but it needs a higher-resolution source image before it could ship.
 */
export type LandingVariant = "statement" | "material";

interface LandingProps {
  variant: LandingVariant;
  /** Required by the "material" variant; optimised at build time by the .astro page. */
  hero?: ResolvedImage;
  /** Localised copy, passed in so the component stays language-agnostic. */
  statement: { lead: string; body: string };
}

const Landing = ({ variant, hero, statement }: LandingProps) => {
  if (variant === "material" && hero) {
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
          src={hero.src}
          srcSet={hero.srcSet}
          sizes="100vw"
          alt={hero.alt}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ transform: "scale(2.1)", transformOrigin: "88% 50%" }}
          // React 18 does not map fetchPriority; pass the raw attribute. LCP hint.
          {...{ fetchpriority: "high" }}
        />
        {/* Only enough scrim to keep the cue legible. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/35 to-transparent" />
      </section>
    );
  }

  return (
    <section
      className="relative flex h-screen snap-start flex-col justify-center px-8 pt-24 md:pt-32"
      aria-label="DOCA Architecture & Design"
    >
      <div className="mx-auto w-full max-w-3xl text-center">
        {/* The lead runs longer than a single clause now, so it steps down a size at the
            large breakpoint to stay on two lines rather than three. */}
        <h1 className="text-balance text-2xl font-light leading-[1.3] tracking-tight text-text-primary md:text-4xl md:leading-[1.25]">
          {statement.lead}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base font-light leading-relaxed text-text-secondary md:mt-8 md:text-lg">
          {statement.body}
        </p>
      </div>
    </section>
  );
};

export default Landing;
