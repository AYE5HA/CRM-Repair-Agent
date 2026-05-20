"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ResetDemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function reset() {
    if (!confirm("Reset all demo data to the seeded HelioStack workspace?")) return;
    setLoading(true);
    await fetch("/api/reset", { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={reset}
      disabled={loading}
      className="rounded-md border border-line px-4 py-2 text-sm font-bold text-steel hover:bg-mist disabled:opacity-50"
    >
      {loading ? "Resetting..." : "Reset demo data"}
    </button>
  );
}
