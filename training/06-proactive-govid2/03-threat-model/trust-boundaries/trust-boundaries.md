# Trust Boundaries Analysis — PROJ-2025-006 (GovID 2.0)

**Classification:** TLP:AMBER  
**Date:** 2025-06-19

---

## Zone Inventory

| Zone | Description | Trust Level | Assets |
|---|---|---|---|
| Z1 — Internet | Public internet; any source | Untrusted | None |
| Z2 — Contractor DMZ | HavayaIT/contractor VPN landing zone | Low trust | Contractor VPN endpoints; PAM jump hosts |
| Z3 — GovID 2.0 Staging | Staging environment; HavayaIT developer access | Low-medium trust | GovID 2.0 staging instances; staging VRID (dev data) |
| Z4 — GOVNET Operational | GovID 2.0 production; VRID 2.0 DB | High trust | CJ-001 (VRID 2.0 DB), CJ-003 (session tokens) |
| Z5 — BiometricTech API Bridge | BiometricTech vendor API integration layer | Medium trust | BiometricTech vendor token; `/verify/bulk` endpoint |
| Z6 — Ministry Integration Bus | API layer connecting 22 government ministries | High trust | CJ-004 (Ministry API keys) |

---

## High-Risk Trust Boundary Crossings

| Crossing | From | To | Control | Risk | Active Threat |
|---|---|---|---|---|---|
| TB-001 | Z1 (Internet) | Z5 (BiometricTech API Bridge) | API token authentication | **Critical** — no source IP binding on vendor token; 2,400 calls/day from adversary IP | TRG-004 — active probing |
| TB-002 | Z3 (Staging) | Z4 (Operational VRID) | Sprint 23 gap: partial overlap in some API query paths | **High** — staging queries can return production VRID data | TRG-003 — Stern credentials exposed |
| TB-003 | Z2 (Contractor DMZ) | Z4 (Operational) | PAM recording; VPN auth | **High** — contractor credentials exposed; repeat of A05 attack path | TRG-003 — Stern VPN credential exposed |
| TB-004 | Z2 (Contractor DMZ) | Z3 (Staging) | Contractor VPN authentication | Medium — staging contains dev data and source code; Sprint 23 gap | TRG-003 |
| TB-005 | Z5 (BiometricTech API) | Z4 (VRID 2.0 DB) | GovID 2.0 API layer — validates token; no rate limit | **Critical** — `/verify/bulk` has no call rate limit; no volume alerting | TRG-004 |

---

## Implicit Trusts (Undocumented Assumptions)

| Trust Assumption | Where | Risk | Remediation |
|---|---|---|---|
| BiometricTech vendor tokens are always used from BiometricTech's registered IPs | Z1 → Z5 | High — no enforcement; assumption violated by TRG-004 | Implement source IP binding on all vendor tokens |
| Staging API calls only query staging data | Z3 → Z4 | Critical — Sprint 23 gap violates this assumption | Emergency firewall rule; Sprint 23 fix |
| HavayaIT developer credentials are not exposed publicly | Z2 access | High — violated by TRG-003 | Force credential rotation; GitHub secret scanning mandatory |
| NDSA API keys in HavayaIT code are rotated after developer departure | Z4, Z6 | Medium — no verified rotation process | Audit; implement API key lifecycle management |
| BiometricTech is itself secure (vendor trust) | Z5 → Z4 | High — TRG-001 UAE incident suggests BiometricTech vendor type may be compromised | Formal security request; INCD read-in pending |

---

## Attack Path Analysis

### Path A: Internet → API Bridge → VRID (Scenario 1)
```
Z1 (Adversary) → [Vendor token, no IP binding] → Z5 (BiometricTech API) → 
[No rate limit] → Z4 (VRID 2.0 DB) → [Bulk extraction]
```
**Controls missing at each boundary:**
- Z1→Z5: Source IP binding on vendor token (**missing**)
- Z5→Z4: API call rate limiting (**missing**); call volume alerting (**missing** — DET-G6-001 blocked)

### Path B: Internet → Contractor DMZ → Staging → Production (Scenario 2 + 5)
```
Z1 (Adversary) → [Stolen Stern VPN credential] → Z2 (Contractor DMZ) → 
[PAM session] → Z3 (Staging) → [Sprint 23 gap] → Z4 (Operational VRID)
```
**Controls missing at each boundary:**
- Z1→Z2: Credential reset not done; MFA on VPN (GOV-DET-A05-001 deployed post-A05)
- Z3→Z4: Sprint 23 firewall gap (**not yet blocked**)

### Path C: Internet → Developer M365 → Source Code → Platform (Scenario 3)
```
Z1 (Adversary) → [AiTM phish targeting developer] → HavayaIT M365 (Z1 perspective) → 
[Source code, API specs] → Z4 (vulnerability identification)
```
**Controls missing at each boundary:**
- Phishing lure → developer: DET-G6-007 lookalike domain rule (deployable)
- HavayaIT M365 visibility: DET-G6-006 (**blocked** — HavayaIT M365 not NDSA-controlled)

---

## Detection Coverage by Trust Boundary

| Boundary | Detection Rule | Status |
|---|---|---|
| Z1→Z5 (Vendor API from internet) | DET-G6-001 (volume), DET-G6-002 (IP binding) | Both blocked |
| Z1→Z2 (Contractor VPN from internet) | DET-G6-005 (off-hours ASN) | Deployable — ready |
| Z3→Z4 (Staging→production) | DET-G6-003 (staging JWT), DET-G6-004 (staging→VRID DB) | Deployable — ready |
| Z5→Z4 (API bridge→VRID) | DET-G6-001 (volume on API layer) | Blocked — log pipeline needed |
| Z1→HavayaIT M365 | DET-G6-006 (M365 sign-in anomaly) | Blocked — requires HavayaIT cooperation |
