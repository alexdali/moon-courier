export function Metric({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return <div className="metric"><span className="metric__label">{label}</span><strong className="metric__value">{value}{suffix ? <small>{suffix}</small> : null}</strong></div>;
}
