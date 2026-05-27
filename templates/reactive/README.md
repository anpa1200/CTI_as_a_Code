# Reactive Investigation Template

Use this template for: **incident response support, post-breach CTI, breach notification analysis, IOC triage from SIEM alerts.**

Corresponding assignments: A01 (LifeTech Pharma), A05 (NDSA Contractor Breach)

---

## Folder Structure

```
reactive/
├── project.yml                  # Project metadata, PIRs, status
├── 00-scope/
│   └── scope.md                 # Scope definition, stakeholders, constraints
├── 01-evidence/
│   ├── README.md                # Evidence inventory and chain of custody
│   ├── raw/                     # Unmodified source artifacts (logs, pcaps, dumps)
│   └── processed/               # Normalized/enriched artifacts
├── 02-sources/
│   └── source-registry.md       # Intelligence source registry with Admiralty ratings
├── 03-analysis/
│   ├── timeline/
│   │   └── timeline.md          # Chronological event reconstruction
│   ├── claims/
│   │   └── claims-ledger.md     # Evidence-backed analytical claims
│   ├── attck-mapping/
│   │   └── attck-mapping.md     # ATT&CK technique coverage
│   └── attribution/
│       └── attribution.md       # Threat actor assessment (conservative)
├── 04-detections/
│   ├── sigma/                   # Sigma rule files (.yml)
│   └── hunt-plans/
│       └── hunt-plan.md         # Threat hunting plan derived from TTPs
├── 05-deliverables/
│   ├── soc-handoff.md           # Operational handoff: IOCs, rules, monitoring
│   └── executive-brief.md       # Non-technical summary for leadership
├── 06-ai-outputs/
│   └── README.md                # AI-assisted drafts (clearly labelled, review required)
└── 07-feedback/
    └── feedback.md              # Post-delivery lessons learned
```

---

## Execution Order

1. **00-scope** — Define what you are and are not investigating. Get stakeholder sign-off.
2. **01-evidence** — Inventory all artifacts. Establish chain of custody before analysis begins.
3. **02-sources** — Register all intelligence sources used; assign Admiralty ratings.
4. **03-analysis/timeline** — Build chronological reconstruction before drawing conclusions.
5. **03-analysis/claims** — Document each analytical claim with supporting evidence references.
6. **03-analysis/attck-mapping** — Map confirmed TTPs to ATT&CK; note gaps.
7. **03-analysis/attribution** — Assess threat actor with confidence levels; avoid overattribution.
8. **04-detections** — Write detections derived from confirmed TTPs. Test before deploying.
9. **05-deliverables** — Produce SOC handoff and executive brief.
10. **07-feedback** — Document what worked and what to improve.

---

## Attribution Discipline

> Do not assert known APT attribution without corroborating evidence.  
> Use: *"activity cluster consistent with..."* / *"assessed alignment with known tradecraft of..."* / *"suspected [region]-nexus actor"*  
> Reserve high-confidence attribution for: overlapping infrastructure, code reuse, operator error, or confirmed IC attribution.

---

## Classification Handling

All files in this project inherit the classification in `project.yml`.  
Files requiring higher classification must be stored outside this folder and referenced by pointer only.
