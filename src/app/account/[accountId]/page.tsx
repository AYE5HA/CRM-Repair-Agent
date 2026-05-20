import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Badge, ConfidenceBadge } from "@/components/Badge";
import { getData } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default async function AccountPage({ params }: { params: Promise<{ accountId: string }> }) {
  const { accountId } = await params;
  const data = await getData();
  const account = data.accounts.find((item) => item.id === accountId);
  if (!account) notFound();

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{account.name}</h1>
          <p className="mt-1 text-steel">{account.domain} • account memory graph and action state</p>
        </div>
        <div className="flex gap-2">
          <Badge tone={account.health === "strong" ? "good" : account.health === "watch" ? "warn" : "danger"}>{account.health}</Badge>
          <ConfidenceBadge score={account.confidence} />
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
        <main className="grid gap-5">
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Account Overview</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {account.deals.map((deal) => (
                <div key={deal.id} className="rounded-md border border-line p-3">
                  <div className="text-xs font-bold uppercase text-steel">Deal</div>
                  <div className="mt-1 font-black">{deal.name}</div>
                  <div className="mt-1 text-sm text-steel">{deal.stage} • {deal.value}</div>
                  <div className="mt-2 text-sm font-semibold text-warning">{deal.urgency}</div>
                </div>
              ))}
              <div className="rounded-md border border-line p-3 md:col-span-2">
                <div className="text-xs font-bold uppercase text-steel">Unresolved Risks</div>
                <div className="mt-2 grid gap-2 text-sm">
                  {account.risks.map((risk) => <div key={risk} className="rounded-md bg-amber-50 p-2 text-amber-800">{risk}</div>)}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Account Memory Timeline</h2>
            <div className="mt-4 grid gap-3">
              {account.timeline.map((item) => (
                <div key={item.id} className="rounded-md border border-line p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-black">{item.title}</div>
                    <Badge>{item.type} • {formatDate(item.occurredAt)}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-steel">{item.summary}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Memory Graph</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              {account.memoryGraph.map((edge) => (
                <div key={`${edge.from}-${edge.to}-${edge.label}`} className="rounded-md border border-line bg-mist p-3 text-sm">
                  <span className="font-black">{edge.from}</span>
                  <span className="px-2 text-steel">→ {edge.label} →</span>
                  <span className="font-black">{edge.to}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        <aside className="grid gap-5 self-start">
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Stakeholders</h2>
            <div className="mt-4 grid gap-3">
              {account.stakeholders.map((person) => (
                <div key={person.id} className="rounded-md border border-line p-3">
                  <div className="font-black">{person.name}</div>
                  <div className="text-sm text-steel">{person.title}</div>
                  <div className="mt-2"><ConfidenceBadge score={person.confidence} /></div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <h2 className="text-lg font-black">Next Best Actions</h2>
            <div className="mt-3 grid gap-2">
              {account.nextActions.map((action, index) => (
                <div key={action} className="rounded-md border border-line p-3 text-sm">
                  <span className="mr-2 font-black text-repair">#{index + 1}</span>{action}
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
