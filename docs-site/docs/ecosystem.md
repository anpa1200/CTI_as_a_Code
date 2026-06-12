---
id: ecosystem
title: Ecosystem
sidebar_position: 5
---

# CTI Project Ecosystem

## Purpose

This page connects the CTI documentation projects into one practitioner ecosystem. Each project has a different role, but they are designed to be used together.

## The Ecosystem

:::tip Start here
**[CTI Portfolio — Andrey Pautov](https://1200km.com/cti.html)** is the top-level entry point: four documentation sites, 11 repositories, 36 articles. Start there to navigate the full body of work, then come back to the specific project you need.
:::

| Project | Role | Use When |
|---|---|---|
| **[CTI Portfolio](https://1200km.com/cti.html)** | Top-level hub — all CTI work in one place | You want an overview of the full body of work: actor research, methodology, detection engineering, labs |
| **[CTI as a Code](https://1200km.com/CTI_as_a_Code/)** | Lab platform + structured training assignments + published case studies | You want a hands-on lab, worked case studies, Sigma rules, and methodology scaffolds |
| **[CTI Analyst Field Manual](https://1200km.com/cti-analyst-field-manual/)** | General CTI tradecraft and analytic operating manual | You need evidence discipline, analytic judgment, attribution methodology, infrastructure pivoting, or CTI-to-detection reasoning |
| **[Customer-Driven AI CTI Project](https://1200km.com/customer-driven-ai-cti-project/)** | Delivery methodology and customer engagement model | CTI work must become a managed project with phases, quality gates, and customer acceptance criteria |
| **[Israel Government Threat Actors CTI](https://1200km.com/israel-government-threat-actors-cti/)** | Israeli sector and actor knowledge base | The question involves Israeli government, municipal, telecom, critical infrastructure, or supplier exposure |
| **[ThreatMapper AI CTI workbench](https://1200km.com/threatmapper/)** | Browser-native ATT&CK workspace plus self-hosted AI-assisted platform | You need ATT&CK mapping, group/campaign TTP-overlap analysis, coverage-gap review, or detection-backlog export |
| **[HexStrike AI](https://github.com/0x4m4/hexstrike-ai)** | AI-powered offensive security automation | Adversarially validating detection coverage built in A04 or A08 against real TTPs |

## Published Case Studies

Real investigations worked end-to-end using the CTI as a Code methodology — from first alert through stakeholder deliverables. Each article is a complete, reproducible walkthrough with evidence files, queries, and detection rules.

| Case Study | Scenario | Key Techniques | Article |
|---|---|---|---|
| **[LifeTech Pharma — Reactive IR](/docs/lifetech-pharma-case-study)** | Dual-entry pharmaceutical IP theft — AiTM + CFO phishing, DCSync, 381 MB exfiltration | T1557 · T1003.006 · T1133 · RBQL anomaly detection · Cobalt Strike beacon analysis | [Medium](https://medium.com/@1200km/cti-as-a-code-in-practice-reactive-investigation-lifetech-pharma-3e6574b7b85f) |
| **[CelltronX Telecom — Proactive Assessment](/docs/celltronx-proactive-case-study)** | MuddyWater targeting Israeli telecom — crown jewels analysis, 5 attack scenarios, detection gap mapping, 5 Sigma rules | T1219 · T1133 · T1505.003 · T1572 · DeTT&CT scoring · SimpleHelp RMM detection | — |

Each case study maps directly to a training assignment, a full technical walkthrough, and an ATT&CK Navigator layer:

- **LifeTech Pharma:** [Case study](/docs/lifetech-pharma-case-study) · [Technical walkthrough](/docs/reactive-walkthrough) · [Assignment A01](/docs/training/01-reactive-lifetech) · [ATT&CK Navigator layer](/investigations/lifetech-2024-11/03-analysis/attck-mapping/attck-navigator-layer.json)
- **CelltronX Telecom:** [Case study](/docs/celltronx-proactive-case-study) · [Proactive walkthrough](/docs/proactive-walkthrough) · [Assignment A02](/docs/training/02-proactive-celltronx)

---

## How CTI as a Code Fits

CTI as a Code is the **practice environment**. It provides:

- The Docker Compose lab stack where you run OpenCTI, TheHive, and Elastic SIEM
- The structured training assignments (A01–A08) as worked case studies
- Published case studies with full evidence analysis, detection gaps, and Sigma rules
- Distributed analytical files demonstrating the methodology in action
- Sigma rules derived from incident TTPs — ready for lab validation

The **Field Manual** is the reasoning standard behind everything. When CTI as a Code says "rate sources with the Admiralty Scale," "label claims," or "convert TTPs to detection logic" — the Field Manual explains the precise methodology those phrases refer to.

The **Israel CTI knowledge base** is the threat context for the NDSA narrative arc (A05–A08). The Iranian-nexus actor cluster, supply chain compromise patterns, and INCD regulatory context in those assignments are grounded in Israeli sector CTI documented there.

## Cross-Project Workflows

### Reactive Investigation → Sigma Rule → Lab Validation

1. Read the **[LifeTech Pharma case study](/docs/lifetech-pharma-case-study)** as a worked example of the full flow
2. Run the same investigation yourself with [Assignment A01](/docs/training/01-reactive-lifetech) or [A05](/docs/training) as the scenario
3. Apply [Field Manual — Evidence Labels](https://1200km.com/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/) and [Source Reliability](https://1200km.com/cti-analyst-field-manual/docs/cti-foundations/source-reliability/) to each timeline event
4. Convert findings to detection logic using [Field Manual — CTI to Detection](https://1200km.com/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/)
5. Deploy the Sigma rule to Elastic SIEM in the lab and validate with [A04](/docs/training) or [A08](/docs/training) emulation methodology
6. Use [HexStrike AI](https://github.com/0x4m4/hexstrike-ai) for adversarial red-team validation of coverage

### Threat Modeling → Detection Backlog → Customer Project

1. Use [A02](/training/proactive-celltronx) or [A06](/training/proactive-govid2) as the proactive threat modeling framework
2. Reference [Israel Government Threat Actors CTI](https://1200km.com/israel-government-threat-actors-cti/) for sector-specific threat actor TTPs
3. Produce a detection backlog with Sigma rules (CTI as a Code template structure)
4. Hand off to [Customer-Driven AI CTI Project](https://1200km.com/customer-driven-ai-cti-project/) for managed delivery with quality gates and customer acceptance criteria

### CTI Program Build → INCD Compliance

1. Use [A07 (NDSA full-cycle program)](/training/full-cycle-ndsa) as the governance framework template
2. Apply [Field Manual — PIR/SIR framework](https://1200km.com/cti-analyst-field-manual/docs/cti-foundations/pir-sir-eei/) for requirement design
3. Use [A08 compliance report](/training/emulation-ndsa) as the detection validation evidence format
4. Cross-reference [Israel Government Threat Actors CTI](https://1200km.com/israel-government-threat-actors-cti/) for INCD regulatory framework context

### Actor Profile → Sector Context → Detection

1. Use [Field Manual — Actor Research](https://1200km.com/cti-analyst-field-manual/docs/actor-research/) to structure the actor profile
2. Use [Israel Government Threat Actors CTI](https://1200km.com/israel-government-threat-actors-cti/) for the Iranian-nexus cluster context relevant to A05–A08
3. Extract detection-relevant TTPs using [A04 TTP extraction methodology](/training/emulation-techpay)
4. Turn the profile into a customer project with [Customer-Driven AI CTI](https://1200km.com/customer-driven-ai-cti-project/)

## NDSA Narrative Arc and the Israel CTI Project

The government assignments (A05–A08) are grounded in the Israeli public-sector threat landscape documented in the [Israel Government Threat Actors CTI](https://1200km.com/israel-government-threat-actors-cti/) project:

| CTI as a Code | Israel CTI cross-reference |
|---|---|
| A05 — Iranian-nexus contractor breach | Iranian-nexus actor cluster targeting Israeli government digital identity systems |
| A06 — GovID 2.0 threat model | BiometricTech supply chain risk; vendor API abuse patterns |
| A07 — INCD regulatory program | INCD-CID framework; Israeli CII operator obligations |
| A08 — INCD Section 8 emulation | Detection validation methodology for Israeli government CTI programs |

## Repository Links

- [CTI Portfolio](https://1200km.com/cti.html) — full work index
- [CTI as a Code](https://github.com/anpa1200/CTI_as_a_Code)
- [CTI Analyst Field Manual](https://github.com/anpa1200/cti-analyst-field-manual)
- [Customer-Driven AI CTI Project](https://github.com/anpa1200/customer-driven-ai-cti-project)
- [Israel Government Threat Actors CTI](https://github.com/anpa1200/israel-government-threat-actors-cti)
- [HexStrike AI](https://github.com/0x4m4/hexstrike-ai)

## Boundary

All CTI documentation projects (CTI as a Code, Field Manual, Customer project, Israel CTI) are defensive and public-source oriented. They do not provide exploit instructions, malware source code, leaked data, credentials, or unauthorized-access guidance. HexStrike AI is an authorized offensive security and penetration testing platform; use it only in authorized engagements.
