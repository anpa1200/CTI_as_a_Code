# NDSA CTI — Q1 2026 Threat Landscape Assessment

**Product ID:** STR-2026-001  
**Classification:** CONFIDENTIAL | TLP:AMBER  
**Distribution:** CISO + DG (read-only); INCD quarterly submission  
**Date:** 2026-01-15  
**PIRs answered:** PIR-001, PIR-002

---

## Executive Summary

NDSA's threat environment in Q1 2026 is characterized by continued Iranian-nexus interest in the GovID 2.0 platform following its successful launch in October 2025. The adversary shifted from API surface reconnaissance (documented Q2 2025, Assignment 6) to authenticated credential abuse attempts targeting GovID session management. Three conclusions for the CISO:

1. **Detection gap: scheduled task persistence.** The SvcHostMonitor persistence technique from the March 2025 incident has been observed in a peer Israeli government agency compromise (December 2025 CERT-IL advisory), confirming the same tool cluster is still active. A new scheduled task persistence variant (T1053.005) was also documented in that incident. NDSA has no scheduled task anomaly rule on VRID-SRV-01 or GovID 2.0 nodes. **Recommendation P1: deploy scheduled task creation rule this sprint.**

2. **PIR-004 elevated to High risk.** CERT-IL TLP:AMBER advisory (December 2025) explicitly identifies HavayaIT Systems Ltd. as an active Iranian-nexus spearphishing target. Two new lookalike domains targeting HavayaIT were registered in January 2026. The same contractor access path that enabled the March 2025 breach is being actively prepared by the same adversary type. Enhanced monitoring and contractor access review required immediately.

3. **Regulatory horizon: PPL 30-day notification amendment.** The Justice Ministry PPL amendment draft (September 2025) specifies a 30-day individual notification deadline replacing "reasonable timeframe." Legal (Goldstein) assesses passage in Q2 2026. For a breach of 340K+ citizens (as occurred in March 2025), a scaled notification process is required. Design must begin now.

---

## Section 1: Israeli Government Digital Infrastructure Threat Landscape (PIR-001)

**Assessed current threat environment (Q4 2025 / Q1 2026):**

Iranian-nexus state-affiliated actors remain the primary assessed threat to Israeli civilian government digital platforms. The March 2025 NDSA breach demonstrated operational capability to execute successful contractor supply chain intrusions against CII-level government systems. Post-launch, the GovID 2.0 platform has attracted continued adversary attention consistent with the pre-launch reconnaissance documented in Assignment 6.

Financially motivated actors targeting government payment-adjacent platforms represent a secondary threat; no confirmed targeting of NDSA specifically in this period.

Confidence: B2 (CERT-IL TLP:AMBER; ClearSky public reporting; INCD classified context [not cited]).

---

## Section 2: Iranian-Nexus Adversary Capability Evolution (PIR-002)

**Core toolset: consistent with March 2025 baseline**

The adversary cluster's primary post-access techniques — BITS-based persistence, LSASS credential dumping (comsvcs.dll), and wevtutil log clearing — remain consistent with the March 2025 documentation. The adversary has not adopted fundamentally new capabilities in this period.

**New observation: scheduled task persistence (T1053.005)**

The December 2025 peer government compromise (CERT-IL advisory) documented scheduled task creation as a secondary persistence mechanism alongside service installation. NDSA's current detection inventory does not cover T1053.005 on VRID-SRV-01 or GovID 2.0 nodes. If the adversary uses this technique in a future NDSA intrusion, it would not be detected.

**Detection recommendation:** Add EID 4698 (new scheduled task) rule on VRID-SRV-01, JUMPHOST-CONTRACTOR-01, and all GovID 2.0 Windows nodes. Priority P1. Estimated effort: 1 day.

---

## Section 3: Contractor and Supply Chain Threat Update (PIR-004)

| Vendor | Risk Level | Change from Last Period | Immediate Action |
|---|---|---|---|
| HavayaIT Systems Ltd. | **High** (elevated from Medium) | CERT-IL confirms active Iranian-nexus spearphishing campaign; 2 new lookalike domains | Review all active HavayaIT accounts; deploy DET-G6-007 on new lookalike domains |
| BiometricTech IL Ltd. | Medium | No new intelligence; IP binding on vendor tokens confirmed implemented post-Assignment 6 | Monthly monitoring of vendor API call patterns |

---

## Section 4: Detection Recommendations

| Priority | Recommendation | PIR | Owner | Sprint |
|---|---|---|---|---|
| P1 | Deploy EID 4698 scheduled task anomaly rule on all NDSA production hosts | PIR-002 | Detection Engineering | Current sprint |
| P1 | Add new HavayaIT lookalike domains (Jan 2026) to DNS watchlist | PIR-004 | SOC | Immediate |
| P1 | Full HavayaIT contractor account review — audit all active sessions, check for non-HavayaIT ASN | PIR-004 | SOC + IT Security | This week |
| P2 | Build GovID API log pipeline (unblocks DET-G6-001, SIR-003) | PIR-005 | SOC Engineering | MATZBEN CAB Q1 |
| P2 | Legal: begin design for 30-day PPL notification scaled process | PIR-003 | Legal | By March 2026 |

---

*Distribution: CISO + DG. INCD quarterly submission extract (sanitized): see separate filing via Friedman.*
