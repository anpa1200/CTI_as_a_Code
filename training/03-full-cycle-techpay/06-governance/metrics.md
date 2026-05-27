# Program Metrics — PROJ-2024-003 (TechPay CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2024-10-15  
**Review cycle:** Quarterly

---

## Intelligence Production Metrics

| Metric | Target | Baseline (Oct 2024) | Q1 2025 Target |
|---|---|---|---|
| PIRs with current answer (≤90 days old) | ≥80% (4/5 PIRs) | 0% (0/5) | 60% (3/5) |
| SOC Flash timeliness (published by Monday 09:00) | ≥90% of weeks | Not operational | 80% |
| Monthly CISO report delivered by 5th of month | ≥90% of months | Not operational | 80% |
| Quarterly strategic assessment cycle | 4/year | 0/year | 1 (Q4 2024 report in January) |
| Collection gap reduction | ≥1 gap closed per quarter | 3 critical gaps | MOU renewed = 1 gap closed |

---

## Detection Metrics

| Metric | Target | Baseline | Q1 2025 Target |
|---|---|---|---|
| ATT&CK techniques with detection rule (primary threat vector) | ≥50% | 0% (0 AiTM rules) | 25% (AiTM VPN rule) |
| Detection rules deployed from CTI recommendations within 30 days | ≥70% | N/A | 70% |
| Mean time from IOC receipt to SIEM watchlist deployment | <4 hours | Manual (next business day) | <2 hours |

---

## Collection Metrics

| Metric | Target | Baseline | Q1 2025 Target |
|---|---|---|---|
| CERT-IL FinCERT MOU active | Yes | **No — lapsed** | Yes |
| Commercial threat intel platform active | Yes | No | No (Q2 procurement) |
| Active collection sources feeding PIR-001 | ≥3 | 1 (ClearSky manual) | 3 (FinCERT + ClearSky + platform) |
| SIR-001 auto-ingest operational | Yes | No | Yes (after MOU) |
| PayNext SIEM integrated | Yes | No | Yes (8 weeks) |

---

## Sharing Metrics

| Metric | Target | Baseline |
|---|---|---|
| Indicators shared with CERT-IL / month | ≥10 | 0 (MOU lapsed) |
| Indicators received from CERT-IL / month | ≥20 | 0 (MOU lapsed) |
| Sharing reciprocity ratio (contributed / received) | ≥0.3 | N/A |

---

## Stakeholder Satisfaction

| Stakeholder | Target Score | Baseline | Last Surveyed |
|---|---|---|---|
| CISO | ≥4/5 | Not measured | Never |
| SOC Manager | ≥4/5 | Not measured | Never |
| Legal | ≥4/5 | Not measured | Never |
| Board | ≥4/5 | Not measured | Never |

*Survey instrument: 5-question form including "Did this intelligence change a decision?" — this is the most important single metric.*

---

## Compliance Metrics

| Requirement | Status | Evidence |
|---|---|---|
| BoI-CD 362 Section 4 — threat intelligence program | **Gap** — no formal program at baseline | This project document |
| BoI-CD 362 Section 6 — intelligence sharing | **Gap** — CERT-IL MOU lapsed | MOU renewal in progress |
| BoI-CD 362 Section 8 — incident-driven PIRs | **Gap** — no PIR framework at baseline | PIR register created this project |

---

## Q1 2025 Priority Dashboard

| Priority | Action | Metric Impacted | Owner | Target |
|---|---|---|---|---|
| P1 | Renew CERT-IL FinCERT MOU | Collection (SIR-001); sharing | Legal + CISO | Jan 2025 |
| P1 | Deploy AiTM VPN detection rule | Detection coverage | Detection Engineering | Jan 2025 |
| P1 | Patch PayNext CVE (CVSS 8.1) | Inherited risk; PIR-002 | IT | Sprint 14 |
| P1 | Produce Q4 2024 quarterly assessment | PIR timeliness | CTI Lead | Jan 15 |
| P2 | Begin commercial platform procurement | Collection gaps; PIR-001 | CISO | Q2 2025 |
