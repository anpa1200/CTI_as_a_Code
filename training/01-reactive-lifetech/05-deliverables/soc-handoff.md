# SOC Handoff Package — PROJ-2024-001

**Classification:** TLP:AMBER  
**Prepared by:** CTI Analyst  
**Date:** 2024-11-20  
**Recipient:** Noa Ben-David, IR Lead

---

## Summary for SOC

A targeted intrusion at LifeTech Pharma between 13–15 November 2024 resulted in exfiltration of ~2.4 GB of R&D licensing data. The attacker bypassed MFA via AiTM, performed DCSync, and departed after 52 hours. **All domain credentials must be treated as compromised.** Deploy detection rules DET-001 through DET-004 immediately; initiate krbtgt rotation.

---

## Confirmed IOCs — Deploy Immediately

| Type | Value | Confidence | Context | Action |
|---|---|---|---|---|
| IP | 198.51.100.44 | High | C2 server; exfiltration destination | Block at firewall; alert on any new outbound connection |
| IP | 185.220.100.77 | High | Turkish residential VPN exit used for AiTM VPN session | Block at VPN gateway; alert on any auth attempt |
| Domain | `uslifepartner-group[.]com` | High | C2 domain; resolved to 198.51.100.44 | Block DNS; alert on lookups |
| Domain | `lifetechpharma-corp[.]eu` | High | AiTM phishing domain targeting m.cohen | Block at mail gateway + DNS |
| File path | `C:\ProgramData\svchost.exe` | High | Dropper/backdoor; non-standard path | AV hunt on all endpoints; delete |
| File path | `C:\Windows\Temp\lsass.dmp` | High | LSASS dump artifact | Hunt and delete |
| Service name | `WindowsUpdateAgent` | High | Persistence mechanism; path `C:\ProgramData\svchost.exe` | Query via SC on all Windows hosts; remove |

---

## Detection Rules to Deploy

| Rule ID | File | Technique | Priority | Test Status |
|---|---|---|---|---|
| DET-001 | `04-detections/sigma/DET-001-office-ps-spawn.yml` | T1059.001 — Office→PowerShell | P1 | Validated against incident evidence |
| DET-002 | `04-detections/sigma/DET-002-lsass-comsvcs.yml` | T1003.001 — LSASS dump | P1 | Validated; add Veeam user filter |
| DET-003 | `04-detections/sigma/DET-003-dcsync.yml` | T1003.006 — DCSync | P1 | Validated; filter MSOL_ accounts |
| DET-004 | `04-detections/sigma/DET-004-vpn-non-corporate-asn.yml` | T1133/T1557 — VPN ASN anomaly | P1 | Requires MaxMind GeoIP enrichment pipeline |

---

## Accounts to Review / Disable

| Account | Host / System | Action | Reason |
|---|---|---|---|
| p.levi | All systems | **Disable immediately** + force password reset | Used by attacker; DCSync performed with this account |
| m.cohen | All systems | Force password reset | Initial phishing victim; credentials potentially captured |
| krbtgt | DC-01 | **Double-rotate krbtgt** (twice, 10 hours apart) | DCSync performed against DC-01; all Kerberos tickets compromised |
| Administrator | DC-01 | Force password reset | DCSync evidence shows Administrator account targeted |
| All service accounts | All systems | Audit and rotate | EV-04 shows credential spray against service accounts |

---

## Systems Requiring Forensic Review

| System | Priority | Evidence of Compromise | Recommended Action |
|---|---|---|---|
| WS-IT-LEVI | P1 | Primary attack host; LSASS dump, DCSync, malware installed | Image before reimaging; preserve for forensics |
| DC-01 | P1 | DCSync performed; multiple EID 4662 events | Full audit of all directory changes during incident window |
| SERVER-FIN-01 | P2 | Robocopy staging; data staged and exfiltrated | Preserve file access logs; document what was accessed |
| WS-CFO-01 | P2 | First C2 beacon; initial compromise host | Check for persistence; scan for `C:\ProgramData\svchost.exe` |

---

## Open Monitoring Requirements

| What to Watch | Where | Duration | Escalation |
|---|---|---|---|
| Any connection to 198.51.100.44 or `uslifepartner-group[.]com` | Firewall / DNS | 90 days | Escalate immediately — attacker may return |
| VPN logons from Turkish ASN or off-hours with p.levi or m.cohen | VPN gateway | 30 days | Escalate immediately |
| Any new service with path `C:\Windows\Temp\` or `C:\ProgramData\` | All Windows endpoints | 30 days | Escalate if found |

---

## Regulatory Notification Status

| Obligation | Regulator | Deadline | Status |
|---|---|---|---|
| Israeli Privacy Protection Law | ILITA | 72 hours from breach determination | Assessment pending — legal review in progress |
| USPartner2024 contract notification | Partner legal | Per contract terms | Pending CISO approval |

---

## Questions for SOC

1. Has any new VPN session been initiated from 185.220.100.77 or any Turkish-ASN IP since containment?
2. Are there any additional hosts that queried `uslifepartner-group[.]com` not captured in the current evidence set?
