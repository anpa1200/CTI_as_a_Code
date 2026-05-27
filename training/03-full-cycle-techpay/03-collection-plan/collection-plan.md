# Collection Plan — PROJ-2024-003 (TechPay CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2024-10-15  
**Review cycle:** Quarterly

---

## Requirements Matrix

| PIR | Primary Source | Method | Frequency | Output | Gap? |
|---|---|---|---|---|---|
| PIR-001 | CERT-IL FinCERT MISP | Structured TAXII feed ingest | Daily auto + quarterly synthesis | Quarterly landscape assessment | **Critical gap: MOU lapsed** |
| PIR-001 | ClearSky / public threat reports | OSINT analyst review | Monthly | Supplementary threat landscape data | Partial — no dedicated analyst time |
| PIR-001 | Commercial platform (not yet procured) | Platform API → MISP | Daily | Real-time actor tracking; TechPay infrastructure mention | **Gap: not procured** |
| PIR-002 | DarkOwl | Automated alerts | Daily | Credential exposure alerts | Active |
| PIR-002 | CyberShield pentest reports | Quarterly engagement | Quarterly | Technical risk findings | Active (limited to quarterly cadence) |
| PIR-002 | PayNext SIEM | Log ingestion (pending) | Continuous (after 8 weeks) | PayNext-specific telemetry | **Gap: 8-week integration window** |
| PIR-003 | Internal — HR + access logs | Manual review | Triggered (now; Ben-David) | Access inventory; revocation recommendation | Active |
| PIR-004 | Bank of Israel publications | Public website monitoring | Weekly | Regulatory updates | Active (manual) |
| PIR-005 | CERT-IL FinCERT + commercial | Feed ingest | Daily + quarterly synthesis | TTP evolution tracking | Gap: MOU + no platform |
| SIR-001 | CERT-IL FinCERT MISP | TAXII auto-ingest → SIEM push | Daily | SIEM watchlist updates | **Blocked: MOU lapsed** |
| SIR-002 | DarkOwl | Automated alerts | Daily | 2h alert to fraud + SOC | Active |
| SIR-003 | NVD + CERT-IL public | CVE feed monitoring | Daily | Patch priority recommendation to IT | Active (manual; no automation yet) |
| SIR-004 | Passive DNS / brand monitor | Automated monitoring | Daily | Lookalike domain alert → SOC | **Gap: service not procured** |

---

## Collection Calendar

| Cadence | Task | Owner |
|---|---|---|
| Daily | DarkOwl alert triage; SIR-002 review | CTI Lead |
| Daily | CVE monitoring (NVD + CERT-IL) | CTI Lead (manual; automate in Q1) |
| Weekly | SOC Flash production (SIR-001 + SIR-002 + OSINT review) | CTI Lead |
| Weekly | Bank of Israel + MoF publications scan | CTI Lead |
| Monthly | PayNext threat update (PIR-002); manual PayNext SIEM review during 8-week gap | CTI Lead |
| Quarterly | PIR-001 landscape assessment + PIR-005 TTP evolution | CTI Lead + CISO |
| Triggered | PIR-003 (insider risk; departing personnel) | CTI Lead + Legal |

---

## Critical Collection Gaps

| Gap | PIRs Affected | Impact | Resolution | Timeline | Owner |
|---|---|---|---|---|---|
| CERT-IL FinCERT MOU lapsed | PIR-001, PIR-005, SIR-001 | No sector-specific Israeli payment threat feed; missed 7 TLP:AMBER bulletins in 9 months | Renew MOU — Legal action item | 2 weeks | Legal + CISO |
| No commercial threat intel platform | PIR-001, PIR-003, PIR-005 | Cannot search TechPay infrastructure mentions; no systematic actor tracking | Procure Recorded Future or equivalent | Q1 2025 — ₪180K/year | CISO approval + procurement |
| PayNext logs not integrated | PIR-002 | Cannot detect active exploitation of PayNext infrastructure during 8-week gap | Manual weekly PayNext SIEM log review until integration complete | 8 weeks | CTI Lead + PayNext IT |
| SIR-004 brand monitoring not active | PIR-003, SIR-004 | Lookalike domains not detected automatically | Procure brand protection service | Q2 2025 — ₪60K/year | CISO approval |

---

## Procurement Plan

| Item | Purpose | PIRs Served | Cost Estimate | Priority | Timeline |
|---|---|---|---|---|---|
| Commercial threat intel platform (Recorded Future / equivalent) | Israeli financial sector actor tracking; infrastructure monitoring; API → SIEM | PIR-001, -003, -005 | ₪180K/year | P1 | Q1 2025 |
| Brand protection / domain monitoring service | Automated lookalike domain detection; SIR-004 | SIR-004, PIR-003 | ₪60K/year | P2 | Q2 2025 |

**Total new collection investment: ₪240K/year**

---

## Ethics and Legal Constraints

| Constraint | Applies To | Action |
|---|---|---|
| PPL (Israeli Privacy Protection Law) | Any collection involving Israeli citizen PII from dark web | Do not retain dark web PII exports; use hashed/anonymized indicators only; notify legal before any PPL-covered data is collected |
| BoI-CD 362 Section 6 | Intelligence sharing with external parties | All external sharing must be TLP-marked; no customer PII in shared products; CERT-IL MOU provides the sharing framework |
| TLP:RED distribution | INCD and classified sources | TLP:RED material (including any classified CERT-IL emergency notifications) restricted to CISO + CTI Lead only; not in shared repositories |
| NDA — Ben-David | PIR-003 collection | Review restricted to CISO + Legal; HR process applies |
