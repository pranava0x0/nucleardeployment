import type { Metadata } from "next";
import Link from "next/link";
import { DeploymentDirectory } from "../components/DeploymentDirectory";
import { PageShell } from "../components/SiteHeader";

export const metadata: Metadata = { title: "Deployments" };

export default function DeploymentsPage() {
  return <PageShell><main id="main" className="inner-page"><header className="page-lead grid-bg"><p className="eyebrow">Evidence directory · Tracked project set</p><h1>Deployments</h1><p>Compare technology, commitment, licensing, construction, and the next decision that moves each project forward.</p></header><section className="section"><div className="directory-tools"><span>Projects and companies are separate records.</span><Link href="/companies">Browse company profiles →</Link></div><DeploymentDirectory /></section></main></PageShell>;
}
