# Trigger Assessment — PROJ-2025-006 (GovID 2.0 Pre-Launch)

**Classification:** TLP:AMBER  
**Date:** 2025-06-19  
**Analyst:** Yael Rotenberg

---

## Trigger Summary

| # | ID | Source | Date | TLP | Admiralty S | Admiralty I | Key Claim | Actionable? |
|---|---|---|---|---|---|---|---|---|
| 1 | TRG-001 | INCD classified advisory via Friedman | 2025-06-02 | RED (restricted) | A | 2 | UAE government biometric platform breached via BiometricTech-type vendor API; Iranian-nexus actor; progression from vendor compromise to bulk extraction within 96h | Yes — high priority; restrict to Nativ + Rotenberg only |
| 2 | TRG-002 | CERT-IL Bulletin CB-2025-041 | 2025-06-08 | AMBER | B | 2 | Iranian-nexus targeting Israeli government biometric systems; developer credential harvesting via lookalike domains; `govid-dev-update[.]com` domain registered | Yes — shareable within NDSA |
| 3 | TRG-003 | GitHub credential leak (HavayaIT dev y.stern) | 2025-06-14 | Internal | A | 1 | NDSA_API_KEY, GovID 2.0 staging JWT, and contractor VPN credential committed to public repo; exposure confirmed 11 days before discovery; JWT already rotated | Yes — confirmed; immediate action required |
| 4 | TRG-004 | BiometricTech IL Ltd. vendor probing notification | 2025-06-17 | Vendor Confidential | B | 2 | IP 185.220.101.47 making 2,400 calls/day to `/verify/bulk` endpoint with valid-format vendor token; IP is not on NDSA-approved allowlist; IP appears in CERT-IL MISP from TRG-002 | Yes — correlates directly with TRG-001, TRG-002 |

---

## Synthesized Threat Picture

An Iranian-nexus adversary is actively targeting NDSA's GovID 2.0 platform in the pre-launch window. The four triggers form a coherent attack preparation chain:

**Chain logic:**
- TRG-001 (classified): UAE biometric breach via vendor API abuse — the blueprint for the likely GovID 2.0 attack
- TRG-002: Developer credential harvesting active in Israel — consistent with repeating the A05 contractor supply chain pattern
- TRG-003: One NDSA developer credential (Stern) confirmed exposed — supply chain entry confirmed
- TRG-004: Active API probing of the exact endpoint the adversary would use for bulk biometric extraction — reconnaissance in progress

**Are all triggers from the same adversary?** Assessed: **Likely yes.** IP 185.220.101.47 appears in both TRG-002 (CERT-IL MISP) and TRG-004 (BiometricTech probing). The UAE incident (TRG-001) uses the same vendor API abuse pattern as TRG-004. Developer credential harvesting (TRG-002) aligns with the Stern GitHub exposure (TRG-003). Four independent signals pointing to the same attack chain.

**Current adversary phase:** Pre-exploitation. Active API surface reconnaissance using what may be a stolen BiometricTech vendor token. The adversary may have also obtained limited staging access via the Stern credentials during the 11-day exposure window.

**Time pressure:** TRG-001 (classified) indicates that in the UAE incident, the adversary progressed from vendor compromise to bulk extraction within 96 hours of gaining API access. If the BiometricTech token is live and the adversary has it, the window is short.

---

## Actor TTP Table

| Technique | Sub | Source | Confidence | Detection Status |
|---|---|---|---|---|
| T1566.001 | Spearphishing with attachment/link | TRG-002 (developer targeting) | High | Partial — DET-G6-007 (lookalike domain DNS) planned |
| T1557 | AiTM credential theft | TRG-001 (UAE pattern), TRG-002 | Medium | GOV-DET-A05-001 (contractor VPN); developer M365 not covered |
| T1078.003 | Cloud account / API credential | TRG-003 (Stern GitHub), TRG-004 (vendor token) | High | DET-G6-002 (vendor token IP binding) — blocked; not deployed |
| T1078.002 | Staging environment credential | TRG-003 | High | DET-G6-003 — deployable; pending |
| T1530 | Data from cloud storage / API | TRG-004 (/verify/bulk probing) | High | DET-G6-001 (API volume) — blocked; log pipeline not built |
| T1005 | Data from local system (VRID export) | TRG-001 (UAE pattern) | Medium | GOV-DET-A05-002 (VRID query rule) — deployed post-A05 |
| T1041 | Exfiltration over C2 channel | TRG-001 (UAE pattern) | Medium | DET-G6-008 (large outbound HTTPS) — blocked; no NetFlow on GovCloud |

---

## Immediate Actions Triggered

| Priority | Action | Triggered By | Owner | Deadline |
|---|---|---|---|---|
| P1 | Block 185.220.101.47 at NDSA perimeter | TRG-004 | SOC (Ben-Moshe) | 2 hours |
| P1 | Force password reset — all HavayaIT contractor NDSA accounts | TRG-003 | CISO / IT | 24 hours |
| P1 | Send formal security request to BiometricTech CISO | TRG-004 | CISO (Nativ) | Immediate |
| P1 | Block staging IP range from querying production VRID (Sprint 23 gap) | TRG-003 | IT / Network Ops | 48 hours |
| P1 | Verify all GovID 2.0 API keys from Stern repo are rotated | TRG-003 | IT | 4 hours |
| P2 | Deploy DET-G6-003 (staging JWT source IP monitoring) | TRG-003 | SOC | 72 hours |
| P2 | Begin GovID API log pipeline build for DET-G6-001 | TRG-004 | SOC Engineering | Sprint start |

---

## Intelligence Gaps

| Gap | Impact | Collection Path |
|---|---|---|
| BiometricTech token status — is it legitimately issued? | Cannot confirm whether adversary has valid API access | BiometricTech formal response (24h deadline) |
| Stern 11-day exposure — did adversary access staging or production? | Sprint 23 gap may have been exploited; scope unknown | Staging access logs review; VRID DB query audit for Stern JWT sessions |
| UAE incident classified details (TRG-001) | Full attack chain and tooling unknown at unclassified level | INCD classified track; not available for unclassified products |
