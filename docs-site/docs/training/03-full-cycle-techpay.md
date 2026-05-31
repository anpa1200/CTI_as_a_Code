---
title: A03 — Full CTI Cycle — TechPay FinTech
sidebar_position: 4
---

# A03 — Full CTI Cycle: TechPay FinTech

**Mode:** Full Cycle · **Org:** TechPay Israel Ltd. · **PROJ-2024-003**

## Scenario

You are the new CTI Lead at TechPay Israel, an Israeli payment processor handling 2.3 billion transactions per year. The current "CTI function" is one junior analyst spending 30% of his time on threat intelligence. The CERT-IL FinCERT membership lapsed 9 months ago. The Detection Engineering team refuses CTI-sourced rules after a false positive caused a €340K SLA breach. And the analyst is leaving in 5 weeks. Build the program from scratch — with a BoI-CD 362 compliance deadline in 4 months.

**Your entry point:** 9 stakeholders; 5 forcing functions; 17 deliverables.

## Five Forcing Functions

| # | Pressure | Deadline | Consequence of Failure |
|---|---|---|---|
| P1 | BoI-CD 362 Section 4 — CTI as formal function | 4 months | Bank of Israel Supervisor follow-up; Level 2 Critical Gap |
| P2 | Near-miss incident — authorized pentest mistaken for attack; €2.1B settlement disrupted | Already happened | DE team distrust; IR has no threat context process |
| P3 | Recorded Future alert — TechPay domain in phishing campaign template | 3 weeks ago, unescalated | CISO trust in current CTI output: zero |
| P4 | PCI-DSS Level 1 QSA assessment | 7 months | 3 open findings; Req. 12.3.2 CTI gap |
| P5 | PayNext acquisition (140K merchants) — 3 open CVEs, no [SIEM](/CTI_as_a_Code/services/elastic-siem), separate AWS | Integration in 12 months | Unmonitored attack surface with CVSS 9.0 CVE |

## Program Design Challenge

The near-miss incident (P2) is the highest-stakes failure context: the IR team declared a P1 on an authorized pentest because CTI had no pentest calendar. €2.1B in settlement transactions was disrupted. The root cause was **the absence of a CTI deconfliction function** — not a technical failure. Every program design decision in this assignment must address whether it would have prevented this outcome.

The Detection Engineering team's trust must be rebuilt through quality, not volume. After the €340K SLA breach from a bad IOC rule, they require:
- Procedure-level TTP detail (command strings, not just technique IDs)
- Evidence the rule was tested against known-good traffic
- Explicit false-positive mitigation section for every proposal

## Key Stakeholders

| Stakeholder | Core Need | Trust Problem |
|---|---|---|
| CISO Yael Mizrahi | Board presentation in 90 days; BoI-CD 362 evidence | Unescalated Recorded Future alert |
| SOC Manager Ronen Katz | Low FP IOCs with campaign context | 3 prior CTI rule failures |
| Detection Engineering Lead Sarah Chen | Procedure-level detail; FP mitigation sections | €340K SLA breach from CTI-sourced rule |
| IR Lead Felix Bauer | Pentest calendar; 15-min threat context during incidents | Near-miss incident — no CTI deconfliction |
| Fraud Team Dieter Müller | DarkOwl dark web intelligence — not shared with Security | Organizational silo; "data sensitivity" |

## PIR Framework (8 PIRs)

| PIR | Question | Stakeholder | BoI-CD 362 Ref |
|---|---|---|---|
| PIR-001 | Which actors target Israeli payment processors; TTPs for VolPay/Kong/Oracle RAC? | CISO, IR, DE | Article 9(2) |
| PIR-002 | Which ATT&CK procedures (command-level) used against payment processors in past 90 days? | SOC, DE | Article 9(2)(e) |
| PIR-003 | Which CVEs in FinServe + PayNext stack are actively exploited in financial sector? | Vuln Mgmt | — |
| PIR-004 | High-confidence IOCs (score ≥75) active against fintech — not yet blocked? | SOC, IR | — |
| PIR-005 | Peer Israeli payment processor incidents this quarter; FinServe applicability? | CISO, Board | Article 11(1)(b) |
| PIR-006 | Fraud/dark web intelligence — FinServe or PayNext merchant data mentioned? | Fraud Team (if protocol agreed) | — |
| PIR-007 | Cloud TTPs (AWS IAM abuse, K8s exploitation) against fintech; PayNext integration risk? | Cloud Security | — |
| PIR-008 | Compromises or threat actor interest in Thales HSM, VolPay, Kong, Oracle RAC, SentinelOne? | CISO, Architecture | Article 21(2)(d), Article 28 |

## 90-Day Roadmap Constraints

- Avi Ben-David (current analyst) leaves in **5 weeks** — all institutional knowledge must be extracted
- CERT-IL FinCERT membership lapsed — requires CISO approval + €18K + 3–4 weeks to restore
- DarkOwl intelligence (Fraud Team) requires negotiated sharing protocol
- BoI-CD 362 deadline in 4 months — board presentation in 90 days

## Assignment Deliverables

1. **CTI Programme Overview** — BoI-CD 362 Section 4 compliance statement
2. **Stakeholder Map** — 9+ stakeholders; PayNext context included
3. **PIR Table** — 8–10 PIRs; BoI-CD 362 reference column
4. **SIR Table** — 2–3 SIRs per PIR
5. **Collection Plan** — lapsed CERT-IL FinCERT addressed; DarkOwl silo addressed
6. **Source Evaluation Matrix** — Admiralty Scale; RF Basic scored as B/2
7. **Analytic Methodology** — ACH applied to Recorded Future alert and Fraud Team silo
8. **Quarterly Threat Actor Assessment** (draft)
9. **Monthly TTP Brief** — procedure-level detail; FP mitigation sections
10. **SOC Brief** — pentest calendar section included
11. **Detection Engineering Brief** — rebuilt-trust format; FP mitigation required
12. **IR Brief** — near-miss lesson learned; pentest deconfliction process
13. **Vulnerability Intelligence Note** — PayNext CVE section (CVSS 9.0 / 8.1 / 7.2)
14. **Dissemination Plan**
15. **Feedback Loop Design** — addresses DE trust + Fraud Team silo + IR near-miss
16. **CTI Metrics Framework** — BoI-CD 362 Section 4 mapping
17. **90-Day Roadmap** — Marcus departure + BoI-CD 362 deadline honored

## Key Learning Objectives

- Build a CTI program in a dysfunctional environment — damaged relationships, lapsed memberships, departing knowledge holder
- Design Intelligence Products differentiated by audience — CISO, SOC, DE, IR, Fraud all need different content
- Apply ACH to ambiguous intelligence (Recorded Future domain alert: targeted or opportunistic?)
- Address an organizational intelligence silo (Fraud Team / DarkOwl) as a negotiation problem, not a communication issue
- Score sources on the Admiralty Scale — RF Basic is B/2, not A/1, for high-stakes blocking decisions
- Produce BoI-CD 362 Section 4 compliance documentation that satisfies Bank of Israel Supervisor

## Cross-Links

- **PIR/SIR methodology:** [Field Manual — PIR/SIR/EEI Framework](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/cti-foundations/pir-sir-eei/)
- **Source reliability:** [Field Manual — Source Reliability](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/cti-foundations/source-reliability/)
- **Detection from CTI:** [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/cti-to-detection/intelligence-to-detection/)
- **TechPay detections under test:** [A04 — Operation Desert Cipher Emulation](./04-emulation-techpay.md)
- **Government parallel (INCD program):** [A07 — Full Cycle NDSA](./07-full-cycle-ndsa.md)

---

## Continue in the ecosystem

- [Full ecosystem](/CTI_as_a_Code/ecosystem) — tools and integrations used in this lab
- [Step-by-step methodology](/CTI_as_a_Code/cti-as-a-code-methodology) — the analytical framework behind every case
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — all published projects and case work
