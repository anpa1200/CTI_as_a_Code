# Execution Log — PROJ-2026-008 (NDSA Annual Detection Validation)

**Classification:** CONFIDENTIAL  
**Date:** 2026-01-20  
**Exercise duration:** 08:10–17:15 IST  
**Lead:** Shai Rotenberg (CTI Lead, NDSA) + CyberShield Ltd. red team  
**Observer:** Gila Ben-Moshe (SOC Lead, NDSA) — monitoring detection alerts in real time  
**Environment:** Lab (isolated VLAN; no production routing)  
**INCD notification code:** INCD-2026-SEC8-0017

---

## Module Execution Log

| Module | Start Time | End Time | Alert Time | Result | Notes |
|---|---|---|---|---|---|
| MOD-01 | 08:15 | 08:18 | 08:17 | **PASS** | Alert at 08:17 IST, 2 min; user, source_ip, source_asn (Turkish residential), timestamp all captured |
| MOD-02 | 08:30 | 08:32 | — | **FAIL (gap confirmed)** | `net user /domain` and `net group "NDSA-VRID-Admins" /domain` ran silently; zero alert generated; no net.exe rule deployed |
| MOD-03 | 08:45 | 08:48 | 09:16 | **PARTIAL** | Alert fired at 09:16, 28 min; src_host and dst_host correct; logon_type field not populated in alert |
| MOD-04 | 09:30 | 09:31 | 09:33 | **PASS** | Alert at 09:33, 3 min; GrantedAccess 0x1410 captured; process ancestry: svchost.exe → rundll32.exe |
| MOD-04 FP | 09:45 | 09:46 | — | **PASS (suppressed)** | Backup tool LSASS access correctly suppressed by GrantedAccess filter (0x1010 excluded) |
| MOD-05 | 10:05 | 10:08 | 10:14 | **PARTIAL** | Alert at 10:14, 6 min; job name and dst_domain present; src_host NOT populated (agent.hostname vs host.name field mapping) |
| MOD-06 | 10:30 | 10:31 | 10:35 | **PASS** | Alert at 10:35, 4 min; EID 7045 captured; `C:\Windows\Temp\` path flagged; ServiceName: SvcHostMonitor |
| MOD-07 | 11:00 | 11:01 | — | **FAIL** | No alert generated; Sysmon EID 13 config covers HKLM only; HKCU write invisible; architectural gap confirmed |
| MOD-08 | 11:30 | 11:31 | 11:33 | **PASS** | Alert at 11:33, 3 min; query text `SELECT * FROM citizen_records` captured; account: lab_svc_vrid |
| MOD-09 | 13:00 | 13:11 | — | **FAIL (gap confirmed)** | 100 MB transferred in 8 chunks to lab C2 over 9 min; no volume threshold rule; no alert; critical gap confirmed |
| MOD-10 | 14:00 | 14:01 | 14:01 | **PASS** | Alert at 14:01, 1 min; `-EncodedCommand` flag captured; base64 decoded: "Write-Host 'emulation test 2026'" |
| MOD-11 | 17:00 | 17:02 | 17:01 | **PASS** | Alert at 17:01, 1 min; EID 1102 captured for Security, System, Application logs; host: VRID-LAB-SRV |

---

## Anomalies and Observations

| # | Observation | Impact |
|---|---|---|
| 1 | MOD-01 timing: Alert fired in 2 min vs. 5 min pass criterion — rule is operating well; ASN enrichment working as expected | No impact; positive finding |
| 2 | MOD-02 silent: Both `net user /domain` and `net group "NDSA-VRID-Admins" /domain` generated zero events in SIEM; no process creation rule for net.exe exists | P2 gap confirmed; in March 2025 incident this reconnaissance phase lasted 8 minutes and produced lateral movement targeting data |
| 3 | MOD-03 delay: RDP alert used 30-minute aggregation window; logon_type field absent in EID 4624 Elastic ingest pipeline mapping | Investigator cannot confirm RDP (Type 10) vs. network logon (Type 3) without manual lookup; 5–10 min response delay |
| 4 | MOD-05 src_host null: Winlogbeat on VRID-LAB-SRV ships hostname as `agent.hostname`; GOV-DET-003 queries `host.name` — field name mismatch in Elastic ingest pipeline | Same root cause as A04 GAP-005; same ingest pipeline fix resolves both |
| 5 | MOD-07 HKCU silent: Sysmon EID 13 confirms 0 events generated for HKCU registry write; DeTT&CT data source score = 0 for this technique | User-level persistence invisible; relevant for contractor accounts (e.g., a.halevi level access); no admin rights needed |
| 6 | MOD-09 volume gap: 100 MB transferred in 8 chunks with no NetFlow or Zeek source in Elastic; no threshold rule exists | In March 2025 incident, 413 MB transferred before any detection; same structural gap persists 10 months later |

---

## Field Evidence: Failed Modules

### MOD-02 — Evidence of Commands Executed (No Alert)

Hayabusa scan against VRID-LAB-SRV.evtx and JUMPHOST-CONTRACTOR-LAB.evtx confirmed:
- EID 4688 (process creation) present for net.exe with CommandLine arguments
- Events exist in the raw log; the SIEM simply has no rule to detect them
- Gap classification: **Rule missing** (not a log source gap)

### MOD-07 — Evidence of HKCU Write Confirmed Not Logged

Sysmon EID 13 query for `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` returned 0 results in both lab SIEM and local `.evtx` review.

Sysmon config confirmed:
```xml
<RegistryEvent onmatch="include">
  <TargetObject condition="contains">HKLM\Software\Microsoft\Windows\CurrentVersion\Run</TargetObject>
  <!-- HKCU not included — architectural gap -->
</RegistryEvent>
```
- Gap classification: **Data source gap** (Sysmon config must be updated before rule can fire)
- Remediation owner: IT Operations (CAB change required)

### MOD-09 — Evidence of Transfer (No Alert)

Wireshark capture on lab VLAN confirmed:
- 8 HTTPS connections to lab C2 over 9 minutes
- Total bytes: 104,857,600 (100 MB test file)
- All traffic HTTPS/443 — no plaintext indicators
- No Zeek or NetFlow log source connected to Elastic
- Gap classification: **Data source gap** (NetFlow or packet metadata pipeline required before rule can fire)

---

## Post-Exercise Clean-Up

| Action | Status |
|---|---|
| Service `SvcHostMonitor` removed from VRID-LAB-SRV | Done |
| Registry Run key `WindowsMonitor` removed from VRID-LAB-SRV | Done |
| `C:\Windows\Temp\test.dmp` deleted | Done |
| `C:\Windows\Temp\test.bin` deleted | Done |
| Lab snapshot restored to pre-exercise state | Done |
| test_contractor_01 account password reset | Done |
| 100 MB test file on CyberShield C2 deleted | Done |
| VECTR exercise record marked complete | Done |
| Rotenberg exercise halt authority: not invoked | — |

---

## Summary Statistics

| Result | Count | Percentage |
|---|---|---|
| PASS | 6 | 55% |
| PARTIAL | 2 | 18% |
| FAIL (gap or arch limit) | 3 | 27% |
| **Total modules** | **11** | |

**INCD Section 8 threshold (per GOV direction): ≥70% PASS+PARTIAL required for compliance without remediation plan.**  
**Result: 73% (8/11) PASS or PARTIAL — threshold met; 3 FAIL gaps require documented remediation plan for full compliance.**
