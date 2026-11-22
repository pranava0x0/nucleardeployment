import Image from "next/image";
import Link from "next/link";
import { SiteNav } from "./SiteNav";
import { dataAsOf } from "../data";
import { authorUrl, repoUrl, sitePath } from "../site";

export function SiteHeader() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Deployment Core home">
        <span className="brand-mark" aria-hidden="true"><Image src={`${basePath}/brand/reactor-velocity-mark.png`} alt="" aria-hidden="true" width={58} height={58} unoptimized /></span>
        <span><b>Deployment Core</b><small>U.S. nuclear deployment intelligence</small></span>
      </Link>
      <SiteNav />
      <Link className="method-link" href="/methodology">Sources through {dataAsOf}</Link>
    </header>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader />
    {children}
    <footer>
      <b>DEPLOYMENT CORE</b>
      <span>U.S. nuclear projects, milestones, and next steps.</span>
      <nav aria-label="Footer">
        <Link href="/methodology">Sources &amp; methodology</Link>
        <Link href="/updates">Updates</Link>
        <a href={sitePath("/feed.xml")}>RSS</a>
        <a href={sitePath("/llms.txt")}>llms.txt</a>
        <a href={repoUrl} target="_blank" rel="noreferrer">GitHub</a>
        <a href={authorUrl} target="_blank" rel="noreferrer">Built by Pranava Raparla</a>
      </nav>
    </footer>
  </>;
}
