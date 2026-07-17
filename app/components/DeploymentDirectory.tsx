"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { projects, stageLabels } from "../data";
import { StageCore } from "./StageCore";

export function DeploymentDirectory() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState(0);
  const filtered = useMemo(() => projects.filter((project) => {
    const matchesText = `${project.name} ${project.developer} ${project.location} ${project.technology}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (!stage || project.stage === stage);
  }), [query, stage]);

  return <>
    <div className="filters" aria-label="Deployment filters">
      <label className="search"><span>SEARCH</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Project, company, state, technology" /></label>
      <label><span>STAGE</span><select value={stage} onChange={(event) => setStage(Number(event.target.value))}>
        <option value={0}>All tracked stages</option>
        {stageLabels.map((label, index) => <option key={label} value={index + 1}>{index + 1} · {label}</option>)}
      </select></label>
      <div className="result-count"><b>{filtered.length}</b><span>of {projects.length} records</span></div>
    </div>
    <div className="deployment-table" role="table" aria-label="Tracked nuclear deployments">
      <div className="table-head" role="row"><span>Project</span><span>Stage</span><span>Latest evidence</span><span>Next gate</span></div>
      {filtered.map((project) => <Link className="deployment-row" href={`/deployments/${project.slug}`} role="row" key={project.slug}>
        <span className="project-cell"><b>{project.name}</b><small>{project.developer} · {project.location}</small></span>
        <span className="stage-cell"><StageCore stage={project.commitment} compact /><i>{project.stageLabel}</i></span>
        <span><b>{project.status}</b><small>{project.latestDate} · {project.verification}</small></span>
        <span><b>{project.next.split(".")[0]}</b><small>{project.nextOwner}</small></span>
      </Link>)}
      {!filtered.length && <p className="empty">No records match. Clear a filter and try again.</p>}
    </div>
  </>;
}
