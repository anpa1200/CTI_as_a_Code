---
title: Training Overview
sidebar_position: 1
---

# Training Assignments

Eight structured CTI assignments covering the full analyst skill set across four operational modes. Every assignment contains a project brief (`assignment.md`), distributed analytical files demonstrating the methodology, synthetic evidence data, and a worked solution (`solution.md`).

## Methodology Types

| Mode | What it trains | Assignments |
|---|---|---|
| **Reactive** | Post-incident CTI — timeline reconstruction, ATT&CK mapping, attribution, detection derivation, regulatory notification | A01, A05 |
| **Proactive** | Pre-incident threat modeling — trigger synthesis, crown jewels, attack scenarios, detection backlog, roadmap | A02, A06 |
| **Full Cycle** | CTI program design — PIR framework, collection plan, sharing architecture, governance, metrics | A03, A07 |
| **Emulation** | Detection validation — TTP extraction, emulation plan, execution, coverage matrix, compliance report | A04, A08 |

## Recommended Execution Orders

### Technical track (DFIR + Detection Engineering)
A01 → A04 → A05 → A08

### Strategic track (Program Design + Management)
A03 → A07 → A02 → A06

### Full track (recommended)
A01 → A02 → A03 → A04 → A05 → A06 → A07 → A08

## Private Sector Cases (A01–A04)

All set in a shared Israeli private sector ecosystem. A03 (TechPay full-cycle program) is tested by the near-miss incident that precedes A04. The Operation Desert Cipher TTPs in A04 are the same adversary cluster assessed in A01 and A02.

## Government Narrative Arc (A05–A08)

Assignments 5–8 form a continuous connected story about the fictional National Digital Services Authority (NDSA):

```
A05 (March 2025)          A06 (June 2025)            A07 (Sep 2025)           A08 (Jan 2026)
NDSA breach               GovID 2.0 pre-launch        INCD mandates program    INCD Section 8
340K biometric records  → Active threat, go/no-go → PIR framework, MOU     → Detection validation
                                                       CERT-IL MOU               6P/2P/3F
```

Each assignment references findings from the previous one. A08 emulates TTPs from both A05 (the breach timeline) and A06 (the GovID 2.0 threat assessment).

## Core Analytical Tools Used

Each assignment references open-source tools appropriate to its methodology:

- **Reactive**: Velociraptor · Timesketch · Plaso · Hayabusa · TheHive · ATT&CK Navigator
- **Proactive**: MISP · OpenCTI · OWASP Threat Dragon · ATT&CK Navigator · DeTT&CT
- **Full Cycle**: OpenCTI · GitLab Issues · DeTT&CT · Elastic SIEM
- **Emulation**: Invoke-AtomicRedTeam · VECTR · MITRE CALDERA · Sigma · Hayabusa · Chainsaw

## Analytical File Structure

Every case folder follows the methodology template:

```
project.yml           — exercise metadata (id, type, PIRs, status)
assignment.md         — brief and objectives
solution.md           — full worked answer
00-scope/             — scope, PIRs, constraints
01-*/                 — inputs (evidence, triggers, stakeholders)
02-*/                 — analysis foundations
03-*/                 — core analytical products
04-*/                 — detections (Sigma rules, backlogs)
05-*/                 — outputs (roadmaps, execution, coverage)
06-*/                 — results or immediate actions
07-*/                 — deliverables (executive brief, SOC handoff)
08-ai-outputs/        — AI-assisted draft outputs (analyst-reviewed)
09-feedback/          — post-delivery review
```
