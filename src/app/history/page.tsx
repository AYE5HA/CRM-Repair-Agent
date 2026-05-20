import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { getData } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function HistoryPage() {
  const data = await getData();
  return (
    <AppShell>
      <h1 className="text-3xl font-black">Audit History</h1>
      <p className="mt-1 text-steel">Every input, extraction, approval, and mocked write-back is preserved.</p>
      <div className="mt-6 grid gap-3">
        {data.audit.map((event) => (
          <div key={event.id} className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-black">{event.detail}</div>
                <div className="mt-1 text-sm text-steel">{event.actor} • {formatDate(event.createdAt)}</div>
              </div>
              <Badge>{event.kind}</Badge>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
