# Intelligence Source Registry — PROJ-2025-005

**Classification:** TLP:AMBER

| ID | Source | Type | Admiralty | Notes |
|---|---|---|---|---|
| INT-001 | NDSA Elastic SIEM (Winlogbeat + Beats) | Log telemetry | A/2 | Primary forensic source; 9.5h gap on VRID-SRV-01 |
| INT-002 | CyberArk PAM session recording | PAM recording | A/1 | Critical — PAM-20250317-0151-HALEVI-01; covers entire gap window |
| INT-003 | NDSA VPN gateway logs | VPN telemetry | A/2 | Captured AiTM session from 203.0.113.115 (Turkish residential VPN) |
| INT-004 | VRID database audit logs | DB audit | A/1 | Independent of Winlogbeat; confirms 340,218-record query at 02:47 IST |
| INT-005 | GOVNET NetFlow | Network telemetry | A/2 | Confirms 413 MB exfil; 48 MB to 198.51.100.77; classified segment access blocked |
| INT-006 | Halevi interview | Human source | B/2 | Confirmed AiTM phishing on personal Gmail; TOTP seed in email; VPN credentials forwarded |
| EXT-001 | ClearSky CloudGuard IL-2024 | Public report | B/3 | Iranian-nexus contractor targeting; basis for attribution assessment |
| EXT-002 | INCD TLP:RED advisory (March 2025) | Government classified | A/1 | Referenced; not cited in unclassified products; confirms Iranian tasking against government |
| EXT-003 | VirusTotal / Shodan | IOC enrichment | C/3 | 203.0.113.201 — bulletproof hosting; no prior attribution in public reporting |
