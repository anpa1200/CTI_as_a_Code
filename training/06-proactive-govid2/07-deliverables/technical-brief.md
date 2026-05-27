# Technical Brief — GovID 2.0 Pre-Launch Threat Assessment

**Product ID:** TAC-2025-006  
**Classification:** TLP:AMBER  
**Prepared for:** NDSA Security Team / SOC / NOC  
**Date:** 2025-06-19

---

## Threat Summary

**Actor:** Iranian-nexus cluster (assessed; medium confidence)  
**Current activity:** Active reconnaissance of GovID 2.0 API surface; developer credential harvesting; vendor supply chain pre-positioning  
**Immediate risk to NDSA:** High — active probing of `/verify/bulk` endpoint (TRG-004); developer credential confirmed exposed (TRG-003); Sprint 23 staging→production gap unmitigated

---

## Attack Scenarios

### SCN-001: Vendor API Token Abuse → Bulk Biometric Extraction (HIGH risk)

**Attack path:**
1. Adversary obtains BiometricTech vendor API token via BiometricTech employee compromise (consistent with UAE incident, TRG-001)
2. Authenticated API calls to GovID 2.0 `/verify/bulk` from 185.220.101.47 — 2,400/day
3. No rate limiting; no source IP allowlisting; calls blend with legitimate BiometricTech operations
4. 9.5M biometric template match results extractable at current throughput

**Key ATT&CK techniques:** T1078.003, T1530, T1041  
**Detection status:** DET-G6-001 (BLOCKED — API logs not in SIEM); DET-G6-002 (BLOCKED — no IP binding)  
**Active evidence:** TRG-004 (confirmed probing); TRG-001 (UAE precedent — same technique)

---

### SCN-002: Staging→Production VRID Gap (HIGH risk)

**Attack path:**
1. Adversary uses Stern GitHub JWT (11-day exposure window; rotated day 11)
2. Staging JWT authenticates to GovID 2.0 staging environment from adversary IP
3. Sprint 23 gap: certain staging API calls trigger production VRID queries
4. Limited production biometric data accessible without touching production environment directly

**Key ATT&CK techniques:** T1078.002, T1005  
**Detection status:** DET-G6-003 (deployable); DET-G6-004 (deployable)  
**Active evidence:** TRG-003 (confirmed Stern JWT exposure); Sprint 23 gap confirmed by engineering

---

### SCN-005: HavayaIT Contractor Repeat Supply Chain (HIGH risk)

**Attack path:**
1. Stern VPN credentials (from GitHub commit) still valid — password reset not yet completed at time of assessment
2. Contractor VPN logon from adversary IP (non-HavayaIT ASN; off-hours)
3. Staging environment access via contractor DMZ
4. Sprint 23 gap enables partial production VRID access

**Key ATT&CK techniques:** T1133, T1557, T1078.002  
**Detection status:** DET-G6-005 active (GOV-DET-A05-001 deployed post-A05 breach)

---

## Detection Status

| Rule | Technique | Status | Note |
|---|---|---|---|
| DET-G6-001: API call volume anomaly | T1530 | **BLOCKED** | GovID API logs not in SIEM |
| DET-G6-002: Vendor token IP binding | T1078.003 | **BLOCKED** | Token IP binding not implemented by BiometricTech |
| DET-G6-003: Staging JWT from non-NDSA IP | T1078.002 | Ready to deploy | Sprint 1 |
| DET-G6-004: Staging→production VRID query | T1005 | Ready to deploy | Sprint 1 |
| DET-G6-005: Contractor VPN off-hours | T1133 | **Active** | Deployed post-A05; covers SCN-005 |
| DET-G6-006: Developer M365 anomaly | T1078.002 | **BLOCKED** | HavayaIT M365 not NDSA-controlled |
| DET-G6-007: Lookalike domain DNS | T1566.001 | Ready to deploy | Sprint 1 |
| DET-G6-008: Large outbound HTTPS | T1041 | **BLOCKED** | No NetFlow on AWS GovCloud |

**Overall coverage:** 1/12 active → 6/12 after Sprint 1 → 11/12 after Sprint 2

---

## IOCs for Monitoring

| Type | Value | Confidence | Source | Action |
|---|---|---|---|---|
| IPv4 | 185.220.101.47 | High | TRG-002 (CERT-IL) + TRG-004 (BiometricTech) | Block immediately at perimeter |
| Domain | `govid-dev-update[.]com` | High | TRG-002 (CERT-IL CB-2025-041) | Block DNS + email gateway |
| Credential | Stern GitHub repo NDSA_API_KEY | High | TRG-003 | Rotate immediately (may already be done) |
| Account | y.stern | High | TRG-003 | Force password reset; add to VPN anomaly watchlist |

---

## Recommended Actions for Security Team

| Priority | Action | Effort | Owner |
|---|---|---|---|
| P1 — Immediate | Block 185.220.101.47; force Stern password reset | 2h | SOC + IT |
| P1 — Immediate | Send BiometricTech formal security request | 1h | CISO |
| P1 — 48h | Staging→production firewall rule (Sprint 23 compensating control) | 1d | Network Ops |
| P1 — Sprint 1 | Deploy DET-G6-003, DET-G6-004, DET-G6-007 | 1 day | SOC |
| P1 — 30 days | Build GovID API log pipeline; deploy DET-G6-001 | 2 weeks + CAB | SOC Engineering |
| P1 — 30 days | BiometricTech IP binding on vendor tokens; deploy DET-G6-002 | 1 week | CISO + BiometricTech |
