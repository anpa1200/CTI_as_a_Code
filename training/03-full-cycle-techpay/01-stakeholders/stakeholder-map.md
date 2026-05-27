# Stakeholder Map — PROJ-2024-003 (TechPay CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2024-10-15

---

## Primary Intelligence Consumers

| Stakeholder | Role | Key Quote | Intelligence Need | PIRs | Preferred Format | Cadence |
|---|---|---|---|---|---|---|
| Yael Mizrahi | CISO | "I need to know about PayNext risks before they become our risks" | Threat assessment of acquired company's inherited attack surface; adversary capability evolution | PIR-001, -002, -003, -005 | Monthly 8-page report; quarterly briefing doc | Monthly + triggered |
| Ronen Katz | SOC Manager | "Give me indicators not essays" | Tactical IOCs; hunting hypotheses; detection engineering priorities | SIR-001, -002 | Weekly SOC Flash (1 page); SIEM watchlist push | Weekly |
| Dana Levi | Legal / Compliance | "What does BoI-CD 362 actually require from us right now?" | Regulatory compliance horizon; gap assessment against Section 4/6/8 | PIR-004 | Quarterly regulatory memo; ad hoc on regulatory developments | Quarterly |
| Board / DG | Strategic oversight | "Can this be defended to the Bank of Israel Supervisor?" | Strategic threat picture defensible under regulatory scrutiny | PIR-001 (strategic summary), PIR-004 | Quarterly Board-ready assessment (5 pages) | Quarterly |
| Fraud Team | Fraud detection | Implicit — DarkOwl alerts flagged monthly | Dark web credential and data exposure monitoring; payment fraud patterns | SIR-002 | DarkOwl alert within 2h; monthly fraud intelligence summary | Alert-driven + monthly |

---

## Secondary Consumers

| Stakeholder | Role | Intelligence Value | Format |
|---|---|---|---|
| Detection Engineering | Rule deployment | CISO translates PIR-001/-005 into detection engineering priorities from monthly report | Section 5 of monthly report (detection recommendations) |
| PayNext Integration Team | Technical integration | PIR-002 findings drive integration security requirements | Section 3 of monthly report (PayNext threat update) |
| HR | Insider risk | PIR-003 (Ben-David departure) outcomes | Ad hoc confidential brief |

---

## External Partners

| Partner | Relationship | What We Share | What We Receive | Status |
|---|---|---|---|---|
| CERT-IL FinCERT | Sector ISAC | Anonymized TechPay/PayNext indicators; post-incident reports (30 days after close); payment fraud patterns | Sector-specific threat bulletins; MISP feed (payment sector); emergency notifications | **MOU lapsed 9 months — renewal P1** |
| CyberShield Ltd. | Pentest vendor | Scope and findings (confidential) | Quarterly pentest reports (PIR-002 source) | Active contract |
| DarkOwl | Dark web monitoring | TechPay/PayNext brand and domain terms | Credential exposure alerts; data dump mentions | Active contract |

---

## Stakeholder Requirements by PIR

| PIR | Requesting Stakeholder | Decision This PIR Supports | Answer Deadline | Current State |
|---|---|---|---|---|
| PIR-001 | CISO, Board | Detection engineering prioritization; vendor risk decisions | Quarterly | **Not answered** — no active collection; CERT-IL MOU lapsed |
| PIR-002 | CISO | Integration security roadmap; risk acceptance | Monthly | Partial answer — DarkOwl has 14 credential exposures; PayNext logs not yet integrated |
| PIR-003 | CISO, Legal | HR security decisions; offboarding procedures | Triggered (now) | Preliminary answer drafted (see `01-stakeholders/avi-departure-risk-brief.md`) |
| PIR-004 | Legal | Compliance planning | Quarterly | Not answered — no regulatory monitoring source active |
| PIR-005 | CISO, Detection Engineering | Detection rule update prioritization | Quarterly | Partial — ClearSky Q4 2024 report available; no systematic coverage |

---

## Stakeholder Satisfaction Tracking

*(Baseline — program not yet operational. Target: quarterly survey from Q1 2025.)*

| Stakeholder | Satisfaction (1–5) | Last survey | Key complaint |
|---|---|---|---|
| CISO | Not yet measured | N/A | Intelligence arrives too late / no sector feed |
| SOC Manager | Not yet measured | N/A | "Indicators not essays" — production too strategic |
| Legal | Not yet measured | N/A | No regulatory horizon monitoring |
| Board | Not yet measured | N/A | No Board-ready format exists |
