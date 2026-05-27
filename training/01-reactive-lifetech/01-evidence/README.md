# Evidence Inventory — PROJ-2024-001

**Classification:** TLP:AMBER  
**Last updated:** 2024-11-16

---

## Chain of Custody

| ID | Filename | Type | Source | Date Acquired | Notes |
|---|---|---|---|---|---|
| EV-001 | `raw/logs/sysmon-ws-cfo-01.jsonl` | Sysmon JSONL | Elastic SIEM export | 2024-11-15 | 14 events; OUTLOOK spawn chain |
| EV-002 | `raw/logs/sysmon-ws-it-levi.jsonl` | Sysmon JSONL | Elastic SIEM export | 2024-11-15 | 13 events; **4h Sysmon gap 03:02–07:14 IST** |
| EV-003 | `raw/logs/sysmon-server-fin-01.jsonl` | Sysmon JSONL | Elastic SIEM export | 2024-11-15 | 9 events; robocopy staging, BITS exfil |
| EV-004 | `raw/logs/winsec-dc01.jsonl` | Windows Security JSONL | Elastic SIEM export | 2024-11-15 | 8 events; DCSync EID 4662, EID 4624 NTLM |
| EV-005 | `raw/logs/ps-scriptblock-gap.md` | Documentation | CTI Analyst | 2024-11-15 | EID 4104 disabled — forensic gap documented |
| EV-006 | `raw/email/phish-p-levi-2024-10-22.eml` | Email artifact | Email security gateway | 2024-11-15 | MFA-ReEnroll phish; SCL:4; ATP missed |
| EV-007 | `raw/email/phish-m-cohen-2024-11-15.eml` | Email artifact | Email security gateway | 2024-11-15 | Q4-Forecast xlsm; from lookalike domain; VT 0/68 at delivery |
| EV-008 | `raw/network/dns-connections.jsonl` | DNS + network JSONL | Elastic SIEM export | 2024-11-15 | C2 domain queries and connections across all 3 hosts |

---

## Evidence Gaps

| Expected Evidence | Why Not Available | Impact on Analysis |
|---|---|---|
| WS-IT-LEVI process events 03:02–07:14 IST | Sysmon crash (EID 7036 service stop) | Cannot reconstruct execution during log-clear window; PAM is substitute |
| PowerShell script block logs (EID 4104) | EID 4104 disabled in Group Policy | Cannot see decoded payload content; base64 only |
| HTTPS inspection logs for C2 communications | TLS inspection not enabled for 198.51.100.44 | Cannot confirm payload content in C2 beacons |
| m.cohen workstation full Sysmon logs | Not enrolled in Velociraptor collection | Initial macro execution reconstructed from email gateway + DNS |
