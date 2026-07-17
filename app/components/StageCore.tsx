export function StageCore({ stage, compact = false }: { stage: number; compact?: boolean }) {
  return (
    <div className={`stage-core ${compact ? "compact" : ""}`} aria-label={`Commitment stage ${stage} of 8`}>
      <div className="core-rings" aria-hidden="true">
        {[8, 7, 6, 5, 4, 3, 2, 1].map((ring) => <span key={ring} className={ring <= stage ? "active" : ""} />)}
        <b>{stage}</b>
      </div>
      {!compact && <div><span className="eyebrow">Commitment level</span><strong>{stage} / 8</strong></div>}
    </div>
  );
}
