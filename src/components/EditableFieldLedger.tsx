"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Evidence, FieldProposal } from "@/lib/types";
import { ConfidenceBadge, Badge } from "./Badge";

export function EditableFieldLedger({
  recordId,
  proposals,
  evidence
}: {
  recordId: string;
  proposals: FieldProposal[];
  evidence: Evidence[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  async function save(proposalId: string) {
    setSaving(true);
    await fetch("/api/proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recordId, proposalId, value: draft })
    });
    setSaving(false);
    setEditing(null);
    router.refresh();
  }

  return (
    <div className="grid gap-3">
      {proposals.map((proposal) => {
        const refs = evidence.filter((item) => proposal.evidenceIds.includes(item.id));
        const display = proposal.editableValue || proposal.proposedValue;
        return (
          <div key={proposal.id} className="rounded-lg border border-line bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="text-xs font-bold uppercase text-steel">{proposal.field}</div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md bg-red-50 p-3 text-sm">
                    <div className="font-bold text-red-700">Current</div>
                    <div>{proposal.currentValue}</div>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-3 text-sm">
                    <div className="font-bold text-emerald-700">Proposed</div>
                    {editing === proposal.id ? (
                      <div className="mt-1 grid gap-2">
                        <input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="w-full rounded border border-line px-2 py-1"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => save(proposal.id)}
                            disabled={saving}
                            className="rounded bg-ink px-2 py-1 text-xs font-bold text-white"
                          >
                            Save
                          </button>
                          <button type="button" onClick={() => setEditing(null)} className="text-xs font-semibold text-steel">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span>{display}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(proposal.id);
                            setDraft(display);
                          }}
                          className="text-xs font-bold text-repair"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ConfidenceBadge score={proposal.confidence} />
                <Badge tone={proposal.contradictionStatus === "conflicted" ? "danger" : proposal.contradictionStatus === "stale" ? "warn" : "good"}>
                  {proposal.contradictionStatus}
                </Badge>
                {proposal.approved ? <Badge tone="good">approved</Badge> : null}
              </div>
            </div>
            <p className="mt-3 text-sm text-steel">{proposal.rationale}</p>
            <p className="mt-1 text-xs text-steel">
              If wrong: reject in approval panel or edit proposed value. Uncertainty remains when confidence &lt; 70%.
            </p>
            <div className="mt-3 grid gap-2">
              {refs.map((ref) => (
                <div key={ref.id} className="rounded-md border border-line bg-mist p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold">{ref.sourceName}</span>
                    <span className="text-xs text-steel">{ref.freshnessDays}d old</span>
                  </div>
                  <div className="mt-1 text-steel">&ldquo;{ref.snippet}&rdquo;</div>
                </div>
              ))}
            </div>
            {proposal.repairHistory.length > 0 && (
              <div className="mt-2 text-xs text-steel">History: {proposal.repairHistory.join(" → ")}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
