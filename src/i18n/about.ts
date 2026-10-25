import type { Locale } from "./ui";

interface AboutContent {
  intro: { before: string; and: string; after: string };
  paragraphs: string[];
  competitions: string[];
  paths: { name: string; text: string }[];
  closing: string;
}

export const ABOUT: Record<Locale, AboutContent> = {
  en: {
    intro: {
      before: "DOCA Architecture & Design is a Romania-based architecture practice, founded in 2024 by ",
      and: " and ",
      after: ".",
    },
    paragraphs: [
      "Our long-standing professional collaboration naturally evolved into establishing DOCA, building on a series of early joint projects and international competitions. From the outset, our work has engaged with diverse scales, with a strong emphasis on space efficiency, usability, urban integration, and human-scale architecture.",
      "At the core of our philosophy lies the experience of the end-user. We place the individual at the center of the architectural process, designing spaces that are not only functional but also sculptural— living environments shaped to enrich daily life.",
    ],
    competitions: [
      "Central Park Book Studio – New York, 2019",
      "Weave – Sustainable Fashion Hub – Milan, 2019",
      "City Link – Copenhagen, 2020",
      "Roots – MilanCall – Milan, 2020 (2nd Prize)",
    ],
    paths: [
      {
        name: "Ștefan Diaconescu",
        text: " refined his expertise in BIM management and project management, with a focus on problem-solving, site coordination, and technical detailing. His ongoing research into technical solutions continuously enhances the quality and innovation of our work.",
      },
      {
        name: "Vlad Căpitanu",
        text: " deepened his architectural perspective through a Master's degree in Sustainable Urban Planning and Design at KTH, Sweden. His Scandinavian experience—both academic and professional—shapes his design philosophy, emphasizing scale, materiality, sustainability, and geometry.",
      },
    ],
    closing:
      "DOCA represents the synthesis of these experiences—a balance between technical precision and conceptual vision. We believe architecture should be human-centered, creating spaces that respond to both individual and collective needs while integrating seamlessly into their cultural and urban contexts.",
  },
  ro: {
    intro: {
      before: "DOCA Architecture & Design este un birou de arhitectură din România, fondat în 2024 de ",
      and: " și ",
      after: ".",
    },
    paragraphs: [
      "Colaborarea noastră profesională de lungă durată a condus firesc la înființarea DOCA, pornind de la o serie de proiecte comune timpurii și de la concursuri internaționale. De la bun început, activitatea noastră a abordat scări diverse, cu accent puternic pe eficiența spațiului, utilitate, integrare urbană și arhitectură la scara omului.",
      "În centrul filosofiei noastre stă experiența utilizatorului final. Așezăm omul în mijlocul procesului de proiectare, creând spații care nu sunt doar funcționale, ci și sculpturale — medii de locuire modelate pentru a îmbogăți viața de zi cu zi.",
    ],
    competitions: [
      "Central Park Book Studio – New York, 2019",
      "Weave – Sustainable Fashion Hub – Milano, 2019",
      "City Link – Copenhaga, 2020",
      "Roots – MilanCall – Milano, 2020 (Premiul al II-lea)",
    ],
    paths: [
      {
        name: "Ștefan Diaconescu",
        text: " și-a rafinat expertiza în managementul BIM și managementul de proiect, cu accent pe rezolvarea problemelor, coordonarea de șantier și detalierea tehnică. Cercetarea sa continuă în zona soluțiilor tehnice îmbunătățește constant calitatea și gradul de inovație al lucrărilor noastre.",
      },
      {
        name: "Vlad Căpitanu",
        text: " și-a aprofundat perspectiva arhitecturală printr-un masterat în Urbanism și Design Sustenabil la KTH, Suedia. Experiența sa scandinavă — deopotrivă academică și profesională — îi modelează filosofia de proiectare, punând accent pe scară, materialitate, sustenabilitate și geometrie.",
      },
    ],
    closing:
      "DOCA reprezintă sinteza acestor experiențe — un echilibru între precizia tehnică și viziunea conceptuală. Credem că arhitectura trebuie să fie centrată pe om, creând spații care răspund deopotrivă nevoilor individuale și colective și care se integrează firesc în contextul lor cultural și urban.",
  },
};
