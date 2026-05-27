# Claims Ledger — PROJ-2024-003 (TechPay CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2024-10-15

---

## Active Claims

### CLM-003-001

**Claim:** AiTM phishing with TOTP session token capture is the current primary access vector against Israeli payment processors and fintech companies.

**Confidence:** B2 — established source (ClearSky); information confirmed by recent incidents documented in public report  
**Evidence:**
- ClearSky November 2024 report: documents active AiTM kit targeting Israeli fintech with TOTP-bypass capability
- Iranian-nexus technique evolution from SMS-bypass to TOTP-capture documented
- Confirmed in LifeTech Pharma (A01) and CelltronX (A02) incidents — same access vector pattern  
**Reasoning:** Three independent sources (ClearSky, LifeTech incident, CelltronX incident) document AiTM with TOTP bypass. The technique represents an evolution from prior SMS-bypass methods. TechPay has zero detection coverage for this vector.  
**Alternative hypotheses:**
- SQL injection / API abuse may be equally prevalent but less documented
- Insider-enabled fraud may be the primary access vector for financial-specific threats rather than external phishing  
**PIR relevance:** PIR-001 (access vector), PIR-005 (TTP evolution)

---

### CLM-003-002

**Claim:** TechPay inherited at least three unmitigated threat exposures from the PayNext acquisition: (1) 14 dark web credential exposures, (2) three active legacy API integrations with non-MFA API keys, (3) an unpatched authentication bypass CVE (score 8.1) in the PayNext merchant portal.

**Confidence:** A1 — primary source (DarkOwl direct alert + internal PayNext audit); information confirmed and verified  
**Evidence:**
- DarkOwl: 14 PayNext-email credentials in dark web forums; exposure pre-dates acquisition announcement
- Internal PayNext audit: 3 legacy API integrations still active in TechPay environment
- CVE database: authentication bypass CVE score 8.1 in PayNext merchant portal codebase; patched version available since September 2024; TechPay environment not yet updated  
**Reasoning:** All three exposures are confirmed from primary sources. The credential exposures are pre-acquisition, meaning the threat actor may have had access before TechPay's due diligence window. The CVE is remotely exploitable and publicly known.  
**PIR relevance:** PIR-002 (acquisition threat inheritance)

---

### CLM-003-003

**Claim:** TechPay's current detection coverage for the primary assessed access vector (AiTM credential theft) is zero, creating an unacceptable detection gap for the first 12 months of the PayNext integration window.

**Confidence:** A1 — internal telemetry review; confirmed absence of detection rules  
**Evidence:**
- Elastic SIEM review: no VPN impossible-travel rule; no non-corporate ASN detection rule; no AiTM-specific rule
- CERT-IL FinCERT MOU lapsed: no sector threat feed to trigger reactive rule deployment
- PayNext logs not yet integrated: any AiTM attack against PayNext-origin accounts would not be visible in TechPay SIEM  
**Reasoning:** The detection gap is confirmed by direct inspection. The impact is amplified by the concurrent PayNext integration window, during which attack surface is largest and visibility is lowest.  
**PIR relevance:** PIR-001, PIR-005, PIR-002

---

### CLM-003-004

**Claim:** Avi Ben-David's departure presents a medium-severity collection protection risk; not an insider threat.

**Confidence:** B2 — internal assessment; probability assessment based on employee profile and circumstances  
**Evidence:**
- No indicators of malicious intent in access logs or behavioral observation
- Ben-David has legitimate access to TechPay intelligence collection methods, active source relationships, and ongoing investigation status
- A competitor or threat actor hiring Ben-David within 12 months gains visibility into TechPay's intelligence blind spots  
**Reasoning:** PIR-003 preliminary answer. The risk is structural (knowledge of SIEM blind spots, collection methods) not behavioral (no evidence of active exfiltration or hostile intent).  
**Alternative hypotheses:**
- H1 (active insider threat): Probability low — no behavioral indicators; departure appears voluntary
- H2 (passive knowledge risk): Probability moderate — standard departure risk for senior analyst  
**PIR relevance:** PIR-003

---

### CLM-003-005

**Claim:** CERT-IL FinCERT MOU renewal is the highest-priority single action to improve TechPay's threat intelligence collection capability, delivering sector-specific intelligence that no other available source provides.

**Confidence:** A1 — gap analysis confirmed; FinCERT value assessed from public FinCERT output during lapse period  
**Evidence:**
- CERT-IL FinCERT shared 7 TLP:AMBER payment sector bulletins during the 9-month MOU lapse period — TechPay received none
- The near-miss incident (€2.1B settlement) would have been flagged to FinCERT members 3 months before it materialized
- No commercial source provides equivalent Israeli payment sector specificity at comparable cost (₪0)  
**Reasoning:** The MOU is free and provides unique sector intelligence. The 9-month lapse directly contributed to TechPay's degraded threat visibility during the PayNext acquisition period.  
**PIR relevance:** PIR-001, PIR-005

---

## Unresolved Questions

| Question | PIR | Collection Gap | Target Date |
|---|---|---|---|
| Are the 14 pre-acquisition PayNext dark web credentials still being used actively? | PIR-002 | DarkOwl can detect current use; requires investigation of session logs | Q1 2025 |
| What specific BoI-CD 362 Section 4/6/8 gaps exist in TechPay's current CTI program? | PIR-004 | No regulatory monitoring source active; requires legal + CTI joint review | Q4 2024 |
| Is the current threat cluster targeting Israeli payment processors the same one documented in ClearSky 2023 reporting? | PIR-001 | CERT-IL FinCERT MOU needed for classified context; commercial platform needed for infrastructure tracking | Q1 2025 (after MOU + platform) |
