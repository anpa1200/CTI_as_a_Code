# Threat Hunt Plan — Iranian-Nexus Activity in LifeTech Pharma

**Hunt ID:** HUNT-2024-001  
**Date:** 2024-11-27  
**Analyst:** CTI Lead  
**Trigger:** Post-incident hunt following confirmed Iranian-nexus breach (PROJ-2024-001)  
**Priority:** P1 — Active threat; actor may retain access

---

## Hunt Objectives

1. Identify any remaining adversary footholds not found during incident response
2. Determine whether any hosts other than WS-IT-LEVI and m.cohen workstation were accessed
3. Identify any second-stage C2 channels distinct from `uslifepartner-group[.]com`
4. Assess whether DCSync (T1003.006) resulted in additional credential theft beyond p.levi

---

## Hypothesis 1: Adversary Has Second Persistence Mechanism on WS-IT-LEVI

**ATT&CK:** T1543.003, T1547.001, T1053.005  
**Rationale:** The `WindowsUpdateAgent` service (T1547.001 via service) was removed, but the 4-hour Sysmon gap on WS-IT-LEVI prevents confirmation that no additional persistence was installed during 03:02–07:14 IST.

**Hunt query (Elastic KQL):**
```
event.code: "7045" AND host.name: "WS-IT-LEVI"
AND winlog.event_data.ImagePath: ("*\\Temp\\*" OR "*\\AppData\\*" OR "*\\ProgramData\\*")
AND @timestamp > "2024-11-14T22:00:00Z" AND @timestamp < "2024-11-16T00:00:00Z"
```

**Hunt query (Sysmon EID 13 — Registry persistence):**
```
event.code: "13" AND host.name: "WS-IT-LEVI"
AND registry.path: ("*\\Run\\*" OR "*\\RunOnce\\*" OR "*\\Services\\*")
AND user.name: "p.levi"
```

**Velociraptor artifact:** `Windows.Persistence.PersistenceSniper` — run against WS-IT-LEVI live; export results for all startup locations (Run keys, services, scheduled tasks, WMI subscriptions)

**Expected evidence if true:** EID 7045 or Sysmon EID 13 in the gap window; service paths outside standard Windows directories

---

## Hypothesis 2: Additional Hosts Accessed via DCSync-Harvested Credentials

**ATT&CK:** T1078.002, T1021.001  
**Rationale:** p.levi executed DCSync (T1003.006) on DC-01 at 22:48 IST. DCSync yields all domain account NTLM hashes. The adversary may have used harvested credentials to authenticate to other hosts not yet identified.

**Hunt query — Lateral movement post-DCSync window:**
```
event.code: "4624" AND winlog.event_data.LogonType: "10"
AND @timestamp > "2024-11-14T22:48:00Z" AND @timestamp < "2024-11-16T00:00:00Z"
AND NOT winlog.event_data.TargetUserName: ("p.levi" OR "m.cohen" OR "SYSTEM" OR "*$")
```

**Hunt query — New admin logons on FILE-SRV-01 post-incident:**
```
event.code: "4624" AND host.name: "FILE-SRV-01"
AND winlog.event_data.LogonType: ("3" OR "10")
AND @timestamp > "2024-11-14T22:48:00Z"
```

**Expected evidence if true:** EID 4624 with unexpected usernames or source hosts in the DCSync post-window

---

## Hypothesis 3: Second C2 Channel via DNS Tunneling or HTTPS to Unreported Domain

**ATT&CK:** T1071.004, T1071.001  
**Rationale:** HTTPS beacons to `uslifepartner-group[.]com` were the observed C2 channel. Sophisticated actors typically deploy a backup C2 channel. The HTTPS inspection gap (`lifetechpharma-corp[.]eu` not inspected) may have masked a second channel.

**Hunt query — DNS anomalies from WS-IT-LEVI:**
```
dns.question.type: "A" AND source.ip: "<WS-IT-LEVI IP>"
AND @timestamp > "2024-11-13T00:00:00Z" AND @timestamp < "2024-11-16T00:00:00Z"
AND NOT dns.question.name: ("*.microsoft.com" OR "*.windows.com" OR "*.windowsupdate.com" OR "uslifepartner-group.com")
```

**Hunt query — HTTPS connections to non-categorized domains:**
```
network.protocol: "https" AND source.ip: "<WS-IT-LEVI IP>"
AND network.bytes_toserver > 1000
AND NOT destination.ip: ("<known corporate SaaS IPs>")
AND @timestamp > "2024-11-13T00:00:00Z"
```

**Expected evidence if true:** DNS queries or HTTPS connections to domains registered within 30 days; short TTL patterns; domains with no web presence

---

## Hypothesis 4: Adversary Sent R&D Data to Additional Destination

**ATT&CK:** T1041  
**Rationale:** Firewall logs show HTTPS uploads to 198.51.100.44. The actor may have staged data to a second destination, particularly if `USPartner2024` folder contents were of sufficient value.

**Hunt query — Outbound HTTPS from FILE-SRV-01:**
```
network.direction: "outbound" AND source.ip: "<FILE-SRV-01 IP>"
AND network.protocol: "https"
AND network.bytes_toserver > 500000
AND @timestamp > "2024-11-14T22:00:00Z" AND @timestamp < "2024-11-16T00:00:00Z"
```

**Expected evidence if true:** HTTPS flows > 1 MB to IPs other than 198.51.100.44

---

## Hunt Scope and Data Sources

| Data Source | Coverage | Gap |
|---|---|---|
| Winlogbeat (Windows Security) | All hosts | WS-IT-LEVI gap 03:02–07:14 IST on 15 Nov |
| Sysmon | WS-IT-LEVI, DC-01, FILE-SRV-01 | Same gap on WS-IT-LEVI; WS-CFO-01 not enrolled |
| DNS | All hosts via internal resolver | Encrypted DNS bypass not monitored |
| Firewall (NGFW) | Internet boundary | HTTPS not inspected for 3 target domains |
| PAM (CyberArk) | JUMPHOST-01 only | Other lateral movement paths not PAM-mediated |

---

## Hunt Execution Log

| Date | Analyst | Query | Finding |
|---|---|---|---|
| 2024-11-27 | CTI Lead | Hypothesis 1 — EID 7045 in gap window | No additional services found outside gap window |
| 2024-11-27 | CTI Lead | Hypothesis 2 — DCSync-window logons | No unexpected logons found; limited by gap window |
| 2024-11-27 | CTI Lead | Hypothesis 3 — DNS anomalies | 2 unresolved domains flagged; submitted to CERT-IL for analysis |
| 2024-11-27 | CTI Lead | Hypothesis 4 — FILE-SRV-01 outbound | No additional exfil destinations identified |

**Findings:** No confirmed additional persistence or second C2 channel found. Two unresolved DNS domains from WS-IT-LEVI require external analysis. Evidence of Sysmon gap limits confidence to **MEDIUM** — absence of evidence is not evidence of absence during the gap window.

**Recommendation:** Re-run Hypothesis 1 using Velociraptor live artifact collection from WS-IT-LEVI to complement SIEM-based hunt.
