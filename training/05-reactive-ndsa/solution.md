# Solution: Assignment 5 — Reactive CTI (Gov): NDSA eID Breach

> **Model answer. All data is fictional.**

---

## Task 1 — Incident Timeline

> **Tools:** [Velociraptor](https://docs.velociraptor.app/) *(open-source)* · [Timesketch](https://timesketch.org/) *(open-source)* · [Plaso / log2timeline](https://github.com/log2timeline/plaso) *(open-source)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [DFIR-IRIS](https://dfir-iris.org/) *(open-source)*
>
> Velociraptor: remote artifact collection from VRID-SRV-01 and JUMP-GOV-01 without rebooting — preserve volatile memory state for the 17 March window; VQL queries can extract specific EIDs across the timeline. Timesketch: collaborative super-timeline for a multi-analyst team spread across NDSA and INCD; tag adversary events, annotate the PAM/SIEM discrepancies, and share the working timeline with INCD without sharing the underlying evidence. Plaso / log2timeline: normalize Winlogbeat JSON, VPN gateway logs, PAM session exports, and NetFlow data into a single timeline. Hayabusa: parse `.evtx` files for the HKCU registry gap window where Sysmon did not capture events. DFIR-IRIS: case management with evidence custody chain — required for INCD red team deconfliction documentation.

### Evidence Inventory

| Source | Coverage | Gap | Confidence |
|---|---|---|---|
| Palo Alto VPN logs | All VPN sessions; full date range | None | High |
| CyberArk PAM session recording | PAM-20250317-0151-HALEVI-01 (01:51–05:51 IST) | None; recording intact | High (primary source for attack execution) |
| Winlogbeat — JUMPHOST-CONTRACTOR-01 | 2025-03-17 full day | None | High |
| Winlogbeat — VRID-SRV-01 | Pre-gap: until 02:00 IST; Post-gap: from 11:34 IST | **9.5-hour gap (02:00–11:34 IST) — wevtutil log clear at ~05:33** | Medium (gap reduces confidence in full attack scope) |
| NetFlow — GOVNET Operational Segment | 2025-03-17 full day | None | High |
| DNS resolver logs | 2025-03-17 full day | None | High |
| VRID database audit logs | All queries; full date range | None | High (critical — confirms query at 02:47 IST) |
| HavayaIT M365 audit logs | 2025-03-12–17 | **NOT available** — pending legal request | None currently |
| GOVNET Classified Segment | Not accessible | **Complete gap** — requires MATZBEN clearance | N/A |

**Gap 1 (VRID-SRV-01 log gap 02:00–11:34 IST):**
The actor cleared logs at ~05:33 IST. Winlogbeat agent auto-restarted at 11:34 IST. Events before 02:00 IST and after 11:34 IST are available. The PAM session recording covers this window entirely — PAM is the primary evidence source for events in the gap window. Confidence in gap-period events: **Medium-High** (PAM recording is intact but PAM is a single source; cross-correlation limited).

**Gap 2 (HavayaIT M365, 5-day window 12–17 March):**
Zero forensic artifacts under NDSA custody for the initial compromise phase. What Halevi did in his M365 account during this period — and what the actor read — is unknown without HavayaIT's cooperation. This gap affects breach scope assessment: the actor may have read contractor credentials or SOPs for ITA and MoI access during this window.

**Dwell time:**
- Confirmed first adversary action: 01:44 IST 17 March 2025 (VPN logon)
- Detection: 14:33 IST 18 March 2025
- Dwell time (confirmed): **36 hours 49 minutes**
- Potential earliest access (if M365 was accessed for lateral recon starting 12 March): **up to 5 days 14 hours**

---

### Unified Incident Timeline

| # | Timestamp (IST) | System | Source | Event | Account | Indicator | ATT&CK | Conf | Note |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2025-03-12 09:47 | Halevi personal Gmail | External (inferred) | AiTM phishing email received at `amir.halevi.work@gmail[.]com` from `gov-procurement-il-portal[.]net` | a.halevi (personal) | `gov-procurement-il-portal[.]net` | T1566.001 | High | Phase 0; no NDSA forensic artifacts; confirmed via Halevi interview |
| 2 | 2025-03-12 ~10:00 | HavayaIT M365 | Inferred | Halevi authenticates to phishing AiTM proxy; M365 session token captured | a.halevi | AiTM session capture | T1557 | High | No direct artifacts; inferred from subsequent actor access to M365 |
| 3 | 2025-03-12 – 2025-03-16 | HavayaIT M365 | Inferred | Actor reads Halevi's email; identifies VPN credentials; finds TOTP seed forwarded to personal Gmail | a.halevi (actor controlled) | M365 mailbox access pattern | T1114.002 | Medium | 5-day gap; M365 audit logs pending; TOTP seed confirmed present in email (Halevi interview) |
| 4 | 2025-03-17 01:44:12 | NDSA VPN GW | VPN logs | Auth success; user `a.halevi`; source 203.0.113.115 (Turkish residential VPN, ClearSky-linked cluster); bytes out 892.4 MB (highly anomalous vs. normal 3–4 MB) | a.halevi | 203.0.113.115 | T1133; T1557 | High | First confirmed NDSA access |
| 5 | 2025-03-17 01:51:03 | JUMPHOST-CONTRACTOR-01 | PAM | RDP session PAM-20250317-0151-HALEVI-01 starts; `net user /domain` | a.halevi | Discovery commands | T1087.002 | High | PAM recording begins |
| 6 | 2025-03-17 01:51:14 | JUMPHOST-CONTRACTOR-01 | PAM | `net group "Domain Admins" /domain`; `net group "NDSA-VRID-Admins" /domain` | a.halevi | VRID-Admins group recon | T1087.002 | High | Actor targeting VRID access group specifically |
| 7 | 2025-03-17 01:52:00 | JUMPHOST-CONTRACTOR-01 | PAM | `ipconfig /all`; `nslookup vrid-srv-01.govnet.ndsa.gov.il` | a.halevi | DNS resolution of VRID server | T1016; T1018 | High | Actor knows VRID server by name; suggests prior reconnaissance |
| 8 | 2025-03-17 02:03:15 | JUMPHOST-CONTRACTOR-01 → VRID-SRV-01 | PAM + Winlogbeat EID 4624 | RDP (`mstsc`) to VRID-SRV-01 from JUMPHOST-CONTRACTOR-01; logon type 10 | a.halevi | Lateral RDP; unrevoked permissions | T1021.001 | High | Maintenance permissions from 8-month-old project not revoked |
| 9 | 2025-03-17 02:18:01 | VRID-SRV-01 | Winlogbeat EID 4688 (pre-gap) | `rundll32.exe comsvcs.dll MiniDump [LSASS_PID] C:\Windows\Temp\lsass.dmp full` | a.halevi (elevated) | GrantedAccess 0x1410; dump corrupted by process protection | T1003.001 | High | Partial failure; dump corrupted — actor proceeds to BITS downloader |
| 10 | 2025-03-17 02:31:12 | VRID-SRV-01 | DNS | Query: `govservice-cdn-updates[.]net` → 203.0.113.201 | SYSTEM | C2 domain resolved | T1071.001 | High | First C2 contact from VRID-SRV-01 |
| 11 | 2025-03-17 02:31:14 | VRID-SRV-01 | Winlogbeat EID 4688 (pre-gap); NetFlow | BITS job downloads `svchosts.exe` from `govservice-cdn-updates[.]net`/203.0.113.201:443; 2.1 MB | SYSTEM | BITS downloader; non-standard payload filename | T1197 | High | Second-stage tool deployed |
| 12 | 2025-03-17 02:31:45 | VRID-SRV-01 | Winlogbeat EID 4688 (pre-gap) | `C:\Windows\Temp\svchost.exe --init` executes | SYSTEM | Non-standard path execution | T1036.005 | High | Masquerading: svchost.exe in Temp |
| 13 | 2025-03-17 02:47:08 | VRID-SRV-01 | VRID DB audit log (pre-gap) | `vrid_query.exe -q "SELECT name, national_id, biometric_hash, last_verified FROM citizen_records"` executed by SVC-HAVAYAIT-MAINT; output to `C:\Windows\Temp\svchost_cache\export_` | SVC-HAVAYAIT-MAINT | Full-table SELECT; full biometric export | T1005 | High | 340,218 records; all citizens; query anomalous vs. maintenance patterns |
| 14 | 2025-03-17 02:49:01 | VRID-SRV-01 | Winlogbeat EID 7045 (pre-gap) | New service `SvcHostMonitor`; path `C:\Windows\Temp\svchost.exe` | SYSTEM | Non-standard service + path | T1543.003 | High | Persistence installed |
| 15 | 2025-03-17 04:15–05:33 | VRID-SRV-01 | NetFlow | 8 HTTPS chunks to 203.0.113.201:443; total ~413 MB | — | 413 MB exfiltration | T1041; T1197 | High | All 340K records exfiltrated |
| 16 | 2025-03-17 05:33:22 | VRID-SRV-01 | Winlogbeat EID 1102 (post-clear residual) | `wevtutil cl System/Security/Application` — EID 1102 residual only | SYSTEM | wevtutil log clear | T1070.001 | High | Winlogbeat agent stops after this (gap begins) |
| 17 | 2025-03-17 05:51:18 | JUMPHOST-CONTRACTOR-01 | PAM | PAM session ends; logoff | a.halevi | Session close | — | High | Total dwell on NDSA: 4h 7min |
| 18 | 2025-03-17 05:51:22 | NDSA VPN GW | VPN logs | VPN session ends; 892.4 MB outbound confirmed | a.halevi | Session end | — | High | — |
| 19 | 2025-03-18 11:34:15 | VRID-SRV-01 | Winlogbeat | Winlogbeat agent auto-restart; log gap ends | — | Gap end | — | High | — |
| 20 | 2025-03-18 14:15 | VRID DB | DB audit | SOC analyst reviews DB; flags full-table query at 02:47 IST by SVC-HAVAYAIT-MAINT | — | Detection via anomalous DB query | — | — | — |
| 21 | 2025-03-18 14:33 | NDSA SOC | SOC ticket | IR Lead Rotenberg notified; incident declared | — | Incident declaration | — | — | — |
| 22 | 2025-03-18 15:45 | NDSA CISO | Decision | CISO Nativ notified; 8-hour INCD notification clock starts | — | Notification clock starts | — | — | — |

---

## Task 2 — ATT&CK Mapping

> **Tools:** [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)*
>
> ATT&CK Navigator: create a layer from the 13 extracted techniques; color red for "no detection" — the resulting all-red layer visualizes the 0/13 coverage rate for the INCD compliance report. DeTT&CT: score each technique against NDSA's data sources to identify which gaps are architectural (no data source) vs. missing rules (data source exists but rule absent). OpenCTI: link the 13-technique table to the campaign object and the HavayaIT contractor threat actor profile. MISP: tag MISP event indicators with ATT&CK Galaxy entries for structured sharing with CERT-IL and the INCD-CID incident report.

| # | Tactic | Technique | Sub | Evidence | Conf | Detection | Fired? | Failure |
|---|---|---|---|---|---|---|---|---|
| 1 | Initial Access | T1566.001 | Spearphishing | Phishing email to personal Gmail; lookalike domain | High | None (personal email; outside NDSA visibility) | No | Personal email not monitorable; architectural gap |
| 2 | Credential Access | T1557 | AiTM | VPN session from Turkish IP; TOTP bypass via seed extracted from email | High | None | No | No AiTM or impossible-travel rule on contractor VPN |
| 3 | Initial Access | T1133 | External Remote Services | VPN auth 01:44 IST; non-corporate ASN; anomalous data volume | High | GOV-DET-001 (off-hours rule) | No | Rule had 12-hour quiet period bug; fires too slowly |
| 4 | Discovery | T1087.002 | Domain Groups | `net group "NDSA-VRID-Admins"` | High | None | No | No net.exe enumeration rule |
| 5 | Discovery | T1016 + T1018 | System Network Config + Remote Discovery | `ipconfig /all`; `nslookup vrid-srv-01` | High | None | No | No discovery detection |
| 6 | Lateral Movement | T1021.001 | RDP | EID 4624 Type 10; JUMPHOST → VRID-SRV-01 | High | GOV-DET-002 | No | 30-min delay; rule deployment scope excluded VRID-SRV-01 |
| 7 | Credential Access | T1003.001 | LSASS/comsvcs.dll | EID 4688; GrantedAccess 0x1410; dump corrupted | High | None | No | No LSASS access rule |
| 8 | Command & Control | T1197 + T1071.001 | BITS + HTTPS | bitsadmin download from `govservice-cdn-updates[.]net`; 203.0.113.201:443 | High | None | No | No BITS-to-external rule on VRID-SRV-01 |
| 9 | Persistence | T1543.003 | Create Service | EID 7045; `SvcHostMonitor`; path `C:\Windows\Temp\` | High | None | No | No new-service-non-standard-path rule |
| 10 | Collection | T1005 | Data from Local System | `vrid_query.exe` full-table SELECT via SVC-HAVAYAIT-MAINT | High | None | No | No DB query anomaly rule |
| 11 | Exfiltration | T1041 | HTTPS | 413 MB in 8 HTTPS chunks to 203.0.113.201:443 | High | None | No | No volume exfiltration rule |
| 12 | Defense Evasion | T1070.001 | Clear Windows Event Logs | EID 1102; wevtutil cl | High | GOV-DET-004 | No | GOV-DET-004 deployed but log gap detection had 12-hour quiet period bug |
| 13 | Defense Evasion | T1036.005 | Masquerading | `svchost.exe` in `C:\Windows\Temp\` | High | None | No | No non-standard path execution rule |

**Coverage: 0 / 13 detected. 3 rules existed; all failed due to configuration or scope bugs.**

**Most critical gap:** T1557 AiTM — the attack's pivotal technique. An impossible-travel rule on contractor VPN (source ASN mismatch + off-hours) would have fired at 01:44 IST, 12 hours before exfiltration began. Every subsequent technique was recoverable if this one had been detected.

---

## Task 3 — Threat Actor Assessment

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [Maltego CE](https://www.maltego.com/maltego-community/) *(freemium)* · [VirusTotal](https://www.virustotal.com/) *(freemium)* · [Shodan](https://www.shodan.io/) *(freemium)*
>
> OpenCTI: build a structured graph linking 203.0.113.201 and `govservice-cdn-updates[.]net` → observed techniques → campaign → assessed Iranian-nexus cluster; export as STIX 2.1 for INCD sharing. MISP: create a TLP:AMBER MISP event with all indicators; share with INCD-CID and CERT-IL via the established TAXII feed. Maltego CE: pivot from the C2 IP to ASN, registrant WHOIS, and co-hosted domains — identify whether `gov-procurement-il-portal[.]net` shares infrastructure with the C2. VirusTotal: query prior use of both C2 domains and IP — passive DNS and prior detection data. Shodan: check 203.0.113.201 for exposed services and TLS certificate SANs that may reveal additional actor infrastructure.

**Campaign Overview**

A threat actor with medium-confidence Iranian-nexus alignment conducted a supply chain intrusion against NDSA between 12–17 March 2025. The actor compromised a contractor employee's Microsoft 365 account via AiTM phishing, extracted VPN credentials and TOTP seed from the compromised mailbox over a 5-day preparation period, then used those credentials to access NDSA's contractor VPN at 01:44 IST on 17 March. The actor pivoted to the VRID-SRV-01 server using unrevoked maintenance permissions, deployed a second-stage exfiltration agent via BITS, queried the full VRID citizen database, and exfiltrated 340,218 biometric records (name, teudat zehut, biometric hash, last verification date) to a C2 server at 203.0.113.201 / `govservice-cdn-updates[.]net`. Total exfiltration: ~413 MB over ~78 minutes. Primary assessed objective: acquisition of the national biometric identity database for intelligence purposes.

**Infrastructure Analysis**

| Indicator | Registration | Hosting | Prior Use | Confidence (actor-controlled) | Action |
|---|---|---|---|---|---|
| 203.0.113.115 | Residential VPN (Turkish exit); registered to fictitious persona per OSINT | Turkish ISP | ClearSky report on Iranian-nexus contractor targeting; appears in 2-IP cluster | High | Block + preserve for law enforcement |
| 203.0.113.201 | Not resolved to named entity in OSINT | Bulletproof hosting (AS not attributable without LEA query) | No prior public reporting | High (sole C2 for exfil) | Block + notify INCD |
| `govservice-cdn-updates[.]net` | Registered 2025-02-18 (24 days before attack); privacy-protected registrar | Hosted on same ASN as 203.0.113.201 | No prior public reporting | High | Block at DNS + notify INCD |
| `gov-procurement-il-portal[.]net` | Registered 2025-03-07 (5 days before phishing); privacy-protected | Parked hosting | No prior public reporting | High | Block |

**Attribution Statement**

> *"The observed tradecraft — specifically AiTM phishing targeting an Israeli government contractor's personal email account, a 5-day preparation window of mailbox reconnaissance, off-hours VPN logon using extracted credentials, and targeted exfiltration of the national biometric identity database — demonstrates medium-confidence overlap with publicly documented Iranian-nexus state-affiliated operations against Israeli civilian government targets (ClearSky 'CloudGuard IL-2024'). The targeting of biometric data is consistent with intelligence collection objectives documented in INCD TLP:RED advisory (March 2025, not cited in unclassified products). However, the C2 infrastructure has no prior public attribution, and the tooling (comsvcs.dll, BITS, wevtutil) is not distinctive to any named group. Assessment: assessed as Iranian-nexus state-affiliated actor with intelligence collection objective; medium confidence (B3). Confidence would increase materially if: C2 infrastructure overlap with known Iranian APT campaigns is identified via classified sources; or additional government targets in Israel or Gulf states are confirmed using the same domain registration and hosting pattern."*

---

## Task 4 — Five Detection Rules

> **Tools:** [Sigma](https://sigmahq.io/) *(open-source)* · [Uncoder.io](https://uncoder.io/) *(free web tool)* · [Elastic Security](https://www.elastic.co/security) *(open-source core)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)*
>
> Sigma: write all 5 rules in vendor-neutral YAML; the MATZBEN-required CAB review process benefits from a Sigma format that detection engineers can review without SIEM expertise. Uncoder.io: convert Sigma YAML to Elastic KQL/EQL for deployment — confirm field mappings match the NDSA Winlogbeat index before committing to MATZBEN change control. Elastic Security: deploy rules via the detection engine API after CAB approval; use EQL for the biometric bulk-query rule which requires sequence correlation. Hayabusa: validate each rule against the `.evtx` evidence from the incident before deploying to production — confirms TP events exist. Chainsaw: run FP simulation scenarios against local event logs to verify filter logic won't suppress legitimate activity.

### GOV-DET-NEW-001: Contractor VPN Off-Hours from Non-Corporate ASN

```yaml
title: Contractor VPN Authentication — Off-Hours from Non-Corporate ASN
id: a1b2c3d4-e5f6-7890-abcd-ef1234567890
status: test
description: >
  Detects contractor VPN authentication from a source IP whose ASN does not match
  the contractor's known corporate office ASN, during off-hours (22:00-06:00 IST).
  Based on NDSA incident March 2025 (AiTM credential theft pattern).
tags:
  - attack.initial_access
  - attack.t1133
  - attack.t1557
logsource:
  product: palo_alto_globalprotect
  category: firewall
detection:
  selection:
    event_type: 'globalprotect'
    auth_status: 'success'
    time_generated|hour_of_day_gte: 22
    time_generated|hour_of_day_lte: 6
  filter_corporate_asns:
    source_asn:
      - 'AS[havayait_corporate_asn]'
      - 'AS[ndsa_approved_remote_asns]'
  condition: selection and not filter_corporate_asns
falsepositives:
  - 'Contractor working from hotel or home ISP during scheduled maintenance — suppress via contractor shift calendar integration'
level: high
```

### GOV-DET-NEW-002: Lateral RDP from Contractor DMZ to Operational Segment Off-Hours

```yaml
title: RDP Lateral Movement from Contractor DMZ to Operational Segment
id: b2c3d4e5-f601-8901-bcde-f01234567891
status: test
description: >
  Detects RDP logon (Type 10) from the Contractor DMZ subnet to the GOVNET
  Operational Segment subnet during off-hours. Based on NDSA incident.
tags:
  - attack.lateral_movement
  - attack.t1021.001
logsource:
  category: authentication
  product: windows
detection:
  selection:
    EventID: 4624
    LogonType: 10
    IpAddress|cidr: '10.10.5.0/24'   # Contractor DMZ subnet
    TargetComputer|cidr: '10.20.15.0/24'  # Operational Segment subnet
  condition: selection
falsepositives:
  - 'Scheduled maintenance RDP sessions — reduce FP by excluding known maintenance windows and service accounts'
level: high
```

### GOV-DET-NEW-003: BITS Job Download to Non-Standard External Destination

```yaml
title: BITS Job Downloading from Non-Microsoft/Non-CDN External Host
id: c3d4e5f6-0712-9012-cdef-012345678902
status: test
description: >
  Detects BITS jobs initiated to external IP addresses not belonging to
  Microsoft update or known CDN ASNs. Non-standard BITS downloader pattern
  observed in NDSA VRID-SRV-01 compromise.
tags:
  - attack.defense_evasion
  - attack.persistence
  - attack.t1197
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\bitsadmin.exe'
    CommandLine|contains: '/transfer'
    CommandLine|contains: '/download'
  filter_ms_urls:
    CommandLine|contains:
      - 'microsoft.com'
      - 'windowsupdate.com'
      - 'update.microsoft.com'
  condition: selection and not filter_ms_urls
falsepositives:
  - 'WSUS or SCCM-initiated BITS jobs to internal servers — add internal IP ranges to filter'
level: high
```

### GOV-DET-NEW-004: wevtutil Log Clear + Winlogbeat Restart Correlation

```yaml
title: Windows Event Log Cleared Followed by Agent Restart
id: d4e5f601-1823-0123-defa-123456789013
status: test
description: >
  Detects wevtutil log clear (EID 1102) followed by Winlogbeat/log agent restart
  within 30 minutes. The gap detection rule was originally set to 12-hour quiet
  period — this corrected rule fires within 30 minutes. Based on NDSA gap bug.
  Requires EQL correlation rule in Elastic.
tags:
  - attack.defense_evasion
  - attack.t1070.001
logsource:
  category: application
  product: windows
# EQL sequence rule in Elastic:
# sequence with maxspan=30m
#   [security where event.code == "1102"]
#   [system where event.provider == "Service Control Manager"
#    and event.code == "7036"
#    and winlog.event_data.param1 == "Winlogbeat"
#    and winlog.event_data.param2 == "running"]
level: critical
```

**KQL for gap detection (Elastic SIEM):**
```
# Separate rule: alert if Winlogbeat events stop for >30 minutes
# Implemented as a threshold rule on absence of events
# Index: winlogbeat-*
# Condition: count(agent.hostname: VRID-SRV-01) = 0 in last 30 minutes
# Alert: Winlogbeat log gap — possible log clearing or agent crash
```

### GOV-DET-NEW-005: VRID Full-Table Database Query by Contractor Service Account

```yaml
title: VRID Database Full-Table Query by Contractor Service Account
id: e5f60123-2934-1234-efab-234567890124
status: test
description: >
  Detects full-table SELECT on the VRID citizen_records table by any
  account when no WHERE clause is present, or when query originates
  from a contractor service account (SVC-HAVAYAIT-MAINT, etc.).
  Requires VRID DB audit log ingestion into SIEM.
tags:
  - attack.collection
  - attack.t1005
logsource:
  category: database
  product: mssql  # or relevant DB product
detection:
  selection_full_table:
    query_text|contains: 'FROM citizen_records'
    query_text|not_contains: 'WHERE'
  selection_contractor_account:
    db_user|startswith: 'SVC-HAVAYAIT'
    query_text|contains: 'biometric_hash'
  condition: selection_full_table or selection_contractor_account
falsepositives:
  - 'Scheduled nightly database backup jobs — add backup service account to filter'
level: critical
```

---

## Task 5 — Regulatory Compliance Matrix

> **Tools:** [TheHive](https://thehive-project.org/) *(open-source)* · [DFIR-IRIS](https://dfir-iris.org/) *(open-source)* · [Joplin](https://joplinapp.org/) *(open-source)*
>
> TheHive: map each notification obligation to a TheHive task with owner and deadline clock; track status (Met/At Risk/Missed) in real time against the 8-hour INCD clock and 72-hour PPL clock. DFIR-IRIS: the incident timeline doubles as a notification audit trail — every evidence collection and analytical decision is timestamped, which regulators may request for compliance verification. Joplin: locally encrypted note-taking for drafting the BDA preliminary report and PPA notification before submission — do not draft sensitive regulatory notifications in cloud document editors.

| Regulation | Trigger | Deadline | Clock Start | Status | Notes |
|---|---|---|---|---|---|
| INCD-CID Section 7(b) | CII system breach confirmed | 8 hours | 15:45 IST 18 March | **Met** (notified 17:00 IST — within window) | Administrative delay (Friedman unavailable until 17:00) is a process finding but did not breach deadline |
| Biometric Database Law (5769-2009) | Biometric data breach | 8 hours (BDA notification) | 15:45 IST 18 March | **Met** (BDA notified 23:30 IST) | 14-minute margin; very close |
| Biometric Database Law — Preliminary Report | Biometric data breach | 24 hours | 15:45 IST 18 March | **At risk** — preliminary report due 15:45 IST 19 March; investigation ongoing at that time | Prepare preliminary report with "investigation continuing" status |
| PPL (Israeli Privacy Protection Law) | Significant personal data breach | 72 hours (PPA) | 15:45 IST 18 March | **Met** — PPA notified within 72 hours | PPA notification sent 21 March 15:00 IST |
| PPL — Individual Notification | Large-scale personal data breach | "Reasonable timeframe" (PPL Article 17B) | PPA notification | **Pending** — 340,218 individuals; notification campaign preparation underway | Letter drafted (see Task 6) |
| MATZBEN Section 14 | Possible classified segment impact (data diode question) | 4 hours of suspected classified breach | Unknown — classified scope not confirmed | **Pending assessment** | INCD parallel investigation must confirm classified scope; classified track separate |

---

## Task 6 — INCD-CID Preliminary Notification (Draft)

> **Tools:** [Joplin](https://joplinapp.org/) *(open-source)* · [DFIR-IRIS](https://dfir-iris.org/) *(open-source)* · [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)*
>
> Joplin: draft the preliminary notification in locally encrypted notes — mandatory for content that will reference classified incident details before the classification level is confirmed. DFIR-IRIS: pull the incident timeline timestamps directly into the notification draft — ensures the notification accurately reflects confirmed vs. estimated times. LibreOffice Writer: format the final notification as a signed PDF per INCD-CID submission requirements; maintain local copies in the incident case file.

```
NDSA INCD-CID PRELIMINARY INCIDENT NOTIFICATION
Classification: SECRET // INCD-CID CHANNEL
Date/Time: 18 March 2025, 17:00 IST
INCD Unit Code: [FRIEDMAN-LIAISON-UNIT-CODE]
Submitting Officer: Col. (Res.) Dror Nativ, CISO, NDSA

1. INCIDENT CLASSIFICATION
   CII Breach — Unauthorized access and data exfiltration from critical
   national identity infrastructure. Severity: CRITICAL.

2. SYSTEMS AFFECTED
   VRID-SRV-01 (GOVNET Operational Segment) — eID Verification and Registry
   Identity Database server. GovID authentication platform not directly affected.
   GOVNET Classified Segment status: UNKNOWN (investigation pending).

3. ESTIMATED DATA SCOPE
   340,218 citizen records confirmed exfiltrated: full name, 9-digit teudat
   zehut, biometric hash value, last verification date. Classified segment
   scope cannot be confirmed without classified forensics access.

4. INITIAL ACCESS VECTOR
   Contractor supply chain: HavayaIT Systems Ltd. employee Amir Halevi;
   AiTM phishing via personal Gmail on 12 March 2025; NDSA VPN credentials
   extracted from compromised Microsoft 365 mailbox. First NDSA access:
   17 March 2025, 01:44 IST from 203.0.113.115 (Turkish exit node).

5. INDICATORS (TLP:RED — INCD distribution only)
   Source IP:  203.0.113.115 (initial access)
   C2 IP:      203.0.113.201
   C2 Domain:  govservice-cdn-updates[.]net
   Phishing:   gov-procurement-il-portal[.]net

6. CONTAINMENT STATUS
   - Halevi account: disabled as of 15:45 IST 18 March
   - C2 indicators: blocked at perimeter firewall
   - VRID-SRV-01: isolated from Contractor DMZ pending forensic completion
   - VPN access: all HavayaIT accounts suspended pending investigation
   - BDA notified: 23:30 IST 18 March

7. CONCURRENT INVESTIGATION
   NDSA IR Lead (Rotenberg) conducting forensic investigation.
   INCD parallel forensics team coordination requested.
   NOTE: INCD red team exercise artifacts (08 March 2025) present in
   classified segment logs — request deconfliction procedure.

8. NEXT STEPS
   Full forensic report: target 30 days (17 April 2025)
   Classified scope determination: pending INCD classified forensics access
   PPL individual notification: campaign in preparation

CONTACT: Col. (Res.) Dror Nativ, CISO | [secure line] | Available 24/7
INCD LIAISON: Lt. Col. (Res.) Oren Friedman | [unit contact]
```

---

## Task 7 — Executive Summary (Knesset Committee)

> **Tools:** [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)* · [Obsidian](https://obsidian.md/) *(free, local)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> LibreOffice Writer: format the Knesset committee summary as an UNCLASSIFIED PDF — this document will be distributed to committee members who are not cleared for classified findings; maintain strict separation from classified incident records. Obsidian: draft from linked notes that map technical findings to plain-language equivalents; use the same note structure to produce both the committee summary and the classified CISO version without duplication. OpenCTI: generate a sanitized intelligence report from the platform's structured data — strip classified indicators and ATT&CK detail before the public-facing export.

**National Digital Services Authority — Incident Summary**
*Prepared for the Knesset Interior Committee*
*Classification: UNCLASSIFIED | Date: 25 March 2025*

**What happened:** On the night of 17 March 2025, an unauthorized party accessed NDSA's national digital identity system through the credentials of an employee of HavayaIT Systems Ltd., one of our authorized IT contractors. The intruder copied records containing the names, national ID numbers, and biometric identifiers of 340,218 Israeli citizens.

**How did it happen:** The contractor's employee received a deceptive email on 12 March that looked like an official government procurement notice. By clicking a link in the email, his work account was compromised. The intruder spent 5 days reading that email account and identifying the contractor's access credentials to NDSA's systems. On 17 March, the intruder used those credentials to log in during the early morning hours and extract the citizen records over approximately 4 hours.

**Who did it:** Based on our investigation, this attack is consistent with the methods used by state-sponsored actors who have targeted Israeli government systems in the past. We are working with INCD and law enforcement to confirm the identity of the perpetrators. We are not in a position to make a public attribution at this time.

**What NDSA knew in advance:** On 10 March 2025, NDSA received a classified advisory from INCD warning that actors were targeting Israeli government contractor companies as a way to reach government systems. This advisory was shared with the Director-General and the CISO. It did not include specific indicators pointing to NDSA or HavayaIT. A review of whether this advisory should have been acted on more urgently is included in our lessons-learned report.

**What we did:** All relevant authorities were notified — INCD within the required timeframe, the Biometric Database Authority within the required timeframe, and the Privacy Protection Authority. HavayaIT's system access has been suspended. We are cooperating with a parallel investigation by INCD. We are notifying all 340,218 affected citizens.

**What we are doing to prevent recurrence:** We have identified 13 technical improvements to our monitoring systems. We have imposed stricter security requirements on all contractors with privileged access. We have corrected the process gaps that contributed to this incident. Full details are available in the CISO's technical report.
