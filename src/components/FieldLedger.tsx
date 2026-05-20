import type { Evidence, FieldProposal } from "@/lib/types";
import { ConfidenceBadge, Badge } from "./Badge";

export function FieldLedger({ proposals, evidence }: { proposals: FieldProposal[]; evidence: Evidence[] }) {
  return (
    <div className="grid gap-3">
      {proposals.map((proposal) => {
        const refs = evidence.filter((item) => proposal.evidenceIds.includes(item.id));
        return (
          <div key={proposal.id} className="rounded-lg border border-line bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase text-steel">{proposal.field}</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md bg-red-50 p-3 text-sm">
                    <div className="font-bold text-red-700">Current</div>
                    <div>{proposal.currentValue}</div>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-3 text-sm">
                    <div className="font-bold text-emerald-700">Proposed</div>
                    <div>{proposal.editableValue || proposal.proposedValue}</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ConfidenceBadge score={proposal.confidence} />
                <Badge tone={proposal.contradictionStatus === "conflicted" ? "danger" : proposal.contradictionStatus === "stale" ? "warn" : "good"}>{proposal.contradictionStatus}</Badge>
              </div>
            </div>
            <p className="mt-3 text-sm text-steel">{proposal.rationale}</p>
            <div className="mt-3 grid gap-2">
              {refs.map((ref) => (
                <div key={ref.id} className="rounded-md border border-line bg-mist p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{ref.sourceName}</span>
                    <span className="text-xs text-steel">{ref.freshnessDays}d old</span>
                  </div>
                  <div className="mt-1 text-steel">“{ref.snippet}”</div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
