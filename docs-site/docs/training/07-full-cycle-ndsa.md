---
title: A07 — Full CTI Cycle (Gov) — NDSA
sidebar_position: 8
---

# A07 — Full CTI Cycle (Gov): NDSA CTI Program

**Mode:** Full Cycle · **Org:** NDSA · **PROJ-2025-007**

## Scenario

It is January 2026. NDSA has survived the biometric breach (A05), launched GovID 2.0 (A06), and received an INCD remediation directive: build a formal CTI program within 6 months. The CISO has ₪8.5M/year and a Knesset committee watching. Build it.

**Your entry point:** 5 existing [SIEM](/CTI_as_a_Code/services/elastic-siem) rules, 15 detection backlog items, an informal CERT-IL relationship (no MOU), an empty MISP instance, and an [INCD](https://anpa1200.github.io/israel-government-threat-actors-cti/) liaison who is simultaneously your primary intelligence source and your compliance auditor.

## Organizational Starting Point

| Capability | Have | Don't Have |
|---|---|---|
| Detection rules | 5 Elastic rules (A05 response) | Formal PIR framework |
| Threat reports | A05 post-incident assessment (1 document) | Collection plan |
| Collection | INCD embedded liaison (Friedman) | Intelligence production process |
| Sharing | Informal CERT-IL relationship | CERT-IL MOU; ITA MOU; ministry sharing agreements |
| Tools | MISP (empty); [Elastic SIEM](/CTI_as_a_Code/services/elastic-siem) | Any structured CTI workflow |

## The INCD Dual Role Problem

Lt. Col. Friedman is simultaneously:
- NDSA's primary source for classified threat intelligence
- INCD's compliance auditor for NDSA's remediation directive
- A person with professional interest in NDSA not having another publicly embarrassing breach

This creates a **structural tension**: the CTI program Rotenberg builds will be audited by the person who controls access to the intelligence that program depends on. Every PIR, collection plan decision, and gap disclosure must be designed with this asymmetry in mind.

## Stakeholder Complexity

| Stakeholder | Classification Tier | Intelligence Need | Sharing Constraint |
|---|---|---|---|
| DG Dr. Shamir | Unclassified + Secret | Strategic threat picture | Can receive sanitized products |
| CISO Col. Nativ | Top Secret | Operational threat-to-control mapping | Full access |
| GovID 2.0 Ops (Shapiro) | Unclassified | GovID-specific threats; indicator tuning | No classification access |
| INCD | TLP:RED via Friedman | NDSA feeds intelligence BACK to INCD | Bidirectional; Friedman controls the pipe |
| CERT-IL | TLP:AMBER (via formal MOU) | Sector threat sharing; collective defense | MOU required — not yet signed |
| Israel Tax Authority | TLP:AMBER (proposed MOU) | Same HavayaIT contractor risk | No MOU yet |
| Knesset Interior Committee | Unclassified only | Breach post-mortems; systemic risk | Public testimony |

## PIR Framework

The 6-month INCD remediation directive mandates:
- PIR-driven collection plan
- Quarterly intelligence products
- Formal sharing agreements with CERT-IL + ≥2 other government agencies

| PIR | Question | Stakeholder | Regulatory Driver |
|---|---|---|---|
| PIR-G7-001 | Which threat actors target Israeli government digital identity infrastructure and citizen data? | CISO, INCD | INCD-CID Art. 9(2) |
| PIR-G7-002 | Which contractor supply chain attack patterns are active against Israeli government agencies? | CISO, IR | INCD-CID Art. 21(2)(d) |
| PIR-G7-003 | Which CVEs in GovID 2.0, VRID, and NDSA infrastructure are actively exploited? | IR, SOC | — |
| PIR-G7-004 | What TTPs are relevant to GovID 2.0's biometric API and vendor access patterns? | Detection Engineering | INCD-CID Art. 21(2)(e) |
| PIR-G7-005 | What are peer government agency incidents in Israel and comparable democracies? | DG, Legal, INCD | INCD remediation directive |

## 6-Month Implementation Milestones

| Milestone | Target | Dependencies | Status at Assignment Start |
|---|---|---|---|
| M1 | PIR framework approved by CISO | Stakeholder interviews | Not started |
| M2 | CERT-IL MOU signed | Legal + CISO approval | 9-month informal relationship; no MOU |
| M3 | ITA MOU signed | Legal; ITA agreement | No MOU |
| M4 | MISP configured with 3 quality feeds | Maya Dvir onboards Week 6 | MISP empty |
| M5 | First quarterly intelligence product published | M1 complete | None produced |
| M6 | INCD remediation directive compliance milestone | All milestones | Not started |

## Assignment Deliverables

1. **CTI Programme Charter** — INCD remediation directive compliance; 6-month target state
2. **Stakeholder Map** — classification tiers; INCD dual role tension documented
3. **PIR/SIR Framework** — 5 PIRs; 2–3 SIRs each; government-specific constraints
4. **Collection Plan** — classified vs. unclassified; Friedman asymmetry addressed
5. **Source Evaluation Matrix** — Admiralty Scale; INCD/CERT-IL classified sources rated
6. **CERT-IL MOU draft** — sharing protocol; TLP:AMBER scope; reciprocal obligations
7. **ITA MOU draft** — HavayaIT contractor intelligence sharing; same vendor risk
8. **Quarterly Threat Actor Assessment** (first issue)
9. **Tactical Intelligence Brief** (for SOC / Detection Engineering)
10. **Metrics Framework** — INCD remediation directive compliance evidence
11. **90-day roadmap** — Maya Dvir onboarding (Week 6) accounted for; Itai Ben-Levi (Week 10)
12. **6-month program review deliverable** — evidence package for INCD compliance milestone

## Key Learning Objectives

- Build a CTI program inside government constraints — classification tiers, change control, Knesset oversight
- Design a collection plan that works when your primary intelligence source is also your compliance auditor
- Navigate MOUs as intelligence infrastructure — CERT-IL MOU is not a formality; it enables TLP:AMBER sharing
- Develop PIRs for a government identity platform that differ substantially from commercial CTI questions
- Produce classified and unclassified versions of the same intelligence product for different audience tiers
- Account for team build time (new hires starting weeks 6 and 10) in the program launch timeline

## Cross-Links

- **PIR/SIR methodology:** [Field Manual — PIR/SIR/EEI Framework](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/cti-foundations/pir-sir-eei/)
- **Collection planning:** [Field Manual — Collection Planning](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/cti-foundations/collection-planning/)
- **Breach that triggered this directive:** [A05 — NDSA Reactive IR](./05-reactive-ndsa.md)
- **Detection backlog from this program tested in:** [A08 — INCD Section 8 Emulation](./08-emulation-ndsa.md)
- **Private sector parallel:** [A03 — Full Cycle TechPay](./03-full-cycle-techpay.md)
- **INCD regulatory framework context:** [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)

---

## Continue in the ecosystem

- [Full ecosystem](/CTI_as_a_Code/ecosystem) — tools and integrations used in this lab
- [Step-by-step methodology](/CTI_as_a_Code/cti-as-a-code-methodology) — the analytical framework behind every case
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — all published projects and case work
