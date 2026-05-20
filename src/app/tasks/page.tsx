import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { getData } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function TasksPage() {
  const data = await getData();
  return (
    <AppShell>
      <h1 className="text-3xl font-black">Action Center</h1>
      <p className="mt-1 text-steel">Tasks generated from repaired commitments, risks, and uncertainty.</p>
      <div className="mt-6 grid gap-3">
        {data.tasks.map((task) => (
          <Link key={task.id} href={`/repair/${task.recordId}`} className="rounded-lg border border-line bg-white p-4 shadow-panel hover:bg-mist">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-black">{task.title}</div>
                <div className="mt-1 text-sm text-steel">{task.reason}</div>
              </div>
              <div className="flex gap-2">
                <Badge tone={task.priority === "high" ? "danger" : task.priority === "medium" ? "warn" : "neutral"}>{task.priority}</Badge>
                <Badge>{task.status}</Badge>
                <Badge>{formatDate(task.dueAt)}</Badge>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
