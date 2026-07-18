import Image from "next/image";

const nav = [
  ["Overview", "/"],
  ["Deployments", "/deployments"],
  ["Locations", "/map"],
  ["Federal Action", "/federal-action"],
  ["Capital + Supply", "/capital"],
  ["Methodology", "/methodology"],
];

export function SiteHeader() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Deployment Core home">
        <span className="brand-mark" aria-hidden="true"><Image src={`${basePath}/brand/reactor-velocity-mark.png`} alt="" width={58} height={58} unoptimized /></span>
        <span><b>DEPLOYMENT</b><small>CORE / U.S. NUCLEAR</small></span>
      </Link>
      <nav aria-label="Primary navigation">
        {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <Link className="method-link" href="/methodology">DATA / 2026.07</Link>
    </header>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <><a className="skip-link" href="#main">Skip to content</a><SiteHeader />{children}<footer><b>DEPLOYMENT CORE</b><span>U.S. nuclear projects, milestones, and next steps.</span><Link href="/methodology">Sources & methodology</Link></footer></>;
}
import Link from "next/link";
