# TechPay Israel CTI — Q4 2024 Threat Landscape Assessment

**Product ID:** STR-2024-001  
**Classification:** CONFIDENTIAL | TLP:AMBER  
**Distribution:** CISO + DG + Board (read-only)  
**Date:** 2025-01-15  
**PIRs answered:** PIR-001, PIR-002

---

## Executive Summary

TechPay Israel faces an elevated threat environment in Q4 2024 / entering Q1 2025. The primary threat is financially motivated adversary activity targeting Israeli payment processors via supply chain access and credential theft, with secondary espionage interest from Iranian-nexus actors in the PayNext customer data set (140,000 Israeli merchants, ₪2.1B transaction volume).

**Three operational conclusions for the CISO:**

1. The PayNext integration introduces two immediately exploitable attack paths that require remediation before integration is complete (see Section 2). One CVE is publicly known, score 8.1, and the portal is internet-accessible.

2. CERT-IL FinCERT membership must be restored in Q1 2025. TechPay has operated without sector-specific threat intelligence for 9 months, during which FinCERT shared 7 TLP:AMBER advisories relevant to payment processors. The near-miss incident that triggered this program review would have been flagged to FinCERT members 3 months earlier.

3. Current detection coverage for AiTM credential theft — the primary assessed access vector — is zero. This must be addressed in the Q1 2025 detection engineering sprint before the PayNext integration completes and attack surface peaks.

---

## Section 1: Israeli Payment Sector Threat Landscape (PIR-001)

**Assessed active threats to Israeli payment processors (Q4 2024):**

Financially motivated actors targeting card processing infrastructure remain the persistent baseline threat to Israeli payment processors. Observed techniques focus on credential theft from processing personnel, payment API manipulation, and insider-enabled fraud schemes.

Iranian-nexus state-affiliated actors have demonstrated secondary interest in Israeli payment infrastructure with an espionage objective — specifically, high-value merchant transaction patterns and Israeli SME financial data. Confidence: B2.

**New or changed TTPs in Q4 2024 (PIR-005):**

ClearSky Cyber Security (November 2024) documented Iranian-nexus use of AiTM phishing kits targeting Israeli fintech companies. The kits now include TOTP session token capture capability, bypassing SMS and authenticator-app MFA. This is an evolution from previously documented SMS-bypass techniques and directly affects TechPay's VPN authentication infrastructure.

*Detection engineering recommendation:* Deploy impossible-travel / non-corporate ASN VPN rule as P1 in Q1 2025 sprint.

---

## Section 2: PayNext Acquisition Threat Inheritance (PIR-002)

**Top 3 inherited threat exposures requiring immediate action:**

| # | Exposure | Risk | Remediation | Owner | Target |
|---|---|---|---|---|---|
| 1 | PayNext merchant portal CVE (CVSS 8.1) — authentication bypass; internet-accessible | Critical | Patch to vendor-fixed version | IT — PayNext team | Sprint 14 (Q1 2025) |
| 2 | 14 PayNext-email credentials in dark web forums (pre-acquisition) | High | Investigate active use; force credential rotation if any used in last 90 days | CTI + IT Security | End of February |
| 3 | 3 legacy PayNext API integrations using non-MFA keys | Medium | Audit and revoke unused; require MFA on any retained | IT + Finance | End of February |

**SIEM visibility gap:** PayNext SIEM integration is 8 weeks away. During this window, any exploitation of PayNext-origin accounts is invisible in TechPay's detection environment. Manual weekly PayNext SIEM log review is the compensating control.

---

## Section 3: Detection Recommendations

| Priority | Recommendation | PIR | Owner | Target Date |
|---|---|---|---|---|
| P1 | Deploy AiTM / impossible-travel VPN rule | PIR-001/005 | Detection Engineering | End of January |
| P1 | Patch PayNext merchant portal CVE | PIR-002 | IT (PayNext team) | Sprint 14 |
| P1 | Renew CERT-IL FinCERT MOU | Collection gap | Legal + CISO | End of January |
| P2 | Revoke / audit 3 legacy PayNext API integrations | PIR-002 | IT + Finance | End of February |
| P2 | Investigate 14 pre-acquisition dark web credential exposures | PIR-002 | CTI + IT Security | End of February |

---

## Collection Gaps and PIR Status

| PIR | Status | Gap |
|---|---|---|
| PIR-001 | Partial answer | CERT-IL FinCERT MOU lapsed; commercial platform not yet procured |
| PIR-002 | Partial answer | PayNext log integration 8 weeks away; full picture not yet available |
| PIR-003 | Draft answer | Ben-David transition plan underway |
| PIR-004 | Not answered | Regulatory monitoring collection not yet active |
| PIR-005 | Partial answer | AiTM evolution documented; systematic tracking requires FinCERT + commercial platform |

---

*This product was produced without CERT-IL FinCERT access. Content is based on ClearSky public reporting, DarkOwl commercial monitoring, and internal TechPay telemetry. Confidence levels reflect this limitation. Full PIR-001 and PIR-005 answers require FinCERT membership renewal.*
