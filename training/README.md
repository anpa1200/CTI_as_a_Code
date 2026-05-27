# CTI as a Code — Training Package

> Domain terms used as standard industry terminology: CTI, DFIR, TTP, IOC, ATT&CK, PIR, SIR, Adversary Emulation.

---

## Overview

Eight structured assignments covering the full CTI analyst skill set across three operational modes. Assignments 1–4 are set in the Israeli private sector. Assignments 5–8 form a connected government narrative arc centered on the fictional National Digital Services Authority (NDSA).

| Mode | Assignment | Organization | Entry Point |
|---|---|---|---|
| **Reactive** | A01 | LifeTech Pharma | Incident already occurred — determine who, how, and why |
| **Proactive** | A02 | CelltronX Telecom | No incident yet — anticipate threat and build detection coverage |
| **Full Cycle** | A03 | TechPay FinTech | Build a collection, analysis, and dissemination program from scratch |
| **Emulation** | A04 | TechPay FinTech | Prove that detections work against confirmed TTPs |
| **Reactive (Gov)** | A05 | NDSA | Government contractor breach — biometric data, 340K records |
| **Proactive (Gov)** | A06 | NDSA GovID 2.0 | National biometric gateway pre-launch — active threat, go/no-go decision |
| **Full Cycle (Gov)** | A07 | NDSA | Build a government CTI program post-incident under INCD mandate |
| **Emulation (Gov)** | A08 | NDSA | Validate government detections — INCD Section 8 compliance |

---

## Directory Structure

Each case folder follows its methodology template structure. Every folder contains `project.yml` (populated metadata), `assignment.md` (the brief), `solution.md` (full worked answer), plus distributed analytical files matching the template layout.

```
training/
├── README.md
│
├── 01-reactive-lifetech/          # PROJ-2024-001 | 52h dwell | DCSync | 0/12 detection coverage
│   ├── project.yml
│   ├── assignment.md
│   ├── solution.md
│   ├── 00-scope/scope.md
│   ├── 01-evidence/               # raw/{logs,email,network} | README with evidence inventory
│   ├── 02-sources/source-registry.md
│   ├── 03-analysis/               # timeline | attck-mapping | attribution | claims
│   ├── 04-detections/sigma/       # DET-001–004 (Office→PS, LSASS, DCSync, VPN ASN)
│   ├── 05-deliverables/           # soc-handoff | executive-brief
│   └── 07-feedback/feedback.md
│
├── 02-proactive-celltronx/        # PROJ-2024-002 | CEDAR-SIGNAL | ENM CVE-2023-44481
│   ├── project.yml
│   ├── assignment.md
│   ├── solution.md
│   ├── 00-scope/scope.md
│   ├── 01-trigger-intelligence/   # 4 triggers + osint + trigger-assessment
│   ├── 02-crown-jewels/crown-jewels.md
│   ├── 03-threat-model/           # 3 scenarios + trust-boundaries
│   ├── 04-detection-backlog/      # backlog + blocked-items
│   ├── 05-roadmap/roadmap.md
│   ├── 06-immediate-actions/72h-plan.md
│   └── 07-deliverables/           # technical-brief | executive-brief
│
├── 03-full-cycle-techpay/         # PROJ-2024-003 | PIR framework | FinCERT lapsed
│   ├── project.yml
│   ├── assignment.md
│   ├── solution.md
│   ├── 00-scope/scope.md
│   ├── 01-stakeholders/stakeholder-map.md
│   ├── 02-pirs/pir-register.md
│   ├── 03-collection-plan/        # collection-plan + source-registry
│   ├── 04-analysis/               # claims + intelligence-products/{strategic,tactical,soc-flash}
│   ├── 05-sharing/sharing-architecture.md
│   └── 06-governance/             # metrics | review-cadence
│
├── 04-emulation-techpay/          # PROJ-2024-004 | Operation Desert Cipher | 43% PASS
│   ├── project.yml
│   ├── assignment.md
│   ├── solution.md
│   ├── 00-pre-emulation/pre-emulation-plan.md
│   ├── 01-cti-report/operation-desert-cipher.md
│   ├── 02-ttp-extraction/ttp-table.md
│   ├── 03-emulation-plan/emulation-plan.md
│   ├── 04-detections/sigma/       # DET-001–007
│   ├── 06-results/                # atomic + caldera results
│   ├── 07-coverage-matrix/coverage-matrix.md
│   ├── 08-gap-backlog/gap-backlog.md
│   └── 09-compliance-report/compliance-report.md
│
├── 05-reactive-ndsa/              # PROJ-2025-005 | 36h dwell | 340K biometric records
│   ├── project.yml
│   ├── assignment.md
│   ├── solution.md
│   ├── 00-scope/scope.md
│   ├── 01-evidence/               # raw/{logs,network,regulatory}
│   ├── 02-sources/source-registry.md
│   ├── 03-analysis/               # timeline | attck-mapping | attribution | claims
│   ├── 04-detections/sigma/       # GOV-DET-A05-001–005
│   └── 05-deliverables/           # soc-handoff | executive-brief | regulatory-notifications
│
├── 06-proactive-govid2/           # PROJ-2025-006 | exposed API key | Sprint 23 blocker
│   ├── project.yml
│   ├── assignment.md
│   ├── solution.md
│   ├── 00-scope/scope.md
│   ├── 01-trigger-intelligence/   # 4 triggers + trigger-assessment
│   ├── 02-crown-jewels/crown-jewels.md
│   ├── 03-threat-model/           # 5 scenarios + trust-boundaries + vendor-risk
│   ├── 04-detection-backlog/      # backlog + blocked-items
│   ├── 05-roadmap/roadmap.md
│   ├── 06-immediate-actions/72h-plan.md
│   └── 07-deliverables/           # technical-brief | executive-brief
│
├── 07-full-cycle-ndsa/            # PROJ-2025-007 | RD-2025-NDSA-004 | CERT-IL MOU
│   ├── project.yml
│   ├── assignment.md
│   ├── solution.md
│   ├── 00-scope/scope.md
│   ├── 01-stakeholders/stakeholder-map.md
│   ├── 02-pirs/pir-register.md
│   ├── 03-collection-plan/        # collection-plan + source-registry
│   ├── 04-analysis/               # claims + intelligence-products
│   ├── 05-sharing/sharing-architecture.md
│   └── 06-governance/             # metrics | review-cadence
│
└── 08-emulation-ndsa/             # PROJ-2026-008 | 11 tests | 55% PASS | INCD: COMPLIANT WITH CONDITIONS
    ├── project.yml
    ├── assignment.md
    ├── solution.md
    ├── 00-pre-emulation/pre-emulation-plan.md
    ├── 01-cti-report/cti-report-summary.md
    ├── 02-ttp-extraction/ttp-table.md
    ├── 03-emulation-plan/emulation-plan.md
    ├── 04-detections/sigma/       # GOV-DET-001–010
    ├── 05-execution/execution-log.md
    ├── 06-results/                # caldera + elastic detection hits
    ├── 07-coverage-matrix/coverage-matrix.md
    ├── 08-gap-backlog/gap-backlog.md
    └── 09-compliance-report/compliance-report.md
```

---

## Recommended Execution Order

### Technical Track (DFIR + Detection Engineering)
A01 → A04 → A05 → A08

### Strategic Track (Program Design + Management)
A03 → A07 → A02 → A06

### Full Track (all 8, recommended order)
A01 → A02 → A03 → A04 → A05 → A06 → A07 → A08

---

## NDSA Narrative Arc

Assignments 5–8 form a continuous story. Each assignment references events from the previous one.

| Assignment | Event | Key Output |
|---|---|---|
| A05 | March 2025 breach — 340K biometric records stolen via contractor | Detection gaps identified; INCD notification filed |
| A06 | June 2025 — GovID 2.0 pre-launch, active adversary probing | Threat model; go/no-go recommendation |
| A07 | September 2025 — INCD mandates formal CTI program | PIR framework; collection plan; sharing architecture |
| A08 | January 2026 — validate detection coverage | 55% PASS; 3 FAIL gaps; INCD: COMPLIANT WITH CONDITIONS; 4 P1 gaps require remediation |

---

## Templates

Blank project scaffolds for starting new investigations are at [`../templates/`](../templates/):

| Template | Use For |
|---|---|
| `templates/reactive/` | A01, A05 — incident response, IOC triage |
| `templates/proactive/` | A02, A06 — threat anticipation, detection improvement |
| `templates/full-cycle/` | A03, A07 — CTI program design, PIR frameworks |

---

## Attribution Discipline

> Do not assert known APT attribution without corroborating evidence.
> Use: *"activity cluster consistent with..."* / *"assessed alignment with..."* / *"suspected [region]-nexus"*
> Iranian-nexus alignment is assessed at medium confidence in most cases — not confirmed attribution.

---

## Synthetic Data Notice

All artifacts (logs, emails, IP addresses, domain names, PII) are fictional.
IP addresses use RFC 5737 documentation ranges (203.0.113.0/24, 198.51.100.0/24).
Do not block these ranges in production systems.
