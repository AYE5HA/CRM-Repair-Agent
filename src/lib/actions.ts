import type {
  Commitment,
  DraftEmail,
  Evidence,
  FieldProposal,
  GeneratedAsset,
  RepairBatch,
  SelfHealingHint,
  StaleFlag,
  Task
} from "./types";
import { daysAgo, uid } from "./utils";

function findSnippet(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[0]) return match[0].trim();
  }
  return "";
}

export function buildCommitments(inputText: string, evidence: Evidence[]): Commitment[] {
  const items: Array<{ text: string; dueHint: string; pattern: RegExp }> = [
    { text: "Send security packet and pilot plan", dueHint: "May 22", pattern: /send the security packet and a pilot plan by ([^.\n]+)/i },
    { text: "Deliver pilot proposal", dueHint: "before Friday", pattern: /pilot proposal before ([^.\n]+)/i },
    { text: "Send SOC2 packet and pilot checklist", dueHint: "May 28", pattern: /send (SOC2[^.\n]+) by ([^.\n]+)/i }
  ];

  const commitments: Commitment[] = [];
  for (const item of items) {
    const match = inputText.match(item.pattern);
    if (!match) continue;
    const dueHint = match[2] || match[1] || item.dueHint;
    commitments.push({
      id: uid("cmt"),
      text: item.text,
      dueHint,
      sourceEvidenceId: evidence[0]?.id || "",
      status: /pause|slip|Q3/i.test(inputText) ? "at_risk" : "open"
    });
  }
  return commitments;
}

export function buildStaleFlags(evidence: Evidence[], proposals: FieldProposal[]): StaleFlag[] {
  const staleEvidence = evidence.filter((item) => item.freshnessDays >= 30);
  const flags: StaleFlag[] = staleEvidence.map((item) => ({
    id: uid("stale"),
    field: item.sourceType === "crm" ? "crm.baseline" : item.sourceName,
    reason: `Source is ${item.freshnessDays} days old and may be superseded by fresher inputs.`,
    ageDays: item.freshnessDays
  }));

  proposals
    .filter((proposal) => proposal.contradictionStatus === "stale")
    .forEach((proposal) => {
      flags.push({
        id: uid("stale"),
        field: proposal.field,
        reason: `CRM value "${proposal.currentValue}" is stale relative to buyer commitments.`,
        ageDays: 45
      });
    });

  return flags;
}

export function buildRepairBatches(proposals: FieldProposal[]): RepairBatch[] {
  const contactIds = proposals.filter((p) => p.field.startsWith("contact.")).map((p) => p.id);
  const dealIds = proposals.filter((p) => p.field.startsWith("deal.") || p.field === "next_step").map((p) => p.id);
  const companyIds = proposals.filter((p) => p.field.startsWith("company.") || p.field === "pain_points").map((p) => p.id);

  const batches: RepairBatch[] = [];
  if (contactIds.length) {
    batches.push({
      id: uid("batch"),
      label: "Contact identity batch",
      proposalIds: contactIds,
      summary: "Update title, email, and outreach context together to avoid partial contact repairs."
    });
  }
  if (dealIds.length) {
    batches.push({
      id: uid("batch"),
      label: "Deal momentum batch",
      proposalIds: dealIds,
      summary: "Stage and next-step should move together so forecast and tasks stay aligned."
    });
  }
  if (companyIds.length) {
    batches.push({
      id: uid("batch"),
      label: "Account context batch",
      proposalIds: companyIds,
      summary: "Refresh company facts and pain points before prioritization changes."
    });
  }

  proposals.forEach((proposal) => {
    const batch = batches.find((item) => item.proposalIds.includes(proposal.id));
    if (batch) proposal.batchId = batch.id;
  });

  return batches;
}

export function buildSelfHealing(proposals: FieldProposal[]): SelfHealingHint[] {
  const hints: SelfHealingHint[] = [];
  const title = proposals.find((p) => p.field === "contact.title");
  const stage = proposals.find((p) => p.field === "deal.stage");
  const nextStep = proposals.find((p) => p.field === "next_step");
  const size = proposals.find((p) => p.field === "company.size");

  if (title?.proposedValue) {
    hints.push({
      id: uid("heal"),
      trigger: "Contact role changed",
      suggestion: `Update outreach templates and stakeholder map to reflect ${title.proposedValue}.`,
      affectedFields: ["contact.title", "stakeholders", "email.tone"]
    });
  }
  if (stage?.proposedValue) {
    hints.push({
      id: uid("heal"),
      trigger: "Deal stage advanced",
      suggestion: "Regenerate proposal tasks and forecast category; close generic discovery follow-ups.",
      affectedFields: ["deal.stage", "tasks", "forecast"]
    });
  }
  if (nextStep?.proposedValue) {
    hints.push({
      id: uid("heal"),
      trigger: "Next step became specific",
      suggestion: "Replace generic deck task with dated deliverables and attach security reviewer if mentioned.",
      affectedFields: ["next_step", "tasks", "reminders"]
    });
  }
  if (size?.proposedValue) {
    hints.push({
      id: uid("heal"),
      trigger: "Company size updated",
      suggestion: "Re-score account priority and adjust segmentation tags after funding/headcount change.",
      affectedFields: ["company.size", "priority", "messaging"]
    });
  }

  return hints;
}

export function buildTasks(
  recordId: string,
  accountId: string,
  nextStep: string,
  urgency: string,
  inputText: string
): Task[] {
  const tasks: Task[] = [
    {
      id: uid("task"),
      accountId,
      recordId,
      title: nextStep === "Clarify next concrete action" ? "Ask for the next committed buyer action" : nextStep,
      priority: urgency ? "high" : "medium",
      dueAt: daysAgo(-2),
      status: "open",
      reason: urgency ? `Urgency signal: ${urgency}` : "Generated from repaired next-step field.",
      kind: "follow_up"
    }
  ];

  if (/security|SOC2|packet/i.test(inputText)) {
    tasks.push({
      id: uid("task"),
      accountId,
      recordId,
      title: "Route security packet to reviewer",
      priority: "high",
      dueAt: daysAgo(-1),
      status: "open",
      reason: "Security review is on the critical path.",
      kind: "email"
    });
  }
  if (/handoff|RevOps|finance/i.test(inputText)) {
    tasks.push({
      id: uid("task"),
      accountId,
      recordId,
      title: "Internal handoff: RevOps + finance alignment",
      priority: "medium",
      dueAt: daysAgo(-3),
      status: "open",
      reason: "Cross-functional stakeholders mentioned in source evidence.",
      kind: "handoff"
    });
  }
  if (/pause|Q3|slip/i.test(inputText)) {
    tasks.push({
      id: uid("task"),
      accountId,
      recordId,
      title: "Deal rescue: confirm deadline before pipeline pause",
      priority: "high",
      dueAt: daysAgo(-1),
      status: "open",
      reason: "Buyer stated deal pauses if commitment is missed.",
      kind: "deal_rescue"
    });
  }

  return tasks;
}

export function buildGeneratedAssets(params: {
  recordId: string;
  accountId: string;
  company: string;
  contact: string;
  nextStep: string;
  pain: string;
  objection: string;
  urgency: string;
  draftEmail: DraftEmail;
}): GeneratedAsset[] {
  const firstName = params.contact === "Unknown contact" ? "there" : params.contact.split(" ")[0];
  return [
    {
      id: uid("asset"),
      type: "email",
      title: params.draftEmail.subject,
      body: params.draftEmail.body,
      rationale: params.draftEmail.rationale
    },
    {
      id: uid("asset"),
      type: "slack",
      title: "Internal handoff note",
      body: `*${params.company} repair summary*\n• Pain: ${params.pain}\n• Next step: ${params.nextStep}\n• ${params.urgency ? `Urgency: ${params.urgency}` : "Confirm deadline with buyer"}\n• Needs: security path + implementation owner before sync.`,
      rationale: "Gives CS/AE teams the repaired truth without opening the full repair workspace."
    },
    {
      id: uid("asset"),
      type: "deal_notes",
      title: "Updated deal notes",
      body: `${params.company}: Buyer pain is ${params.pain}. Repaired next step: ${params.nextStep}. ${params.objection ? `Open concern: ${params.objection}.` : ""}`,
      rationale: "CRM-ready narrative grounded in evidence-backed repairs."
    },
    {
      id: uid("asset"),
      type: "objection",
      title: "Objection handling snippet",
      body: params.objection
        ? `If "${params.objection}" resurfaces: acknowledge the constraint, cite the sub-30-day implementation path, and offer a security-first pilot scope.`
        : "No explicit objection captured. Default to timeline + security proof points.",
      rationale: "Prepared only when an objection signal exists in the source text."
    },
    {
      id: uid("asset"),
      type: "reminder",
      title: "No-response reminder",
      body: `If no reply from ${firstName} within 48h of sending assets, ping with: "Happy to adjust the pilot plan — still aiming for ${params.urgency || "your target date"}?"`,
      rationale: "Protects the commitment window without generic nurture language."
    }
  ];
}

export function buildDraftEmail(company: string, contact: string, nextStep: string, questions: string[]) {
  const firstName = contact === "Unknown contact" ? "there" : contact.split(" ")[0];
  const questionLine = questions[0] ? `\n\nQuick confirm: ${questions[0]}` : "";
  return {
    subject: `Next steps for ${company}`,
    body: `Hi ${firstName},\n\nThanks for the context. I captured the key next step as: ${nextStep}.${questionLine}\n\nBest,\nAyesha`,
    rationale: "Draft is grounded in the repaired next step and asks only the highest-impact clarification."
  };
}

export function extractObjection(text: string) {
  return findSnippet(text, [/(?:objection|concern)[:\s-]+([^.\n]+)/i, /security review cannot slip/i]);
}
