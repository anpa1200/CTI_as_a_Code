# TTP Extraction — Operation Desert Cipher

**Source:** Operation Desert Cipher campaign report (ClearSky; Iranian-nexus attribution)  
**Date:** 2024-11-01

---

## Extracted TTPs

| # | Behavior (from report) | Tactic | Technique | Sub | Evidence Ref | Confidence | Emulate? | Reason if No |
|---|---|---|---|---|---|---|---|---|
| 1 | Actor sends spearphishing email with document lure; macro drops PowerShell stager | Initial Access | T1566.001 | — | Report §2.1 | High | **No** | Requires email infrastructure; test at email gateway layer separately |
| 2 | PowerShell encoded command execution after macro | Execution | T1059.001 | — | Report §2.1 | High | **Yes** | — |
| 3 | AiTM proxy kit captures M365 session token, bypassing TOTP | Credential Access | T1557 | — | Report §2.2 | High | **No** | Cannot safely emulate AiTM in lab without risk of production token capture |
| 4 | Actor uses stolen session token to authenticate to VPN | Initial Access | T1133 | — | Report §2.2 | High | **Yes (adapted)** | Simulate off-hours logon from non-corporate IP using test credential |
| 5 | `net user /domain`, `net group "Domain Admins"`, `ipconfig /all` on entry host | Discovery | T1087.002; T1016 | — | Report §2.3 | High | **Yes** | — |
| 6 | DNS resolution of internal target server name | Discovery | T1018 | — | Report §2.3 | High | **Yes** | Included in discovery module |
| 7 | RDP lateral movement from jump host to target server | Lateral Movement | T1021.001 | — | Report §2.3 | High | **Yes** | — |
| 8 | `comsvcs.dll MiniDump` LSASS dump; GrantedAccess 0x1410 | Credential Access | T1003.001 | comsvcs.dll | Report §2.4 | High | **Yes** | — |
| 9 | BITS job downloads second-stage tool from C2 | Persistence; Defense Evasion | T1197 | — | Report §2.4 | High | **Yes** | — |
| 10 | Service installed from non-standard path (`C:\Windows\Temp\`) | Persistence | T1543.003 | — | Report §2.5 | High | **Yes** | — |
| 11 | Database tool misused for full-table SQL query and staging | Collection | T1005; T1074.001 | — | Report §2.5 | High | **Yes (adapted)** | Adapted to lab database |
| 12 | Multi-chunk HTTPS exfiltration to C2 via BITS | Exfiltration | T1041; T1197 | — | Report §2.6 | High | **Yes** | Use lab C2 endpoint |
| 13 | `wevtutil cl` Security, System, Application | Defense Evasion | T1070.001 | Clear Windows Event Logs | Report §2.6 | High | **Yes** | Run LAST |
| 14 | Registry Run Key for autostart of second-stage (AMSI log evidence) | Persistence | T1547.001 | — | Report §2.4 (AMSI log) | Medium | **Yes** | — |

---

## Summary

| Category | Count |
|---|---|
| Total TTPs extracted | 14 |
| Emulated | 11 |
| Adapted (emulated with modification) | 2 (T1133, T1005) |
| Excluded | 3 (T1566.001, T1557, and T1133 counted as adapted) |

---

## Kill Chain Coverage

| Kill Chain Phase | Techniques |
|---|---|
| Initial Access | T1566.001 (excluded), T1133, T1557 (excluded) |
| Execution | T1059.001 |
| Persistence | T1197, T1543.003, T1547.001 |
| Credential Access | T1557 (excluded), T1003.001 |
| Discovery | T1087.002, T1016, T1018 |
| Lateral Movement | T1021.001 |
| Collection | T1005, T1074.001 |
| Exfiltration | T1041 |
| Defense Evasion | T1070.001 |
