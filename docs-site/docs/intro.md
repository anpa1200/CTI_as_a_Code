---
id: intro
title: Introduction
sidebar_position: 1
---

# CTI as a Code

A full Linux Cyber Threat Intelligence lab and structured CTI methodology framework, running on Docker Compose.

**CTI as Code** treats threat intelligence investigations like software engineering projects — version-controlled, template-driven, evidence-traced claims, reproducible analysis, deployable Sigma rules.

## What's in this project

| Component | What it is |
|---|---|
| **Docker Compose lab** | OpenCTI · TheHive 5 · Cortex · Elastic SIEM · Logstash — spin up a full CTI platform on one Linux host |
| **8 training assignments** | Reactive, proactive, full-cycle, and adversary emulation methodology — across private sector and government scenarios |
| **3 blank methodology templates** | Reactive / proactive / full-cycle scaffolds for starting new investigations |
| **194 analytical files** | Distributed across 8 populated case folders — timelines, claims ledgers, Sigma rules, coverage matrices, compliance reports |

## Lab stack

| Service | Role | Port |
|---|---|---|
| OpenCTI | Threat intelligence platform — STIX2 actors, TTPs, IOC graph | :8080 |
| TheHive 5 | Incident response case management | :9100 |
| Cortex | Automated enrichment engine | :9002 |
| Kibana / SIEM | Detection dashboards, alert triage, timeline investigation | :5601 |
| Elasticsearch 8 | Shared data store | :9200 |
| Logstash | Log ingestion pipeline | :5044 |

## 8 training assignments

Assignments 1–4 cover the Israeli private sector. Assignments 5–8 form a connected government narrative arc centered on the fictional National Digital Services Authority (NDSA).

| # | Mode | Organization | Core Challenge |
|---|---|---|---|
| A01 | Reactive | LifeTech Pharma | 52-hour Iranian-nexus breach, 0/12 detection coverage |
| A02 | Proactive | CelltronX Telecom | Nation-state contractor supply chain targeting |
| A03 | Full Cycle | TechPay FinTech | Build a CTI program from scratch under BoI-CD 362 |
| A04 | Emulation | TechPay FinTech | Validate detections against Operation Desert Cipher TTPs |
| A05 | Reactive (Gov) | NDSA | Contractor breach — 340K biometric records, INCD notification |
| A06 | Proactive (Gov) | NDSA GovID 2.0 | National biometric gateway pre-launch — go/no-go |
| A07 | Full Cycle (Gov) | NDSA | Build a CTI program under INCD Remediation Directive |
| A08 | Emulation (Gov) | NDSA | INCD Section 8 annual detection validation |

## Navigation

- **[Quick Start](quick-start)** — lab up and running in 10 minutes
- **[Architecture](architecture)** — design decisions and data flows
- **[Training](training)** — all 8 assignments with objectives and deliverables
- **[Ecosystem](ecosystem)** — how this project fits with the Field Manual and other CTI projects

## Related projects

This project is part of a practitioner CTI ecosystem:

- **[CTI Analyst Field Manual](https://anpa1200.github.io/cti-analyst-field-manual/)** — the analytic tradecraft standard underpinning every assignment
- **[Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)** — the sector knowledge base for A05–A08
- **[Customer-Driven AI CTI Project](https://anpa1200.github.io/customer-driven-ai-cti-project/)** — delivery methodology for turning CTI into managed customer projects
- **[HexStrike AI](https://github.com/0x4m4/hexstrike-ai)** — adversarial validation platform for detection coverage built in A04 and A08
