import Link from "next/link";
import { BarChart3, GitCompareArrows, History, Inbox, ListTodo, Settings, ShieldCheck } from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/repair/rec_helio_repair", label: "Repair", icon: Inbox },
  { href: "/account/acct_heliostack", label: "Memory", icon: ShieldCheck },
  { href: "/sync", label: "CRM Sync", icon: GitCompareArrows },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <aside className="fixed left-0 top-0 hidden h-full w-64 border-r border-line bg-white px-5 py-6 lg:block">
        <Link href="/dashboard" className="block">
          <div className="text-lg font-black tracking-normal">CRM Repair Agent</div>
          <div className="mt-1 text-xs font-medium text-steel">Truth reconstruction for revenue teams</div>
        </Link>
        <nav className="mt-8 grid gap-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-steel hover:bg-mist hover:text-ink">
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
