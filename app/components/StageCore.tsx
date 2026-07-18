export function StageCore({ stage, label, compact = false }: { stage: number; label?: string; compact?: boolean }) {
  return (
    <div className={`stage-core ${compact ? "compact" : ""}`} aria-label={`Deployment stage ${stage} of 8${label ? `: ${label}` : ""}`}>
      <div className="core-rings" aria-hidden="true">
        {[8, 7, 6, 5, 4, 3, 2, 1].map((ring) => <span key={ring} className={ring <= stage ? "active" : ""} />)}
        <b>{stage}</b>
      </div>
      {!compact && <div className="stage-readout"><span>Deployment stage</span><strong>{stage} / 8</strong>{label && <small>{label}</small>}</div>}
    </div>
  );
}
