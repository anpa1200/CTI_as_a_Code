# TTP Extraction — NDSA Detection Validation 2026

**Sources:** March 2025 NDSA eID breach (A05 analysis); GovID 2.0 pre-launch assessment (A06); INCD Section 8 requirement  
**Date:** 2026-01-05

---

## Extracted TTPs (from March 2025 NDSA Breach)

| # | Behavior (from incident) | Tactic | Technique | Sub | Evidence Source | Confidence | Emulate? | Reason if No |
|---|---|---|---|---|---|---|---|---|
| 1 | AiTM phishing via `gov-procurement-il-portal[.]net`; Halevi personal Gmail | Initial Access | T1566.001 | — | A05 timeline event 1 | High | **No** | Personal email outside NDSA visibility; architectural gap |
| 2 | AiTM proxy captures Halevi M365 session token; TOTP bypassed | Credential Access | T1557 | — | A05 timeline event 2 | High | **No** | Cannot safely emulate AiTM without production token risk |
| 3 | Contractor VPN auth from 203.0.113.115 (Turkish residential VPN) at 01:44 IST | Initial Access | T1133 | — | A05 timeline event 4 | High | **Yes (adapted)** | Simulate from non-corporate ASN; test GOV-DET-A05-001 |
| 4 | `net user /domain`; `net group "NDSA-VRID-Admins" /domain` | Discovery | T1087.002 | — | A05 timeline event 5-6 | High | **Yes** | Test for gap |
| 5 | `ipconfig /all`; `nslookup vrid-srv-01` | Discovery | T1016; T1018 | — | A05 timeline event 7 | High | **Yes** | Included in discovery module |
| 6 | RDP from JUMPHOST-CONTRACTOR-01 to VRID-SRV-01 (EID 4624 Type 10) | Lateral Movement | T1021.001 | — | A05 timeline event 8 | High | **Yes** | Test GOV-DET-002 |
| 7 | `comsvcs.dll MiniDump` LSASS; GrantedAccess 0x1410 | Credential Access | T1003.001 | comsvcs.dll | A05 timeline event 9 | High | **Yes** | Test GOV-DET-010 |
| 8 | BITS download of `svchosts.exe` from `govservice-cdn-updates[.]net` | Persistence; C2 | T1197; T1071.001 | — | A05 timeline event 11 | High | **Yes** | Test GOV-DET-003 |
| 9 | Service `SvcHostMonitor` installed from `C:\Windows\Temp\svchost.exe` | Persistence | T1543.003 | — | A05 timeline event 14 | High | **Yes** | Test GOV-DET-006 |
| 10 | `vrid_query.exe` full-table SELECT on `citizen_records` | Collection | T1005 | — | A05 timeline event 13 | High | **Yes** | Test GOV-DET-A05-002 |
| 11 | 413 MB HTTPS exfiltration to 203.0.113.201:443 in 8 chunks | Exfiltration | T1041; T1197 | — | A05 timeline events 15 | High | **Yes** | Test for volume detection gap |
| 12 | `wevtutil cl Security/System/Application` | Defense Evasion | T1070.001 | Clear Windows Event Logs | A05 timeline event 16 | High | **Yes** | Test GOV-DET-A05-005 |
| 13 | Sysmon HKCU registry Run key (AMSI log evidence) | Persistence | T1547.001 | — | A05 analysis | Medium | **Yes** | Test HKCU gap |

## Additional TTPs from GovID 2.0 Assessment (A06)

| # | Behavior | Tactic | Technique | Source | Emulate? |
|---|---|---|---|---|---|
| 14 | Bulk API calls to `/verify/bulk` from non-approved IP | Collection | T1530 | A06 TRG-004 | **Yes (if lab API available)** |
| 15 | Vendor API token used from non-allowlisted IP | Credential Access | T1078.003 | A06 TRG-004 | **Yes (adapted)** |

---

## Emulation Summary

| Category | Count |
|---|---|
| Total TTPs identified | 15 |
| Emulated | 11 |
| Adapted | 2 (T1133, T1530) |
| Excluded | 2 (T1566.001, T1557) |
