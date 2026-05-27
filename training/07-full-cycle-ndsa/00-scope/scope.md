# Scope — PROJ-2025-007 (NDSA CTI Program Build)

**Classification:** TLP:AMBER  
**Analyst:** CTI Lead (NDSA, transitioning)  
**Date opened:** 2025-10-01  
**Program horizon:** 12 months (INCD remediation directive compliance deadline: 2026-07-01)

---

## Program Context

NDSA is building a CTI program from zero following the March 2025 eID breach (Assignment 5). This program is now mandated by INCD Remediation Directive RD-2025-NDSA-004, which requires formal CTI capability within 9 months (by 2026-07-01). Budget: ₪8.5M/year (staff: ₪3.2M; infrastructure: ₪1.8M; tools/services: ₪3.5M).

---

## Program Objective

Design and launch a formal CTI program that:
1. Answers the CISO's and DG's intelligence questions on threats to NDSA digital infrastructure
2. Provides the SOC weekly tactical indicators and hunting hypotheses
3. Feeds intelligence back to INCD from NDSA's unique GovID 2.0 authentication telemetry
4. Satisfies INCD remediation directive RD-2025-NDSA-004 by 2026-07-01
5. Prevents a recurrence of the March 2025 breach pattern

---

## In Scope

- Threats to NDSA Crown Jewels: VRID 2.0 (9.5M biometric records), GovID 2.0 authentication platform, Ministry Integration Bus
- Contractor and vendor security intelligence: HavayaIT Systems Ltd., BiometricTech IL Ltd.
- Iranian-nexus adversary capability tracking (post-March 2025 incident)
- CERT-IL MISP integration and ITA peer sharing MOU
- INCD remediation compliance (RD-2025-NDSA-004)
- Regulatory intelligence: INCD-CID, PPL, Biometric Database Law, MATZBEN changes

---

## Out of Scope

- Offensive cyber operations of any kind
- SOC alert triage (separate function)
- Physical security
- Classified government network (separate track; INCD managed)

---

## Priority Intelligence Requirements

| # | PIR | Owner | Cadence |
|---|---|---|---|
| PIR-001 | Israeli government digital infrastructure threat landscape | CISO | Quarterly |
| PIR-002 | Iranian-nexus adversary capability evolution | CISO / Detection Engineering | Quarterly |
| PIR-003 | Regulatory compliance horizon (INCD-CID, PPL, BDA) | Legal | Quarterly |
| PIR-004 | Contractor and supply chain threat (HavayaIT, BiometricTech) | CISO | Monthly; triggered |
| PIR-005 | GovID 2.0 platform-specific threat and precursor indicators | CISO + INCD | Quarterly; triggered |

---

## Constraints

- INCD Remediation Directive deadline: 2026-07-01 — all 8 compliance items must be met
- CERT-IL MISP MOU not yet signed — highest priority legal action
- Classified INCD advisories (TLP:RED) cannot reach SOC directly — downgrade process required
- GovID API logs not yet in SIEM — log pipeline required before SIR-003 can operate fully
- Staff: Maya Dvir (senior analyst, starts 2026-01 Week 6); Itai Ben-Levi (junior analyst, starts 2026-01 Week 10)

---

## Definition of Done (INCD Compliance Checklist)

- [ ] PIR framework formally documented and stakeholder-approved (Feb 2026)
- [ ] Collection plan v1.0 complete (Feb 2026)
- [ ] Q1 2026 quarterly intelligence product published (March 2026)
- [ ] CERT-IL sharing MOU signed (Feb 2026)
- [ ] ITA peer sharing MOU signed (March 2026)
- [ ] MISP with ≥2 INCD-approved feeds operational (March 2026)
- [ ] CTI analyst with ≥3 years experience on staff (Maya Dvir — Week 6)
- [ ] Annual review process documented (April 2026)

---

## Stakeholders

| Name | Role | PIRs | Delivery Format |
|---|---|---|---|
| Dr. Ayelet Shamir | Director-General | PIR-001, PIR-005 (strategic summary) | Quarterly briefing doc; Board-ready |
| Col. (Res.) Dror Nativ | CISO | PIR-001, -002, -004, -005 | Monthly operational + quarterly strategic |
| Gila Ben-Moshe | SOC Lead | SIR-001, -002, -003 | Weekly SOC Flash; SIEM watchlist push |
| Lt. Col. (Res.) Oren Friedman | INCD liaison | PIR-005 feed to INCD; classified advisories → NDSA | Formal quarterly submission; ad hoc |
| Rachel Goldstein | Legal | PIR-003 | Quarterly regulatory memo |
| Ministry of Interior | Downstream consumer | SIR-003 (sanitized) | Weekly unclassified summary |
