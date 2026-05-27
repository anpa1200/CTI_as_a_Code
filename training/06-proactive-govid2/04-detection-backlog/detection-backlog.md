# Detection Backlog — PROJ-2025-006 (GovID 2.0)

**Classification:** TLP:AMBER  
**Date:** 2025-06-19  
**Base detection coverage:** 0/12 active at assessment date

---

## Backlog

| ID | Title | Scenario | ATT&CK | Log Source | Status | Priority | Effort | Blocked? |
|---|---|---|---|---|---|---|---|---|
| DET-G6-001 | GovID API bulk call volume anomaly from non-allowlisted IP | SCN-001 | T1530 | GovID 2.0 API access logs | Not deployed | P1 | 3d | **Yes** — GovID API logs not in SIEM |
| DET-G6-002 | BiometricTech vendor token from non-allowlisted IP | SCN-001 | T1078.003 | GovID API logs + token registry | Not deployed | P1 | 2d | **Yes** — token IP binding not implemented |
| DET-G6-003 | Staging environment JWT used from non-NDSA IP | SCN-002, SCN-005 | T1078.002 | Staging access logs | Deployable | P1 | 1d | No |
| DET-G6-004 | Staging API query triggering production VRID lookup | SCN-002 | T1078.002, T1005 | VRID DB audit logs | Deployable | P1 | 2d | No |
| DET-G6-005 | Contractor VPN off-hours from non-corporate ASN | SCN-005 | T1133, T1557 | VPN logs | **Deployed** (from GOV-DET-A05-001) | P1 | — | No |
| DET-G6-006 | Developer M365 sign-in from non-corporate ASN | SCN-003 | T1078.002 | HavayaIT M365 audit | Not deployed | P1 | 3d | **Yes** — HavayaIT M365 not NDSA-controlled |
| DET-G6-007 | Lookalike domain resolution by NDSA/HavayaIT endpoints | SCN-003 | T1566.001 | DNS resolver logs | Deployable | P2 | 2d | No |
| DET-G6-008 | Large outbound HTTPS from GovID 2.0 frontend to non-approved destination | SCN-001 | T1041 | NetFlow / GovID frontend logs | Not deployed | P1 | 4d | **Yes** — no NetFlow on AWS GovCloud IL tier |
| DET-G6-009 | GovID 2.0 configuration change outside change window | SCN-004 | T1565.001 | GovID app config audit logs | Deployable | P2 | 2d | No |
| DET-G6-010 | Mass session invalidation / token revocation event | SCN-004 | T1531 | GovID session management logs | Not deployed | P2 | 2d | **Yes** — session logs not ingested |
| DET-G6-011 | BITS downloader on GovID 2.0 nodes (from A05 pattern) | SCN-001 | T1197 | Winlogbeat (GovID nodes) | Deployable | P2 | 1d | No |
| DET-G6-012 | New service or registry run key on GovID 2.0 nodes | SCN-001 | T1543.003, T1547.001 | Winlogbeat + Sysmon | Partial | P2 | 1d | Partial — HKCU Sysmon gap from A05 |

---

## Sprint Planning

### Sprint 1 (Immediate — within 72h)
Priority: Deploy all rules that are ready now.

| Rule | Action |
|---|---|
| DET-G6-003 | Deploy staging JWT source IP rule |
| DET-G6-004 | Deploy staging→production VRID DB query rule |
| DET-G6-007 | Deploy lookalike domain DNS rule (add CERT-IL CB-2025-041 domains) |
| DET-G6-009 | Deploy GovID config change outside window |
| DET-G6-011 | Deploy BITS downloader on GovID 2.0 nodes |

### Sprint 2 (2-week window)
Priority: Unblock log sources.

| Rule | Blocker to Unblock |
|---|---|
| DET-G6-001 | Build GovID API log pipeline to Elastic |
| DET-G6-002 | Require BiometricTech to implement IP-binding (contractual + technical) |
| DET-G6-006 | Require HavayaIT contractual M365 log sharing obligation |
| DET-G6-008 | Enable AWS VPC Flow Logs as partial compensating control |

### Sprint 3 (30-day window)
Priority: Full coverage.

| Rule | Dependency |
|---|---|
| DET-G6-010 | GovID session log ingestion |
| DET-G6-012 | HKCU Sysmon gap fix on GovID nodes |

---

## Delivered / Active

| Rule | Status | Note |
|---|---|---|
| DET-G6-005 (Contractor VPN off-hours) | **Active** | GOV-DET-A05-001 deployed post-A05; covers SCN-005 |

---

## Coverage Summary

| Status | Count |
|---|---|
| Active | 1 (DET-G6-005) |
| Deployable (Sprint 1) | 5 |
| Blocked (need log source or vendor action) | 5 |
| Partial | 1 |
| **Total** | **12** |

**Current coverage (techniques with at least partial detection):** 2/7 key techniques in primary scenario  
**Target after Sprint 1:** 5/7  
**Target after Sprint 2:** 7/7 (all unblocked)
