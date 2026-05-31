---
title: Training Overview
sidebar_position: 1
---

# Training Assignments

Eight structured CTI assignments covering the full analyst skill set across four operational modes. Every assignment contains a project brief (`assignment.md`), distributed analytical files demonstrating the [step-by-step methodology](/docs/cti-as-a-code-methodology), synthetic evidence data, and a worked solution (`solution.md`).

## Methodology Types

| Mode | What it trains | Assignments |
|---|---|---|
| **Reactive** | Post-incident CTI — timeline reconstruction, ATT&CK mapping, attribution, detection derivation, regulatory notification | [A01](/docs/training/01-reactive-lifetech), [A05](/docs/training/05-reactive-ndsa) |
| **Proactive** | Pre-incident threat modeling — trigger synthesis, crown jewels, attack scenarios, detection backlog, roadmap | [A02](/docs/training/02-proactive-celltronx), [A06](/docs/training/06-proactive-govid2) |
| **Full Cycle** | CTI program design — PIR framework, collection plan, sharing architecture, governance, metrics | [A03](/docs/training/03-full-cycle-techpay), [A07](/docs/training/07-full-cycle-ndsa) |
| **Emulation** | Detection validation — TTP extraction, emulation plan, execution, coverage matrix, compliance report | [A04](/docs/training/04-emulation-techpay), [A08](/docs/training/08-emulation-ndsa) |

## Recommended Execution Orders

### Technical track (DFIR + Detection Engineering)
[A01](/docs/training/01-reactive-lifetech) → [A04](/docs/training/04-emulation-techpay) → [A05](/docs/training/05-reactive-ndsa) → [A08](/docs/training/08-emulation-ndsa)

### Strategic track (Program Design + Management)
[A03](/docs/training/03-full-cycle-techpay) → [A07](/docs/training/07-full-cycle-ndsa) → [A02](/docs/training/02-proactive-celltronx) → [A06](/docs/training/06-proactive-govid2)

### Full track (recommended)
[A01](/docs/training/01-reactive-lifetech) → [A02](/docs/training/02-proactive-celltronx) → [A03](/docs/training/03-full-cycle-techpay) → [A04](/docs/training/04-emulation-techpay) → [A05](/docs/training/05-reactive-ndsa) → [A06](/docs/training/06-proactive-govid2) → [A07](/docs/training/07-full-cycle-ndsa) → [A08](/docs/training/08-emulation-ndsa)

## Private Sector Cases (A01–A04)

All set in a shared Israeli private sector ecosystem. [A03](/docs/training/03-full-cycle-techpay) ([TechPay full-cycle](/docs/training/03-full-cycle-techpay) program) is tested by the near-miss incident that precedes [A04](/docs/training/04-emulation-techpay). The Operation Desert Cipher TTPs in [A04](/docs/training/04-emulation-techpay) are the same adversary cluster assessed in [A01](/docs/training/01-reactive-lifetech) and [A02](/docs/training/02-proactive-celltronx).

## Government Narrative Arc (A05–A08)

Assignments 5–8 form a continuous connected story about the fictional National Digital Services Authority (NDSA):

```
A05 (March 2025)          A06 (June 2025)            A07 (Sep 2025)           A08 (Jan 2026)
NDSA breach               GovID 2.0 pre-launch        INCD mandates program    INCD Section 8
340K biometric records  → Active threat, go/no-go → PIR framework, MOU     → Detection validation
                                                       CERT-IL MOU               6P/2P/3F
```

Each assignment references findings from the previous one. [A08](/docs/training/08-emulation-ndsa) emulates TTPs from both [A05](/docs/training/05-reactive-ndsa) (the breach timeline) and [A06](/docs/training/06-proactive-govid2) (the GovID 2.0 threat assessment).

## Core Analytical Tools Used

Each assignment references open-source tools appropriate to its methodology:

- **Reactive**: Velociraptor · Timesketch · Plaso · Hayabusa · [TheHive](/docs/services/thehive-cortex) · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/)
- **Proactive**: MISP · [OpenCTI](/docs/services/opencti) · OWASP Threat Dragon · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) · DeTT&CT
- **Full Cycle**: [OpenCTI](/docs/services/opencti) · GitLab Issues · DeTT&CT · [Elastic SIEM](/docs/services/elastic-siem)
- **Emulation**: Invoke-AtomicRedTeam · VECTR · MITRE CALDERA · [Sigma](https://sigmahq.io/) · Hayabusa · Chainsaw

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

---

## Continue in the ecosystem

- [Full ecosystem](/docs/ecosystem) — all tools and integrations used across assignments
- [Step-by-step methodology](/docs/cti-as-a-code-methodology) — the analytical framework behind every case
- [LifeTech Pharma case study](/docs/lifetech-pharma-case-study) — worked reactive investigation (PROJ-2024-001)
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — all projects and published work
