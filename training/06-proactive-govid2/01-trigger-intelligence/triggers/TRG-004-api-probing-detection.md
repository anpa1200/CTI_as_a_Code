# TRG-004 — BiometricTech API Probing Notification

**Trigger ID:** TRG-004  
**Source:** BiometricTech IL Ltd. — security notification to NDSA CISO  
**Date received:** 2025-06-17  
**TLP:** Vendor Confidential (treat as TLP:AMBER internally)  
**Admiralty Source:** B (established source; commercially motivated but accurate)  
**Admiralty Information:** 2 (likely true; corroborated by TRG-002 IP match)

---

## Summary

BiometricTech IL Ltd. notified NDSA that IP address 185.220.101.47 has been making approximately 2,400 API calls per day to the GovID 2.0 `/verify/bulk` endpoint over the past 10 days (since approximately 2025-06-07). The calls are using a valid-format BiometricTech vendor API token. This IP is not on the NDSA-approved allowlist for BiometricTech vendor API access.

BiometricTech's notification stated they cannot confirm whether the token is legitimately issued from their token registry without an internal audit — which they initiated upon sending this notification.

---

## Key Data

| Field | Value |
|---|---|
| Probing IP | 185.220.101.47 |
| Endpoint targeted | `/verify/bulk` (GovID 2.0 API) |
| Call volume | ~2,400 calls/day; ~24,000 calls total over 10-day window |
| Token format | Valid BiometricTech vendor API token format |
| Token status | BiometricTech investigating; not yet confirmed as legitimate or stolen |
| IP on NDSA allowlist | No |
| First seen | ~2025-06-07 |
| Last seen | 2025-06-17 (date of notification) |

---

## Corroboration

**Critical finding:** 185.220.101.47 appears in CERT-IL MISP event from TRG-002 (Bulletin CB-2025-041), tagged as Iranian-nexus infrastructure associated with developer credential harvesting campaigns against Israeli government. This is an independent, cross-source corroboration that significantly raises confidence this is adversary-controlled infrastructure.

The endpoint being probed (`/verify/bulk`) is the same endpoint identified in the UAE government biometric platform breach (TRG-001, classified). This is not coincidental.

---

## Assessed TTPs

| Technique | Evidence |
|---|---|
| T1530 (Data from Cloud Storage/API) | Bulk API calls against biometric matching endpoint |
| T1078.003 (Valid API Credentials) | Valid-format vendor token used in calls |
| Reconnaissance (T1595 adapted) | Probing pattern consistent with API surface mapping before extraction attempt |

---

## Relevance Assessment

**High.** This is the most operationally urgent trigger. The adversary is actively probing the exact API surface they would use to conduct a bulk biometric extraction. Combined with TRG-001's 96-hour exploitation timeline from the UAE incident, the window for remediation is short.

**PIR contribution:** Directly addresses PIR-1 (is 185.220.101.47 actor-controlled) and PIR-2 (BiometricTech vendor token status).

---

## Required Actions

| Action | Deadline | Owner |
|---|---|---|
| Block 185.220.101.47 at NDSA perimeter immediately | 2 hours | SOC |
| Send formal security request to BiometricTech CISO (request token audit + 30-day API log export) | Immediate | CISO Nativ |
| Require BiometricTech to implement source IP binding on all vendor tokens within 48h | 48 hours | CISO → BiometricTech |
| Share 185.220.101.47 as TLP:AMBER indicator with CERT-IL | Same day | SOC |

---

## Raw Log Reference

See: `01-trigger-intelligence/triggers/TRG-004-api-probing-detection.jsonl` — raw API log sample provided by BiometricTech showing probing pattern (synthetic data; representative format)
