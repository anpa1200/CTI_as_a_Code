# Execution Log — PROJ-2024-004 (Operation Desert Cipher)

**Date:** 2024-11-20  
**Exercise duration:** 09:00–17:30 IST  
**Lead:** CyberShield Ltd. + TechPay CTI (Avi Ben-David observer)  
**Environment:** Lab (isolated from production)

---

## Module Execution Log

| Module | Start Time | End Time | Alert Time | Result | Notes |
|---|---|---|---|---|---|
| MOD-01 | 09:05 | 09:08 | 09:08 | **PASS** | Alert fired at 09:08 IST, 3 min after auth; all fields populated |
| MOD-02 | 09:20 | 09:22 | — | **FAIL (gap)** | No alert generated; net.exe discovery commands ran silently; gap confirmed |
| MOD-03 | 09:35 | 09:38 | 10:11 | **PARTIAL** | Alert fired at 10:11 — 33 min delay (within documented window); logon type field not populated |
| MOD-04 | 10:20 | 10:21 | 10:22 | **PASS** | Alert at 10:22, 2 min; GrantedAccess 0x1410 captured; process ancestry: svchost.exe → rundll32.exe |
| MOD-04 FP | 10:35 | 10:36 | — | **PASS (suppressed)** | Backup tool LSASS access correctly suppressed by filter |
| MOD-10 | 10:50 | 10:51 | 10:51 | **PASS** | Alert at 10:51, 1 min; encoded command captured; base64 decoded in alert |
| MOD-05 | 11:15 | 11:17 | 11:22 | **PARTIAL** | Alert at 11:22, 7 min; job name and dst_domain present; src_host NOT populated (field mapping bug) |
| MOD-06 | 11:45 | 11:46 | 11:49 | **PASS** | Alert at 11:49, 4 min; EID 7045 captured; service path `C:\Windows\Temp\` flagged |
| MOD-07 | 12:10 | 12:11 | — | **FAIL** | No alert generated; Sysmon HKCU registry monitoring not configured; confirmed architectural gap |
| MOD-08 | 13:00 | 13:01 | 13:03 | **PASS** | Alert at 13:03, 3 min; query text captured; account = LAB-SVC-MAINT |
| MOD-09 | 14:00 | 14:10 | — | **FAIL (gap)** | 100 MB transferred in 5 chunks to lab C2; no volume threshold rule; no alert generated |
| MOD-11 | 17:00 | 17:02 | 17:01 | **PASS** | Alert at 17:01, 1 min; EID 1102 captured for Security, System, Application |

---

## Anomalies and Observations

| # | Observation | Impact |
|---|---|---|
| 1 | MOD-03 delay: RDP alert took 33 minutes because Elastic rule uses a 30-minute aggregation window | Alert fires but too slow for < 30-min attack windows |
| 2 | MOD-05 src_host null: `host.name` field path mismatch — Winlogbeat ships as `agent.hostname` on this OS version | Investigator cannot identify originating host without manual correlation |
| 3 | MOD-07 HKCU silent: Sysmon EID 13 config covers HKLM but not HKCU by default | User-level persistence invisible |
| 4 | MOD-09 gap: No NetFlow or Zeek log source connected to Elastic in lab | Cannot measure volume; architectural gap |

---

## Post-Exercise Clean-Up

| Action | Status |
|---|---|
| Test service `TestSvcMonitor` removed | Done |
| Registry Run key `WindowsMonitor` removed | Done |
| `C:\Windows\Temp\test.dmp` deleted | Done |
| `C:\Windows\Temp\test.bin` deleted | Done |
| Lab snapshot restored to pre-exercise state | Done |
| test_contractor_01 account password reset | Done |

---

## Summary Statistics

| Result | Count | Percentage |
|---|---|---|
| PASS | 6 | 55% |
| PARTIAL | 2 | 18% |
| FAIL (gap or arch limit) | 3 | 27% |
| **Total modules** | **11** | |
