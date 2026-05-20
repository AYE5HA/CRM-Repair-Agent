import type { GeneratedAsset } from "@/lib/types";

const labels: Record<GeneratedAsset["type"], string> = {
  email: "Follow-up email",
  slack: "Slack handoff",
  deal_notes: "Deal notes",
  objection: "Objection snippet",
  reminder: "No-response reminder"
};

export function ActionAssets({ assets }: { assets: GeneratedAsset[] }) {
  return (
    <div className="grid gap-3">
      {assets.map((asset) => (
        <div key={asset.id} className="rounded-md border border-line p-3">
          <div className="text-xs font-bold uppercase text-repair">{labels[asset.type]}</div>
          <div className="mt-1 font-black">{asset.title}</div>
          <pre className="mt-2 whitespace-pre-wrap text-sm text-steel">{asset.body}</pre>
          <p className="mt-2 text-xs text-steel">{asset.rationale}</p>
        </div>
      ))}
    </div>
  );
}
