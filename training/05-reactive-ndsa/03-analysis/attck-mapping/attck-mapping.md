# ATT&CK Mapping — PROJ-2025-005

**ATT&CK Version:** v15  
**Detection coverage: 0/13 — 3 rules existed; all failed due to bugs or scope exclusions.**

---

## Confirmed TTPs

| Technique ID | Name | Tactic | Evidence | Confidence | Detection | Fired? | Failure Reason |
|---|---|---|---|---|---|---|---|
| T1566.001 | Spearphishing Attachment | Initial Access | EV-006 (Halevi interview); `gov-procurement-il-portal[.]net` | High | None (personal email; outside NDSA visibility) | No | Architectural — personal email not monitorable |
| T1557 | Adversary-in-the-Middle | Credential Access | EV-001 (VPN from Turkish IP; TOTP bypass via stolen seed) | High | None | No | No AiTM/impossible-travel rule on contractor VPN |
| T1133 | External Remote Services | Initial Access | EV-001 (VPN auth 01:44 IST; non-corporate ASN; 892.4 MB outbound) | High | GOV-DET-001 | No | **Rule had 12-hour quiet-period bug; did not fire on first 2 anomalous sessions** |
| T1114.002 | Email Collection: Remote Email Collection | Collection | EV-006 (inferred — M365 mailbox access; TOTP seed in email) | Medium | None | No | M365 is HavayaIT-controlled; NDSA has no visibility |
| T1087.002 | Account Discovery: Domain Account | Discovery | EV-002 (`net group "NDSA-VRID-Admins"`) | High | None | No | No domain enumeration rule deployed |
| T1016; T1018 | System Network Config + Remote Discovery | Discovery | EV-002 (`ipconfig`; `nslookup vrid-srv-01`) | High | None | No | No discovery detection |
| T1021.001 | Remote Desktop Protocol | Lateral Movement | EV-002 (EID 4624 Type 10; JUMPHOST → VRID-SRV-01) | High | GOV-DET-002 | No | **Rule scope excluded VRID-SRV-01; 30-min delay** |
| T1003.001 | LSASS Memory Dump (comsvcs.dll) | Credential Access | EV-003 (EID 4688; GrantedAccess 0x1410; dump corrupted) | High | None | No | No LSASS access rule |
| T1197 | BITS Jobs | Defense Evasion / C2 | EV-003 (BITS download of `svchosts.exe`) | High | None | No | No BITS-to-external rule on VRID-SRV-01 |
| T1036.005 | Masquerading: Match Legitimate Name | Defense Evasion | EV-003 (`svchost.exe` in `C:\Windows\Temp\`) | High | None | No | No non-standard path execution rule |
| T1543.003 | Create or Modify System Process: Windows Service | Persistence | EV-003 (EID 7045; `SvcHostMonitor`; Temp path) | High | None | No | No new-service-non-standard-path rule |
| T1005 | Data from Local System | Collection | EV-003 (`vrid_query.exe` full-table SELECT via SVC-HAVAYAIT-MAINT) | High | GOV-DET-005 equivalent | No | **GOV-DET-005 was on VRID-LAB-01, not VRID-SRV-01** |
| T1041 | Exfiltration Over C2 Channel | Exfiltration | EV-004 (413 MB in 8 HTTPS chunks to 203.0.113.201) | High | None | No | No volume exfiltration rule |
| T1070.001 | Clear Windows Event Logs | Defense Evasion | EV-003 (EID 1102; wevtutil cl) | High | GOV-DET-004 | No | **GOV-DET-004 had same 12-hour quiet-period bug** |

---

## Priority Detection Gaps (new rules required post-incident)

| Priority | Technique | Detection Approach |
|---|---|---|
| P1 | T1557 AiTM — Contractor VPN impossible travel | Source ASN mismatch + off-hours + anomalous data volume on VPN auth |
| P1 | T1005 VRID full-table query | DB query anomaly rule on VRID-SRV-01 (not just lab) |
| P1 | T1003.001 LSASS comsvcs | rundll32 + comsvcs.dll + MiniDump on all servers |
| P1 | T1197 BITS to external | BITS transfer to non-GOV-IL/non-Microsoft destination |
| P2 | T1070.001 wevtutil — fix quiet-period bug | Remove 12-hour suppression from GOV-DET-004 |
| P2 | T1543.003 Service from Temp path | New service with path containing `Temp` or `ProgramData` |
| P2 | T1041 large outbound | HTTPS outbound >100MB/session to non-approved destination |
