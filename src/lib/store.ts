import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { seedData } from "./seed";
import type { AppData, AuditEvent, RepairRecord } from "./types";
import { nowIso, uid } from "./utils";

const dataDir = path.join(process.cwd(), "data");
const dataFile = path.join(dataDir, "crm-repair-agent.json");

async function ensureDataFile() {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(seedData, null, 2), "utf8");
  }
}

function parseJson<T>(raw: string): T {
  return JSON.parse(raw.replace(/^\uFEFF/, "")) as T;
}

export async function getData(): Promise<AppData> {
  await ensureDataFile();
  return parseJson<AppData>(await readFile(dataFile, "utf8"));
}

export async function saveData(data: AppData) {
  await ensureDataFile();
  await writeFile(dataFile, JSON.stringify(data, null, 2), "utf8");
}

export async function resetData() {
  await saveData(seedData);
  return seedData;
}

export async function addAudit(event: Omit<AuditEvent, "id" | "createdAt">) {
  const data = await getData();
  data.audit.unshift({ ...event, id: uid("aud"), createdAt: nowIso() });
  await saveData(data);
}

export async function addRecord(record: RepairRecord) {
  const data = await getData();
  data.records.unshift(record);
  data.tasks.unshift(...record.tasks);
  data.draftEmails.unshift(record.draftEmail);
  data.audit.unshift({
    id: uid("aud"),
    kind: "input.received",
    actor: "Ayesha",
    recordId: record.id,
    accountId: record.accountId,
    detail: `Ingested ${record.inputType} input and created repair record ${record.title}.`,
    createdAt: nowIso()
  });
  data.audit.unshift({
    id: uid("aud"),
    kind: "extraction.performed",
    actor: "Repair engine",
    recordId: record.id,
    accountId: record.accountId,
    detail: `Generated ${record.proposals.length} proposals, ${record.contradictions.length} contradictions, ${record.commitments.length} commitments, and ${record.tasks.length} tasks.`,
    createdAt: nowIso()
  });
  await saveData(data);
}

export async function editProposal(recordId: string, proposalId: string, value: string) {
  const data = await getData();
  const record = data.records.find((item) => item.id === recordId);
  if (!record) throw new Error("Record not found");

  record.proposals = record.proposals.map((proposal) =>
    proposal.id === proposalId ? { ...proposal, editableValue: value } : proposal
  );
  record.syncPreview = record.syncPreview.map((row) => {
    const proposal = record.proposals.find((item) => item.field === row.field);
    return proposal ? { ...row, after: proposal.editableValue || proposal.proposedValue } : row;
  });
  record.updatedAt = nowIso();
  data.audit.unshift({
    id: uid("aud"),
    kind: "proposal.edited",
    actor: "Ayesha",
    recordId,
    accountId: record.accountId,
    detail: `Edited proposal ${proposalId} before approval.`,
    createdAt: nowIso()
  });
  await saveData(data);
  return record;
}

function applyRepairsToAccount(data: AppData, record: RepairRecord) {
  const account = data.accounts.find((item) => item.id === record.accountId);
  if (!account) return;

  const approved = record.proposals.filter((p) => p.approved);
  for (const proposal of approved) {
    const value = proposal.editableValue || proposal.proposedValue;
    if (proposal.field === "contact.title" && account.stakeholders[0]) {
      account.stakeholders[0].title = value;
      account.stakeholders[0].confidence = proposal.confidence;
    }
    if (proposal.field === "deal.stage" && account.deals[0]) {
      account.deals[0].stage = value;
    }
    if (proposal.field === "next_step") {
      account.nextActions[0] = value;
      account.deals[0] && (account.deals[0].urgency = `Commitment: ${value}`);
    }
    if (proposal.field === "company.size") {
      account.memoryGraph.push({ from: value, to: account.name, label: "headcount at" });
    }
  }

  account.timeline.unshift({
    id: uid("int"),
    accountId: account.id,
    type: "note",
    title: "CRM repair write-back applied",
    occurredAt: nowIso(),
    summary: `Synced ${approved.length} approved field repairs from ${record.title}.`,
    evidenceIds: record.evidence.slice(0, 2).map((ev) => ev.id)
  });

  const avg =
    approved.reduce((sum, proposal) => sum + proposal.confidence, 0) / Math.max(approved.length, 1);
  account.confidence = Math.round(avg || account.confidence);
  account.health = account.confidence >= 85 ? "strong" : account.confidence >= 70 ? "watch" : "at-risk";
}

export async function approveRecord(recordId: string, approvedIds: string[]) {
  const data = await getData();
  const record = data.records.find((item) => item.id === recordId);
  if (!record) throw new Error("Record not found");

  record.proposals = record.proposals.map((proposal) => ({
    ...proposal,
    approved: approvedIds.includes(proposal.id)
  }));
  record.status = "approved";
  record.updatedAt = nowIso();
  record.tasks = record.tasks.map((task) => ({ ...task, status: "approved" }));
  data.tasks = data.tasks.map((task) => (task.recordId === recordId ? { ...task, status: "approved" } : task));
  data.audit.unshift({
    id: uid("aud"),
    kind: "proposal.approved",
    actor: "Ayesha",
    recordId,
    accountId: record.accountId,
    detail: `Approved ${approvedIds.length} repair proposals for CRM write-back preview.`,
    createdAt: nowIso()
  });
  await saveData(data);
  return record;
}

export async function syncRecord(recordId: string) {
  const data = await getData();
  const record = data.records.find((item) => item.id === recordId);
  if (!record) throw new Error("Record not found");

  if (record.status !== "approved") {
    record.proposals = record.proposals.map((proposal) => ({ ...proposal, approved: true }));
  }

  record.status = "synced";
  record.updatedAt = nowIso();
  record.tasks = record.tasks.map((task) => ({ ...task, status: "synced" }));
  data.tasks = data.tasks.map((task) => (task.recordId === recordId ? { ...task, status: "synced" } : task));

  applyRepairsToAccount(data, record);

  const approvedCount = record.proposals.filter((item) => item.approved).length;
  data.syncHistory.unshift({
    id: uid("sync"),
    recordId,
    crm: "Mock CRM",
    summary: `Wrote ${approvedCount} approved repairs, ${record.tasks.length} tasks, and ${record.generatedAssets?.length || 0} action assets.`,
    createdAt: nowIso()
  });
  data.audit.unshift({
    id: uid("aud"),
    kind: "sync.completed",
    actor: "Mock CRM sync",
    recordId,
    accountId: record.accountId,
    detail: "Simulated CRM write-back completed. Account memory and audit trail updated.",
    createdAt: nowIso()
  });
  await saveData(data);
  return record;
}
