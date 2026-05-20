export function MetricCard({ label, value, subtext }: { label: string; value: string | number; subtext: string }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="text-xs font-bold uppercase text-steel">{label}</div>
      <div className="mt-2 text-3xl font-black tracking-normal text-ink">{value}</div>
      <div className="mt-1 text-sm text-steel">{subtext}</div>
    </div>
  );
}
