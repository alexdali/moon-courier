export function ProgressBar({ value, tone = 'cyan', label }: { value: number; tone?: 'cyan' | 'mint' | 'amber' | 'red' | 'violet'; label?: string }) {
  const bounded = Math.max(0, Math.min(100, value));
  return <div className="progress-wrap" aria-label={label}><div className="progress-track"><span className={`progress-fill progress-fill--${tone}`} style={{ width: `${bounded}%` }} /></div>{label ? <span className="progress-label">{label}</span> : null}</div>;
}
