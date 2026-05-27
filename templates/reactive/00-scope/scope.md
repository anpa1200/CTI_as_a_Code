# Scope Definition

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]  
**Date scoped:** YYYY-MM-DD  
**Scoped by:** [analyst name]  
**Approved by:** [stakeholder name / role]

---

## Incident Summary

> One paragraph: what triggered this investigation, what is the suspected impact, and what questions need answering.

[FILL IN]

---

## In Scope

| Asset / System | Owner | Justification |
|---|---|---|
| | | |

---

## Out of Scope

| Asset / System | Reason for Exclusion |
|---|---|
| | |

---

## Priority Intelligence Requirements (PIRs)

> Copy from project.yml. These drive all analytical work — every claim should trace to at least one PIR.

| ID | Question | Priority | Due |
|---|---|---|---|
| PIR-001 | | High | |
| PIR-002 | | High | |

---

## Constraints and Assumptions

- **Legal/regulatory**: [e.g., INCD notification window, data protection restrictions]
- **Evidence limitations**: [e.g., no endpoint agent on X, log retention only 30 days]
- **Access restrictions**: [e.g., cannot access production database directly]
- **Assumptions**: [e.g., timestamps assumed UTC unless otherwise noted]

---

## Stakeholders

| Name | Role | Involvement |
|---|---|---|
| | CISO / Owner | Approves scope, receives executive brief |
| | SOC Lead | Receives handoff, implements detections |
| | Legal / Compliance | Advises on notification obligations |

---

## Definition of Done

This investigation is complete when:

- [ ] All PIRs answered or formally deferred with reasoning
- [ ] Timeline covers full attacker dwell period (or gap documented)
- [ ] ATT&CK mapping reviewed and finalized
- [ ] At least one detection rule per confirmed TTP
- [ ] SOC handoff delivered and acknowledged
- [ ] Executive brief approved by stakeholder
- [ ] Regulatory notifications filed if required
