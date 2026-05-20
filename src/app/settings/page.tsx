import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { ResetDemoButton } from "@/components/ResetDemoButton";
import { providerLabel } from "@/lib/provider";

const settings = [
  ["AI provider", providerLabel()],
  ["CRM sync", "Mock CRM write-back, local JSON persistence"],
  ["Approval mode", "Human approval required before sync"],
  ["Data handling", "Local-only demo data stored in /data"],
  ["Confidence model", "Direct evidence + freshness + conflict penalty"]
];

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Settings</h1>
          <p className="mt-1 text-steel">Production-oriented defaults for a local, safe demo.</p>
        </div>
        <ResetDemoButton />
      </div>
      <div className="mt-6 grid gap-4">
        {settings.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-line bg-white p-4 shadow-panel">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-bold uppercase text-steel">{label}</div>
                <div className="mt-1 font-black">{value}</div>
              </div>
              <Badge tone="good">enabled</Badge>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
