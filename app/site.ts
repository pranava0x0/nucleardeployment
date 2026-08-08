/**
 * One place that knows the site's addresses.
 *
 * Two kinds, kept deliberately apart:
 * - The build's own mount point (`basePath`), for internal links and files.
 *   Empty locally, `/nucleardeployment` on the GitHub Pages export.
 * - The published address (`canonicalUrl` and friends), which always names
 *   production, so a local or preview build never advertises itself as the
 *   canonical copy. The generator scripts in scripts/ default to the same
 *   published address.
 */
export const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

/** A route or file under the build's own mount point. */
export const sitePath = (path: string) => `${basePath}${path}`;

const publishedOrigin = "https://pranava0x0.github.io";
const publishedBasePath = "/nucleardeployment";

/**
 * The one true copy of a route, trailing slash included, because that is the
 * form GitHub Pages serves without a redirect hop.
 */
export const canonicalUrl = (path: string) => `${publishedOrigin}${publishedBasePath}${path === "/" ? "" : path}/`;

/** The absolute form for JSON-LD, identical to the canonical. */
export const absoluteUrl = canonicalUrl;

/** Absolute URL for a static file in public/, which never takes a trailing slash. */
export const absoluteFileUrl = (path: string) => `${publishedOrigin}${publishedBasePath}${path}`;

/** Repository the data and code live in. The correction CTA files issues here. */
export const repoUrl = "https://github.com/pranava0x0/nucleardeployment";

/** Personal site of the maintainer, for the footer credit. */
export const authorUrl = "https://www.pranavaraparla.com";
