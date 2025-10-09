import Navigation from "@/components/Navigation";

const Info = () => {
  return (
    <>
      <title>Info - Premium Creative Studio</title>
      <meta
        name="description"
        content="Learn about our creative studio's philosophy, approach, and commitment to exceptional design."
      />

      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-32 pb-16">
          <div className="max-w-4xl mx-auto px-8">
            <h1 className="text-4xl md:text-5xl font-light text-text-primary text-center mb-16">
              About Our Studio
            </h1>

            <div className="space-y-12">
              <div className="max-w-3xl mx-auto">
                <p className="text-lg text-text-secondary leading-relaxed text-justify mb-8">
                  DOCA Architecture & Design is a Romania-based architecture practice,
                  founded in 2024 by{" "}
                  <a
                    href="https://www.linkedin.com/in/stefandiaconescu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-text-primary hover:text-accent-hover transition-colors duration-200 cursor-pointer"
                  >
                    Ștefan Diaconescu
                  </a>
                  {" "}and{" "}
                  <a
                    href="https://www.linkedin.com/in/vlad-capitanu-12850b1ab"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-text-primary hover:text-accent-hover transition-colors duration-200 cursor-pointer"
                  >
                    Vlad Căpitanu
                  </a>.
                </p>

                <p className="text-lg text-text-secondary leading-relaxed text-justify mb-8">
                  Our long-standing professional collaboration naturally evolved into
                  establishing DOCA, building on a series of early joint projects and
                  international competitions. From the outset, our work has engaged
                  with diverse scales, with a strong emphasis on space efficiency,
                  usability, urban integration, and human-scale architecture.
                </p>

                <p className="text-lg text-text-secondary leading-relaxed text-justify mb-8">
                  At the core of our philosophy lies the experience of the end-user. We
                  place the individual at the center of the architectural process,
                  designing spaces that are not only functional but also sculptural—
                  living environments shaped to enrich daily life.
                </p>

                <br/>

                <div className="text-lg text-text-secondary leading-relaxed text-justify mb-8">
                  <p className="font-semibold mb-4">
                    Selected Competitions & Projects
                  </p>

                  Central Park Book Studio – New York, 2019<br/>
                  Weave – Sustainable Fashion Hub – Milan, 2019<br/>
                  City Link – Copenhagen, 2020<br/>
                  Roots – MilanCall – Milan, 2020 (2nd Prize)<br/>
                </div>
                <br/>

                <div className="text-lg text-text-secondary leading-relaxed text-justify mb-8">
                  <p className="font-semibold mb-4">
                    Our Complementary Professional Paths
                  </p>
                  <ul className="list-inside space-y-4 text-justify text-center">
                    <li>
                      <span className="font-medium">Ștefan Diaconescu</span> refined his
                      expertise in BIM management and project management, with a focus
                      on problem-solving, site coordination, and technical detailing.
                      His ongoing research into technical solutions continuously
                      enhances the quality and innovation of our work.
                    </li>
                    <li>
                      <span className="font-medium">Vlad Căpitanu</span> deepened his
                      architectural perspective through a Master's degree in Sustainable
                      Urban Planning and Design at KTH, Sweden. His Scandinavian
                      experience—both academic and professional—shapes his design
                      philosophy, emphasizing scale, materiality, sustainability, and
                      geometry.
                    </li>
                  </ul>
                </div>

                <p className="text-lg text-text-secondary leading-relaxed text-justify">
                  DOCA represents the synthesis of these experiences—a balance between
                  technical precision and conceptual vision. We believe architecture
                  should be human-centered, creating spaces that respond to both
                  individual and collective needs while integrating seamlessly into
                  their cultural and urban contexts.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Info;
