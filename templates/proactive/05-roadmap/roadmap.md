# Capability Improvement Roadmap

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]  
**Roadmap horizon:** 90 days  
**Base date:** YYYY-MM-DD

---

## Roadmap Principles

1. **Risk-driven**: Every item links to a threat scenario and crown jewel.
2. **Achievable**: Includes realistic effort estimates and accounts for blockers.
3. **Measurable**: Each milestone has a clear success criterion.

---

## 72-Hour (Immediate) Actions

> What can be done right now with no new budget, no new tools, and no CAB approval?

| Action | Owner | Success Criterion | Due |
|---|---|---|---|
| Deploy existing Sigma rule to SIEM | SOC | Alert firing in SIEM | +24h |
| Block known IOCs at firewall | SOC | IOCs in block list | +24h |
| Brief SOC on new TTPs | CTI | SOC runbook updated | +48h |

---

## 30-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| | Detection rule | P1 | | 3 days | Rule deployed, PASS in emulation |
| | Logging improvement | P1 | | 5 days | Events visible in SIEM |
| | Hunting campaign | P2 | | 2 days | Hunt completed, findings documented |

---

## 60-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| | | | | | |

---

## 90-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| | | | | | |

---

## Dependencies and Blockers

| Item | Blocker | Unblock Path | Owner | ETA |
|---|---|---|---|---|
| | Sprint 23 | | Engineering | |
| | CAB approval | | Change Manager | |
| | Budget approval | | CISO | |

---

## Success Metrics

| Metric | Baseline | 30-Day Target | 90-Day Target |
|---|---|---|---|
| ATT&CK technique coverage (PASS) | X% | X% | X% |
| Mean time to detect (MTTD) | Xh | Xh | Xh |
| Blocked detections resolved | X | X | X |
| Open P1 detection gaps | X | 0 | 0 |
