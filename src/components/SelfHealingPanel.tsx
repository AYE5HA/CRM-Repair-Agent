import type { SelfHealingHint, StaleFlag } from "@/lib/types";
import { Badge } from "./Badge";

export function SelfHealingPanel({ hints, staleFlags }: { hints: SelfHealingHint[]; staleFlags: StaleFlag[] }) {
  return (
    <div className="grid gap-4">
      {staleFlags.length > 0 && (
        <div>
          <h3 className="text-sm font-black uppercase text-steel">Stale-info detector</h3>
          <div className="mt-2 grid gap-2">
            {staleFlags.map((flag) => (
              <div key={flag.id} className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
                <div className="font-bold text-amber-900">{flag.field}</div>
                <div className="text-amber-800">{flag.reason}</div>
                <Badge tone="warn">{flag.ageDays}d old</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-black uppercase text-steel">Self-healing CRM</h3>
        <div className="mt-2 grid gap-2">
          {hints.map((hint) => (
            <div key={hint.id} className="rounded-md border border-line bg-mist p-3 text-sm">
              <div className="font-bold">{hint.trigger}</div>
              <p className="mt-1 text-steel">{hint.suggestion}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {hint.affectedFields.map((field) => (
                  <span key={field} className="rounded-full border border-line bg-white px-2 py-0.5 text-xs font-semibold">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
