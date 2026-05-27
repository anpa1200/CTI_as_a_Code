# Threat Hunt Plan — Remaining Adversary Footprint Post-NDSA Breach

**Hunt ID:** HUNT-2025-001  
**Date:** 2025-04-10  
**Analyst:** Shai Rotenberg (CTI Lead, NDSA)  
**Trigger:** Post-incident hunt following March 2025 NDSA eID breach (A05); INCD Remediation Directive RD-2025-NDSA-004 requirement  
**Priority:** P1 — Active threat; HavayaIT contractor access pathway remains partially open

---

## Hunt Objectives

1. Confirm complete removal of adversary persistence mechanisms (SvcHostMonitor service, HKCU registry Run key, `C:\Windows\Temp\svchost.exe`)
2. Identify whether any hosts other than VRID-SRV-01 received lateral movement or malware installation
3. Determine whether any additional contractor accounts were accessed using DCSync-style technique or credential harvesting
4. Identify whether VRID database was accessed from any second pathway not captured in the A05 timeline
5. Assess whether GovID 2.0 staging environment was accessed (staging→production gap was not part of A05 investigation scope)

---

## Hypothesis 1: SvcHostMonitor Service Reinstalled After IR Remediation

**ATT&CK:** T1543.003  
**Rationale:** The `SvcHostMonitor` service was removed during IR. However, the BITS download mechanism (T1197) was used to stage the malware. If the BITS job was not removed from all systems, it may reinstall the service on next scheduled run.

**Hunt query (Elastic KQL — service installation):**
```
event.code: "7045"
AND winlog.event_data.ImagePath: ("*\\Temp\\*" OR "*\\ProgramData\\*" OR "*\\AppData\\*")
AND @timestamp > "2025-03-20T00:00:00Z"
```

**Hunt query — BITS jobs on all monitored hosts:**
```
event.code: "4688" AND process.name: "bitsadmin.exe"
AND @timestamp > "2025-03-20T00:00:00Z"
```

**Velociraptor artifact:** `Windows.Persistence.PersistenceSniper` on VRID-SRV-01 and JUMPHOST-CONTRACTOR-01; check all persistence locations including scheduled tasks, WMI subscriptions, and startup folders

**Expected evidence if true:** EID 7045 with Temp path or bitsadmin.exe process creation events post-remediation

---

## Hypothesis 2: HKCU Registry Run Key Persists Under a Different User Account

**ATT&CK:** T1547.001  
**Rationale:** The HKCU Run key was identified in AMSI logs under the `a.halevi` account profile. If the actor harvested additional credentials (possible given LSASS dump at TL-9), persistence may have been installed under a different user profile not reviewed during IR.

**Hunt query — All HKCU Run key writes across all users:**
```
event.code: "13" AND registry.path: ("*HKCU*\\Run\\*" OR "*HKU*\\*\\Run\\*")
AND @timestamp > "2025-03-01T00:00:00Z"
```

**Velociraptor hunt:** Enumerate `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` for all user profiles on VRID-SRV-01 and JUMPHOST-CONTRACTOR-01; compare against pre-incident baseline

*Note: Sysmon EID 13 may not have HKCU data if Sysmon config was not updated — use Velociraptor live artifact as primary source for this hypothesis*

---

## Hypothesis 3: Additional VRID Database Access Pathways

**ATT&CK:** T1005, T1078.002  
**Rationale:** The actor used `vrid_query.exe` (TL-13) with `a.halevi` + `SVC-HAVAYAIT-MAINT` credentials. VRID database may be accessible via additional service accounts or API pathways not covered by the A05 investigation.

**Hunt query — VRID database authentication events:**
```
event.action: "query_executed" AND database.name: "citizen_records"
AND @timestamp > "2025-03-01T00:00:00Z"
AND NOT winlog.event_data.TargetUserName: ("SVC-VRID-READ" OR "SYSTEM")
```

**Hunt query — Bulk SELECT patterns:**
```
event.action: "query_executed"
AND winlog.event_data.QueryText: ("SELECT *" OR "SELECT COUNT")
AND database.name: "citizen_records"
AND @timestamp > "2025-03-01T00:00:00Z"
```

**Database audit review:** Pull 90-day database access log; identify all accounts that queried `citizen_records` table; compare to authorized access list; flag any queries with >1000 row return count from non-standard accounts

---

## Hypothesis 4: GovID 2.0 Staging Environment Was Accessed

**ATT&CK:** T1078.001, T1133  
**Rationale:** GovID 2.0 was in Sprint 23 at the time of the breach. The staging→production gap identified in A06 (SCN-002) was not in scope for the A05 incident response. If the actor had access to VRID-SRV-01 and knowledge of the GovID 2.0 architecture, staging environment access is plausible.

**Hunt query — Authentication to GovID staging from contractor VPN subnet:**
```
event.code: "4624" AND source.ip: "10.20.50.0/24"
AND host.name: ("govid-staging*" OR "govid-lab*")
AND @timestamp > "2025-03-01T00:00:00Z" AND @timestamp < "2025-04-01T00:00:00Z"
```

**Hunt query — BiometricTech API calls from non-approved source IPs:**
```
url.path: "/verify/bulk" OR url.path: "/enroll"
AND NOT source.ip: "10.20.15.0/24"
AND @timestamp > "2025-03-01T00:00:00Z"
```

*Note: This hypothesis requires GovID 2.0 API logs to be in SIEM — pipeline gap may limit coverage*

---

## Hypothesis 5: C2 Communications to Second Infrastructure

**ATT&CK:** T1071.001  
**Rationale:** The observed C2 was `govservice-cdn-updates[.]net`. Sophisticated actors deploy backup C2 infrastructure. In March 2025, VRID-SRV-01 had 78 minutes of exfiltration with no detection — backup C2 using a different domain or protocol may have operated simultaneously.

**Hunt query — Outbound HTTPS from VRID-SRV-01 to new destinations:**
```
network.direction: "outbound" AND source.ip: "<VRID-SRV-01 IP>"
AND network.protocol: "https"
AND NOT destination.ip: ("<known corporate SaaS CIDRs>")
AND network.bytes_toserver > 50000
AND @timestamp > "2025-03-01T00:00:00Z"
```

**Hunt query — DNS queries to recently registered domains:**
```
dns.question.type: "A" AND source.ip: "<VRID-SRV-01 IP>"
AND NOT dns.question.name: ("*.microsoft.com" OR "*.windows.com" OR "*.gov.il" OR "govservice-cdn-updates.net")
AND @timestamp > "2025-02-01T00:00:00Z"
```

---

## Hunt Scope and Data Sources

| Data Source | Coverage | Limitation |
|---|---|---|
| Winlogbeat (Windows Security) | VRID-SRV-01, JUMPHOST-CONTRACTOR-01, GovID 2.0 staging | Winlogbeat silence alerting not yet deployed (see A05 feedback) |
| Sysmon | VRID-SRV-01, JUMPHOST-CONTRACTOR-01 | HKCU registry events not captured (Sysmon config gap) |
| GOV-DET-A05-001 through 005 | All monitored hosts | Rules deployed post-incident; historical data must be re-queried manually |
| GovID 2.0 API logs | GovID 2.0 frontend | Not yet in Elastic SIEM — pipeline gap |
| VRID database audit logs | VRID-SRV-01 database | Available; 90-day retention |

---

## Hunt Execution Log

| Date | Analyst | Hypothesis | Finding |
|---|---|---|---|
| 2025-04-10 | Rotenberg | H1 — SvcHostMonitor reinstall | No re-installation found; BITS job confirmed removed |
| 2025-04-10 | Rotenberg | H2 — HKCU other accounts | Velociraptor live scan: HKCU Run keys for 3 active profiles checked; no malicious entries |
| 2025-04-10 | Rotenberg | H3 — VRID DB additional access | 2 non-standard query accounts flagged; verified as authorized IT operations; no bulk SELECT |
| 2025-04-10 | Rotenberg | H4 — GovID staging | API log pipeline not in SIEM; hunt inconclusive — gap documented for A06 scope |
| 2025-04-10 | Rotenberg | H5 — Second C2 | 4 suspicious outbound HTTPS destinations identified; 2 resolved as legitimate CDNs; 2 submitted to CERT-IL for analysis |

**Overall finding:** No confirmed active adversary footprint found on VRID-SRV-01 or JUMPHOST-CONTRACTOR-01 post-IR. Confidence: **MEDIUM** (Sysmon HKCU gap limits registry persistence assurance; GovID staging API hunt inconclusive due to log source gap).

**Recommendation:** Complete Sysmon HKCU config update (GAP-002 from A08) before next hunt cycle to improve registry persistence hunting confidence.
