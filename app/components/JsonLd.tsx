/**
 * Serializes a schema.org object into the page. The object is static site
 * data, never user input, and every angle bracket is unicode-escaped so the
 * serialized string cannot close the element or open a tag. A rendered-html
 * test asserts the emitted JSON parses back to the object it came from.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
  return <script type="application/ld+json">{json}</script>;
}
