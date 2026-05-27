# Incident Timeline — PROJ-2024-001

**Classification:** TLP:AMBER  
**All timestamps UTC+2 (IST) unless noted**  
**Last updated:** 2024-11-16

---

## Timeline

| # | Timestamp (IST) | Host / System | Event | Evidence ID | ATT&CK TTP | Confidence | Notes |
|---|---|---|---|---|---|---|---|
| 1 | 2024-11-13 09:14 | m.cohen workstation | Phishing email received: "DocuSign — LifeTech_Partnership_Invoice.docx" from `noreply@lifetechpharma-corp[.]eu` | EV-07 | T1566.001 | High | Lookalike domain registered 5 days prior |
| 2 | 2024-11-13 09:31 | m.cohen workstation | `winword.exe` spawns `cmd.exe` → `powershell.exe -enc [base64]` (EID 4688) | EV-01 | T1059.001 | High | Macro execution; encoded payload |
| 3 | 2024-11-13 09:32 | m.cohen workstation | DNS query: `uslifepartner-group[.]com` → 198.51.100.44 | EV-08 | T1071.001 | High | First C2 beacon |
| 4 | 2024-11-13 09:33–18:30 | m.cohen workstation | Periodic HTTPS beacons ~47min interval to 198.51.100.44:443 | EV-08 | T1071.001 | High | Consistent beacon interval |
| 5 | 2024-11-14 22:05 | VPN Gateway | VPN auth: user `p.levi`; source 185.220.100.77 (Istanbul, Turkey); MFA bypassed via AiTM session token replay | EV-06 | T1557; T1133 | High | Off-hours; anomalous source country |
| 6 | 2024-11-14 22:11 | JUMPHOST-01 | RDP session opened to JUMPHOST-01 via p.levi credentials | EV-02 | T1021.001 | High | PAM session PAM-20241114-2211 starts |
| 7 | 2024-11-14 22:14 | JUMPHOST-01 | `net user /domain`; `net group "Domain Admins" /domain`; `ipconfig /all` | EV-02 | T1087.002; T1016 | High | Discovery recon |
| 8 | 2024-11-14 22:22 | WS-IT-LEVI | EID 4624 Type 10: RDP logon from JUMPHOST-01 as p.levi | EV-02 | T1021.001 | High | Lateral movement to IT admin workstation |
| 9 | 2024-11-14 22:31 | WS-IT-LEVI | `rundll32.exe comsvcs.dll MiniDump [PID] C:\Windows\Temp\lsass.dmp full` | EV-02 | T1003.001 | High | GrantedAccess 0x1410; LSASS dump created |
| 10 | 2024-11-14 22:35 | WS-IT-LEVI | `mimikatz.exe` execution (AMSI log) | EV-02 | T1003.001 | High | Credential extraction from dump |
| 11 | 2024-11-14 22:48 | DC-01 | EID 4662: DS-Replication-Get-Changes-All GUID `1131f6aa...` from non-DC host using p.levi | EV-04 | T1003.006 | High | DCSync; krbtgt + privileged accounts targeted |
| 12 | 2024-11-14 23:02 | SERVER-FIN-01 | `robocopy.exe \\SERVER-FIN-01\R&D_Confidential\USPartner2024` staged to local temp | EV-03 | T1039 | High | 47 files, ~2.3 GB; US licensing data |
| 13 | 2024-11-14 23:11 | WS-IT-LEVI | EID 7045: new service `WindowsUpdateAgent`; path `C:\ProgramData\svchost.exe` | EV-02 | T1547.001 | High | Persistence mechanism |
| 14 | 2024-11-14 23:14 | WS-IT-LEVI | DNS query: `uslifepartner-group[.]com` from WS-IT-LEVI (malware spread to IT host) | EV-08 | T1071.001 | High | C2 pivoted to IT workstation |
| 15 | 2024-11-14 23:18–02:47 | WS-IT-LEVI | HTTPS upload: 8 sessions, ~2.4 GB to 198.51.100.44:443 | EV-08 | T1041 | High | Data exfiltration complete |
| 16 | 2024-11-15 03:02 | WS-IT-LEVI | Sysmon service stop (EID 7036) — **4-hour gap begins** | EV-02 | — | High | Gap covers log-clearing window |
| 17 | 2024-11-15 03:14 | WS-IT-LEVI | EID 1102: Audit log cleared via wevtutil; Security + System + Application | EV-02 | T1070.001 | High | Post-clear EID 1102 persists |
| 18 | 2024-11-15 07:14 | WS-IT-LEVI | Sysmon restarts (EID 7036) — gap ends | EV-02 | — | High | |
| 19 | 2024-11-15 10:47 | — | SOC analyst notices log gap in Elastic; creates P3 ticket | — | — | — | Detection starts |
| 20 | 2024-11-15 14:17 | — | IR Lead escalates to P1 incident | — | — | — | Containment begins |

---

## Dwell Time

| Metric | Value |
|---|---|
| First confirmed attacker activity | 2024-11-13 09:31 IST |
| Detection date | 2024-11-15 10:47 IST |
| Dwell time (confirmed) | **52 hours 46 minutes** |
| Worst-case (domain reg → containment) | ~6+ days |
| Containment initiated | 2024-11-15 14:17 IST |

---

## Timeline Gaps

| Gap Period | What is Unknown | Evidence That Would Fill Gap |
|---|---|---|
| WS-IT-LEVI 03:02–07:14 IST 15-Nov | Process execution events (Sysmon EID 1, 3) | PAM session recording (partial substitute); reimaged from backup |
| m.cohen workstation full Sysmon | Macro execution chain detail | Velociraptor collection (not deployed on this host) |
| C2 beacon content | Payload contents in HTTPS sessions | TLS inspection (not enabled) |
