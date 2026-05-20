import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#eef4f7] text-ink">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-sm font-bold text-repair">
            <ShieldCheck size={16} />
            Demo workspace ready
          </div>
          <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-normal">CRM Repair Agent</h1>
          <p className="mt-4 max-w-2xl text-xl leading-8 text-steel">
            A truth reconstruction engine for fragmented sales context. It turns messy notes, calls, emails, and CRM rows into auditable account state.
          </p>
          <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {["Evidence ledger", "Contradiction radar", "Write-back preview"].map((item) => (
              <div key={item} className="rounded-lg border border-line bg-white p-4 text-sm font-bold shadow-panel">{item}</div>
            ))}
          </div>
        </section>
        <section className="rounded-lg border border-line bg-white p-6 shadow-panel">
          <div className="text-2xl font-black">Sign in</div>
          <p className="mt-2 text-sm text-steel">Use the seeded demo account. Auth is mocked locally so the product can run anywhere.</p>
          <div className="mt-5 grid gap-3">
            <input readOnly value="ayesha@example.com" className="rounded-md border border-line px-3 py-2 text-sm" />
            <input readOnly value="••••••••••" className="rounded-md border border-line px-3 py-2 text-sm" />
            <Link href="/dashboard" className="rounded-md bg-ink px-4 py-2 text-center text-sm font-bold text-white">Enter demo workspace</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
