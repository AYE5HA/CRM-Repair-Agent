import Link from "next/link";
import { GitCompareArrows, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { ResetDemoButton } from "@/components/ResetDemoButton";
import { getData } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function SyncPage() {
  const data = await getData();
  const pending = data.records.filter((r) => r.status === "approved");
  const ready = data.records.filter((r) => r.status === "needs_repair" || r.status === "in_review");

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">CRM Sync / Action Center</h1>
          <p className="mt-1 text-steel">Write-back preview, approved updates, and mocked sync history. Nothing writes without approval.</p>
        </div>
        <ResetDemoButton />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <div className="flex items-center gap-2">
            <GitCompareArrows size={18} />
            <h2 className="text-lg font-black">Approved — ready to sync</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {pending.length === 0 ? (
              <p className="text-sm text-steel">No approved records. Approve repairs on a record page first.</p>
            ) : (
              pending.map((record) => (
                <Link key={record.id} href={`/repair/${record.id}`} className="rounded-md border border-emerald-200 bg-emerald-50 p-3 hover:bg-emerald-100">
                  <div className="font-black">{record.title}</div>
                  <div className="mt-1 text-sm text-steel">
                    {record.proposals.filter((p) => p.approved).length} approved fields • {record.tasks.length} tasks
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
          <h2 className="text-lg font-black">Awaiting approval</h2>
          <div className="mt-4 grid gap-3">
            {ready.map((record) => (
              <Link key={record.id} href={`/repair/${record.id}`} className="rounded-md border border-line p-3 hover:bg-mist">
                <div className="font-black">{record.title}</div>
                <Badge tone="warn">{record.status.replace("_", " ")}</Badge>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-lg border border-line bg-white p-4 shadow-panel">
        <h2 className="text-lg font-black">Write-back preview (all records)</h2>
        <div className="mt-4 grid gap-4">
          {data.records.map((record) => (
            <div key={record.id} className="rounded-md border border-line p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Link href={`/repair/${record.id}`} className="font-black hover:text-repair">
                  {record.title}
                </Link>
                <Badge tone={record.status === "synced" ? "good" : "neutral"}>{record.status}</Badge>
              </div>
              <div className="mt-3 grid gap-2">
                {record.syncPreview.map((row) => (
                  <div key={row.field} className="grid gap-2 text-sm md:grid-cols-[140px_1fr_1fr]">
                    <span className="font-bold">{row.field}</span>
                    <span className="text-red-700 line-through decoration-red-300">{row.before}</span>
                    <span className="text-emerald-700">{row.after}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-line bg-white p-4 shadow-panel">
        <div className="flex items-center gap-2">
          <RefreshCw size={18} />
          <h2 className="text-lg font-black">Sync history</h2>
        </div>
        <div className="mt-4 grid gap-2">
          {data.syncHistory.map((item) => (
            <div key={item.id} className="rounded-md border border-line p-3 text-sm">
              <div className="font-bold">{item.summary}</div>
              <div className="text-steel">
                {item.crm} • {formatDate(item.createdAt)} •{" "}
                <Link href={`/repair/${item.recordId}`} className="text-repair">
                  view record
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
