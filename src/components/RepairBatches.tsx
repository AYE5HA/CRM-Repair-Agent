import type { FieldProposal, RepairBatch } from "@/lib/types";

export function RepairBatches({ batches, proposals }: { batches: RepairBatch[]; proposals: FieldProposal[] }) {
  if (!batches.length) return null;
  return (
    <div className="grid gap-3">
      {batches.map((batch) => {
        const fields = proposals.filter((p) => batch.proposalIds.includes(p.id)).map((p) => p.field);
        return (
          <div key={batch.id} className="rounded-md border border-repair/30 bg-emerald-50/50 p-3">
            <div className="font-black text-repair">{batch.label}</div>
            <p className="mt-1 text-sm text-steel">{batch.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {fields.map((field) => (
                <span key={field} className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-steel">
                  {field}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
