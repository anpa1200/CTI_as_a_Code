# Collection Plan — PROJ-2025-007 (NDSA CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2025-10-01  
**Review cycle:** Quarterly

---

## Requirements Matrix

| PIR | Primary Source | Method | Frequency | Output | Gap? |
|---|---|---|---|---|---|
| PIR-001 | CERT-IL MISP | TAXII auto-ingest + quarterly synthesis | Daily + quarterly | Quarterly landscape section | **Gap: MOU not signed** |
| PIR-001 | ClearSky / Check Point public reports | OSINT manual review | Monthly | Landscape supplementary data | Partial — no systematic schedule |
| PIR-002 | CERT-IL MISP | TAXII ingest + analyst review | Daily + quarterly | Capability evolution section | **Gap: MOU not signed** |
| PIR-002 | INCD classified via Friedman | Advisory push + downgrade process | On publication | Downgraded note; SOC product after sanitization | Informal — formal process needed |
| PIR-003 | Bank of Israel; INCD publications; MATZBEN circulars | Public website monitoring | Weekly | Regulatory horizon memo | Active (manual) |
| PIR-004 | CERT-IL MISP (HavayaIT indicators) | TAXII + PIR-004 tag filter | Daily | Contractor risk update | **Gap: MOU not signed** |
| PIR-004 | Internal VPN + PAM logs | SIEM query | Daily | Contractor VPN anomaly report | Active |
| PIR-005 | NDSA SIEM — GovID API logs | Log pipeline (in progress) | Continuous | SIR-003 anomaly alerts | **Gap: API log pipeline not built** |
| PIR-005 | INCD classified | Via Friedman | On publication | Downgraded product for SOC | Informal — formalize |
| SIR-001 | CERT-IL MISP | TAXII auto-push → SIEM watchlist | Daily | SIEM watchlist auto-update | **Blocked: MOU** |
| SIR-003 | NDSA SIEM — GovID API | Continuous alert + daily digest | Continuous | SOC alert; MoI sanitized weekly | **Blocked: log pipeline** |
| SIR-004 | Passive DNS / brand monitoring | Automated alerts | Daily | Lookalike domain alert → SOC | **Blocked: tool not procured** |

---

## Collection Calendar

| Cadence | Task | Owner |
|---|---|---|
| Daily | CERT-IL MISP triage (once MOU signed); SIR-001 ingest | CTI Lead |
| Daily | Internal VPN anomaly report (PIR-004 / SIR-002) | SOC auto + CTI Lead review |
| Daily | GovID API anomaly summary (once pipeline built) | SOC auto + CTI Lead review |
| Weekly | SOC Flash production (SIR-001 + SIR-002 + OSINT) | CTI Lead (Maya Dvir from Week 6) |
| Weekly | MoI sanitized GovID threat summary | CTI Lead |
| Monthly | PIR-004 contractor risk update; PIR-003 regulatory scan | CTI Lead + Legal |
| Quarterly | PIR-001/-002/-003/-005 product production | CTI Lead + CISO |
| Quarterly | INCD formal intelligence submission | CISO + CTI Lead |
| Triggered | PIR-004 (vendor security signal); PIR-005 (new GovID threat) | CTI Lead + CISO |

---

## Critical Collection Gaps

| Gap | PIRs Affected | Impact | Resolution | Timeline | Owner |
|---|---|---|---|---|---|
| CERT-IL MISP MOU not signed | PIR-001, -002, -004, SIR-001 | No structured Israeli government sector feed; no formal sharing relationship with CERT-IL | Legal P1 action: sign CERT-IL MOU | Feb 2026 (per INCD RD) | Legal + CISO |
| GovID API log pipeline not built | PIR-005, SIR-003 | Cannot detect bulk API abuse, authentication anomalies, or post-launch adversary behavior in GovID 2.0 | Build GovID API → Elastic log pipeline; MATZBEN CAB | March 2026 | SOC Engineering |
| ITA sharing MOU not signed | PIR-004 | No cross-agency HavayaIT activity correlation | Legal P2 action: draft and negotiate ITA MOU | March 2026 | Legal + CISO |
| Domain monitoring tool not procured | SIR-004 | Lookalike domains targeting GovID not detected automatically | Procure domain monitoring service (₪40K/year) | Q2 2026 | CISO |
| Commercial threat intel platform not procured | PIR-001, -002, -005 | No advance actor infrastructure tracking; OSINT-only for threat landscape | Procure platform (₪180K/year) within tool budget | Q2 2026 | CISO |
| Classified INCD downgrade process not designed | SIR-002, PIR-002, -005 | Classified advisories cannot be acted on by SOC; single person (CISO) is bottleneck | Design formal downgrade process; 4-week design sprint | Nov 2025 | CTI Lead + Legal |
| BiometricTech contractual log access not in place | PIR-004, PIR-005 | No visibility into BiometricTech security events; repeat of pre-Assignment 6 blindspot | Add security log access clause at contract renewal | Q2 2026 | Legal |

---

## Procurement Plan (from ₪3.5M tools/services budget)

| Item | Purpose | PIRs | Cost | Priority | Timeline |
|---|---|---|---|---|---|
| Commercial threat intel platform | Actor tracking; government sector focus | PIR-001, -002, -005 | ₪180K/year | P1 | Q2 2026 |
| MISP operational infrastructure | MOU implementation; auto-ingest; MoI sharing | All SIRs | ₪30K/year | P1 | Q1 2026 |
| Domain monitoring service | SIR-004; GovID brand protection | SIR-004 | ₪40K/year | P2 | Q2 2026 |
| **Year 1 total** | | | **₪250K** | | |

---

## Ethics and Legal Constraints

| Constraint | Applies To | Action Required |
|---|---|---|
| PPL — citizen data | Any collection involving Israeli citizen identity data | Do not retain; anonymize before sharing; legal review before any PIR-003 analysis involving named individuals |
| TLP:RED — classified INCD material | SIR-002, PIR-005 | Restrict to CISO + CTI Lead; formal downgrade process before any SOC distribution |
| BDA (Biometric Database Law) | Any collection involving biometric hash data | BDA approval required for sharing biometric data with INCD; coordinate via Friedman |
| INCD-CID classification authority | Any intelligence product that includes classified INCD source material | INCD approval required before publication |
