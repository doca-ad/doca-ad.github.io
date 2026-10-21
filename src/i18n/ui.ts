export const LOCALES = ["en", "ro"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** EN lives at the root, RO under /ro. Chosen while the site had no search presence to lose. */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean === "/" ? "/" : clean;
  return clean === "/" ? "/ro" : `/ro${clean}`;
}

/** Strip the /ro prefix to get the canonical route key. */
export function stripLocale(pathname: string): string {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/ro") return "/";
  return p.startsWith("/ro/") ? p.slice(3) : p;
}

export function localeFromPath(pathname: string): Locale {
  return pathname === "/ro" || pathname.startsWith("/ro/") ? "ro" : "en";
}

export const UI = {
  en: {
    "nav.home": "Home",
    "nav.projects": "Projects",
    "nav.info": "Info",
    "nav.contact": "Contact",
    "nav.tagline": "Architecture & Design",
    "nav.menu": "Menu",
    "nav.close": "Close menu",

    "home.statement.lead": "Architecture at the scale of a person.",
    "home.statement.body":
      "We place the individual at the centre of the process — designing spaces that are not only functional, but sculptural.",
    "home.scroll": "Scroll to next",

    "projects.title": "Our Projects",
    "projects.allProjects": "All projects",

    "info.title": "About Our Studio",
    "info.founders": "Vlad Căpitanu and Ștefan Diaconescu",
    "info.competitions": "Selected Competitions & Projects",
    "info.paths": "Our Complementary Professional Paths",

    "contact.title": "Contact",
    "contact.invitation":
      "We are always looking forward to meeting passionate people. Don't hesitate to contact us!",
    "contact.social": "You can also find us on social media platforms:",
    "contact.and": " and ",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.studio": "Studio",

    "404.title": "Page not found",
    "404.body": "The page you are looking for does not exist.",
    "404.back": "Back to home",
  },
  ro: {
    "nav.home": "Acasă",
    "nav.projects": "Proiecte",
    "nav.info": "Despre",
    "nav.contact": "Contact",
    "nav.tagline": "Arhitectură & Design",
    "nav.menu": "Meniu",
    "nav.close": "Închide meniul",

    "home.statement.lead": "Arhitectură la scara omului.",
    "home.statement.body":
      "Așezăm omul în centrul procesului — proiectăm spații care nu sunt doar funcționale, ci și sculpturale.",
    "home.scroll": "Derulează mai departe",

    "projects.title": "Proiectele noastre",
    "projects.allProjects": "Toate proiectele",

    "info.title": "Despre studio",
    "info.founders": "Vlad Căpitanu și Ștefan Diaconescu",
    "info.competitions": "Concursuri și proiecte selectate",
    "info.paths": "Parcursurile noastre profesionale complementare",

    "contact.title": "Contact",
    "contact.invitation":
      "Ne bucurăm mereu să cunoaștem oameni pasionați. Nu ezitați să ne scrieți!",
    "contact.social": "Ne puteți găsi și pe rețelele de socializare:",
    "contact.and": " și ",
    "contact.email": "E-mail",
    "contact.phone": "Telefon",
    "contact.studio": "Birou",

    "404.title": "Pagina nu a fost găsită",
    "404.body": "Pagina pe care o căutați nu există.",
    "404.back": "Înapoi la pagina principală",
  },
} as const;

export type UIKey = keyof (typeof UI)["en"];

export function t(locale: Locale, key: UIKey): string {
  return UI[locale][key] ?? UI[DEFAULT_LOCALE][key];
}

/** Page metadata per locale, keyed by canonical route. */
export const META: Record<string, Record<Locale, { title: string; description: string }>> = {
  "/": {
    en: {
      title: "DOCA Architecture & Design",
      description:
        "Bucharest-based architecture and interior design studio founded in 2024 by Ștefan Diaconescu and Vlad Căpitanu. Space efficiency, usability, urban integration and human-scale architecture.",
    },
    ro: {
      title: "DOCA Arhitectură & Design",
      description:
        "Birou de arhitectură și design interior din București, fondat în 2024 de Ștefan Diaconescu și Vlad Căpitanu. Eficiența spațiului, utilitate, integrare urbană și arhitectură la scara omului.",
    },
  },
  "/projects": {
    en: {
      title: "Projects",
      description:
        "Architecture and interior design projects by DOCA — residential, offices and healthcare across Romania, from 2024 onward.",
    },
    ro: {
      title: "Proiecte",
      description:
        "Proiecte de arhitectură și design interior realizate de DOCA — locuințe, birouri și spații medicale din România, din 2024 până în prezent.",
    },
  },
  "/info": {
    en: {
      title: "About the studio",
      description:
        "DOCA Architecture & Design was founded in 2024 by Ștefan Diaconescu and Vlad Căpitanu, combining BIM and project management with Scandinavian urban design practice.",
    },
    ro: {
      title: "Despre studio",
      description:
        "DOCA Arhitectură & Design a fost fondat în 2024 de Ștefan Diaconescu și Vlad Căpitanu, îmbinând managementul BIM și de proiect cu experiența scandinavă în urbanism și design.",
    },
  },
  "/contact": {
    en: {
      title: "Contact",
      description:
        "Get in touch with DOCA Architecture & Design in Bucharest — office@doca-ad.ro, +40 723 340 088.",
    },
    ro: {
      title: "Contact",
      description:
        "Contactați DOCA Arhitectură & Design din București — office@doca-ad.ro, +40 723 340 088.",
    },
  },
};

/**
 * Project types are composed as "Discipline / Programme" (e.g. "Interior Design / Offices").
 * Translating per segment avoids having to enumerate every combination, and keeps working
 * if DOCA add a new programme through the admin.
 */
const TYPE_SEGMENTS: Record<string, string> = {
  "Architecture": "Arhitectură",
  "Interior Design": "Design interior",
  "Offices": "Birouri",
  "Residential": "Rezidențial",
  "Healthcare": "Medical",
  "Mixed-use": "Funcțiuni mixte",
};

export function translateType(type: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return type;
  return type
    .split("/")
    .map((part) => {
      const key = part.trim();
      return TYPE_SEGMENTS[key] ?? key;
    })
    .join(" / ");
}
