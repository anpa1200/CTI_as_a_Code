# Intelligence Source Registry — PROJ-2024-001

**Classification:** TLP:AMBER

| ID | Source | Type | Admiralty | Notes |
|---|---|---|---|---|
| INT-001 | Elastic SIEM / Winlogbeat | Log telemetry | A/2 | Primary forensic source; Sysmon EID 1/3/10/11/13/22 |
| INT-002 | Palo Alto GlobalProtect VPN logs | VPN telemetry | A/2 | Critical — captured AiTM session from Istanbul |
| INT-003 | CyberArk PAM session recording | PAM recording | A/2 | PAM-20241114-2211-LEVI-01; covers Sysmon gap window |
| INT-004 | Email security gateway (Proofpoint) | Mail logs | A/2 | Phishing emails; SCL:4 on both; ATP did not trigger |
| INT-005 | DNS resolver logs | DNS telemetry | A/2 | C2 domain resolution across all 3 hosts |
| INT-006 | Firewall / NGFW logs | Network telemetry | A/2 | HTTPS connection records; no TLS inspection |
| EXT-001 | VirusTotal | IOC enrichment | C/3 | Hash/IP lookups; 198.51.100.44 had 0 detections at time of incident |
| EXT-002 | DomainTools WHOIS | Domain intelligence | C/3 | `lifetechpharma-corp[.]eu` registered 8 Nov 2024; `uslifepartner-group[.]com` not attributed |
| EXT-003 | ClearSky 2023-2024 threat reports | Threat intel | B/3 | Iranian-nexus AiTM against Israeli pharma; basis for attribution |

---

## Source Limitations

| Source | Known Limitation |
|---|---|
| Elastic SIEM | WS-CFO-01 not enrolled in Velociraptor; CFO workstation logs are partial |
| Firewall NGFW | TLS inspection disabled for 198.51.100.44; C2 payload contents unknown |
| PAM | Single source for the 03:02–07:14 gap window; no cross-correlation available |
| VirusTotal | C2 IP had 0 detections — novel infrastructure; negative result has limited value |
