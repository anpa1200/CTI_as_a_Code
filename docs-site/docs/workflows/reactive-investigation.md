---
id: reactive-investigation
title: Reactive Investigation — Intake
sidebar_position: 0
---

# Reactive Investigation — Intake

**This is the step most analysts skip. It is the most important step.**

Before you open a log file, before you run a query, before you create a case — you need to understand what the reporter knows, what has already been touched, and what constraints exist. Getting this wrong means analyzing the wrong systems, missing the actual entry point, or tainting evidence that could later matter to regulators or legal. See the [reactive walkthrough](/CTI_as_a_Code/reactive-walkthrough) for a full hands-on example using the [LifeTech Pharma](/CTI_as_a_Code/lifetech-pharma-case-study) scenario.

Run the intake as a structured conversation — a call, a meeting, or the form below filled in by the requester. Take verbatim notes. Do not interpret or analyze during this step; just capture.

---

## Use the intake form

Two formats are available depending on how you're working:

**Interactive (browser)** — open during the call, fill in live, print or export to PDF when done:

→ [Open Intake Form](/intake-form)

**Markdown template (editor / git)** — copy to `00-scope/intake-YYYY-MM-DD.md`, fill in your editor, commit alongside the case:

```bash
cp templates/reactive/intake-form.md investigations/PROJ-XXX/00-scope/intake-$(date +%F).md
```

---

## Why each section matters

**Section 4 — What has already been done** is the most commonly skipped and the most dangerous to miss. If a system was rebooted before collection, volatile memory evidence is gone. If malware was quarantined without preserving a copy, you cannot analyze it. If credentials were rotated before you can correlate session IDs, the trail goes cold. You need to know this before you touch a single log.

**Section 5.3 — Systems not to touch** prevents contaminating law enforcement evidence or triggering monitoring that alerts the adversary. If someone is under investigation for insider threat and you start querying their account in the [SIEM](/CTI_as_a_Code/services/elastic-siem), you may blow the operation.

**Section 7 — Regulatory** sets hard deadlines that override your investigation timeline. If INCD notification is due in 72 hours from discovery, and discovery was 48 hours ago, you have 24 hours before a regulator gets a call regardless of where your analysis is. This needs to be on the table from minute one.

**Section 9 — Analyst assessment** prevents you from starting analysis without a hypothesis. The intake is the moment you form your first working theory. Write it down before looking at logs — it forces you to be explicit about what you are looking for and what would contradict it.

---

## Commit the intake into the project

The intake document is the first commit in the investigation's git history. Every subsequent commit builds on it. When the investigation is reviewed three months later, the git log shows what was known when, and what the analyst's reasoning was at each stage.

```bash
# After filling in the intake form
git add 00-scope/intake-2025-03-17.md
git commit -m "PROJ-001: intake complete — initial hypothesis: AiTM contractor credential theft"
```

---

## Next step

Once intake is complete → [create the project folder from the template](/cti-as-a-code-methodology#step-2-create-your-project-folder-from-the-template) and scope the investigation. Then proceed to [IOC triage](/CTI_as_a_Code/workflows/ioc-triage) or [threat actor research](/CTI_as_a_Code/workflows/threat-actor-research) depending on what the intake surfaces.

---

## Ecosystem

- [Ecosystem overview](/CTI_as_a_Code/ecosystem) — all tools and integrations in the lab
- [CTI as a Code Methodology](/CTI_as_a_Code/cti-as-a-code-methodology) — the step-by-step process this workflow fits into
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — worked examples and published assessments
- [CTI Analyst Field Manual](https://anpa1200.github.io/cti-analyst-field-manual/) — reference companion for reactive investigations
