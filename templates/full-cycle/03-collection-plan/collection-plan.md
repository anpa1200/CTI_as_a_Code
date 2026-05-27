# Intelligence Collection Plan

**Program:** [project.yml → project.id]  
**Version:** 1.0  
**Last updated:** YYYY-MM-DD

Collection is driven by PIRs. If you can't trace a collection activity to a PIR, question whether it's worth the time.

---

## Collection Requirements Matrix

| PIR | Information Need | Source Type | Source ID | Collection Method | Frequency |
|---|---|---|---|---|---|
| PIR-001 | | Government advisory | SRC-001 | RSS / Email / Portal | Weekly |
| PIR-001 | | OSINT | SRC-005 | Automated search | Daily |
| PIR-002 | | Internal telemetry | SRC-010 | SIEM query | Real-time |

---

## Collection Calendar

| Activity | PIR | Source | Owner | Frequency | Next Due |
|---|---|---|---|---|---|
| CERT-IL portal review | PIR-001 | SRC-001 | | Weekly | YYYY-MM-DD |
| Threat feed digest | PIR-002 | SRC-003 | | Daily | |
| Peer ISAC digest | PIR-001, PIR-003 | SRC-007 | | Weekly | |
| SIEM hunting queries | PIR-002 | SRC-010 | | Ad-hoc | |

---

## Collection Gaps

| PIR | Information Need | Collection Gap | Gap Impact | Remediation |
|---|---|---|---|---|
| PIR-001 | | No source covers [X] | Cannot answer PIR-001 without | Add source SRC-XXX |

---

## Source Performance Review

Quarterly: assess whether each source is delivering useful intelligence.

| Source | PIRs Supported | Products Contributed | Quality | Keep / Deprioritize |
|---|---|---|---|---|
| SRC-001 | PIR-001 | 3 last quarter | High | Keep |

---

## Collection Ethics and Legal Constraints

| Activity | Constraint | Approval Required |
|---|---|---|
| Passive OSINT on threat actors | Public data only | None |
| Infrastructure scanning | Only own assets | CISO |
| Purchasing threat intel feeds | Budget and vendor review | Procurement |
| Accessing classified systems | Clearance required | Program Lead + ISSO |
