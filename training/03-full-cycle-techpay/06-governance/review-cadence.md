# Review Cadence — PROJ-2024-003 (TechPay CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2024-10-15

---

## Review Schedule

| Review | Frequency | Who | Agenda | Duration |
|---|---|---|---|---|
| SOC Flash | Weekly (Monday) | CTI Lead + SOC | Priority item; new IOCs; hunting hypothesis | 30 min production; no meeting |
| Monthly CISO Report | Monthly (by 5th) | CTI Lead + CISO | PayNext threat update; detection backlog; new threats | 60 min write; 30 min CISO review |
| PIR Review | Quarterly | CTI Lead + CISO + Legal | PIR relevance; unanswered PIRs; new requirements | 90 min |
| Strategic Assessment | Quarterly | CTI Lead + CISO + DG | PIR-001/002/005 answers; Board summary prep | 2h |
| Annual Program Review | Annual | CTI Lead + CISO + Board | Program health; metrics; budget; PIR framework refresh | Half-day |
| Triggered Reviews | Ad hoc | CISO + CTI Lead | New trigger (peer incident, CERT-IL advisory); PIR-003 departures | 1–4h depending on trigger |

---

## Monthly Review Agenda Template

1. **Threat landscape update** — new developments vs. last month; what changed?
2. **PIR status** — which PIRs have a current answer; which are stale?
3. **PayNext threat update** (first 12 months) — integration security status; inherited exposure remediation
4. **Detection engineering** — CTI-recommended rules; deployment status; rules deployed in last 30 days
5. **Collection status** — source health; new gaps; procurement progress
6. **Action items** — carry over; new items; owners and deadlines

---

## Quarterly Review Agenda Template

1. **PIR review** — formal review of each PIR: still relevant? answer current? collection adequate?
2. **Threat landscape** — Q assessment for PIR-001 and PIR-005
3. **Regulatory horizon** — PIR-004 answer; BoI-CD 362 updates
4. **Program health** — metrics dashboard review; stakeholder satisfaction survey results
5. **Collection plan update** — source changes; procurement decisions; MOU status
6. **PIR additions / retirements** — propose new PIRs from stakeholder feedback; retire answered/irrelevant PIRs
7. **Action items** — formal sign-off with named owners and deadlines

---

## Annual Program Review Agenda Template

1. **12-month program assessment** — metrics vs. targets; what worked; what to improve
2. **PIR framework refresh** — full review of all PIRs; stakeholder interviews for new requirements
3. **Collection plan refresh** — source contract renewals; new sources; deprecations
4. **Sharing architecture review** — MOU renewals; new partners
5. **Budget planning** — next year intelligence program budget proposal
6. **Staff and training** — analyst development; succession planning (learned from Ben-David)
7. **BoI-CD 362 compliance assessment** — Section 4/6/8 status; regulatory findings

---

## Review History

| Date | Review Type | Key Decisions |
|---|---|---|
| 2024-10-15 | Program launch | PIR framework v1.0 approved; CERT-IL MOU renewal authorized; Ben-David transition plan approved |
| *(Q1 2025)* | Quarterly PIR review | TBD |
| *(Q4 2025)* | Annual program review | TBD |

---

## Escalation Criteria

Escalate to CISO outside normal review cadence if:

- Any CERT-IL TLP:RED notification received (contact CISO immediately — do not wait for scheduled review)
- Active exploitation of PayNext CVE detected in TechPay environment
- PIR-003 trigger: any senior employee departure with CTI/SIEM access
- CERT-IL FinCERT emergency notification about active campaign against Israeli payment processors
- DarkOwl SIR-002 alert: TechPay or PayNext credential appearing in active fraud forum
