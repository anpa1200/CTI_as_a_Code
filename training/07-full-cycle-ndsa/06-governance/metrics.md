# Program Metrics — PROJ-2025-007 (NDSA CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2025-10-01  
**Review cycle:** Quarterly  
**Compliance framework:** INCD Remediation Directive RD-2025-NDSA-004

---

## Intelligence Production Metrics

| Metric | Target | Baseline (Oct 2025) | Q1 2026 Target |
|---|---|---|---|
| Quarterly products published on time | 100% | 0 — program not operational | 1 (Q1 2026 assessment by Jan 15) |
| PIRs with current answer (≤90 days old) | ≥80% (4/5) | 20% (PIR-004 partial only) | 60% (3/5) |
| SOC Flash timeliness (published weekly by Monday 09:00) | ≥90% of weeks | Not operational | 80% |
| Mean time from indicator receipt to SIEM watchlist | <4 hours | Manual (next business day) | <4 hours (after CERT-IL MOU) |

---

## Detection Metrics

| Metric | Target | Baseline | Q1 2026 Target |
|---|---|---|---|
| ATT&CK techniques with active detection rule (March 2025 technique set) | 100% | 38% (5/13 — deployed post-incident) | 46% (+T1053.005 scheduled task rule) |
| Detection rules deployed from CTI recommendation within 30 days | ≥70% | N/A (program new) | 70% |
| Mean time from CERT-IL IOC to SIEM watchlist deployment | <4 hours | Manual; unstructured | <2 hours (after MOU + automation) |
| Detection coverage for GovID 2.0 platform | ≥50% of known scenarios | 0% (API logs not in SIEM) | 25% (after log pipeline) |

---

## Collection Metrics

| Metric | Target | Baseline | Q1 2026 Target |
|---|---|---|---|
| CERT-IL MISP MOU signed | Yes | **No** | Yes — Feb 2026 (INCD RD requirement) |
| ITA sharing MOU signed | Yes | **No** | Yes — March 2026 |
| Commercial threat intel platform active | Yes | No | No (Q2 2026) |
| GovID API log pipeline operational | Yes | **No** | Yes — March 2026 |
| Active collection sources feeding PIR-001 | ≥3 | 1 (OSINT manual only) | 3 (after CERT-IL MOU) |

---

## INCD Compliance Metrics (RD-2025-NDSA-004)

| Requirement | Deadline | Status | Evidence Required |
|---|---|---|---|
| Formal PIR framework with stakeholder sign-off | Feb 2026 | **In progress** | Signed PIR document |
| Collection plan v1.0 | Feb 2026 | **In progress** | Collection plan document |
| Q1 quarterly intelligence product | March 2026 | **On track** | Product + distribution records |
| CERT-IL sharing MOU | Feb 2026 | **Not signed** | Signed MOU |
| ITA peer sharing MOU | March 2026 | **Not started** | Signed MOU |
| MISP with ≥2 INCD-approved feeds | March 2026 | **Not operational** | MISP screenshot + feed list |
| CTI analyst ≥3 years experience | Week 6 2026 | **On track** — Maya Dvir hired | HR record |
| Annual review process documented | April 2026 | Not started | Review procedure document |

**Overall compliance forecast: ON TRACK for 2026-07-01 deadline if MOU signing actions execute on schedule.**

---

## Stakeholder Satisfaction

| Stakeholder | Target | Baseline | Survey Cadence |
|---|---|---|---|
| CISO | ≥4/5 | Not measured | Quarterly from Q1 2026 |
| SOC Lead | ≥4/5 | Not measured | Quarterly |
| DG | ≥4/5 | Not measured | Quarterly |
| INCD | ≥4/5 | Not measured | Quarterly |
| MoI | ≥3/5 | Not measured | Quarterly |

**Anti-theater test:** Each quarter, ask: "If the CTI program had produced nothing this quarter, would any operational decision have changed?" If no, review PIR relevance and stakeholder engagement immediately.

---

## 8 Key Metrics (INCD RD Reporting)

| # | Metric | Type | Target | Why |
|---|---|---|---|---|
| M1 | # quarterly products published on time | Output | 100% | Stakeholder trust; INCD compliance |
| M2 | # PIRs with actionable answer per quarter | Output | ≥4/5 | Production completeness |
| M3 | Mean time from threat bulletin to SIEM indicator deployed | **Outcome** | <2 days | Operational agility |
| M4 | # detections deployed based on CTI recommendation | **Outcome** | ≥5/quarter | CTI → action conversion |
| M5 | # threat campaigns identified before CERT-IL public bulletin | **Outcome** | ≥1/quarter | Proactive value |
| M6 | % stakeholder responses citing CTI in a decision | **Outcome** | ≥60% | Program value; anti-theater |
| M7 | # intelligence gaps closed per quarter | **Outcome** | ≥2/quarter | Collection improvement |
| M8 | INCD compliance items on schedule | Process | 100% | Regulatory obligation |
