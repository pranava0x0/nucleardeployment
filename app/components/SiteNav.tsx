"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  ["Overview", "/"], ["Fission types", "/fission"], ["Deployments", "/deployments"], ["Companies", "/companies"],
  ["Locations", "/map"], ["Financing", "/financing"], ["Buyers", "/bd"],
  ["Federal action", "/federal-action"], ["Capital + supply", "/capital"],
  ["Updates", "/updates"], ["Methodology", "/methodology"],
];

export function SiteNav() {
  const pathname = usePathname() ?? "/";
  useEffect(() => {
    // A section link should reveal its target even when the target is itself a disclosure.
    function revealHash() {
      if (!window.location.hash) return;
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); }
      catch (error) { if (error instanceof URIError) return; throw error; }
      const target = document.getElementById(id);
      let expanded = false;
      for (let node = target; node; node = node.parentElement) {
        if (node instanceof HTMLDetailsElement && !node.open) { node.open = true; expanded = true; }
      }
      if (expanded) target?.scrollIntoView({ block: "start" });
    }
    function repeatHash(event: MouseEvent) {
      const anchor = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (anchor?.href === window.location.href) revealHash();
    }
    revealHash();
    window.addEventListener("hashchange", revealHash);
    document.addEventListener("click", repeatHash);
    return () => { window.removeEventListener("hashchange", revealHash); document.removeEventListener("click", repeatHash); };
  }, [pathname]);
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const path = (base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname).replace(/\/$/, "") || "/";
  return <nav aria-label="Primary navigation">
    {links.map(([label, href]) => <Link key={href} href={href}
      aria-current={(href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`)) ? "page" : undefined}>
      {label}
    </Link>)}
  </nav>;
}
