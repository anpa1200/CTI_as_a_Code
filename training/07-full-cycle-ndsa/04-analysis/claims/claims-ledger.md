# Claims Ledger — PROJ-2025-007 (NDSA CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2025-10-01

---

## Active Claims

### CLM-007-001

**Claim:** The Iranian-nexus threat cluster responsible for the March 2025 NDSA breach has not fundamentally changed its core toolset; BITS persistence, LSASS credential dumping via comsvcs.dll, and wevtutil log clearing remain the primary post-access techniques as of Q4 2025.

**Confidence:** B2 — established source (ClearSky; CERT-IL December 2025 advisory); information corroborated by peer government agency incident  
**Evidence:**
- ClearSky post-incident analysis confirms technique consistency with previously documented Iranian-nexus cluster
- December 2025 CERT-IL advisory: SvcHostMonitor persistence variant observed in Israeli government agency compromise; same tooling family
- No new signature techniques observed in public reporting; operator tradecraft consistent  
**Reasoning:** Technique evolution is typically slow for well-funded state actors using proven toolsets. The March 2025 actor used commodity tools (BITS, comsvcs.dll, wevtutil) that are not distinctive to this actor but are consistent with documented tradecraft.  
**New development (Q1 2026):** T1053.005 (Scheduled Tasks) observed as secondary persistence alongside service installation. This is a gap in current NDSA detection coverage.  
**PIR relevance:** PIR-002, PIR-005

---

### CLM-007-002

**Claim:** HavayaIT Systems Ltd. is an active high-confidence target of Iranian-nexus spearphishing campaigns as of December 2025, representing the same contractor supply chain risk vector that enabled the March 2025 NDSA breach.

**Confidence:** A2 — CERT-IL TLP:AMBER advisory (December 2025); information likely true and corroborated  
**Evidence:**
- CERT-IL Bulletin (December 2025): explicitly names HavayaIT as confirmed Iranian-nexus spearphishing target
- Two new lookalike domains targeting HavayaIT registered in January 2026 (passive DNS monitoring)
- PIR-004 elevated to High risk from Medium  
**Reasoning:** Same contractor, same access path, same adversary targeting confirmed via authoritative source. The March 2025 attack succeeded via HavayaIT. The adversary is demonstrating persistent interest in this access vector.  
**Alternative:** The CERT-IL advisory may be based on incomplete attribution and HavayaIT is a false positive. Assessed as unlikely — CERT-IL attribution at B2 is reliable.  
**PIR relevance:** PIR-004

---

### CLM-007-003

**Claim:** NDSA's current detection coverage for the GovID 2.0 platform remains critically incomplete because the GovID API logs are not yet in the SIEM, meaning bulk biometric API abuse would not be detected in real-time.

**Confidence:** A1 — confirmed by internal engineering review  
**Evidence:**
- Engineering confirmation: GovID 2.0 API runs on AWS GovCloud; no Elastic SIEM pipeline exists
- SIR-003 operational status: blocked
- DET-G6-001 status: blocked  
**Reasoning:** This is the same gap that existed pre-Assignment 6. Despite GovID 2.0 launching in October 2025, the monitoring gap persists because the log pipeline was not in the launch criteria timeline.  
**PIR relevance:** PIR-005, SIR-003

---

### CLM-007-004

**Claim:** The PPL (Privacy Protection Law) amendment expected in Q2 2026 will reduce the individual notification timeline from "reasonable timeframe" (current) to 30 calendar days, requiring NDSA to design a scaled notification process for future biometric data breach scenarios before the law takes effect.

**Confidence:** B3 — government source (BoI publications); information possibly true; draft amendment published but not enacted  
**Evidence:**
- Justice Ministry PPL amendment draft published September 2025
- 30-day notification deadline specified in draft Article 17B(2)
- Legal (Goldstein) assessment: expected to pass Q2 2026 with minor changes  
**Reasoning:** The draft amendment is in public comment period. The 30-day requirement is consistent with EU GDPR Article 34 (which Israeli PPL reform is modeled on). For NDSA with 340,000+ potentially affected citizens (as in March 2025), a manual notification process would not meet a 30-day deadline.  
**PIR relevance:** PIR-003

---

### CLM-007-005

**Claim:** NDSA's intelligence program can provide unique value to INCD by feeding GovID 2.0 authentication telemetry — specifically bulk API anomalies and authentication stuffing patterns — that INCD cannot obtain from any other government agency because no other agency processes 3.1M authentication events per day across all Israeli government services.

**Confidence:** A1 — unique NDSA data source; confirmed by Friedman  
**Evidence:**
- GovID 2.0 authentication volume: 3.1M events/day across 47 government services
- No other single platform in Israeli government provides cross-ministry authentication visibility
- INCD Friedman explicitly requested this feed as a condition of CERT-IL cooperation  
**Reasoning:** The NDSA-to-INCD intelligence feed is mutually beneficial: NDSA receives classified threat intelligence; INCD receives unique authentication telemetry. This creates a durable sharing relationship rather than a one-directional compliance obligation.  
**PIR relevance:** PIR-005 (bidirectional)

---

## Unresolved Questions

| Question | PIR | Gap | Target |
|---|---|---|---|
| Did the post-launch shift to authenticated credential abuse attempts (Q1 2026) represent a new attack phase, or is it routine credential stuffing? | PIR-005 | GovID API logs not yet in SIEM; pattern characterization limited | Q1 2026 (after log pipeline) |
| Is the SvcHostMonitor technique variant observed in the December 2025 peer incident the same tool binary as used in March 2025 NDSA breach? | PIR-002 | Hash comparison requires classified INCD forensics share | Feb 2026 |
| What is the scope of Iranian-nexus spearphishing against HavayaIT — have any HavayaIT employees' accounts been compromised since March 2025? | PIR-004 | HavayaIT M365 audit logs not under NDSA control | Requires HavayaIT contractual log access |
