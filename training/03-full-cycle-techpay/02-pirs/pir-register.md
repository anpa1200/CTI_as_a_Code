# PIR Register — PROJ-2024-003 (TechPay CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2024-10-15  
**Status:** v1.0 — initial program launch

---

## Active PIRs

| ID | Intelligence Question | Owner | Cadence | Priority | Status | Last Answered |
|---|---|---|---|---|---|---|
| PIR-001 | Which threat actors are actively targeting Israeli payment processors and fintech companies, and what are their current access vectors and objectives? | CISO | Quarterly + triggered on peer incident | P1 | **Not yet answered** | Never |
| PIR-002 | What are the specific threat exposures inherited from the PayNext Solutions Ltd. acquisition that have not yet been remediated, and which pose the highest risk to TechPay's core payment infrastructure? | CISO | Monthly (first 12 months) | P1 | **Partial** — credential exposure data from DarkOwl; logs not integrated | Partial |
| PIR-003 | Are any current employees, contractors, or departing personnel — specifically including Avi Ben-David — in possession of TechPay-sensitive access or intelligence that could benefit a threat actor or competitor? | CISO + Legal | Triggered (all senior departures) + quarterly contractor review | P1 | **Draft answer** — see `01-stakeholders/avi-departure-risk-brief.md` | 2024-10-15 |
| PIR-004 | What changes to BoI-CD 362, Israeli PPL, or Bank of Israel supervisory expectations are anticipated in the next 6 months that would affect TechPay's reporting obligations or detection requirements? | Legal | Quarterly | P2 | **Not yet answered** | Never |
| PIR-005 | Has the primary threat cluster targeting Israeli payment infrastructure changed its tooling, persistence mechanisms, or evasion techniques in the past 90 days in ways that reduce effectiveness of current TechPay detections? | CISO + Detection Engineering | Quarterly | P1 | **Partial** — ClearSky Nov 2024 AiTM report available | Partial |

---

## Standing Intelligence Requirements (SIRs)

| ID | Collection Task | Source | Frequency | Output | Consumer | Status |
|---|---|---|---|---|---|---|
| SIR-001 | Monitor CERT-IL FinCERT MISP feed for new indicators matching payment processors | CERT-IL FinCERT MISP | Daily auto-ingest | SIEM watchlist + MISP tagged events | SOC | **Blocked** — MOU lapsed; renewal in progress |
| SIR-002 | Monitor DarkOwl for TechPay/PayNext credential leaks, domain mentions, payment data dumps | DarkOwl | Daily | Alert to fraud team + SOC within 2h | Fraud Team, SOC | Active |
| SIR-003 | Monitor NVD + CERT-IL for CVEs affecting TechPay/PayNext payment processing stack | NVD, CERT-IL public | Daily | Patch priority recommendation to IT within 24h | IT Operations | Active (manual) |
| SIR-004 | Monitor domain registrations for lookalike domains targeting TechPay/PayNext brands | Passive DNS / brand monitoring | Daily | Alert to SOC + block recommendation within 4h | SOC, Legal | **Not active** — brand monitoring service not procured |

---

## PIR Details

### PIR-001 — Israeli Payment Processor Threat Landscape

**Question:** Which threat actors are actively targeting Israeli payment processors and fintech companies, and what are their current access vectors and objectives?  
**Why:** Drives detection engineering prioritization and vendor risk decisions. Without a current threat picture, detection priorities are based on generic frameworks, not TechPay-specific risk.  
**Scope:** Israeli domestic payment sector; exclude international rails.  
**Collection sources:** CERT-IL FinCERT (blocked — MOU); ClearSky public reports; commercial platform (not yet procured); MISP sector community  
**Indicator of answer:** Response names ≥1 active campaign against Israeli payment processors; maps TTPs to current TechPay attack surface; includes confidence assessment  
**Answer history:**
- 2024-10-15: No answer — program not yet operational; CERT-IL MOU lapsed

---

### PIR-002 — PayNext Acquisition Threat Inheritance

**Question:** What are the specific threat exposures inherited from the PayNext Solutions Ltd. acquisition that have not yet been remediated, and which pose the highest risk to TechPay's core payment infrastructure?  
**Why:** Board approved acquisition; integration team is 8 weeks from completing log integration. Risk decisions on integration sequencing require this intelligence.  
**Scope:** PayNext infrastructure, personnel, and third-party integrations  
**Collection sources:** DarkOwl (credential monitoring); PayNext SIEM (pending integration); CyberShield pentest reports; manual PayNext infrastructure review  
**Indicator of answer:** Identifies top 3 inherited exposures with remediation timelines; confirms no active exploitation of PayNext exposures detected  
**Answer history:**
- 2024-10-15: Partial — DarkOwl: 14 PayNext-email credentials in dark web forums; 3 legacy API integrations active. Full answer pending PayNext log integration.

---

### PIR-003 — Insider and Third-Party Access Risk

**Question:** Are any current employees, contractors, or departing personnel — specifically including Avi Ben-David — in possession of TechPay-sensitive access or intelligence that could benefit a threat actor or competitor?  
**Why:** Ben-David departure creates both a knowledge-transfer risk and a collection-protection concern. A competitor or threat actor that recruits him gains visibility into TechPay's intelligence gaps.  
**Scope:** Ben-David specifically; quarterly contractor access audit generally  
**Collection sources:** Internal — access logs, HR records, SIEM; NDA review  
**Indicator of answer:** Access inventory for flagged individuals; access revocation recommendation; transition plan with knowledge gap identified  
**Answer history:**
- 2024-10-15: Preliminary — Ben-David assessed as medium exposure risk. See `01-stakeholders/avi-departure-risk-brief.md`.

---

### PIR-004 — Regulatory Compliance Horizon

**Question:** What changes to BoI-CD 362, Israeli PPL, or Bank of Israel supervisory expectations are anticipated in the next 6 months that would affect TechPay's reporting obligations or detection requirements?  
**Why:** Legal team needs 3-month lead time to implement compliance changes. Without a horizon watch, TechPay is reactive.  
**Scope:** Bank of Israel publications; Ministry of Finance; INCD-CID (where relevant to financial sector)  
**Collection sources:** Bank of Israel website (free); BoI circulars via Legal; CERT-IL public advisories  
**Indicator of answer:** Identifies ≥1 upcoming regulatory change with implementation timeline and TechPay-specific impact assessment  
**Answer history:**
- 2024-10-15: Not yet answered.

---

### PIR-005 — Adversary Capability Evolution

**Question:** Has the primary threat cluster targeting Israeli payment infrastructure changed its tooling, persistence mechanisms, or evasion techniques in the past 90 days in ways that reduce effectiveness of current TechPay detections?  
**Why:** Detection rules built against Q2 2024 TTPs may miss Q4 2024 tooling changes.  
**Scope:** Israeli payment sector threat actors; focus on credential theft and payment API abuse techniques  
**Collection sources:** ClearSky public reports; CERT-IL FinCERT (blocked); commercial platform (not procured)  
**Indicator of answer:** Maps any new techniques to TechPay detection inventory; identifies rules requiring update; includes confidence assessment  
**Answer history:**
- 2024-10-15: Partial — ClearSky Nov 2024 documents AiTM TOTP-bypass kits targeting Israeli fintech. New technique vs. previous SMS-bypass. TechPay AiTM detection coverage: zero.

---

## Deferred PIRs

*None at program launch.*

---

## Retired PIRs

*None at program launch.*
