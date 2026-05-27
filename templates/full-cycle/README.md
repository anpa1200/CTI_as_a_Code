# Full-Cycle Intelligence Program Template

Use this template for: **building or maturing a CTI program, intelligence program design, PIR frameworks, collection plans, sharing architecture, governance.**

Corresponding assignments: A03 (TechPay CTI Program), A07 (NDSA Formal CTI Program — Regulatory Requirement)

---

## Folder Structure

```
full-cycle/
├── project.yml                              # Program metadata, PIRs, sharing config
├── 00-scope/
│   └── scope.md                             # Program charter, mandate, boundaries
├── 01-stakeholders/
│   └── stakeholder-map.md                   # Stakeholder requirements and engagement
├── 02-pirs/
│   ├── pir-register.md                      # Standing PIR register (full program)
│   └── templates/
│       └── pir-template.md                  # Template for new PIRs
├── 03-collection-plan/
│   ├── collection-plan.md                   # What to collect, how, from where
│   └── sources/
│       └── source-registry.md               # Full source registry with Admiralty ratings
├── 04-analysis/
│   ├── claims/
│   │   └── claims-ledger.md                 # Evidence-backed analytical claims
│   └── intelligence-products/
│       ├── strategic/                        # Strategic intelligence products
│       ├── tactical/                         # Tactical intel for SOC / IR
│       └── soc-flash/                        # SOC Flash: short rapid-fire tactical alerts
├── 05-sharing/
│   ├── sharing-architecture.md              # How intel is shared, with whom, at what TLP
│   └── mou-templates/
│       └── mou-template.md                  # MOU template for new partners
├── 06-governance/
│   ├── metrics.md                           # Program KPIs and measurement
│   └── review-cadence.md                    # Review schedule and process
├── 07-deliverables/
│   ├── intelligence-products/               # Published intelligence products
│   └── program-documentation/               # Policy docs, charters, compliance evidence
├── 08-ai-outputs/
│   └── README.md                            # AI-assisted drafts (review required)
└── 09-feedback/
    └── feedback.md                          # Program retrospective and improvement log
```

---

## Execution Order

1. **00-scope** — Define the program mandate. What are we here to do? Who authorizes us?
2. **01-stakeholders** — Map all consumers. Understand their specific intelligence needs.
3. **02-pirs** — Build the PIR register from stakeholder requirements. Review regularly.
4. **03-collection-plan** — Design collection based on PIRs. Register and rate all sources.
5. **04-analysis** — Establish analysis processes. Write products for defined consumers.
6. **05-sharing** — Design sharing architecture. Execute MOUs. Join sector community.
7. **06-governance** — Define metrics. Establish review cadence. Build compliance evidence.
8. **07-deliverables** — Publish intelligence products. Maintain program documentation.
9. **09-feedback** — Quarterly retrospective: are we answering PIRs? Are stakeholders satisfied?

---

## Full-Cycle Principle: Intelligence Must Answer PIRs

Every intelligence product must be traceable to at least one PIR.  
Every PIR must have a named consumer who reviews whether it was answered.  
PIRs with no product in 90 days should be reviewed: Is the question still relevant? Is collection insufficient?

---

## Program Maturity Levels

| Level | Description | Key Capabilities |
|---|---|---|
| 1 — Ad hoc | Reactive only, no program structure | Alert triage, IOC blocking |
| 2 — Defined | PIRs exist, basic collection, occasional products | Structured PIRs, source registry |
| 3 — Managed | Regular products, sharing established, metrics tracked | MOUs, quarterly products, KPIs |
| 4 — Optimized | Detection integrated, emulation regular, regulatory compliant | DeTT&CT, Atomic Red Team, INCD MOU |

Use this framework to assess current maturity and set improvement targets.
