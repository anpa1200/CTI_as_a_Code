# Scope — PROJ-2024-003 (TechPay Israel — Full CTI Program Build)

**Classification:** TLP:AMBER  
**Analyst:** CTI Lead (Avi Ben-David, transitioning)  
**Date opened:** 2024-10-15  
**Program horizon:** 12 months (quarterly review cycle)

---

## Program Context

TechPay Israel Ltd. is building a CTI program from near-zero following:
- A near-miss incident (€2.1B settlement exposure; CTI would have provided 3-month early warning)
- The PayNext Solutions Ltd. acquisition (threat surface inheritance)
- Avi Ben-David's departure in 5 weeks (CTI continuity risk)
- CERT-IL FinCERT MOU lapsed 9 months (no sector-specific threat feed)
- BoI-CD 362 compliance requirements for financial institutions

---

## Program Objective

Design and launch a sustainable, stakeholder-driven CTI program that:
1. Answers the CISO's and Board's intelligence questions on Israeli payment sector threats
2. Provides the SOC with tactical indicators and hunting hypotheses weekly
3. Satisfies BoI-CD 362 Section 4/6/8 threat intelligence requirements
4. Survives the Ben-David departure without losing institutional intelligence

---

## In Scope

- TechPay Israel payment processing infrastructure
- PayNext Solutions Ltd. inherited threat surface (12-month window)
- Contractor and third-party access to TechPay systems
- Ben-David departure risk and knowledge transfer
- CERT-IL FinCERT MOU renewal
- Israeli payment sector threat landscape (PIR-001 answer)
- BoI-CD 362 compliance horizon (PIR-004 answer)

---

## Out of Scope

- TechPay's parent company (out of NDSA OSINT; different regulatory jurisdiction)
- International payment rails (SWIFT, Visa/MC global) — scoped to Israeli domestic processing
- Physical security threats

---

## Priority Intelligence Requirements

| # | PIR | Owner | Cadence |
|---|---|---|---|
| PIR-001 | Israeli payment processor threat landscape — active actors, access vectors, objectives | CISO | Quarterly |
| PIR-002 | PayNext acquisition threat inheritance — specific inherited exposures not yet remediated | CISO | Monthly (first 12 months) |
| PIR-003 | Insider and third-party access risk — specifically Ben-David departure | CISO + Legal | Triggered |
| PIR-004 | Regulatory compliance threat horizon — BoI-CD 362 upcoming requirements | Legal | Quarterly |
| PIR-005 | Adversary capability evolution — Israeli payment sector TTP changes in past 90 days | CISO + Detection Engineering | Quarterly |

---

## Constraints

- Ben-David departure in 5 weeks: knowledge transfer must be completed before Week 3 of notice period
- CERT-IL FinCERT MOU lapsed: no sector-specific threat feed; legal must initiate renewal within 2 weeks
- No commercial threat intel platform yet: procurement required; estimated ₪180K/year
- PayNext logs not yet integrated: 8-week gap window; manual review during transition
- BoI-CD 362 compliance: PIR framework and intelligence production must meet Sections 4, 6, and 8

---

## Definition of Done

- [ ] 5 PIRs and 4 SIRs formally approved by CISO
- [ ] Collection plan with source registry completed; gaps identified
- [ ] CERT-IL FinCERT MOU renewal initiated by Legal
- [ ] Ben-David transition plan documented; all active assessments handed off
- [ ] Quarterly strategic assessment (PIR-001/PIR-002 response) produced
- [ ] Weekly SOC Flash template operational and first edition delivered
- [ ] Program health metrics dashboard defined
- [ ] BoI-CD 362 compliance gap assessment completed

---

## Stakeholders

| Name | Role | PIRs Requested | Delivery Format |
|---|---|---|---|
| Yael Mizrahi | CISO | PIR-001, -002, -003, -005 | Monthly report + quarterly briefing |
| Ronen Katz | SOC Manager | SIR-001, -002 (tactical indicators) | Weekly SOC Flash; SIEM watchlist push |
| Dana Levi | Legal / Compliance | PIR-004 | Quarterly regulatory memo |
| Board / DG | Strategic oversight | PIR-001 (strategic summary) | Quarterly Board-ready assessment |
| Fraud Team | Fraud detection | SIR-002 (dark web credentials/dumps) | DarkOwl alert within 2h of match |
| CERT-IL FinCERT | External partner | TLP:AMBER sharing (post-MOU renewal) | Quarterly peer product |
