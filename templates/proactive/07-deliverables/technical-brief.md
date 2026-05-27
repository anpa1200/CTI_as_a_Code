# Technical Brief

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]  
**Prepared for:** Security team / SOC / Detection engineering  
**Prepared by:** [analyst]  
**Date:** YYYY-MM-DD

---

## Threat Summary

**Actor**: [Assessed designation]  
**Confidence**: High / Medium / Low  
**Targeting**: [Sectors / technology / geography targeted]  
**Current activity level**: Active / Elevated / Dormant

---

## Attack Scenarios

For each scenario from `03-threat-model/scenarios/threat-scenarios.md`:

### SCN-001: [Name]

**Risk**: High / Medium / Low  
**Crown jewel**: [CJ-XXX]

**Attack path**:
1. [Initial access step]
2. [Execution/persistence]
3. [Lateral movement]
4. [Objective/exfiltration]

**Key ATT&CK techniques**:
- T1XXX.XXX — [Name]
- T1XXX — [Name]

**Detection coverage**:
- **Covered**: [techniques with active rules]
- **Gaps**: [techniques with no or partial coverage]

---

## Detection Status

| Rule | Technique | Status | Note |
|---|---|---|---|
| [Rule name] | T1XXX | PASS | Deployed |
| [Rule name] | T1XXX | BLOCKED | Awaiting Sprint 23 |

**Overall coverage**: X of Y techniques detected (X%)  
**Highest-risk undetected technique**: [T1XXX — Name]

---

## Recommended Actions for Security Team

| Priority | Action | Effort | Owner |
|---|---|---|---|
| P1 | | | |
| P1 | | | |
| P2 | | | |

---

## IOCs for Monitoring

| Type | Value | Confidence | Action |
|---|---|---|---|
| | | | Monitor / Block |

---

## Appendix: Full TTP Table

| Technique ID | Name | Tactic | Evidence Source | Detection |
|---|---|---|---|---|
| | | | TRG-XXX | Rule name / None |
