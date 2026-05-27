# Incident Timeline — PROJ-2025-005

**Classification:** TLP:AMBER  
**All timestamps IST (UTC+3) unless noted**

---

## Timeline

| # | Timestamp (IST) | System | Source | Event | Account | ATT&CK | Confidence |
|---|---|---|---|---|---|---|---|
| 1 | 2025-03-12 09:47 | Halevi personal Gmail | Inferred | AiTM phishing email from `gov-procurement-il-portal[.]net` to personal Gmail | a.halevi | T1566.001 | High |
| 2 | 2025-03-12 ~10:00 | HavayaIT M365 | Inferred | AiTM session token capture for M365; VPN credentials and TOTP seed extracted from mailbox | a.halevi | T1557, T1114.002 | High (inferred from Halevi interview) |
| 3 | 2025-03-12–16 | HavayaIT M365 | Inferred | Actor reads contractor SOPs; identifies VRID access path; locates VPN credentials + TOTP seed | a.halevi (actor) | T1114.002 | Medium — M365 logs pending |
| 4 | 2025-03-17 01:44:12 | NDSA VPN GW | EV-001, EV-003 | Auth success: `a.halevi`; source 203.0.113.115 (Turkish residential VPN); **892.4 MB outbound — highly anomalous** | a.halevi | T1133, T1557 | High |
| 5 | 2025-03-17 01:51:03 | JUMPHOST-CONTRACTOR-01 | EV-002 | PAM session PAM-20250317-0151-HALEVI-01 starts; `net user /domain` | a.halevi | T1087.002 | High |
| 6 | 2025-03-17 01:51:14 | JUMPHOST-CONTRACTOR-01 | EV-002 | `net group "NDSA-VRID-Admins" /domain` — actor specifically seeking VRID access group | a.halevi | T1087.002 | High |
| 7 | 2025-03-17 01:52:00 | JUMPHOST-CONTRACTOR-01 | EV-002 | `ipconfig /all`; `nslookup vrid-srv-01.govnet.ndsa.gov.il` — actor knows VRID server name | a.halevi | T1016, T1018 | High |
| 8 | 2025-03-17 02:03:15 | JUMPHOST → VRID-SRV-01 | EV-002 + EV-003 | RDP logon type 10 to VRID-SRV-01; unrevoked 8-month-old maintenance permissions | a.halevi | T1021.001 | High |
| 9 | 2025-03-17 02:18:01 | VRID-SRV-01 | EV-003 | `rundll32.exe comsvcs.dll MiniDump [PID]` — dump corrupted by process protection | a.halevi (elevated) | T1003.001 | High |
| 10 | 2025-03-17 02:31:12 | VRID-SRV-01 | EV-003 | DNS query: `govservice-cdn-updates[.]net` → 203.0.113.201 | SYSTEM | T1071.001 | High |
| 11 | 2025-03-17 02:31:14 | VRID-SRV-01 | EV-003, EV-004 | BITS job downloads `svchosts.exe` from `govservice-cdn-updates[.]net`; 2.1 MB | SYSTEM | T1197 | High |
| 12 | 2025-03-17 02:31:45 | VRID-SRV-01 | EV-003 | `C:\Windows\Temp\svchost.exe --init` executes — masquerading | SYSTEM | T1036.005 | High |
| 13 | 2025-03-17 02:47:08 | VRID-SRV-01 | EV-003 | `vrid_query.exe -q "SELECT name, national_id, biometric_hash, last_verified FROM citizen_records"` — 340,218 rows | SVC-HAVAYAIT-MAINT | T1005 | High |
| 14 | 2025-03-17 02:49:01 | VRID-SRV-01 | EV-003 | EID 7045: service `SvcHostMonitor`; path `C:\Windows\Temp\svchost.exe` — persistence | SYSTEM | T1543.003 | High |
| 15 | 2025-03-17 04:15–05:33 | VRID-SRV-01 | EV-004 | 8 HTTPS chunks to 203.0.113.201:443; ~413 MB — all 340K records exfiltrated | — | T1041, T1197 | High |
| 16 | 2025-03-17 05:33:22 | VRID-SRV-01 | EV-003 | EID 1102: wevtutil log clear — **Winlogbeat gap begins** | SYSTEM | T1070.001 | High |
| 17 | 2025-03-17 05:51:18 | JUMPHOST-CONTRACTOR-01 | EV-002 | PAM session ends; logoff | a.halevi | — | High |
| 18 | 2025-03-18 11:34:15 | VRID-SRV-01 | EV-003 | Winlogbeat auto-restart — gap ends | — | — | High |
| 19 | 2025-03-18 14:15 | VRID DB | EV-003 | SOC analyst flags full-table query at 02:47 IST by SVC-HAVAYAIT-MAINT | — | — | — |
| 20 | 2025-03-18 14:33 | NDSA SOC | — | Incident declared | — | — | — |
| 21 | 2025-03-18 15:45 | NDSA CISO | — | CISO notified; INCD 8-hour notification clock starts (deadline 23:45 IST) | — | — | — |
| 22 | 2025-03-18 23:38 | NDSA Legal | EV-005 | INCD-CID notification filed — **7 minutes before deadline** | — | — | — |

---

## Dwell Time

| Metric | Value |
|---|---|
| First adversary action (confirmed) | 2025-03-17 01:44 IST |
| Detection | 2025-03-18 14:33 IST |
| Dwell time (confirmed) | **36 hours 49 minutes** |
| Potential earliest (M365 recon from 12 March) | Up to 5 days 14 hours |
| Total exfiltrated | 340,218 biometric records; ~413 MB |

---

## Evidence Gaps

| Gap | Period | Source | Impact |
|---|---|---|---|
| VRID-SRV-01 Winlogbeat | 02:00–11:34 IST 17 March | Attacker log clear | PAM is substitute; confidence medium-high |
| HavayaIT M365 audit | 12–17 March | Outside NDSA jurisdiction | Phase 0 and reconnaissance phase unknown |
