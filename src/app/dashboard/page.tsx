import Link from "next/link";
import { AlertTriangle, CheckCircle2, Gauge, GitCompareArrows } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge, ConfidenceBadge } from "@/components/Badge";
import { IngestionForm } from "@/components/IngestionForm";
import { MetricCard } from "@/components/MetricCard";
import { getData } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const data = await getData();
  const unresolved = data.records.reduce((sum, record) => sum + record.contradictions.length, 0);
  const openTasks = data.tasks.filter((task) => task.status === "open");
  const allProposals = data.records.flatMap((record) => record.proposals);
  const confidence = allProposals.length
    ? Math.round(allProposals.reduce((sum, proposal) => sum + proposal.confidence, 0) / allProposals.length)
    : 0;
  const highPriority = data.tasks.filter((t) => t.priority === "high" && t.status === "open").slice(0, 5);

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Repair Command Center</h1>
          <p className="mt-1 text-steel">Records that need truth reconstruction, approval, and write-back discipline.</p>
        </div>
        <Link href="/repair/rec_helio_repair" className="rounded-md bg-repair px-4 py-2 text-sm font-bold text-white">Open demo repair</Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="Records needing repair" value={data.records.filter((record) => record.status !== "synced").length} subtext="Fragmented inputs waiting for approval" />
        <MetricCard label="Contradictions" value={unresolved} subtext="High-impact conflicts detected" />
        <MetricCard label="Open follow-ups" value={openTasks.length} subtext="Generated from commitments" />
        <MetricCard label="Avg confidence" value={`${confidence}%`} subtext="Visible heuristic scoring" />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_420px]">
        <div className="grid gap-5">
          <IngestionForm />
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <GitCompareArrows size={18} />
              <h2 className="text-lg font-black">Recent Records Needing Repair</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {data.records.map((record) => (
                <Link key={record.id} href={`/repair/${record.id}`} className="rounded-lg border border-line p-4 hover:bg-mist">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-black">{record.title}</div>
                      <div className="text-sm text-steel">{formatDate(record.updatedAt)} • {record.proposals.length} repairs • {record.contradictions.length} contradictions</div>
                    </div>
                    <Badge tone={record.status === "synced" ? "good" : "warn"}>{record.status.replace("_", " ")}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <aside className="grid gap-5">
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} />
              <h2 className="text-lg font-black">Contradiction Radar</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {data.records.flatMap((record) => record.contradictions.map((item) => ({ ...item, recordId: record.id }))).map((item) => (
                <Link href={`/repair/${item.recordId}`} key={item.id} className="rounded-md border border-red-100 bg-red-50 p-3">
                  <div className="text-sm font-black text-red-800">{item.field}</div>
                  <div className="mt-1 text-sm text-red-700">{item.summary}</div>
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <Gauge size={18} />
              <h2 className="text-lg font-black">Confidence Trends</h2>
            </div>
            <div className="mt-4 grid gap-3">
              {data.records[0]?.proposals.slice(0, 4).map((proposal) => (
                <div key={proposal.id} className="flex items-center justify-between rounded-md border border-line p-3">
                  <span className="text-sm font-bold">{proposal.field}</span>
                  <ConfidenceBadge score={proposal.confidence} />
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">High-Priority Follow-ups</h2>
            <div className="mt-3 grid gap-2">
              {highPriority.map((task) => (
                <Link key={task.id} href={`/repair/${task.recordId}`} className="rounded-md border border-line p-3 text-sm hover:bg-mist">
                  <div className="font-bold">{task.title}</div>
                  <div className="text-steel">{task.reason}</div>
                </Link>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              <h2 className="text-lg font-black">Recently Approved Write-backs</h2>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-steel">
              {data.syncHistory.map((item) => (
                <Link key={item.id} href={`/repair/${item.recordId}`} className="block rounded-md border border-line p-3 hover:bg-mist">
                  {item.summary}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
