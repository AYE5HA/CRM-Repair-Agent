import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ListTodo, Mail, Network, Sparkles } from "lucide-react";
import { ActionAssets } from "@/components/ActionAssets";
import { AppShell } from "@/components/AppShell";
import { Badge, ConfidenceBadge } from "@/components/Badge";
import { CommitmentTracker } from "@/components/CommitmentTracker";
import { ConfidenceHeatmap } from "@/components/ConfidenceHeatmap";
import { EditableFieldLedger } from "@/components/EditableFieldLedger";
import { RepairActions } from "@/components/RepairActions";
import { RepairBatches } from "@/components/RepairBatches";
import { SelfHealingPanel } from "@/components/SelfHealingPanel";
import { getData } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function RepairPage({ params }: { params: Promise<{ recordId: string }> }) {
  const { recordId } = await params;
  const data = await getData();
  const record = data.records.find((item) => item.id === recordId);
  if (!record) notFound();
  const account = data.accounts.find((item) => item.id === record.accountId);
  const assets = record.generatedAssets || [];
  const commitments = record.commitments || [];
  const batches = record.repairBatches || [];
  const selfHealing = record.selfHealing || [];
  const staleFlags = record.staleFlags || [];

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{record.title}</h1>
          <p className="mt-1 text-steel">
            {account?.name || "Account"} • {formatDate(record.updatedAt)} • {record.inputType}
            {account ? (
              <>
                {" "}
                •{" "}
                <Link href={`/account/${account.id}`} className="font-semibold text-repair hover:underline">
                  Account memory
                </Link>
              </>
            ) : null}
          </p>
        </div>
        <Badge tone={record.status === "synced" ? "good" : "warn"}>{record.status.replace("_", " ")}</Badge>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_420px]">
        <main className="grid gap-5">
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <Sparkles size={18} />
              <h2 className="text-lg font-black">Extracted Entities</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {record.extracted.map((item) => (
                <div key={`${item.field}-${item.value}`} className="rounded-md border border-line p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase text-steel">{item.field}</span>
                    <ConfidenceBadge score={item.confidence} />
                  </div>
                  <div className="mt-2 font-bold">{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Confidence Heatmap</h2>
            <div className="mt-4">
              <ConfidenceHeatmap proposals={record.proposals} />
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Network size={18} />
              <h2 className="text-lg font-black">Truth Ledger (evidence-first)</h2>
            </div>
            <EditableFieldLedger recordId={record.id} proposals={record.proposals} evidence={record.evidence} />
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Repair Batches</h2>
            <div className="mt-3">
              <RepairBatches batches={batches} proposals={record.proposals} />
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Before / After CRM Diff</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-line">
              <div className="hidden gap-2 border-b border-line bg-mist p-2 text-xs font-bold uppercase text-steel md:grid md:grid-cols-[170px_1fr_1fr_1fr]">
                <span>Field</span>
                <span className="text-red-700">Before</span>
                <span className="text-emerald-700">After</span>
                <span>Impact</span>
              </div>
              {record.syncPreview.map((item) => (
                <div key={item.field} className="grid gap-2 border-b border-line p-3 last:border-b-0 md:grid-cols-[170px_1fr_1fr_1fr]">
                  <div className="text-sm font-black">{item.field}</div>
                  <div className="rounded-md bg-red-50 p-2 text-sm text-red-800">{item.before}</div>
                  <div className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-800">{item.after}</div>
                  <div className="text-sm text-steel">
                    {item.impact}
                    {item.uncertain ? " • remains uncertain" : ""}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <ListTodo size={18} />
              <h2 className="text-lg font-black">Generated Tasks</h2>
            </div>
            <div className="mt-4 grid gap-2">
              {record.tasks.map((task) => (
                <div key={task.id} className="rounded-md border border-line p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-bold">{task.title}</span>
                    <Badge tone={task.priority === "high" ? "danger" : "warn"}>{task.priority}</Badge>
                  </div>
                  <p className="mt-1 text-steel">{task.reason}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="grid gap-5 self-start">
          <RepairActions recordId={record.id} proposals={record.proposals} status={record.status} />
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <h2 className="text-lg font-black">Contradiction Radar</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {record.contradictions.length === 0 ? (
                <p className="text-sm text-steel">No conflicts detected for this record.</p>
              ) : (
                record.contradictions.map((item) => (
                  <div key={item.id} className="rounded-md border border-red-100 bg-red-50 p-3">
                    <div className="text-sm font-black text-red-800">{item.summary}</div>
                    <div className="mt-2 grid gap-1 text-xs text-red-700">
                      {item.values.map((v) => (
                        <div key={v.evidenceId}>
                          {v.sourceName}: {v.value}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-red-700">{item.recommendedResolution}</div>
                  </div>
                ))
              )}
            </div>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Commitment Tracker</h2>
            <div className="mt-3">
              <CommitmentTracker commitments={commitments} />
            </div>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Minimum Questions</h2>
            <div className="mt-3 grid gap-3">
              {record.minimumQuestions.map((item) => (
                <div key={item.question} className="rounded-md border border-line p-3">
                  <div className="text-sm font-bold">{item.question}</div>
                  <div className="mt-1 text-sm text-steel">{item.impact}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <SelfHealingPanel hints={selfHealing} staleFlags={staleFlags} />
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <Mail size={18} />
              <h2 className="text-lg font-black">Action Generator</h2>
            </div>
            <div className="mt-3">
              <ActionAssets assets={assets.length ? assets : [{ id: "fallback", type: "email", title: record.draftEmail.subject, body: record.draftEmail.body, rationale: record.draftEmail.rationale }]} />
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
