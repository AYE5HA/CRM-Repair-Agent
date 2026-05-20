import {
  buildCommitments,
  buildDraftEmail,
  buildGeneratedAssets,
  buildRepairBatches,
  buildSelfHealing,
  buildStaleFlags,
  buildTasks,
  extractObjection
} from "./actions";
import type { Evidence, FieldObservation, FieldProposal, RepairRecord } from "./types";
import { clamp, daysAgo, nowIso, uid } from "./utils";

const fields = [
  "contact.name",
  "contact.title",
  "company.name",
  "contact.email",
  "contact.phone",
  "deal.stage",
  "pain_points",
  "objections",
  "next_step",
  "stakeholders",
  "product_interest",
  "budget",
  "urgency",
  "company.size"
];

function findValue(text: string, patterns: RegExp[], fallback = "") {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim().replace(/[.,;]$/, "");
  }
  return fallback;
}

function evidenceFor(sourceName: string, sourceType: Evidence["sourceType"], snippet: string, days: number): Evidence {
  return {
    id: uid("ev"),
    sourceName,
    sourceType,
    snippet: snippet.slice(0, 260),
    observedAt: daysAgo(days),
    freshnessDays: days
  };
}

function score(value: string, evidenceCount: number, freshnessDays: number, conflicted = false) {
  const base = value ? 52 : 24;
  return clamp(base + evidenceCount * 18 + Math.max(0, 22 - freshnessDays) - (conflicted ? 18 : 0));
}

function crmBaseline(field: string) {
  const map: Record<string, string> = {
    "contact.title": "VP Marketing",
    "deal.stage": "Discovery",
    next_step: "Send generic deck",
    "company.size": "80 employees"
  };
  return map[field] || "Unknown / stale";
}

export function analyzeInput(inputText: string, inputType: Evidence["sourceType"] = "note"): RepairRecord {
  const title = findValue(
    inputText,
    [/account\s+([A-Z][\w\s-]+)/i, /company[:\s]+([A-Z][\w\s-]+)/i],
    "New reconstructed account"
  );
  const company = findValue(inputText, [/account\s+([A-Z][\w\s-]+)/i, /company[:\s]+([A-Z][\w\s-]+)/i], "Unknown company");
  const contact = findValue(
    inputText,
    [/contact\s+([A-Z][a-z]+ [A-Z][a-z]+)/i, /primary contact\s+([A-Z][a-z]+ [A-Z][a-z]+)/i, /(?:with|from)\s+([A-Z][a-z]+ [A-Z][a-z]+)/i],
    "Unknown contact"
  );
  const titleValue = findValue(
    inputText,
    [
      /(?:now|as|title is|role is|you're now)\s+(Chief [\w\s]+|VP [\w\s]+|Director [\w\s]+|Head of [\w\s]+)/i,
      /moved into\s+(CRO|Chief [\w\s]+)/i
    ],
    ""
  );
  const email = findValue(inputText, [/([\w.-]+@[\w.-]+\.\w+)/i], "");
  const phone = findValue(inputText, [/(\+?\d[\d\s().-]{7,}\d)/], "");
  const stage = /proposal|pilot/i.test(inputText)
    ? "Proposal requested"
    : /discovery/i.test(inputText)
      ? "Discovery"
      : "Needs qualification";
  const nextStep = findValue(
    inputText,
    [
      /(?:please|next step|action item|todo)[:\s-]+([^.\n]+)/i,
      /(send (?:the )?[^.\n]+)/i,
      /(SOC2[^.\n]+)/i
    ],
    "Clarify next concrete action"
  );
  const pain = findValue(
    inputText,
    [/(?:pain is|pain point is|real pain is)\s+([^.\n]+)/i, /struggling with\s+([^.\n]+)/i, /handoff leakage[^.\n]*/i],
    "Fragmented customer context"
  );
  const objection = extractObjection(inputText);
  const budget = findValue(inputText, [/(budget[^.\n]+)/i, /(\$[\d,kK]+[^.\n]*)/i], "");
  const urgency = findValue(inputText, [/(before [A-Z][a-z]+ \d{1,2})/i, /(by [A-Z][a-z]+ \d{1,2})/i, /(until Q[1-4])/i], "");
  const companySize = findValue(inputText, [/(\d{2,4})\s+employees/i, /has\s+(\d{2,4})\s+employees/i], "");
  const stakeholders = [...inputText.matchAll(/\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g)]
    .map((match) => match[1])
    .filter((name, index, list) => list.indexOf(name) === index)
    .slice(0, 5);

  const evidence: Evidence[] = [
    evidenceFor("User pasted input", inputType, inputText, 0),
    evidenceFor(
      "Current CRM baseline",
      "crm",
      "Existing CRM fields were treated as lower-freshness baseline evidence when contradicted by pasted input.",
      45
    )
  ];

  if (/slack|series|employees/i.test(inputText)) {
    evidence.push(evidenceFor("Slack / enrichment note", "slack", findValue(inputText, [/[^.\n]{20,120}/], inputText), 5));
  }

  const extractedValues: Record<string, string> = {
    "contact.name": contact,
    "contact.title": titleValue,
    "company.name": company,
    "contact.email": email,
    "contact.phone": phone,
    "deal.stage": stage,
    pain_points: pain,
    objections: objection,
    next_step: nextStep,
    stakeholders: stakeholders.join(", "),
    product_interest: findValue(inputText, [/(?:interested in|evaluating|looking at)\s+([^.\n]+)/i], "CRM repair workflow"),
    budget,
    urgency,
    "company.size": companySize ? `${companySize} employees` : ""
  };

  const extracted: FieldObservation[] = fields
    .filter((field) => extractedValues[field])
    .map((field) => ({
      field,
      value: extractedValues[field],
      evidenceId: evidence[0].id,
      confidence: score(extractedValues[field], evidence.length, 0),
      freshnessDays: 0
    }));

  const proposals: FieldProposal[] = extracted.map((item) => {
    const currentValue = crmBaseline(item.field);
    const conflicted = currentValue !== "Unknown / stale" && currentValue !== item.value;
    const stale = item.field === "next_step" && /generic/i.test(currentValue);
    return {
      id: uid("prop"),
      field: item.field,
      currentValue,
      proposedValue: item.value,
      confidence: score(item.value, evidence.length, item.freshnessDays, conflicted),
      action: item.value ? "update" : "flag",
      rationale: `${item.field} is supported by fresh pasted evidence. Confidence reflects direct mention, source freshness, and whether the CRM baseline conflicts.`,
      evidenceIds: evidence.slice(0, conflicted ? 2 : 1).map((ev) => ev.id),
      contradictionStatus: conflicted ? "conflicted" : stale ? "stale" : "clear",
      lastVerifiedAt: nowIso(),
      repairHistory: ["Generated from ingestion pipeline", conflicted ? "Conflicts with CRM baseline" : "No direct conflict found"]
    };
  });

  const contradictions = proposals
    .filter((proposal) => proposal.contradictionStatus === "conflicted")
    .map((proposal) => ({
      id: uid("con"),
      field: proposal.field,
      severity: "high" as const,
      summary: `${proposal.field} has a fresher value than the CRM baseline.`,
      values: [
        { value: proposal.currentValue, evidenceId: evidence[1].id, sourceName: evidence[1].sourceName },
        { value: proposal.proposedValue, evidenceId: evidence[0].id, sourceName: evidence[0].sourceName }
      ],
      recommendedResolution: `Use "${proposal.proposedValue}" unless the user rejects this repair.`
    }));

  const minimumQuestions = [
    {
      question: "Which stakeholder has final authority for the next committed step?",
      impact: "Resolves ownership and prevents follow-up from going to the wrong person.",
      resolves: ["stakeholder_authority", "next_step_owner"]
    },
    {
      question: urgency
        ? `Is ${urgency} a hard deadline or a preference?`
        : "What date should the follow-up be anchored to?",
      impact: "Turns ambiguous urgency into a reliable task deadline.",
      resolves: ["deadline_confidence"]
    }
  ].filter((_, index) => index === 0 || urgency);

  const recordId = uid("rec");
  const accountId = "acct_heliostack";
  const emailDraft = buildDraftEmail(company, contact, nextStep, minimumQuestions.map((q) => q.question));
  const tasks = buildTasks(recordId, accountId, nextStep, urgency, inputText);
  const repairBatches = buildRepairBatches(proposals);
  const staleFlags = buildStaleFlags(evidence, proposals);
  const selfHealing = buildSelfHealing(proposals);
  const commitments = buildCommitments(inputText, evidence);

  const draftEmail = {
    id: uid("email"),
    accountId,
    recordId,
    ...emailDraft
  };

  const generatedAssets = buildGeneratedAssets({
    recordId,
    accountId,
    company,
    contact,
    nextStep,
    pain,
    objection,
    urgency,
    draftEmail
  });

  return {
    id: recordId,
    accountId,
    title,
    status: "needs_repair",
    inputText,
    inputType,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    evidence,
    extracted,
    proposals,
    contradictions,
    minimumQuestions,
    tasks,
    draftEmail,
    generatedAssets,
    commitments,
    selfHealing,
    repairBatches,
    staleFlags,
    syncPreview: proposals.map((proposal) => ({
      field: proposal.field,
      before: proposal.currentValue,
      after: proposal.proposedValue,
      impact:
        proposal.field === "deal.stage"
          ? "Updates forecast and task priority"
          : proposal.field === "contact.title"
            ? "Updates outreach context and stakeholder map"
            : "Refreshes CRM truth ledger",
      uncertain: proposal.confidence < 70
    }))
  };
}
