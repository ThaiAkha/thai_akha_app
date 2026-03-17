import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title,
  description,
  ogImage,
  robots,
  canonicalUrl,
  ogType = "website",
  twitterCard = "summary_large_image",
}: {
  title: string;
  description: string;
  ogImage?: string | null;
  robots?: string | null;
  canonicalUrl?: string | null;
  ogType?: string | null;
  twitterCard?: string | null;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    {robots && <meta name="robots" content={robots} />}
    {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {ogType && <meta property="og:type" content={ogType} />}
    {ogImage && <meta property="og:image" content={ogImage} />}
    {twitterCard && <meta name="twitter:card" content={twitterCard} />}
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {ogImage && <meta name="twitter:image" content={ogImage} />}
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
