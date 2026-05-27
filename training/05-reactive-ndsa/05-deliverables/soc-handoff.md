# SOC Handoff — NDSA eID Breach (PROJ-2025-005)

**Classification:** TLP:AMBER  
**Prepared by:** NDSA IR Team  
**Date:** 2025-03-21  
**Status:** Containment complete; monitoring active; classified scope pending INCD

---

## IOCs for Monitoring

| ID | Type | Value | Confidence | Status | Action |
|---|---|---|---|---|---|
| IOC-001 | IPv4 | 203.0.113.115 | High | Blocked | Turkish exit node; actor VPN access IP; block + preserve for law enforcement |
| IOC-002 | IPv4 | 203.0.113.201 | High | Blocked | C2 server; exfiltration destination; 413 MB received |
| IOC-003 | Domain | `govservice-cdn-updates[.]net` | High | Blocked at DNS | C2 domain; registered 2025-02-18; hosted on same ASN as IOC-002 |
| IOC-004 | Domain | `gov-procurement-il-portal[.]net` | High | Blocked at DNS | AiTM phishing domain; used in Halevi spearphish |
| IOC-005 | File path | `C:\Windows\Temp\svchost.exe` | High | Removed | Second-stage implant; masquerading as svchost.exe |
| IOC-006 | File path | `C:\Windows\Temp\lsass.dmp` | High | Removed | Partial LSASS dump; process protection limited success |
| IOC-007 | Service name | `SvcHostMonitor` | High | Removed | Persistence mechanism; path `C:\Windows\Temp\svchost.exe` |
| IOC-008 | File path | `C:\Windows\Temp\svchost_cache\export_*` | High | Removed | VRID export staging directory; files exfiltrated before log clear |

---

## Detection Rules — Deployed and Pending

| Rule ID | Title | Technique | Status | Notes |
|---|---|---|---|---|
| GOV-DET-A05-001 | Contractor VPN — Off-Hours from Non-Corporate ASN | T1133, T1557 | **Deploy immediately** | Replaces GOV-DET-001; removes 12h quiet-period bug |
| GOV-DET-A05-002 | VRID Full-Table SELECT Query | T1005 | **Deploy immediately** | Deploys on VRID-SRV-01 production; was previously lab-only |
| GOV-DET-A05-003 | BITS Job to Non-Microsoft/Non-GOV-IL External Host | T1197 | **Deploy immediately** | New rule; no prior coverage |
| GOV-DET-A05-004 | LSASS Dump via comsvcs.dll | T1003.001 | **Deploy immediately** | New rule; Veeam backup agent filter included |
| GOV-DET-A05-005 | wevtutil Log Clear | T1070.001 | **Deploy immediately** | Replaces GOV-DET-004; removes 12h quiet-period bug |

**CAB status:** MATZBEN CAB-2025-0321 submitted. Emergency deployment approval requested — target: 72h from CAB submission.

---

## Accounts Requiring Action

| Account | Type | Action Required | Status | Owner |
|---|---|---|---|---|
| a.halevi | Contractor (HavayaIT) | Disabled; VPN access revoked; credentials invalidated | Done — 15:45 IST 18 March | IT Security |
| SVC-HAVAYAIT-MAINT | Service account | Disable; rotate credentials; audit all recent queries | Done — 16:00 IST 18 March | IT Security |
| All HavayaIT VPN accounts | Contractor VPN | Suspend pending security review; each account requires re-authorization | Done — 17:30 IST 18 March | IT Security |
| NDSA Domain Admins | Group membership audit | Verify no accounts added by actor during breach window | Complete — no changes found | IT Security |
| krbtgt | Kerberos TGT account | Double-rotation required (standard post-breach procedure; DCSync assessed as failed but follow protocol) | Pending — schedule within 72h | Active Directory team |

---

## Systems Requiring Review

| System | Action | Status |
|---|---|---|
| VRID-SRV-01 | Isolated from Contractor DMZ; forensic image taken; validate service `SvcHostMonitor` removed; confirm all temp files cleaned | Complete |
| JUMPHOST-CONTRACTOR-01 | Review all process and auth events for 2025-03-17 window; confirm no persistence installed | Review complete; no additional persistence found |
| NDSA VPN Gateway | Confirm 203.0.113.115 and 203.0.113.201 blocked; audit all sessions in 72h window before incident | Complete |

---

## Monitoring Requirements (Ongoing)

1. **VRID-SRV-01 Winlogbeat continuity** — alert if events stop for >15 minutes (new threshold; previously no alerting)
2. **Contractor VPN session volume** — alert on outbound data volume >50 MB per contractor session
3. **VRID DB query monitoring** — alert on any full-table SELECT or query returning >10,000 rows from `citizen_records`
4. **DNS for IOC-003 and IOC-004** — continue blocking; alert on any internal resolution attempt (indicates compromised endpoint)
5. **203.0.113.0/24 block** — this /24 range is used for synthetic IOCs in this training exercise; in production equivalent, block confirmed actor IPs

---

## Regulatory Status

| Obligation | Deadline | Status |
|---|---|---|
| INCD-CID Section 7(b) — 8-hour notification | 23:45 IST 18 March | **Met** — notified 17:00 IST |
| Biometric Database Authority — 8-hour notification | 23:45 IST 18 March | **Met** — notified 23:30 IST (14-min margin) |
| Privacy Protection Authority — 72-hour notification | 15:45 IST 21 March | **Met** — notified 15:00 IST 21 March |
| PPL individual notification — 340,218 citizens | "Reasonable timeframe" | **Pending** — letter campaign in preparation |
| MATZBEN classified scope — 4-hour clock | Clock not started | **Pending INCD classified forensics** |
