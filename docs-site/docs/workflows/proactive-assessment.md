---
id: proactive-assessment
title: Proactive Assessment — Intake
sidebar_position: 1
---

# Proactive Assessment — Intake

**Start here, before you open any advisory, before you run any query.**

A proactive assessment begins with a trigger — a CERT advisory, a peer incident, a commercial alert, a board direction. The trigger tells you *something happened out there*. The intake tells you whether it matters *here*, for *this organization*, right now.

Getting this wrong means spending a week analyzing TTPs that are irrelevant to the org's environment, or missing the fact that the threat actor specifically targets this sector and has active infrastructure pointed at it. The intake is what turns a generic advisory into a scoped threat assessment. See [threat actor research](/CTI_as_a_Code/workflows/threat-actor-research) for the structured approach that follows intake.

Run the intake as a structured conversation — a call, a meeting, or the form below filled in by the commissioner. Take verbatim notes. Do not analyze during this step; just capture.

---

## Use the intake form

Two formats are available depending on how you're working:

**Interactive (browser)** — open during the call, fill in live, print or export to PDF when done:

→ [Open Proactive Assessment Intake Form](/intake-proactive)

**Markdown template (editor / git)** — copy to `00-scope/intake-YYYY-MM-DD.md`, fill in your editor, commit alongside the project:

```bash
cp templates/proactive/intake-form.md assessments/ASSESS-XXX/00-scope/intake-$(date +%F).md
```

---

## Why each section matters

**Section 1.2 — Specific intelligence driving urgency** is the anchor of the entire assessment. "We saw a threat report about ransomware" is not enough. You need the exact advisory number, the exact actor name, the exact techniques described — because your entire collection and analysis plan flows from that specificity. If the trigger is vague, the assessment will be vague.

**Section 1.3 — Admiralty reliability rating** forces you to be explicit about source quality before you commit resources. A C3 report (source of unknown reliability, possibly true) should not drive the same urgency or scope as an A1 report (completely reliable, confirmed). Write it down at intake so your analysis tracks this caveat throughout.

**Section 2.2 — Crown jewels** defines your scope boundary. You are not assessing whether the org *could* be targeted in general — you are assessing whether the *specific threat* could reach the *specific assets* that would cause irreversible harm. Without crown jewels, you have no scope.

**Section 3.4 — Detection gaps** tells you immediately what you cannot answer with current visibility. If the threat actor is known to use living-off-the-land techniques via WMI and the org has no Sysmon logging, flag that at intake — do not discover it in week two when the detection backlog gets prioritized. Visibility gaps map directly to the [Elastic SIEM](/CTI_as_a_Code/services/elastic-siem) and [OpenCTI](/CTI_as_a_Code/services/opencti) coverage questions.

**Section 6 — Regulatory context** sets hard constraints. If GDPR applies and customer data is involved, a finding about exfiltration risk has a 72h notification clock attached to it. Know this before you start, not after you've written the report.

**Section 7.1 — Threat relevance** is your first analytic judgment. Write it before you start the technical work. It forces you to be explicit about whether you are doing this because the threat is genuinely relevant, or because someone asked you to. Both are valid reasons — but they drive different scopes and deliverables.

---

## Commit the intake into the project

The intake document is the first commit in the assessment's git history. Every subsequent commit builds on it. When the assessment is reviewed six months later, the git log shows what was known at intake and how the analysis evolved.

```bash
# After filling in the intake form
git add 00-scope/intake-2025-04-12.md
git commit -m "ASSESS-001: intake complete — trigger: CERT-IL advisory TA-2025-04, relevance: HIGH"
```

---

## Next step

Once intake is complete → begin the [threat actor research](/CTI_as_a_Code/workflows/threat-actor-research) phase: map the actor's TTPs against the org's crown jewels and detection posture, then build the detection backlog.

---

## Ecosystem

- [Ecosystem overview](/CTI_as_a_Code/ecosystem) — all tools and integrations in the lab
- [CTI as a Code Methodology](/CTI_as_a_Code/cti-as-a-code-methodology) — the step-by-step process this workflow fits into
- [CTI Portfolio](https://1200km.com/cti.html) — worked examples and published assessments
- [CTI Analyst Field Manual](https://1200km.com/cti-analyst-field-manual/) — reference companion for proactive assessments
