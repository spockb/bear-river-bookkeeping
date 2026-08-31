import client from "../assets/client.json";
import faqs from "../assets/faqs.json";
import services from "../assets/services.json";

export const siteUrl = `https://${client.domain}`;

/** Turn a site path into an absolute URL. Astro's canonical paths are trailing-slashed. */
export const abs = (path = "/") => new URL(path, siteUrl).href;

/* Stable @id values. Every node points at these same identifiers so Google reads
   one business entity across the whole site instead of four unrelated ones. */
const BUSINESS_ID = `${siteUrl}/#business`;
const WEBSITE_ID = `${siteUrl}/#website`;

/** The four services, shared by the business node and every location page. */
function offerCatalog() {
  return {
    "@type": "OfferCatalog",
    name: "Bookkeeping Services",
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
        serviceType: service.name,
        provider: { "@id": BUSINESS_ID },
      },
    })),
  };
}

/**
 * The business itself. AccountingService is the schema.org type for bookkeeping
 * and accounting firms; it inherits everything LocalBusiness supports.
 */
export function businessNode() {
  const { address, geo, openingHours, profiles } = client;

  const node = {
    "@type": ["AccountingService", "ProfessionalService"],
    "@id": BUSINESS_ID,
    name: client.name,
    description: client.description,
    url: `${siteUrl}/`,
    telephone: client.phoneE164,
    email: client.email,
    priceRange: client.priceRange,
    image: abs("/images/BearRiver.png"),
    logo: abs("/images/BearRiver.png"),
    // Service-area business: no storefront, so no streetAddress is published.
    address: {
      "@type": "PostalAddress",
      addressLocality: address.city,
      addressRegion: address.state,
      postalCode: address.zip,
      addressCountry: address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    hasMap: address.mapLink,
    areaServed: client.serviceArea.map((name) => ({ "@type": "Place", name })),
    founder: {
      "@type": "Person",
      name: client.founder,
      jobTitle: client.founderTitle,
    },
    knowsAbout: [
      "Bookkeeping",
      "QuickBooks Online",
      "Bank reconciliation",
      "Payroll processing",
      "1099 filing",
      "Financial reporting",
    ],
    hasOfferCatalog: offerCatalog(),
  };

  if (openingHours?.length) {
    node.openingHoursSpecification = openingHours.map((slot) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: slot.days,
      opens: slot.opens,
      closes: slot.closes,
    }));
  }

  // Only publish profile links that actually exist — empty strings break validation.
  const sameAs = Object.values(profiles).filter(Boolean);
  if (sameAs.length) node.sameAs = sameAs;

  return node;
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${siteUrl}/`,
    name: client.name,
    publisher: { "@id": BUSINESS_ID },
    inLanguage: "en-US",
  };
}

/** The current page, tied back to the site and the business. */
export function webPageNode({ path, title, description, type = "WebPage" }) {
  return {
    "@type": type,
    "@id": `${abs(path)}#webpage`,
    url: abs(path),
    name: title,
    description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": BUSINESS_ID },
    inLanguage: "en-US",
  };
}

/**
 * A location page: the same provider, scoped to one city. This is what ties
 * "bookkeeping" and "Coeur d'Alene" together as a single offering rather than
 * leaving Google to infer it from the copy.
 */
export function locationServiceNode({ path, city, state, description }) {
  return {
    "@type": "Service",
    "@id": `${abs(path)}#service`,
    name: `Bookkeeping Services in ${city}, ${state}`,
    description,
    serviceType: "Bookkeeping",
    provider: { "@id": BUSINESS_ID },
    areaServed: {
      "@type": "City",
      name: `${city}, ${state}`,
      containedInPlace: { "@type": "State", name: state === "WA" ? "Washington" : "Idaho" },
    },
    hasOfferCatalog: offerCatalog(),
  };
}

/**
 * One named service with its own page. Unlike the location nodes, this is
 * scoped to the offering rather than to a city, and is served everywhere.
 */
export function serviceDetailNode({ path, name, description }) {
  return {
    "@type": "Service",
    "@id": `${abs(path)}#service`,
    name,
    description,
    serviceType: name,
    url: abs(path),
    provider: { "@id": BUSINESS_ID },
    areaServed: client.serviceArea.map((area) => ({ "@type": "Place", name: area })),
    audience: {
      "@type": "BusinessAudience",
      audienceType: "Small service businesses",
    },
  };
}

/** trail: [{ name, path }] starting at Home. Omitted on the homepage. */
export function breadcrumbNode(trail) {
  return {
    "@type": "BreadcrumbList",
    "@id": `${abs(trail[trail.length - 1].path)}#breadcrumb`,
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: abs(crumb.path),
    })),
  };
}

/**
 * Defaults to faqs.json — the same file the homepage accordion renders from.
 * Service pages pass their own list and their own path.
 */
export function faqNode(items = faqs, path = "/") {
  return {
    "@type": "FAQPage",
    "@id": `${abs(path)}#faq`,
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}

/**
 * Wrap nodes in a single @graph. One script tag per page, one connected graph,
 * rather than several disconnected blobs.
 */
export function graph(nodes) {
  return {
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  };
}
