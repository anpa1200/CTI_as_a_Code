# Review Cadence — PROJ-2025-007 (NDSA CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2025-10-01  
**Compliance:** INCD Remediation Directive RD-2025-NDSA-004

---

## Review Schedule

| Review | Frequency | Who | Purpose | Duration |
|---|---|---|---|---|
| SOC Flash | Weekly (Monday) | CTI Lead + SOC Lead | Priority monitoring item; new IOCs; hunting hypothesis | 30 min production; no meeting |
| Monthly Operational Report | Monthly (by 5th) | CTI Lead + CISO | PIR-004 contractor update; detection backlog; new threats | 60 min write; 30 min CISO review |
| Quarterly PIR Review | Quarterly | CTI Lead + CISO + Legal | PIR relevance; unanswered PIRs; new requirements; collection plan update | 90 min |
| Quarterly Strategic Assessment | Quarterly | CTI Lead + CISO + DG | PIR-001/-002/-005 answers; Board summary prep; INCD submission | 2h |
| INCD Formal Submission | Quarterly | CISO + CTI Lead | RD-2025-NDSA-004 compliance; GovID telemetry report | 1h (after strategic assessment) |
| Annual Program Review | Annual | CTI Lead + CISO + DG + INCD | Full program health; PIR framework refresh; INCD compliance audit; budget | Half-day |
| Triggered Review | Ad hoc | CISO + CTI Lead | PIR-004 vendor security signal; PIR-005 new GovID threat; CERT-IL emergency notification | 1–4h |

---

## Monthly Operational Report Agenda

1. Threat landscape update — new developments vs. last month
2. PIR-004 contractor risk — HavayaIT and BiometricTech status; any new vendor security signals
3. Detection backlog — rules deployed; rules pending; new P1 items from CTI recommendations
4. Collection status — source health; MOU milestones; pipeline progress
5. INCD compliance tracking — 8 items status; any at risk
6. Action items — carry over; new items; named owners and deadlines

---

## Quarterly PIR Review Agenda

1. PIR health check — each PIR: still relevant? current answer? collection adequate?
2. New PIR proposals — from stakeholder feedback and new threat developments
3. Retire / defer — PIRs answered definitively (defer to annual review cycle)
4. Collection plan update — source changes; procurement decisions; pipeline milestones
5. Sharing architecture — MOU status; new partner proposals
6. Action items — formal sign-off with owners and deadlines

---

## Annual Program Review Agenda (INCD Compliance Report)

1. 12-month metrics vs. targets (8 INCD metrics)
2. PIR framework full refresh — stakeholder interviews for new requirements
3. Collection plan refresh — source contracts; new sources; deprecations
4. Sharing architecture review — MOU renewals; new partners
5. Budget review — Year 1 actuals vs. plan; Year 2 proposal
6. Staff assessment — analyst development; succession planning
7. INCD compliance formal audit — all 8 RD-2025-NDSA-004 items
8. INCD presentation — present findings to Friedman; receive INCD feedback

---

## INCD Compliance Milestone Calendar

| Milestone | Deadline | Owner | Status |
|---|---|---|---|
| PIR framework v1.0 with stakeholder sign-off | 2026-02-01 | CTI Lead | In progress |
| Collection plan v1.0 | 2026-02-01 | CTI Lead | In progress |
| CERT-IL MISP MOU signed | 2026-02-15 | Legal + CISO | P1 legal action |
| ITA sharing MOU signed | 2026-03-15 | Legal + CISO | P2 legal action |
| MISP with ≥2 INCD-approved feeds operational | 2026-03-15 | CTI Lead + IT | Requires MOU + infrastructure |
| Q1 2026 quarterly product published | 2026-03-31 | CTI Lead | On track |
| Annual review process documented | 2026-04-15 | CTI Lead | Not started |
| INCD compliance audit (full program review) | 2026-07-01 | CISO | All items must be complete |

---

## Escalation Criteria

Escalate to CISO immediately (do not wait for scheduled review) if:

- Any INCD TLP:RED notification received via Friedman
- Any HavayaIT or BiometricTech VPN session from non-corporate ASN after hours (GOV-DET-A05-001)
- Any VRID DB query returning >10,000 records by a non-scheduled account
- Any GovID 2.0 API call volume from a single IP exceeding 500 calls in 10 minutes
- CERT-IL emergency notification about active campaign against Israeli government platforms
- New lookalike domain registered targeting GovID / NDSA / HavayaIT brands

---

## Review History

| Date | Review Type | Key Decisions |
|---|---|---|
| 2025-10-01 | Program launch | PIR framework v1.0 approved by CISO; CERT-IL MOU renewal authorized; Maya Dvir offer made |
| *(2026-01-15)* | Q1 quarterly assessment | See STR-2026-001; PIR-004 elevated to High; scheduled task rule P1 |
| *(2026-07-01)* | INCD compliance audit | TBD |
