# Threat Scenarios — PROJ-2025-006 (GovID 2.0 Pre-Launch)

**Classification:** TLP:AMBER  
**Methodology:** STRIDE  
**Date:** 2025-06-19

---

## Scenario 1: BiometricTech Vendor API Token Abuse → Bulk Biometric Extraction

**Risk: HIGH** | **Likelihood: 4/5** | **Impact: C=5, I=2, A=1**

**Narrative:** The adversary has obtained a valid BiometricTech IL vendor API token — either by compromising a BiometricTech employee (consistent with TRG-001 UAE pattern) or by finding it exposed in a repository or internal communication. Using this token, the adversary makes authenticated calls to GovID 2.0's `/verify/bulk` API endpoint. Without rate limiting or source IP allowlisting, the adversary can extract up to 3.1M biometric template matches per day at observed API throughput (2,400 calls/day). The extraction is indistinguishable from legitimate BiometricTech batch operations.

**Attack path:**
1. Adversary obtains BiometricTech vendor API token (via BiometricTech employee compromise or credential exposure)
2. Adversary sends authenticated API requests to GovID 2.0 `/verify/bulk` from 185.220.101.47
3. VRID 2.0 returns biometric match results — adversary stores and reconstructs citizen biometric profiles
4. Exfiltration continues over days; no rate limit triggers; no IP anomaly detection

**ATT&CK:** T1078.003, T1530, T1041

**Prerequisites:** Valid BiometricTech vendor token; knowledge of GovID 2.0 API structure

**Active evidence:** TRG-004 (185.220.101.47 probing `/verify/bulk` with valid-format token); TRG-001 (UAE precedent — same pattern)

**Detection opportunity:**
- API call volume anomaly on `/verify/bulk` (DET-G6-001 — **blocked**: log pipeline not built)
- Non-allowlisted source IP using vendor token (DET-G6-002 — **blocked**: token IP binding not implemented)

---

## Scenario 2: Staging Environment → Production VRID Partial Access (Sprint 23 Gap)

**Risk: HIGH** | **Likelihood: 3/5** | **Impact: C=4, I=1, A=1**

**Narrative:** The Stern GitHub credential exposure (11-day window) included a GovID 2.0 staging JWT. Due to the Sprint 23 unresolved gap, certain queries made against the staging API return production VRID data. The adversary may have already accessed limited production biometric data via this path during the 11-day exposure window. This would make the breach scope larger than currently assessed.

**Attack path:**
1. Adversary discovers Stern's GitHub repo containing staging JWT (exposed 2025-06-03 to 2025-06-14)
2. Adversary authenticates to GovID 2.0 staging environment using stolen JWT
3. Adversary identifies which staging API calls trigger production VRID queries (Sprint 23 gap)
4. Adversary extracts limited production VRID data via staging → production cross-query path
5. JWT rotated by NDSA on day 11; adversary access ends

**ATT&CK:** T1078.002, T1005

**Prerequisites:** JWT staging token (confirmed exposed; rotated); knowledge of Sprint 23 gap API behavior

**Active evidence:** TRG-003 (confirmed 11-day JWT exposure); Sprint 23 gap confirmed by NDSA engineering

**Detection opportunity:**
- Staging JWT used from non-NDSA IP (DET-G6-003 — deployable; staging access logs available)
- DB query originating from staging IP range (DET-G6-004 — deployable; VRID DB audit logs available)

---

## Scenario 3: Developer Spearphishing → GovID 2.0 Source Code Exfiltration

**Risk: MEDIUM** | **Likelihood: 3/5** | **Impact: C=4, I=1, A=1**

**Narrative:** Using lure subjects documented in CERT-IL CB-2025-041 ("GovID 2.0 Developer Access Update", "INCD API Security Review — Action Required"), the adversary targets HavayaIT and NDSA developers via spearphishing. One successfully phished developer provides M365 access. The actor reads internal GovID 2.0 developer documentation, API specifications, and source code — enabling precise vulnerability identification before launch.

**Attack path:**
1. Adversary sends spearphish to HavayaIT developer via CERT-IL-documented lure domains
2. Developer credentials captured via AiTM; M365 session token extracted
3. Actor reads developer documentation, API specs, internal repositories via M365
4. Actor identifies exploitable conditions in GovID 2.0 before security review completes

**ATT&CK:** T1566.001, T1557, T1078.002, T1114.002

**Prerequisites:** Successful phish of one developer with code access; CERT-IL lure domains confirmed active

**Active evidence:** TRG-002 (CERT-IL confirms developer targeting active); TRG-003 (Stern confirms poor HavayaIT developer credential hygiene)

**Detection opportunity:**
- M365 sign-in from non-HavayaIT ASN (DET-G6-006 — **blocked**: HavayaIT M365 not NDSA-controlled)
- Lookalike domain resolution (DET-G6-007 — deployable; DNS resolver logs available)

---

## Scenario 4: GovID 2.0 Session Token Bulk Invalidation (Availability Attack)

**Risk: LOW-MEDIUM** | **Likelihood: 2/5** | **Impact: C=1, I=4, A=5**

**Narrative:** Having established persistence via Scenario 3, the adversary modifies GovID 2.0 session token validity parameters or performs a mass logout of all active sessions — causing authentication failures across all 47 government services simultaneously. Timed to a politically significant event (election, government crisis, major policy announcement), the disruption creates maximum political impact while attribution is being established.

**Attack path:**
1. Adversary gains persistent access via Scenario 3 (source code → vulnerability)
2. Adversary escalates to write access on GovID 2.0 configuration or session store
3. At chosen moment, adversary invalidates all active sessions or modifies token validity to 0
4. All 47 government services become unavailable for affected citizens

**ATT&CK:** T1565.001, T1531

**Prerequisites:** Persistent access with write access to GovID 2.0 config or session store; requires earlier scenario success

**Active evidence:** No current direct trigger; depends on earlier scenario succeeding

**Detection opportunity:**
- Config change outside change window (DET-G6-009 — deployable)
- Mass session invalidation event (DET-G6-010 — **blocked**: session logs not ingested)

---

## Scenario 5: Supply Chain Compromise via HavayaIT (A05 Pattern Repeat)

**Risk: HIGH** | **Likelihood: 3/5** | **Impact: C=4, I=2, A=1**

**Narrative:** The same contractor access pathway exploited in the March 2025 NDSA breach (Assignment 5) is re-exploited against GovID 2.0. Yoav Stern's VPN credentials were also exposed in the GitHub commit (TRG-003). While the staging JWT was rotated, the VPN password may not yet have been changed. The adversary could use Stern's VPN credentials to access the staging environment or enumerate GovID 2.0 contractor access.

**Attack path:**
1. Adversary uses Stern's exposed VPN credential (not yet reset as of TRG-003 discovery date)
2. Contractor VPN access gained from non-HavayaIT ASN
3. Adversary accesses staging environment via contractor DMZ
4. Sprint 23 gap: staging→production VRID queries succeed
5. OR: Adversary uses staging access to obtain additional credentials/API keys

**ATT&CK:** T1133, T1557, T1078.002, T1005

**Prerequisites:** Stern VPN credential still valid; contractor DMZ → staging network path accessible

**Active evidence:** TRG-003 (Stern VPN credential confirmed in GitHub commit for 11 days); CERT-IL confirms active developer targeting

**Detection opportunity:**
- Contractor VPN off-hours from non-corporate ASN (DET-G6-005 — deployable; already developed post-A05)
- Staging environment JWT from non-NDSA IP (DET-G6-003 — deployable)

---

## Risk Summary Matrix

| Scenario | Likelihood | CIA Impact | Overall Risk | Sprint 23 Blocks? | Immediate Action |
|---|---|---|---|---|---|
| SCN-001: Vendor API token abuse | 4/5 | C=5 | **Critical** | No | Block 185.220.101.47; BiometricTech formal request |
| SCN-002: Staging→production gap | 3/5 | C=4 | **High** | Yes — directly | Add firewall rule blocking staging→VRID production |
| SCN-003: Developer spearphishing | 3/5 | C=4 | **High** | Partially | DET-G6-007 lookalike domain DNS rule |
| SCN-004: Mass session invalidation | 2/5 | A=5 | **Medium** | No | DET-G6-009 config change rule |
| SCN-005: HavayaIT repeat supply chain | 3/5 | C=4 | **High** | Yes — partially | Force Stern VPN password reset; DET-G6-005 |
