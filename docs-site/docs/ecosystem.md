---
id: ecosystem
title: Ecosystem
sidebar_position: 5
---

# CTI Project Ecosystem

## Purpose

This page connects the CTI documentation projects into one practitioner ecosystem. Each project has a different role, but they are designed to be used together.

## The Ecosystem

| Project | Role | Use When |
|---|---|---|
| **[CTI as a Code](https://anpa1200.github.io/CTI_as_a_Code/)** | Lab platform + structured training assignments | You want a hands-on lab, worked case studies, Sigma rules, and methodology scaffolds |
| **[CTI Analyst Field Manual](https://anpa1200.github.io/cti-analyst-field-manual/)** | General CTI tradecraft and analytic operating manual | You need evidence discipline, analytic judgment, attribution methodology, infrastructure pivoting, or CTI-to-detection reasoning |
| **[Customer-Driven AI CTI Project](https://anpa1200.github.io/customer-driven-ai-cti-project/)** | Delivery methodology and customer engagement model | CTI work must become a managed project with phases, quality gates, and customer acceptance criteria |
| **[Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)** | Israeli sector and actor knowledge base | The question involves Israeli government, municipal, telecom, critical infrastructure, or supplier exposure |
| **[HexStrike AI](https://github.com/0x4m4/hexstrike-ai)** | AI-powered offensive security automation | Adversarially validating detection coverage built in A04 or A08 against real TTPs |

## How CTI as a Code Fits

CTI as a Code is the **practice environment**. It provides:

- The Docker Compose lab stack where you run OpenCTI, TheHive, and Elastic SIEM
- The structured training assignments (A01–A08) as worked case studies
- Distributed analytical files demonstrating the methodology in action
- Sigma rules derived from incident TTPs — ready for lab validation

The **Field Manual** is the reasoning standard behind everything. When CTI as a Code says "rate sources with the Admiralty Scale," "label claims," or "convert TTPs to detection logic" — the Field Manual explains the precise methodology those phrases refer to.

The **Israel CTI knowledge base** is the threat context for the NDSA narrative arc (A05–A08). The Iranian-nexus actor cluster, supply chain compromise patterns, and INCD regulatory context in those assignments are grounded in Israeli sector CTI documented there.

## Cross-Project Workflows

### Reactive Investigation → Sigma Rule → Lab Validation

1. Use [CTI as a Code A01](./training/01-reactive-lifetech) or [A05](./training/05-reactive-ndsa) as the scenario
2. Apply [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/) and [Source Reliability](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/source-reliability/) to each timeline event
3. Convert findings to detection logic using [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/)
4. Deploy the Sigma rule to Elastic SIEM in the lab and validate with [A04](./training/04-emulation-techpay) or [A08](./training/08-emulation-ndsa) emulation methodology
5. Use [HexStrike AI](https://github.com/0x4m4/hexstrike-ai) for adversarial red-team validation of coverage

### Threat Modeling → Detection Backlog → Customer Project

1. Use [A02](./training/02-proactive-celltronx) or [A06](./training/06-proactive-govid2) as the proactive threat modeling framework
2. Reference [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/) for sector-specific threat actor TTPs
3. Produce a detection backlog with Sigma rules (CTI as a Code template structure)
4. Hand off to [Customer-Driven AI CTI Project](https://anpa1200.github.io/customer-driven-ai-cti-project/) for managed delivery with quality gates and customer acceptance criteria

### CTI Program Build → INCD Compliance

1. Use [A07 (NDSA full-cycle program)](./training/07-full-cycle-ndsa) as the governance framework template
2. Apply [Field Manual — PIR/SIR framework](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/pir-sir-eei/) for requirement design
3. Use [A08 compliance report](./training/08-emulation-ndsa) as the detection validation evidence format
4. Cross-reference [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/) for INCD regulatory framework context

### Actor Profile → Sector Context → Detection

1. Use [Field Manual — Actor Research](https://anpa1200.github.io/cti-analyst-field-manual/docs/actor-research/) to structure the actor profile
2. Use [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/) for the Iranian-nexus cluster context relevant to A05–A08
3. Extract detection-relevant TTPs using [A04 TTP extraction methodology](./training/04-emulation-techpay)
4. Turn the profile into a customer project with [Customer-Driven AI CTI](https://anpa1200.github.io/customer-driven-ai-cti-project/)

## NDSA Narrative Arc and the Israel CTI Project

The government assignments (A05–A08) are grounded in the Israeli public-sector threat landscape documented in the [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/) project:

| CTI as a Code | Israel CTI cross-reference |
|---|---|
| A05 — Iranian-nexus contractor breach | Iranian-nexus actor cluster targeting Israeli government digital identity systems |
| A06 — GovID 2.0 threat model | BiometricTech supply chain risk; vendor API abuse patterns |
| A07 — INCD regulatory program | INCD-CID framework; Israeli CII operator obligations |
| A08 — INCD Section 8 emulation | Detection validation methodology for Israeli government CTI programs |

## Repository Links

- [CTI as a Code](https://github.com/anpa1200/CTI_as_a_Code)
- [CTI Analyst Field Manual](https://github.com/anpa1200/cti-analyst-field-manual)
- [Customer-Driven AI CTI Project](https://github.com/anpa1200/customer-driven-ai-cti-project)
- [Israel Government Threat Actors CTI](https://github.com/anpa1200/israel-government-threat-actors-cti)
- [HexStrike AI](https://github.com/0x4m4/hexstrike-ai)

## Boundary

All CTI documentation projects (CTI as a Code, Field Manual, Customer project, Israel CTI) are defensive and public-source oriented. They do not provide exploit instructions, malware source code, leaked data, credentials, or unauthorized-access guidance. HexStrike AI is an authorized offensive security and penetration testing platform; use it only in authorized engagements.
