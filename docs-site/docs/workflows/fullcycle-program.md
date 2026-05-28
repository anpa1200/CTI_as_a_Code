---
id: fullcycle-program
title: Full-Cycle Program — Intake
sidebar_position: 2
---

# Full-Cycle CTI Program — Intake

**Building a CTI program that doesn't exist yet — or rebuilding one that failed — starts here.**

The full-cycle intake is different from a reactive or proactive assessment intake. You are not investigating an incident or assessing a specific threat. You are designing an intelligence program: its mandate, its consumers, its PIRs, its collection architecture, its sharing relationships, its governance, and its metrics. Getting this right at the start is the difference between a program that produces intelligence and a program that produces reports nobody reads.

The intake call is your one chance to capture the commissioner's real requirements before the political pressures, scope creep, and stakeholder management begin. Capture everything. Commit to nothing during the call except that you heard correctly.

---

## Use the intake form

Two formats are available depending on how you're working:

**Interactive (browser)** — open during the call, fill in live, print or export to PDF when done:

→ [Open Full-Cycle Program Intake Form](/intake-fullcycle)

**Markdown template (editor / git)** — copy to `00-scope/intake-YYYY-MM-DD.md`, fill in your editor, commit as the first artifact of the program:

```bash
cp templates/full-cycle/intake-form.md programs/PROG-XXX/00-scope/intake-$(date +%F).md
```

---

## Why each section matters

**Section 2.1 — Stakeholder table with TLP limits** is the single most important output of the intake. Every intelligence product you produce will need a distribution decision. If you don't know who gets what at TLP:RED vs. TLP:GREEN, you will either over-share (a security risk) or under-share (a credibility risk). Build this table at intake, not after your first product is written.

**Section 2.4 — Who should NOT have visibility** is rarely asked and frequently critical. If there is an active insider threat investigation, a pending termination, or a legal matter involving someone who would normally be a stakeholder, you need to know before you start. Finding out after you've shared a PIR status update with the wrong person is a serious problem.

**Section 3.1 — PIR register** is the foundation of the program's scope. Everything you collect, analyze, and produce should trace back to a PIR. If a question is not in the PIR register, the answer to it is not your job. If the commissioner cannot answer this section, the program is not ready to be built — that is a valid finding to surface at the end of the intake.

**Section 4.3 — Collection gaps** tells you immediately what the program cannot do from day one. A program with no external sharing relationships (no CERT-IL MOU, no ISAC membership) has limited external collection. A program with no EDR telemetry cannot answer tactical TTPs questions. Surface these gaps at intake so the 30-day plan addresses the right ones first.

**Section 7.3 — KPIs** forces the commissioner to commit to how they will measure success before work begins. "PIR answer rate" and "detection coverage %" are measurable. "Better situational awareness" is not. If the commissioner cannot specify a KPI, the program has no accountability framework — and no way to justify its budget at the end of year one.

**Section 9.3 — First 30-day actions** is the output that makes the intake actionable. It bridges from requirements capture to program execution. The 30-day plan should answer at least one PIR, establish at least one external sharing relationship, and demonstrate value to at least one stakeholder. If it cannot, the program's credibility will not survive year one.

---

## Commit the intake into the program

The intake is the first artifact in the program's git history. It captures the commissioner's requirements before any analysis begins and provides an audit trail for every subsequent decision.

```bash
# After filling in the intake form
git add 00-scope/intake-2025-05-15.md
git commit -m "PROG-001: program intake complete — sponsor: CISO, trigger: INCD directive, target: L3 maturity in 12mo"
```

---

## Next step

Once intake is complete → draft the program charter, initialize the PIR register, map the stakeholder network, and identify the first 30-day deliverable that will establish credibility with the primary consumer.
