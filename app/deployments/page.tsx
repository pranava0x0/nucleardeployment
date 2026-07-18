import type { Metadata } from "next";
import Link from "next/link";
import { DeploymentDirectory } from "../components/DeploymentDirectory";
import { PageShell } from "../components/SiteHeader";

export const metadata: Metadata = { title: "Deployments" };

export default function DeploymentsPage() {
  return <PageShell><main id="main" className="inner-page"><header className="page-lead grid-bg"><h1>Deployments</h1><p>U.S. reactor projects by technology, deployment stage, latest milestone, and next step.</p></header><section className="section"><div className="directory-tools"><span>Project directory</span><Link href="/companies">Browse company profiles →</Link></div><DeploymentDirectory /></section></main></PageShell>;
}
