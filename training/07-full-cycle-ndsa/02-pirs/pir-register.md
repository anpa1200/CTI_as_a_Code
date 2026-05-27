# PIR Register — PROJ-2025-007 (NDSA CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2025-10-01  
**Status:** v1.0 — initial program launch (per INCD RD-2025-NDSA-004 requirement)

---

## Active PIRs

| ID | Intelligence Question | Owner | Cadence | Priority | Status | Last Answered |
|---|---|---|---|---|---|---|
| PIR-001 | Which threat actors are actively targeting Israeli civilian government digital platforms and what are their current access vectors and primary objectives? | CISO | Quarterly | P1 | **Not yet answered** — program launching | Never |
| PIR-002 | Has the primary Iranian-nexus threat cluster targeting Israeli government biometric and identity infrastructure changed its tooling, persistence mechanisms, or evasion techniques in the past 90 days? | CISO / Detection Eng | Quarterly | P1 | **Partial** — March 2025 incident provides baseline; next evolution update due Q1 2026 | 2025-03-21 (incident analysis) |
| PIR-003 | What changes to INCD-CID, Israeli PPL, Biometric Database Law, or MATZBEN are anticipated in the next 6 months that would affect NDSA's incident notification obligations or detection requirements? | Legal | Quarterly | P2 | **Partial** — PPL amendment tracked (Q2 2026 expected); BDA changes unclear | 2025-10-01 |
| PIR-004 | Are any contractors or vendors with privileged access to NDSA systems — specifically HavayaIT Systems Ltd. and BiometricTech IL Ltd. — known to be compromised, targeted, or exhibiting anomalous access patterns? | CISO | Monthly; triggered | P1 | **Active** — HavayaIT confirmed Iranian-nexus target (CERT-IL Dec 2025); BiometricTech vendor status under review | 2025-10-01 |
| PIR-005 | What adversary capabilities, infrastructure, and tradecraft are specifically targeting the GovID 2.0 authentication platform, and what are the primary indicators that would signal an imminent attack? | CISO + INCD | Quarterly; triggered | P1 | **Partial** — March 2025 incident technique set documented; post-launch activity update needed | 2025-03-21 |

---

## Standing Intelligence Requirements (SIRs)

| ID | Collection Task | Source | Frequency | Output | Consumer | Status |
|---|---|---|---|---|---|---|
| SIR-001 | Monitor CERT-IL MISP for indicators matching: Israeli government, biometric, identity, GovID sector tags | CERT-IL MISP (MOU) | Daily auto-ingest; analyst triage within 4h | SIEM watchlist update + MISP event tags | SOC (Ben-Moshe) | **Blocked** — MOU not signed |
| SIR-002 | Monitor INCD advisories via Friedman for signals relevant to NDSA Crown Jewels | INCD (classified route) | On publication / Friedman notification | Triage note; PIR relevance tag; downgrade process for SOC distribution | CTI Lead → CISO → SOC (after downgrade) | Partial — informal channel active; formal process not designed |
| SIR-003 | Monitor GovID 2.0 API access logs for anomalies matching known adversary patterns | NDSA SIEM (internal) | Continuous / daily summary | Alert to SOC + weekly anomaly report to CTI Lead | SOC; MoI (sanitized weekly) | **Blocked** — GovID API logs not in SIEM |
| SIR-004 | Monitor lookalike domain registrations targeting GovID / NDSA / biometric brands | Passive DNS / brand monitoring | Daily | Alert if new lookalike registered; SOC block recommendation within 4h | SOC; Legal | **Blocked** — domain monitoring tool not procured |

---

## PIR Details

### PIR-002 — Iranian-Nexus Adversary Capability Evolution

**Question:** Has the primary Iranian-nexus threat cluster targeting Israeli government biometric and identity infrastructure changed its tooling, persistence mechanisms, or evasion techniques in the past 90 days?  
**Why:** NDSA detected 0/13 techniques in the March 2025 breach. Detection rules were deployed post-incident. If the adversary changes techniques, the rules will miss the next attack.  
**Scope:** Post-March 2025 period; focus on biometric and government identity platforms  
**Collection sources:** CERT-IL MISP (blocked — MOU); INCD classified (via Friedman); ClearSky public; peer government CERT-IL sharing  
**Indicator of answer:** Names any new techniques not present in March 2025 incident; maps to NDSA detection inventory; notes rules that need updating  
**Answer history:**
- 2025-03-21: Baseline set — 13 techniques documented from March 2025 breach; all 13 had zero detection at time of breach; 5 new rules deployed post-incident
- 2026-01 (Q1 2026): Update: SvcHostMonitor persistence observed in peer government agency (Dec 2025 CERT-IL); scheduled task persistence T1053.005 now also observed

### PIR-004 — Contractor and Supply Chain Threat

**Question:** Are any contractors or vendors with privileged access to NDSA systems known to be compromised, targeted, or exhibiting anomalous access patterns?  
**Why:** March 2025 breach was a contractor supply chain attack. The same vector remains the highest-probability attack path.  
**Scope:** HavayaIT Systems Ltd. (contractor); BiometricTech IL Ltd. (vendor); any new contractors added to NDSA access register  
**Collection sources:** CERT-IL MISP; INCD advisories; internal VPN and PAM logs; Shodan (vendor infrastructure); contractual log access (not yet in place)  
**Indicator of answer:** Specific vendor risk rating (Low/Medium/High) with recommendation (continue / enhanced monitoring / suspend access)  
**Answer history:**
- 2025-10-01: HavayaIT — Medium risk; post-March 2025 access review complete; MFA enforced; contractor TOTP seed backup procedure changed
- 2026-01: HavayaIT elevated to High — CERT-IL TLP:AMBER (Dec 2025) confirms HavayaIT is active Iranian-nexus spearphishing target

### PIR-005 — GovID 2.0 Platform-Specific Threat

**Question:** What adversary capabilities, infrastructure, and tradecraft are specifically targeting GovID 2.0, and what are the primary indicators of an imminent attack?  
**Why:** GovID 2.0 launched October 2025. It processes 3.1M authentication events/day. A successful attack would affect all 47 government services. The adversary was probing pre-launch (Assignment 6) — the question is what changed post-launch.  
**Scope:** GovID 2.0 API, BiometricTech vendor integration, authentication flows; post-launch adversary activity  
**Collection sources:** NDSA SIEM (internal; GovID API logs in progress); INCD classified; CERT-IL; BiometricTech vendor security reports  
**Indicator of answer:** Maps threat to GovID 2.0 architecture; produces ≥3 IOCs for SOC watchlist  
**Answer history:**
- 2025-03-21: Pre-launch baseline — 5 scenarios from Assignment 6
- 2026-01 Q1: Post-launch update — shift from API surface reconnaissance to authenticated credential abuse attempts targeting session management

---

## Deferred PIRs

*None at program launch.*

---

## Retired PIRs

*None at program launch.*
