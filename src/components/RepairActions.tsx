"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FieldProposal } from "@/lib/types";

export function RepairActions({ recordId, proposals, status }: { recordId: string; proposals: FieldProposal[]; status: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState(() => proposals.map((proposal) => proposal.id));
  const [loading, setLoading] = useState("");

  function toggle(id: string) {
    setSelected((items) => (items.includes(id) ? items.filter((item) => item !== id) : [...items, id]));
  }

  async function run(action: "approve" | "sync") {
    setLoading(action);
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, recordId, approvedIds: selected })
    });
    setLoading("");
    if (!response.ok) return;
    router.refresh();
  }

  return (
    <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <h2 className="text-lg font-black">Human Approval</h2>
      <p className="mt-1 text-sm text-steel">Nothing writes silently. Select the repairs to approve, then run the mocked CRM sync.</p>
      <div className="mt-4 grid gap-2">
        {proposals.map((proposal) => (
          <label key={proposal.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line p-3 text-sm">
            <span className="font-semibold">{proposal.field}: {proposal.currentValue} → {proposal.proposedValue}</span>
            <input type="checkbox" checked={selected.includes(proposal.id)} onChange={() => toggle(proposal.id)} className="h-4 w-4" />
          </label>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={() => run("approve")} disabled={loading !== "" || status === "synced"} className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
          {loading === "approve" ? "Approving..." : "Approve selected"}
        </button>
        <button
          onClick={() => run("sync")}
          disabled={loading !== "" || status === "synced" || (status !== "approved" && status !== "synced")}
          className="rounded-md bg-repair px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          title={status !== "approved" ? "Approve selected repairs first" : undefined}
        >
          {loading === "sync" ? "Syncing..." : "Write to Mock CRM"}
        </button>
      </div>
      {status !== "approved" && status !== "synced" ? (
        <p className="mt-2 text-xs text-steel">Approve selected repairs before write-back.</p>
      ) : null}
      {status === "synced" ? (
        <p className="mt-2 text-xs font-semibold text-emerald-700">Synced to Mock CRM. View account memory and audit history.</p>
      ) : null}
    </section>
  );
}
