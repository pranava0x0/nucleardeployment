"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Overview", "/"], ["Fission types", "/fission"], ["Deployments", "/deployments"], ["Companies", "/companies"],
  ["Locations", "/map"], ["Financing", "/financing"], ["Buyers", "/bd"],
  ["Federal action", "/federal-action"], ["Capital + supply", "/capital"],
  ["Updates", "/updates"], ["Methodology", "/methodology"],
];

export function SiteNav() {
  const pathname = usePathname() ?? "/";
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const path = (base && pathname.startsWith(base) ? pathname.slice(base.length) : pathname).replace(/\/$/, "") || "/";
  return <nav aria-label="Primary navigation">
    {links.map(([label, href]) => <Link key={href} href={href}
      aria-current={(href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`)) ? "page" : undefined}>
      {label}
    </Link>)}
  </nav>;
}
