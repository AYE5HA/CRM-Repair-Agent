# CRM Repair Agent

CRM Repair Agent is a full-stack Next.js product that reconstructs the most likely truth from messy sales inputs, detects contradictions, proposes evidence-backed CRM repairs, and simulates approved write-back into a local CRM sync layer.

It is intentionally **not** a generic chatbot. The core experience is a **truth ledger**: every important CRM field shows the current value, proposed repair, confidence score, evidence snippets, freshness, contradiction status, and repair history.

## What Is Included

- Login and demo workspace
- Dashboard with repair queue, contradiction radar, high-priority follow-ups, write-back status, and confidence heatmap
- Inbox ingestion for pasted text and `.txt`, `.md`, `.csv`, `.pdf` metadata uploads
- Deterministic analysis pipeline: extraction, confidence scoring, contradictions, minimum questions, repair batches, commitments, self-healing hints, tasks, and action assets
- Repair workspace with editable evidence-first field ledger and color-coded before/after CRM diff
- Human approval flow (approve before sync) and mocked CRM sync engine
- Account memory view with timeline, stakeholders, risks, next actions, and memory graph
- CRM Sync / Action Center (`/sync`) with write-back previews and sync history
- Tasks, history/audit trail, settings with demo reset, seeded HelioStack data, and sample transcripts

## Special Features 

1. **Before/After CRM Diff** — color-coded field changes with downstream impact
2. **Evidence-first repair** — every update links to source snippets and freshness
3. **Contradiction radar** — conflicts across CRM vs call/email/Slack
4. **Account memory timeline** — interactions assembled into narrative state
5. **Confidence heatmap** — per-field interpretable scores
6. **Repair batches** — related fields grouped for safe joint updates
7. **Commitment tracker** — promises and deadlines from calls
8. **Stale-info detector** — old CRM baseline vs fresh inputs
9. **Minimum-question generator** — only high-impact clarifications
10. **Self-healing CRM** — cascading update suggestions when one field changes

## Tech Stack

- Next.js App Router (React 19)
- Tailwind CSS
- Local JSON persistence in `data/crm-repair-agent.json`
- Mock auth and mocked CRM write-back
- Deterministic repair engine (`src/lib/analyzer.ts`) with OpenAI seam (`src/lib/provider.ts`)

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login).

Reset seeded data anytime:

```bash
npm run seed
# or use "Reset demo data" in Settings / CRM Sync
```

## Demo Walkthrough (under 2 minutes)

1. Sign in from `/login` → **Enter demo workspace**
2. On `/dashboard`, review HelioStack queue, contradiction radar, and follow-ups
3. Open `/repair/rec_helio_repair`
4. Inspect truth ledger, heatmap, contradictions, commitments, batches, action assets
5. Edit a proposed value if needed → **Approve selected** → **Write to Mock CRM**
6. Visit `/account/acct_heliostack` for updated memory timeline
7. Visit `/sync` and `/history` for write-back preview and audit trail

Try ingestion: paste text from `public/samples/heliostack-transcript.txt` or `nimbus-crm-row.txt` on the dashboard.

## Architecture

```text
src/app/                 Next.js routes and API endpoints
src/components/          Reusable product UI
src/lib/analyzer.ts      Extraction + orchestration entry
src/lib/actions.ts       Tasks, assets, commitments, batches, self-healing
src/lib/store.ts         Persistence, approval, sync, audit
src/lib/seed.ts          Seeded demo workspace
src/lib/types.ts         Product data model
src/lib/provider.ts      LLM provider seam
public/samples/          Walkthrough inputs
```

Layers: UI → API orchestration → extraction/scoring/contradiction/action generation → persistence → audit.

## Production Extension Points

- Set `OPENAI_API_KEY` and extend `provider.ts` for LLM-assisted extraction (keep deterministic confidence scoring)
- Swap JSON store for SQLite / Postgres / Supabase
- Replace mock auth with NextAuth or Supabase Auth
- Plug real CRM adapters behind `syncRecord`
- Add PDF/OCR parsing for document ingestion

## Routes

| Route | Purpose |
|-------|---------|
| `/login` | Mock sign-in |
| `/dashboard` | Command center + ingestion |
| `/repair/[recordId]` | Truth ledger + approval |
| `/account/[accountId]` | Account memory |
| `/sync` | CRM write-back center |
| `/tasks` | Generated tasks |
| `/history` | Audit log |
| `/settings` | Config + demo reset |
