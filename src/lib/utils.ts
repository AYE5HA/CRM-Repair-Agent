export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export function confidenceBand(score: number) {
  if (score >= 82) return "high";
  if (score >= 62) return "medium";
  return "low";
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(
    new Date(value)
  );
}

export function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}
