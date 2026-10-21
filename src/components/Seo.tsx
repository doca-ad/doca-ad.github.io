import { Helmet } from "react-helmet-async";

const ORIGIN = "https://docastudio.ro";
const SUFFIX = "DOCA Architecture & Design";

interface SeoProps {
  title: string;
  description: string;
  path: string;
  /** Omit on the home page, which is the root of the trail. */
  breadcrumb?: string;
}

/**
 * Per-page metadata.
 *
 * This replaces bare <title>/<meta> written inside page JSX. That pattern relies on
 * React 19's metadata hoisting; on React 18 those elements render into <body> and are
 * ignored, so every route silently shared the one <title> from index.html.
 */
const Seo = ({ title, description, path, breadcrumb }: SeoProps) => {
  const full = path === "/" ? title : `${title} — ${SUFFIX}`;
  const url = `${ORIGIN}${path}`;

  return (
    <Helmet>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />

      {breadcrumb && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${ORIGIN}/` },
              { "@type": "ListItem", position: 2, name: breadcrumb, item: url },
            ],
          })}
        </script>
      )}
    </Helmet>
  );
};

export default Seo;
