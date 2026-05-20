import type { AppData } from "./types";
import { daysAgo, nowIso } from "./utils";

const transcript = `CRM export says: Account HelioStack, primary contact Maya Chen, VP Marketing, stage Discovery, next step "send generic deck".

Call transcript May 18:
Alex: Maya, just to confirm, you're now Chief Revenue Officer?
Maya: Yes, I moved into CRO last quarter. Priya Nair owns RevOps and Daniel Cho is our security reviewer.
Maya: The real pain is handoff leakage between sales and success. We lose renewal context in Slack.
Alex: Is this still exploratory?
Maya: No, we need a pilot proposal before Friday. Budget is available if implementation is under 30 days.
Maya: Please send the security packet and a pilot plan by May 22. If we don't have it by then we will pause until Q3.
Later Slack note: HelioStack raised Series B in March and has 180 employees, not 80.`;

export const seedData: AppData = {
  workspace: { id: "ws_demo", name: "Demo Revenue Workspace" },
  user: { id: "usr_ayesha", name: "Ayesha", email: "ayesha@example.com", role: "Founder" },
  accounts: [
    {
      id: "acct_heliostack",
      name: "HelioStack",
      domain: "heliostack.io",
      health: "watch",
      confidence: 78,
      stakeholders: [
        { id: "ct_maya", accountId: "acct_heliostack", name: "Maya Chen", title: "Chief Revenue Officer", email: "maya@heliostack.io", confidence: 93 },
        { id: "ct_priya", accountId: "acct_heliostack", name: "Priya Nair", title: "RevOps Lead", confidence: 72 },
        { id: "ct_daniel", accountId: "acct_heliostack", name: "Daniel Cho", title: "Security Reviewer", confidence: 69 }
      ],
      deals: [
        {
          id: "deal_helio_pilot",
          accountId: "acct_heliostack",
          name: "CRM Repair Pilot",
          stage: "Proposal requested",
          value: "$42k",
          urgency: "Pilot proposal due May 22",
          risks: ["Security packet not sent", "Timeline slips to Q3 if May 22 commitment is missed"]
        }
      ],
      timeline: [
        {
          id: "int_call_1",
          accountId: "acct_heliostack",
          type: "call",
          title: "Discovery call shifted into pilot request",
          occurredAt: daysAgo(2),
          summary: "Maya clarified title, urgency, budget gate, stakeholders, and a hard follow-up commitment.",
          evidenceIds: ["ev_call_1", "ev_call_2", "ev_slack_1"]
        }
      ],
      risks: ["Old CRM stage understates deal readiness", "Security reviewer is not attached to account"],
      nextActions: ["Send pilot plan and security packet", "Ask Priya for implementation owner", "Set no-response reminder"],
      memoryGraph: [
        { from: "Maya Chen", to: "HelioStack", label: "CRO at" },
        { from: "Priya Nair", to: "CRM Repair Pilot", label: "owns RevOps evaluation" },
        { from: "Daniel Cho", to: "Security packet", label: "reviews" },
        { from: "Series B", to: "Priority", label: "raises urgency" }
      ]
    }
  ],
  records: [
    {
      id: "rec_helio_repair",
      accountId: "acct_heliostack",
      title: "HelioStack fragmented call + CRM row",
      status: "needs_repair",
      inputText: transcript,
      inputType: "transcript",
      createdAt: daysAgo(1),
      updatedAt: nowIso(),
      evidence: [
        { id: "ev_crm_1", sourceType: "crm", sourceName: "CRM export row", snippet: "primary contact Maya Chen, VP Marketing, stage Discovery, next step send generic deck", observedAt: daysAgo(55), freshnessDays: 55 },
        { id: "ev_call_1", sourceType: "transcript", sourceName: "May 18 call", snippet: "you're now Chief Revenue Officer? Yes, I moved into CRO last quarter.", observedAt: daysAgo(2), freshnessDays: 2 },
        { id: "ev_call_2", sourceType: "transcript", sourceName: "May 18 call", snippet: "No, we need a pilot proposal before Friday. Budget is available if implementation is under 30 days.", observedAt: daysAgo(2), freshnessDays: 2 },
        { id: "ev_call_3", sourceType: "transcript", sourceName: "May 18 call", snippet: "Please send the security packet and a pilot plan by May 22.", observedAt: daysAgo(2), freshnessDays: 2 },
        { id: "ev_slack_1", sourceType: "slack", sourceName: "Slack note", snippet: "HelioStack raised Series B in March and has 180 employees, not 80.", observedAt: daysAgo(5), freshnessDays: 5 }
      ],
      extracted: [
        { field: "contact.title", value: "Chief Revenue Officer", evidenceId: "ev_call_1", confidence: 93, freshnessDays: 2 },
        { field: "deal.stage", value: "Proposal requested", evidenceId: "ev_call_2", confidence: 88, freshnessDays: 2 },
        { field: "next_step", value: "Send security packet and pilot plan by May 22", evidenceId: "ev_call_3", confidence: 91, freshnessDays: 2 },
        { field: "company.size", value: "180 employees", evidenceId: "ev_slack_1", confidence: 82, freshnessDays: 5 }
      ],
      proposals: [
        {
          id: "prop_title",
          field: "contact.title",
          currentValue: "VP Marketing",
          proposedValue: "Chief Revenue Officer",
          confidence: 93,
          action: "update",
          rationale: "The newest direct call evidence states Maya moved into CRO last quarter. The CRM value is older and conflicts.",
          evidenceIds: ["ev_crm_1", "ev_call_1"],
          contradictionStatus: "conflicted",
          lastVerifiedAt: daysAgo(2),
          repairHistory: ["CRM had VP Marketing from older export", "Call confirmed CRO"],
          batchId: "batch_contact"
        },
        {
          id: "prop_stage",
          field: "deal.stage",
          currentValue: "Discovery",
          proposedValue: "Proposal requested",
          confidence: 88,
          action: "update",
          rationale: "Buyer explicitly said this is no longer exploratory and asked for a pilot proposal before Friday.",
          evidenceIds: ["ev_crm_1", "ev_call_2"],
          contradictionStatus: "conflicted",
          lastVerifiedAt: daysAgo(2),
          repairHistory: ["Discovery stage contradicted by pilot request"],
          batchId: "batch_deal"
        },
        {
          id: "prop_next",
          field: "next_step",
          currentValue: "Send generic deck",
          proposedValue: "Send security packet and pilot plan by May 22",
          confidence: 91,
          action: "update",
          rationale: "The buyer requested two concrete assets by a specific date. Generic deck is stale and underspecified.",
          evidenceIds: ["ev_crm_1", "ev_call_3"],
          contradictionStatus: "stale",
          lastVerifiedAt: daysAgo(2),
          repairHistory: ["Generic deck replaced with precise commitment"],
          batchId: "batch_deal"
        },
        {
          id: "prop_size",
          field: "company.size",
          currentValue: "80 employees",
          proposedValue: "180 employees",
          confidence: 82,
          action: "update",
          rationale: "Slack enrichment is fresher than CRM headcount and aligns with Series B signal.",
          evidenceIds: ["ev_slack_1"],
          contradictionStatus: "stale",
          lastVerifiedAt: daysAgo(5),
          repairHistory: ["CRM headcount outdated after funding event"],
          batchId: "batch_company"
        }
      ],
      contradictions: [
        {
          id: "con_title",
          field: "contact.title",
          severity: "high",
          summary: "Maya's title differs across CRM and call evidence.",
          values: [
            { value: "VP Marketing", evidenceId: "ev_crm_1", sourceName: "CRM export row" },
            { value: "Chief Revenue Officer", evidenceId: "ev_call_1", sourceName: "May 18 call" }
          ],
          recommendedResolution: "Use Chief Revenue Officer and mark old CRM title as superseded."
        },
        {
          id: "con_stage",
          field: "deal.stage",
          severity: "high",
          summary: "CRM says Discovery, but call evidence shows proposal requested with a deadline.",
          values: [
            { value: "Discovery", evidenceId: "ev_crm_1", sourceName: "CRM export row" },
            { value: "Proposal requested", evidenceId: "ev_call_2", sourceName: "May 18 call" }
          ],
          recommendedResolution: "Move deal to Proposal requested and generate follow-up tasks."
        }
      ],
      minimumQuestions: [
        {
          question: "Who owns implementation on HelioStack's side if the pilot is approved?",
          impact: "Resolves task owner and handoff routing before the 30-day implementation gate.",
          resolves: ["implementation_owner", "pilot_plan_owner"]
        },
        {
          question: "Should Daniel Cho receive the security packet directly or through Maya?",
          impact: "Reduces security review delay without asking broad stakeholder questions.",
          resolves: ["security_path"]
        }
      ],
      tasks: [
        { id: "task_packet", accountId: "acct_heliostack", recordId: "rec_helio_repair", title: "Send security packet and pilot plan", priority: "high", dueAt: daysAgo(-2), status: "open", reason: "Buyer deadline May 22 controls deal momentum.", kind: "email" },
        { id: "task_owner", accountId: "acct_heliostack", recordId: "rec_helio_repair", title: "Ask Maya who owns implementation", priority: "medium", dueAt: daysAgo(-3), status: "open", reason: "Implementation under 30 days is a budget gate.", kind: "qualification" },
        { id: "task_security", accountId: "acct_heliostack", recordId: "rec_helio_repair", title: "Route security packet to Daniel Cho", priority: "high", dueAt: daysAgo(-1), status: "open", reason: "Security reviewer named on call.", kind: "handoff" }
      ],
      generatedAssets: [
        { id: "asset_email", type: "email", title: "Pilot plan and security packet for HelioStack", body: "Hi Maya,\n\nThanks for clarifying the pilot path. I'm sending the security packet and a focused pilot plan aligned to a sub-30-day implementation window.\n\nTo keep this moving before May 22, could you confirm whether Priya owns implementation planning and whether Daniel should receive the packet directly?\n\nBest,\nAyesha", rationale: "Uses the specific commitment and minimum questions." },
        { id: "asset_slack", type: "slack", title: "Internal handoff note", body: "*HelioStack repair summary*\n• Pain: handoff leakage between sales and success\n• Next step: security packet + pilot plan by May 22\n• Urgency: pause until Q3 if missed\n• Needs: implementation owner + security routing", rationale: "Handoff for RevOps/CS without opening repair workspace." },
        { id: "asset_notes", type: "deal_notes", title: "Updated deal notes", body: "HelioStack: CRO Maya Chen driving pilot. Pain is renewal context loss in Slack. Proposal path with May 22 commitment.", rationale: "CRM-ready narrative from repaired fields." },
        { id: "asset_objection", type: "objection", title: "Timeline objection handling", body: "If implementation timeline resurfaces: offer phased pilot under 30 days with security packet first.", rationale: "Budget gate tied to implementation window." },
        { id: "asset_reminder", type: "reminder", title: "No-response reminder", body: "If no reply within 48h: 'Still aiming for May 22 delivery — want me to route the security packet to Daniel directly?'", rationale: "Protects commitment window." }
      ],
      commitments: [
        { id: "cmt_may22", text: "Send security packet and pilot plan", dueHint: "May 22", sourceEvidenceId: "ev_call_3", status: "at_risk" },
        { id: "cmt_pilot", text: "Deliver pilot proposal", dueHint: "before Friday", sourceEvidenceId: "ev_call_2", status: "open" }
      ],
      selfHealing: [
        { id: "heal_title", trigger: "Contact role changed", suggestion: "Update outreach templates and stakeholder map to reflect Chief Revenue Officer.", affectedFields: ["contact.title", "stakeholders"] },
        { id: "heal_stage", trigger: "Deal stage advanced", suggestion: "Regenerate proposal tasks; close generic discovery follow-ups.", affectedFields: ["deal.stage", "tasks"] },
        { id: "heal_size", trigger: "Company size updated", suggestion: "Re-score account priority after Series B / 180 headcount.", affectedFields: ["company.size", "priority"] }
      ],
      repairBatches: [
        { id: "batch_contact", label: "Contact identity batch", proposalIds: ["prop_title"], summary: "Title change should update outreach and stakeholder context together." },
        { id: "batch_deal", label: "Deal momentum batch", proposalIds: ["prop_stage", "prop_next"], summary: "Stage and next-step move together so forecast and tasks align." },
        { id: "batch_company", label: "Account context batch", proposalIds: ["prop_size"], summary: "Refresh headcount before segmentation changes." }
      ],
      staleFlags: [
        { id: "stale_crm", field: "crm.baseline", reason: "CRM export is 55 days old and contradicted by call evidence.", ageDays: 55 },
        { id: "stale_next", field: "next_step", reason: "Generic deck task is stale relative to May 22 commitment.", ageDays: 45 }
      ],
      draftEmail: {
        id: "email_helio",
        accountId: "acct_heliostack",
        recordId: "rec_helio_repair",
        subject: "Pilot plan and security packet for HelioStack",
        body: "Hi Maya,\n\nThanks for clarifying the pilot path. I’m sending the security packet and a focused pilot plan aligned to a sub-30-day implementation window.\n\nTo keep this moving before May 22, could you confirm whether Priya owns implementation planning and whether Daniel should receive the packet directly?\n\nBest,\nAyesha",
        rationale: "Uses the specific commitment, acknowledges the budget gate, and asks only the two uncertainty-reducing questions."
      },
      syncPreview: [
        { field: "contact.title", before: "VP Marketing", after: "Chief Revenue Officer", impact: "Updates outreach context and stakeholder map", uncertain: false },
        { field: "deal.stage", before: "Discovery", after: "Proposal requested", impact: "Creates proposal tasks and changes forecast category", uncertain: false },
        { field: "next_step", before: "Send generic deck", after: "Send security packet and pilot plan by May 22", impact: "Replaces generic follow-up with dated commitment", uncertain: false },
        { field: "company.size", before: "80 employees", after: "180 employees", impact: "Adjusts segmentation and prioritization", uncertain: true }
      ]
    }
  ],
  tasks: [
    { id: "task_packet", accountId: "acct_heliostack", recordId: "rec_helio_repair", title: "Send security packet and pilot plan", priority: "high", dueAt: daysAgo(-2), status: "open", reason: "Buyer deadline May 22 controls deal momentum.", kind: "email" },
    { id: "task_owner", accountId: "acct_heliostack", recordId: "rec_helio_repair", title: "Ask Maya who owns implementation", priority: "medium", dueAt: daysAgo(-3), status: "open", reason: "Implementation under 30 days is a budget gate.", kind: "qualification" },
    { id: "task_security", accountId: "acct_heliostack", recordId: "rec_helio_repair", title: "Route security packet to Daniel Cho", priority: "high", dueAt: daysAgo(-1), status: "open", reason: "Security reviewer named on call.", kind: "handoff" }
  ],
  draftEmails: [
    {
      id: "email_helio",
      accountId: "acct_heliostack",
      recordId: "rec_helio_repair",
      subject: "Pilot plan and security packet for HelioStack",
      body: "Hi Maya,\n\nThanks for clarifying the pilot path.",
      rationale: "Seeded demo draft"
    }
  ],
  audit: [
    { id: "aud_1", kind: "input.received", actor: "System", recordId: "rec_helio_repair", accountId: "acct_heliostack", detail: "Loaded HelioStack CRM export, call transcript, and Slack note.", createdAt: daysAgo(1) },
    { id: "aud_2", kind: "extraction.performed", actor: "Repair engine", recordId: "rec_helio_repair", accountId: "acct_heliostack", detail: "Extracted 4 high-impact field observations and 2 contradictions.", createdAt: nowIso() }
  ],
  syncHistory: [
    { id: "sync_prev", recordId: "rec_helio_repair", crm: "Mock CRM", summary: "Demo workspace seeded. No production write-back has occurred yet.", createdAt: daysAgo(1) }
  ]
};
