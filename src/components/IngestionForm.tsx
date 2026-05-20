"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { UploadCloud } from "lucide-react";

const sample = `Account NimbusOps. CRM says contact Jordan Lee, Director IT, stage Discovery.
Call note: Jordan is now VP Operations. They are evaluating CRM Repair Agent for renewal handoff leakage.
Concern: security review cannot slip. Please send SOC2 packet and pilot checklist by May 28.
Budget is approved if onboarding takes less than 21 days. Priya Shah from finance must be included.`;

export function IngestionForm() {
  const router = useRouter();
  const [text, setText] = useState(sample);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    formData.set("text", text);
    const response = await fetch("/api/ingest", { method: "POST", body: formData });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error || "Unable to ingest input.");
      return;
    }
    router.push(`/repair/${payload.record.id}`);
    router.refresh();
  }

  return (
    <form action={submit} className="rounded-lg border border-line bg-white p-4 shadow-panel">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black">Inbox / Input</h2>
          <p className="text-sm text-steel">Paste a transcript, CRM row, email thread, Slack note, or upload txt/md/csv.</p>
        </div>
        <select name="inputType" className="rounded-md border border-line bg-white px-3 py-2 text-sm font-semibold">
          <option value="transcript">Transcript</option>
          <option value="email">Email</option>
          <option value="slack">Slack</option>
          <option value="crm">CRM row</option>
          <option value="note">Note</option>
          <option value="csv">CSV</option>
        </select>
      </div>
      <textarea value={text} onChange={(event) => setText(event.target.value)} className="mt-4 h-48 w-full resize-none rounded-md border border-line p-3 text-sm outline-none focus:border-repair" />
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold text-steel hover:bg-mist">
          <UploadCloud size={16} />
          Upload file
          <input name="file" type="file" accept=".txt,.md,.csv,.pdf" className="hidden" />
        </label>
        {error ? <span className="text-sm font-semibold text-danger">{error}</span> : null}
        <button disabled={loading} className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
          {loading ? "Reconstructing..." : "Run repair analysis"}
        </button>
      </div>
    </form>
  );
}
