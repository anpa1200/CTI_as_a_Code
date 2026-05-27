# Trust Boundary Analysis — PROJ-2024-002

**Classification:** TLP:AMBER

---

## Network Zones

| Zone | Description | Trust Level | Key Systems |
|---|---|---|---|
| Internet | Public internet | Untrusted | Attacker entry point |
| Contractor DMZ | NOC contractor VPN landing zone | Low | JUMPHOST-NOC-01; contractor endpoints |
| NMS Segment | Ericsson ENM + Nokia NetAct | Medium-High | ENM v21.4.8; NetAct console |
| SS7/Core Network | Signaling and subscriber data | Critical | SS7 MAP; HLR; BSS |
| Billing Segment | Customer billing database | High | Billing API; subscriber records |
| PM Office Segment | Government connectivity circuit | Critical | BGP peering for PM Office contract |

---

## High-Risk Trust Crossings

| Crossing | From | To | Authentication | Monitoring | Risk |
|---|---|---|---|---|---|
| Contractor VPN entry | Internet | Contractor DMZ | TOTP (AiTM bypassable) | Partial (off-hours rule — 30-min delay) | **HIGH** |
| ENM direct access | Internet | NMS Segment | CVE-2023-44481 exposed | None | **CRITICAL — unpatched** |
| Contractor DMZ → NMS | Contractor DMZ | NMS Segment | Valid account (domain) | Partial (30-min delay) | **HIGH** |
| NMS → SS7 | NMS Segment | SS7/Core | Service account | **None — SS7 MAP not logged** | **HIGH** |
| NMS → PM Office routing | NMS Segment | PM Office Segment | Admin account | None — config change not alerted | High |
| Billing API access | Contractor DMZ or Internet | Billing Segment | API token | **None — billing API logs not in SIEM** | **HIGH** |

---

## Implicit Trusts to Investigate

| System A | Trusts System B | Why | Reviewed? |
|---|---|---|---|
| ENM v21.4.8 | All NMS management traffic | Legacy integration; no per-user ACL at API layer | **No — CVE-2023-44481 means unauthenticated access possible** |
| Billing API | Any source with valid token | No IP allowlisting | No |
| SS7 NMS client | Core network signaling | Operational requirement | No — no logging on MAP queries |

---

## Attack Path Analysis

| Scenario | Trust Crossings Required | Weakest Link |
|---|---|---|
| SCN-001 | Internet → Contractor DMZ (VPN/AiTM) → NMS Segment (RDP) → SS7/Core | ENM CVE-2023-44481 or AiTM contractor credential |
| SCN-002 | Internet → Billing API (credential) | Billing API no IP allowlist; no rate limit |
| SCN-003 | [Requires SCN-001] → NMS Segment → PM Office routing config | NMS write access from compromised account; no change-window enforcement |
