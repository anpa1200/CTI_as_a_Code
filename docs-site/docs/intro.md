---
id: intro
title: Introduction
sidebar_position: 1
---

# CTI as a Code

A full Linux Cyber Threat Intelligence lab and structured [CTI methodology](/CTI_as_a_Code/cti-as-a-code-methodology) framework, running on [Docker Compose](https://docs.docker.com/compose/).

**CTI as Code** treats threat intelligence investigations like software engineering projects — version-controlled, template-driven, evidence-traced claims, reproducible analysis, deployable [Sigma](https://sigmahq.io/) rules.

## What's in this project

| Component | What it is |
|---|---|
| **[Docker Compose lab](/CTI_as_a_Code/architecture)** | [OpenCTI](/CTI_as_a_Code/services/opencti) · [TheHive 5](/CTI_as_a_Code/services/thehive-cortex) · [Cortex](/CTI_as_a_Code/services/thehive-cortex) · [Elastic SIEM](/CTI_as_a_Code/services/elastic-siem) · Logstash — spin up a full CTI platform on one Linux host |
| **[8 training assignments](/CTI_as_a_Code/training)** | Reactive, proactive, full-cycle, and adversary emulation [methodology](/CTI_as_a_Code/cti-as-a-code-methodology) — across private sector and government scenarios |
| **3 blank methodology templates** | Reactive / proactive / full-cycle scaffolds for starting new investigations |
| **194 analytical files** | Distributed across 8 populated case folders — timelines, claims ledgers, [Sigma](https://sigmahq.io/) rules, coverage matrices, compliance reports |

## Lab stack

| Service | Role | Port |
|---|---|---|
| [OpenCTI](/CTI_as_a_Code/services/opencti) | Threat intelligence platform — STIX2 actors, TTPs, IOC graph | :8080 |
| [TheHive 5](/CTI_as_a_Code/services/thehive-cortex) | Incident response case management | :9100 |
| [Cortex](/CTI_as_a_Code/services/thehive-cortex) | Automated enrichment engine | :9002 |
| [Kibana / SIEM](/CTI_as_a_Code/services/elastic-siem) | Detection dashboards, alert triage, timeline investigation | :5601 |
| [Elasticsearch 8](/CTI_as_a_Code/services/elasticsearch) | Shared data store | :9200 |
| Logstash | Log ingestion pipeline | :5044 |

## 8 training assignments

Assignments 1–4 cover the Israeli private sector. Assignments 5–8 form a connected government narrative arc centered on the fictional National Digital Services Authority (NDSA). See the [published LifeTech Pharma case study](/CTI_as_a_Code/lifetech-pharma-case-study) for a complete worked example of A01.

| # | Mode | Organization | Core Challenge |
|---|---|---|---|
| [A01](/CTI_as_a_Code/training/reactive-lifetech/) | Reactive | LifeTech Pharma | 52-hour Iranian-nexus breach, 0/12 detection coverage |
| [A02](/CTI_as_a_Code/training/proactive-celltronx/) | Proactive | CelltronX Telecom | Nation-state contractor supply chain targeting |
| [A03](/CTI_as_a_Code/training/full-cycle-techpay/) | Full Cycle | TechPay FinTech | Build a CTI program from scratch under BoI-CD 362 |
| [A04](/CTI_as_a_Code/training/emulation-techpay/) | Emulation | TechPay FinTech | Validate detections against Operation Desert Cipher TTPs |
| [A05](/CTI_as_a_Code/training/reactive-ndsa/) | Reactive (Gov) | NDSA | Contractor breach — 340K biometric records, INCD notification |
| [A06](/CTI_as_a_Code/training/proactive-govid2/) | Proactive (Gov) | NDSA GovID 2.0 | National biometric gateway pre-launch — go/no-go |
| [A07](/CTI_as_a_Code/training/full-cycle-ndsa/) | Full Cycle (Gov) | NDSA | Build a CTI program under INCD Remediation Directive |
| [A08](/CTI_as_a_Code/training/emulation-ndsa/) | Emulation (Gov) | NDSA | INCD Section 8 annual detection validation |

## Navigation

- **[Quick Start](/quick-start)** — lab up and running in 10 minutes
- **[Architecture](/architecture)** — design decisions and data flows
- **[Methodology](/methodology)** — tool reference and workflow steps
- **[Step-by-Step Methodology](/cti-as-a-code-methodology)** — complete intake, claims ledger, gap taxonomy, Sigma validation, and detection backlog guide
- **[Training](/training)** — all 8 assignments with objectives and deliverables
- **[Case Studies](/lifetech-pharma-case-study)** — published worked investigations
- **[Ecosystem](/ecosystem)** — how this project fits with the Field Manual and other CTI projects

## Related projects

This project is part of a practitioner [CTI ecosystem](https://anpa1200.github.io/cti.html):

- **[CTI Portfolio](https://anpa1200.github.io/cti.html)** — all projects, repositories, and published articles in one place
- **[CTI Analyst Field Manual](https://anpa1200.github.io/cti-analyst-field-manual/)** — the analytic tradecraft standard underpinning every assignment
- **[Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)** — the sector knowledge base for [A05](/CTI_as_a_Code/training/reactive-ndsa/)–[A08](/CTI_as_a_Code/training/emulation-ndsa/)
- **[Customer-Driven AI CTI Project](https://anpa1200.github.io/customer-driven-ai-cti-project/)** — delivery methodology for turning CTI into managed customer projects
- **[HexStrike AI](https://github.com/0x4m4/hexstrike-ai)** — adversarial validation platform for detection coverage built in [A04](/CTI_as_a_Code/training/emulation-techpay/) and [A08](/CTI_as_a_Code/training/emulation-ndsa/)
