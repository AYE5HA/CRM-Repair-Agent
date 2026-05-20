import { confidenceBand } from "@/lib/utils";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "good" | "warn" | "danger" }) {
  const classes = {
    neutral: "border-line bg-white text-steel",
    good: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    danger: "border-red-200 bg-red-50 text-red-700"
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${classes[tone]}`}>{children}</span>;
}

export function ConfidenceBadge({ score }: { score: number }) {
  const band = confidenceBand(score);
  return <Badge tone={band === "high" ? "good" : band === "medium" ? "warn" : "danger"}>{score}% confidence</Badge>;
}
