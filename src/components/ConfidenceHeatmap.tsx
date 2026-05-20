import type { FieldProposal } from "@/lib/types";
import { confidenceBand } from "@/lib/utils";

export function ConfidenceHeatmap({ proposals }: { proposals: FieldProposal[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {proposals.map((proposal) => {
        const band = confidenceBand(proposal.confidence);
        const heat =
          band === "high" ? "bg-emerald-100 border-emerald-300" : band === "medium" ? "bg-amber-50 border-amber-200" : "bg-red-50 border-red-200";
        return (
          <div key={proposal.id} className={`rounded-md border p-3 ${heat}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase text-steel">{proposal.field}</span>
              <span className="text-sm font-black">{proposal.confidence}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
              <div
                className={`h-full rounded-full ${band === "high" ? "bg-emerald-500" : band === "medium" ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${proposal.confidence}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
