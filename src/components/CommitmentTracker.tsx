import type { Commitment } from "@/lib/types";
import { Badge } from "./Badge";

export function CommitmentTracker({ commitments }: { commitments: Commitment[] }) {
  if (!commitments.length) {
    return <p className="text-sm text-steel">No dated commitments extracted from this input.</p>;
  }
  return (
    <div className="grid gap-2">
      {commitments.map((item) => (
        <div key={item.id} className="rounded-md border border-line p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-bold">{item.text}</span>
            <Badge tone={item.status === "at_risk" ? "danger" : item.status === "met" ? "good" : "warn"}>{item.status}</Badge>
          </div>
          <div className="mt-1 text-sm text-steel">Due: {item.dueHint}</div>
        </div>
      ))}
    </div>
  );
}
