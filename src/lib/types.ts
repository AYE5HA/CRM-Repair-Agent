export type ConfidenceBand = "high" | "medium" | "low";
export type ProposalAction = "keep" | "update" | "delete" | "merge" | "flag";
export type AuditKind =
  | "input.received"
  | "extraction.performed"
  | "field.proposed"
  | "proposal.edited"
  | "proposal.approved"
  | "sync.completed";

export type Evidence = {
  id: string;
  sourceType: "transcript" | "email" | "slack" | "crm" | "note" | "csv" | "pdf";
  sourceName: string;
  snippet: string;
  observedAt: string;
  freshnessDays: number;
};

export type FieldObservation = {
  field: string;
  value: string;
  evidenceId: string;
  confidence: number;
  freshnessDays: number;
};

export type FieldProposal = {
  id: string;
  field: string;
  currentValue: string;
  proposedValue: string;
  confidence: number;
  action: ProposalAction;
  rationale: string;
  evidenceIds: string[];
  contradictionStatus: "clear" | "conflicted" | "missing" | "stale";
  lastVerifiedAt: string;
  repairHistory: string[];
  editableValue?: string;
  approved?: boolean;
  batchId?: string;
};

export type Contradiction = {
  id: string;
  field: string;
  severity: "high" | "medium" | "low";
  summary: string;
  values: Array<{ value: string; evidenceId: string; sourceName: string }>;
  recommendedResolution: string;
};

export type Task = {
  id: string;
  accountId: string;
  recordId: string;
  title: string;
  priority: "high" | "medium" | "low";
  dueAt: string;
  status: "open" | "approved" | "synced" | "done";
  reason: string;
  kind?: "follow_up" | "call" | "email" | "handoff" | "qualification" | "deal_rescue";
};

export type DraftEmail = {
  id: string;
  accountId: string;
  recordId: string;
  subject: string;
  body: string;
  rationale: string;
};

export type GeneratedAsset = {
  id: string;
  type: "email" | "slack" | "deal_notes" | "objection" | "reminder";
  title: string;
  body: string;
  rationale: string;
};

export type Commitment = {
  id: string;
  text: string;
  dueHint: string;
  sourceEvidenceId: string;
  status: "open" | "at_risk" | "met";
};

export type SelfHealingHint = {
  id: string;
  trigger: string;
  suggestion: string;
  affectedFields: string[];
};

export type RepairBatch = {
  id: string;
  label: string;
  proposalIds: string[];
  summary: string;
};

export type StaleFlag = {
  id: string;
  field: string;
  reason: string;
  ageDays: number;
};

export type Interaction = {
  id: string;
  accountId: string;
  type: "call" | "email" | "slack" | "meeting" | "note";
  title: string;
  occurredAt: string;
  summary: string;
  evidenceIds: string[];
};

export type Contact = {
  id: string;
  accountId: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  confidence: number;
};

export type Deal = {
  id: string;
  accountId: string;
  name: string;
  stage: string;
  value?: string;
  urgency: string;
  risks: string[];
};

export type Account = {
  id: string;
  name: string;
  domain?: string;
  health: "strong" | "watch" | "at-risk";
  confidence: number;
  stakeholders: Contact[];
  deals: Deal[];
  timeline: Interaction[];
  risks: string[];
  nextActions: string[];
  memoryGraph: Array<{ from: string; to: string; label: string }>;
};

export type RepairRecord = {
  id: string;
  accountId: string;
  title: string;
  status: "needs_repair" | "in_review" | "approved" | "synced";
  inputText: string;
  inputType: Evidence["sourceType"];
  createdAt: string;
  updatedAt: string;
  extracted: FieldObservation[];
  evidence: Evidence[];
  proposals: FieldProposal[];
  contradictions: Contradiction[];
  minimumQuestions: Array<{ question: string; impact: string; resolves: string[] }>;
  tasks: Task[];
  draftEmail: DraftEmail;
  generatedAssets: GeneratedAsset[];
  commitments: Commitment[];
  selfHealing: SelfHealingHint[];
  repairBatches: RepairBatch[];
  staleFlags: StaleFlag[];
  syncPreview: Array<{
    field: string;
    before: string;
    after: string;
    impact: string;
    uncertain: boolean;
  }>;
};

export type AuditEvent = {
  id: string;
  kind: AuditKind;
  actor: string;
  recordId?: string;
  accountId?: string;
  detail: string;
  createdAt: string;
};

export type AppData = {
  workspace: { id: string; name: string };
  user: { id: string; name: string; email: string; role: string };
  accounts: Account[];
  records: RepairRecord[];
  tasks: Task[];
  draftEmails: DraftEmail[];
  audit: AuditEvent[];
  syncHistory: Array<{ id: string; recordId: string; crm: string; summary: string; createdAt: string }>;
};
