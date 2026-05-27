# Solution: Assignment 1 — Reactive CTI: LifeTech Pharma Incident

> **Model answer. All data is fictional.**

---

## Task 1 — Incident Timeline

> **Tools:** [Velociraptor](https://docs.velociraptor.app/) *(open-source)* · [Timesketch](https://timesketch.org/) *(open-source)* · [Plaso / log2timeline](https://github.com/log2timeline/plaso) *(open-source)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [TheHive](https://thehive-project.org/) *(open-source)*
>
> Velociraptor: collect `.evtx` from WS-IT-LEVI and other hosts without rebooting; query remotely using VQL for specific event IDs across the timeline window. Timesketch: collaborative super-timeline analysis — import Plaso output, tag adversary events, add analyst comments, and share with the IR team. Plaso / log2timeline: ingest Winlogbeat JSON, VPN logs, PAM exports, and firewall logs into a single normalized timeline automatically. Hayabusa: parse raw `.evtx` directly to CSV — especially useful for the Sysmon gap window where log2timeline may not have events. TheHive: case management with evidence custody chain; attach evidence files and track who processed each source.

### Evidence Inventory

| Source | Systems | Time Range | Gap | Usability |
|---|---|---|---|---|
| Winlogbeat (Windows Event Log) | WS-IT-LEVI, DC-01, FILE-SRV-01 | 2024-11-14 00:00–2024-11-16 18:00 | WS-IT-LEVI: 03:00–07:00 IST on 15 Nov (Sysmon crash) | High |
| Palo Alto VPN | vpn-gw-01 | 2024-11-01–2024-11-16 | None | High |
| CyberArk PAM | JUMPHOST-01 | 2024-11-14 22:00–2024-11-15 06:00 | None | High (session recording intact) |
| DNS resolver | All segments | 2024-11-14–2024-11-16 | None | High |
| Firewall (NGFW) | Internet boundary | 2024-11-14–2024-11-16 | HTTPS inspection not enabled for lifetechpharma-corp[.]eu | Medium |
| Email gateway | All users | 2024-11-13–2024-11-15 | None | High |

**Critical gap — WS-IT-LEVI Sysmon crash:** The 4-hour gap covers the exact window of VPN logon anomaly from Istanbul. This gap is evidenced by Sysmon service stop at 03:02 IST and restart at 07:14 IST (Service Control Manager EID 7036). Windows Event Log (non-Sysmon) continued capturing; gap affects process creation and network connection events only, not logon events.

**Gap impact statement:** *"The WS-IT-LEVI Sysmon gap prevents reconstruction of process execution between 03:02 and 07:14 IST on 15 November. Logon events (EID 4624/4648) remained captured. The initial staging activity on this host cannot be confirmed from SIEM. PAM session recording is the primary source for this window."*

---

### Unified Incident Timeline

| # | Timestamp (IST) | System | Source | Event | Account | Indicator | ATT&CK | Conf | Note |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 2024-11-13 09:14 | m.cohen workstation | Email gateway | Received email: "DocuSign — LifeTech_Partnership_Invoice.docx" from `noreply@lifetechpharma-corp[.]eu` | m.cohen | `lifetechpharma-corp[.]eu` (lookalike) | T1566.001 | High | Phishing lure; lookalike domain registered 5 days prior |
| 2 | 2024-11-13 09:31 | m.cohen workstation | Winlogbeat | EID 4688: `winword.exe` spawns `cmd.exe` → `powershell.exe -enc [base64]` | m.cohen | Encoded PowerShell child of Word | T1059.001 | High | Macro execution; base64 payload |
| 3 | 2024-11-13 09:32 | m.cohen workstation | DNS | Query: `uslifepartner-group[.]com` → 198.51.100.44 | SYSTEM | `uslifepartner-group[.]com` (C2 domain) | T1071.001 | High | First C2 beacon after macro |
| 4 | 2024-11-13 09:33 | m.cohen workstation | Firewall | HTTPS POST to 198.51.100.44:443 (212 bytes — likely beacon checkin) | — | 198.51.100.44 | T1071.001 | High | HTTPS beacon; no inspection |
| 5 | 2024-11-13 09:45–18:30 | m.cohen workstation | Firewall | Periodic HTTPS beacons to 198.51.100.44 every ~47 minutes | — | 198.51.100.44 | T1071.001 | High | Beacon interval consistent across day |
| 6 | 2024-11-14 22:05 | VPN GW | VPN logs | VPN auth: user `p.levi`; source IP 185.220.100.77 (Istanbul, Turkey; residential VPN exit); MFA bypassed (session token replay — AiTM) | p.levi | 185.220.100.77; AiTM session | T1557; T1133 | High | 04:05 IST equivalent; off-hours logon; source anomalous |
| 7 | 2024-11-14 22:11 | JUMPHOST-01 | PAM | RDP session opened to JUMPHOST-01 using p.levi credentials | p.levi | Session PAM-20241114-2211 | T1021.001 | High | PAM recording starts |
| 8 | 2024-11-14 22:14 | JUMPHOST-01 | PAM | `net user /domain`; `net group "Domain Admins" /domain`; `ipconfig /all` | p.levi | Discovery commands | T1087.002; T1016 | High | Standard initial recon pattern |
| 9 | 2024-11-14 22:22 | WS-IT-LEVI | Winlogbeat | EID 4624 Type 10 (RDP): logon from JUMPHOST-01; p.levi → WS-IT-LEVI | p.levi | Lateral RDP | T1021.001 | High | IT admin workstation targeted |
| 10 | 2024-11-14 22:31 | WS-IT-LEVI | Winlogbeat | EID 4688: `rundll32.exe comsvcs.dll MiniDump [LSASS_PID] C:\Windows\Temp\lsass.dmp full` | p.levi (elevated) | comsvcs.dll LSASS dump | T1003.001 | High | GrantedAccess 0x1410; dump created |
| 11 | 2024-11-14 22:35 | WS-IT-LEVI | Winlogbeat | EID 4688: `mimikatz.exe` execution (detected post-mortem; AMSI log) | p.levi (elevated) | mimikatz.exe in `C:\ProgramData\` | T1003.001 | High | Likely credential extraction from dump |
| 12 | 2024-11-14 22:48 | DC-01 | Winlogbeat | EID 4742 (Computer Account Changed); EID 4662 with properties `{1131f6aa...}` (Replication-Get-Changes-All) | p.levi | DCSync indicators | T1003.006 | High | DCSync using p.levi Replicating Directory Changes All privilege |
| 13 | 2024-11-14 23:02 | FILE-SRV-01 | Winlogbeat | EID 4688: `robocopy.exe` targeting `\\FILE-SRV-01\R&D_Confidential\USPartner2024` | p.levi | robocopy staging to local temp | T1039 | High | R&D share access; USPartner2024 folder (47 files; 2.3 GB) |
| 14 | 2024-11-14 23:11 | WS-IT-LEVI | Winlogbeat | EID 7045: new service `WindowsUpdateAgent`; path `C:\ProgramData\svchost.exe` | SYSTEM | Non-standard service + path | T1547.001 (via service) | High | Persistence mechanism installed |
| 15 | 2024-11-14 23:14 | WS-IT-LEVI | DNS | DNS query: `uslifepartner-group[.]com` from WS-IT-LEVI (previously only from m.cohen workstation) | SYSTEM | `uslifepartner-group[.]com` | T1071.001 | High | Malware pivoted to IT admin host |
| 16 | 2024-11-14 23:18–02:47 | WS-IT-LEVI | Firewall | Staged HTTPS uploads to 198.51.100.44:443; 8 sessions; total ~2.4 GB | — | 2.4 GB outbound | T1041 | High | Data exfiltration; multiple chunks |
| 17 | 2024-11-15 03:02 | WS-IT-LEVI | Winlogbeat | Sysmon service stop (EID 7036) — Sysmon crash begins 4-hour gap | — | Sysmon gap | — | High | Gap starts |
| 18 | 2024-11-15 03:14 | WS-IT-LEVI | Winlogbeat | EID 1102 (Audit log cleared) — wevtutil cl; Security, System, Application | SYSTEM | wevtutil | T1070.001 | High | Log clear; EID 1102 is post-clear residual |
| 19 | 2024-11-15 07:14 | WS-IT-LEVI | Winlogbeat | Sysmon restarts (EID 7036) | — | Sysmon restart | — | High | Gap ends |
| 20 | 2024-11-15 10:47 | WS-IT-LEVI | SOC ticket | SOC analyst notices log gap in Elastic; creates P3 ticket | — | Detection via gap | — | — | Detection starts |
| 21 | 2024-11-15 11:33 | VPN GW | VPN logs | Second VPN session p.levi from same Istanbul IP; 18-minute session; 0.4 MB in / 2.1 MB out | p.levi | 185.220.100.77 | T1133 | High | Likely verification beacon |
| 22 | 2024-11-15 14:17 | — | IR Lead decision | IR Lead Noa Ben-David escalates to CISO; P3 ticket → P1 incident | — | Escalation | — | — | Incident declared |

**Dwell time:**
- Confirmed (first adversary action to containment): 13 Nov 09:31 → 15 Nov 14:17 = **52 hours 46 minutes**
- Worst case (potential pre-phishing recon undetected): possibly earlier; domain was registered 8 Nov = **up to 6+ days**

---

## Task 2 — ATT&CK Mapping

> **Tools:** [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)*
>
> ATT&CK Navigator: create a layer from the 12 extracted techniques; color-code by detection status (green = fired, yellow = partial, red = no coverage) — makes the 0/12 coverage gap immediately visible. DeTT&CT: score each technique against available data sources to distinguish "rule missing" from "log source missing." OpenCTI: link the technique table to the threat actor profile and campaign object for intelligence traceability. MISP: tag MISP event indicators with ATT&CK Galaxy entries to produce a structured export for partner sharing.

| # | Tactic | Technique | Sub | Evidence | Conf | Detection | Fired? | Failure |
|---|---|---|---|---|---|---|---|---|
| 1 | Initial Access | T1566.001 | — | Email gateway: lookalike domain `lifetechpharma-corp[.]eu`; Word macro execution | High | Email gateway rule (blocked EXE, not macro) | Partial | Macro-in-Word not blocked; only EXE attachment rule existed |
| 2 | Execution | T1059.001 | — | EID 4688: `powershell.exe -enc` child of `winword.exe` | High | None | No | No PowerShell child-of-Office rule deployed |
| 3 | Credential Access | T1557 (AiTM) | — | VPN session from Istanbul; session token replay bypassing TOTP | High | None | No | No impossible travel / ASN anomaly rule on VPN |
| 4 | Credential Access | T1003.001 | comsvcs.dll | EID 4688: `rundll32.exe comsvcs.dll MiniDump`; GrantedAccess 0x1410 | High | None | No | No LSASS access rule deployed |
| 5 | Credential Access | T1003.006 | — | EID 4662 with `Replication-Get-Changes-All` GUID on DC-01 | High | None | No | DCSync rule not deployed |
| 6 | Lateral Movement | T1021.001 | — | EID 4624 Type 10: JUMPHOST-01 → WS-IT-LEVI | High | GOV-DET-002 equivalent | Partial | Rule deployed but 30-min delay; did not alert during incident |
| 7 | Persistence | T1547.001 | via service | EID 7045: `WindowsUpdateAgent` service; non-standard path | High | None | No | No service install from non-standard path rule |
| 8 | Persistence | T1197 | — | BITS job used for beacon communication (inferred from beacon pattern) | Medium | None | No | BITS rule not deployed |
| 9 | Collection | T1039 | — | EID 4688: `robocopy.exe` targeting R&D share | High | None | No | No bulk file access rule on FILE-SRV-01 |
| 10 | Exfiltration | T1041 | — | 2.4 GB HTTPS to 198.51.100.44 over 3 hours; 8 sessions | High | None | No | No large outbound data rule; HTTPS inspection disabled |
| 11 | Defense Evasion | T1070.001 | — | EID 1102 (post-clear residual); Sysmon gap correlates with wevtutil timing | High | None | No | No wevtutil + Sysmon restart correlation rule |
| 12 | Command & Control | T1071.001 | — | Periodic HTTPS beacons to 198.51.100.44 every ~47 min; DNS queries to `uslifepartner-group[.]com` | High | None | No | No beacon interval / domain reputation rule |

**Detection coverage: 0 / 12 techniques had a working detection that fired. 1 partial (lateral movement rule exists but fired too slowly).**

**Most critical gap:** T1557 AiTM credential bypass — the attack's pivotal technique. Valid credentials from a legitimate user bypassed all authentication controls. An impossible-travel or ASN-anomaly VPN rule would have caught the Turkish IP 4 hours after initial VPN access and potentially 12 hours before data exfiltration began.

---

## Task 3 — Threat Actor Assessment

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [Maltego CE](https://www.maltego.com/maltego-community/) *(freemium)* · [VirusTotal](https://www.virustotal.com/) *(freemium)* · [Shodan](https://www.shodan.io/) *(freemium)*
>
> OpenCTI: build a structured graph linking C2 infrastructure (198.51.100.44, `uslifepartner-group[.]com`) → observed techniques → campaign → assessed threat cluster; reuse in future attribution comparison. MISP: create a MISP event with all indicators; tag with ATT&CK Galaxy and Threat Actor Galaxy entries for cross-organization correlation. Maltego CE: pivot from the C2 IP to ASN, registrant data, and co-hosted domains to find additional infrastructure patterns. VirusTotal: check prior use of C2 domains and IP — prior detections or passive DNS records that link to other campaigns. Shodan: query the C2 IP for exposed services and TLS certificate data — certificate CN/SAN may reveal additional actor infrastructure.

### Campaign Overview
LifeTech Pharma Ltd. experienced a targeted intrusion between 13 November (initial phishing) and 15 November 2024 (detection). The adversary gained persistent access through a CFO credential via an AiTM phishing campaign, pivoted to the IT administration host, extracted domain credentials via DCSync, and exfiltrated approximately 2.4 GB of R&D data from the USPartner2024 licensing folder containing 47 files related to a $52M US licensing transaction.

### Tradecraft Summary
- **Access:** AiTM phishing via lookalike domain against CFO m.cohen; session token replay on VPN bypassing TOTP
- **Pivot:** DCSync using compromised IT admin account to obtain domain credentials; RDP lateral movement to WS-IT-LEVI
- **Collection and exfiltration:** robocopy staging of targeted R&D share; HTTPS exfiltration to `uslifepartner-group[.]com` / 198.51.100.44 in 8 staged chunks

### Attribution Assessment

**Confidence:** Medium — Admiralty B3

**Supporting evidence:**
- AiTM phishing targeting Israeli pharmaceutical company with US licensing partnerships is consistent with Iranian-nexus espionage interest in Israeli tech sector (publicly documented by ClearSky 2023-2024)
- Lookalike domain registered 5 days before use; registered via privacy-protected registrar; similar registration pattern to documented Iranian-nexus infrastructure
- Dual motivation (IP theft + potential financial disruption of licensing deal) consistent with assessed Iranian-nexus interest in disrupting Israeli-US commercial technology partnerships
- Victim selection logic (pharma company with US licensing deal valued at $52M) consistent with strategic IP theft objective

**Against attribution:**
- No confirmed tooling overlap with specific named groups (mimikatz is not distinctive; robocopy is benign)
- Infrastructure (198.51.100.44) has no prior attribution in public threat reporting
- No Iranian-language artifacts or operational security failures that confirm origin

**Model attribution statement:**
> *"The observed tradecraft — specifically AiTM phishing targeting Israeli commercial technology sector, session token replay bypassing MFA, and targeted exfiltration of active partnership documentation — demonstrates medium-confidence overlap with publicly documented Iranian-nexus commercial espionage operations against Israeli pharma and technology companies. However, the infrastructure (198.51.100.44) has no prior attribution in public reporting, and mimikatz/robocopy usage is not distinctive. Assessment: assessed as a state-affiliated or state-tasked actor with dual espionage and commercial disruption motivation, consistent with Iranian-nexus targeting patterns; insufficient evidence for definitive attribution to a named group. Confidence: Medium (B3). Confidence would increase materially if: malware code-sharing or infrastructure overlap with known campaigns is identified; or additional victims in the same sector are identified using the same C2 infrastructure."*

---

## Task 4 — Detection Rules

> **Tools:** [Sigma](https://sigmahq.io/) *(open-source)* · [Uncoder.io](https://uncoder.io/) *(free web tool)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)* · [Elastic Security](https://www.elastic.co/security) *(open-source core)*
>
> Sigma: write all 4 rules in vendor-neutral YAML; convert to Elastic KQL or Splunk SPL with pySigma for immediate deployment. Uncoder.io: paste the Sigma YAML and get a ready-to-deploy Elastic KQL query — eliminates manual field mapping translation. Hayabusa: validate each rule against the collected LifeTech Pharma `.evtx` files before production deployment — confirms the rule fires on the known TP events. Chainsaw: run a rapid Sigma-based scan on the collected event logs to verify raw evidence exists for each technique before blaming rule logic. Elastic Security: deploy all 4 rules via the detection engine API; test with KQL equivalents against the incident index before activating.

### DET-001: PowerShell Execution as Child of Microsoft Office

```yaml
title: PowerShell Spawned by Microsoft Office Application
id: a3b91c2d-4e5f-6789-abcd-ef0123456789
status: test
description: >
  Detects PowerShell spawned directly by a Microsoft Office application.
  Common in malicious macro execution. Based on LifeTech Pharma incident (Nov 2024).
author: LifeTech Pharma CTI
date: 2024/11/20
tags:
  - attack.execution
  - attack.t1059.001
  - attack.initial_access
  - attack.t1566.001
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith:
      - '\powershell.exe'
      - '\cmd.exe'
    ParentImage|endswith:
      - '\winword.exe'
      - '\excel.exe'
      - '\outlook.exe'
      - '\powerpnt.exe'
  condition: selection
falsepositives:
  - 'Legitimate macro automation in controlled environments — suppress by ParentCommandLine whitelist'
level: high
fields:
  - Image
  - CommandLine
  - ParentImage
  - ParentCommandLine
  - User
  - ComputerName
```

**KQL:**
```
process.executable: (*\\powershell.exe OR *\\cmd.exe)
AND process.parent.executable: (*\\winword.exe OR *\\excel.exe OR *\\outlook.exe OR *\\powerpnt.exe)
```

---

### DET-002: comsvcs.dll LSASS Memory Dump

```yaml
title: LSASS Memory Dump via comsvcs.dll MiniDump
id: b4c02d3e-5f60-7890-bcde-f01234567890
status: test
description: >
  Detects LSASS memory dump using the comsvcs.dll MiniDump export via rundll32.
  Evidenced in LifeTech Pharma incident; GrantedAccess 0x1410.
author: LifeTech Pharma CTI
date: 2024/11/20
tags:
  - attack.credential_access
  - attack.t1003.001
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\rundll32.exe'
    CommandLine|contains|all:
      - 'comsvcs.dll'
      - 'MiniDump'
  condition: selection
falsepositives:
  - 'Legitimate crash dump collection — rare; suppress by ParentImage if from known crash reporter'
level: critical
fields:
  - Image
  - CommandLine
  - ParentImage
  - User
  - ComputerName
```

---

### DET-003: DCSync via Directory Replication Rights

```yaml
title: DCSync Attack — Replication Get Changes All
id: c5d13e4f-6071-8901-cdef-012345678901
status: test
description: >
  Detects DCSync by monitoring for EID 4662 with the Replication-Get-Changes-All
  access right GUID, performed by a non-DC computer account.
author: LifeTech Pharma CTI
date: 2024/11/20
tags:
  - attack.credential_access
  - attack.t1003.006
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4662
    Properties|contains:
      - '1131f6aa-9c07-11d1-f79f-00c04fc2dcd2'
      - '1131f6ad-9c07-11d1-f79f-00c04fc2dcd2'
      - '89e95b76-444d-4c62-991a-0facbeda640c'
  filter_dc:
    SubjectUserName|endswith: '$'
  condition: selection and not filter_dc
falsepositives:
  - 'Azure AD Connect sync accounts — add to filter by SubjectUserName'
  - 'Veeam / backup software with AD replication rights — add to filter'
level: critical
fields:
  - SubjectUserName
  - Properties
  - ObjectDN
  - ComputerName
```

---

### DET-004: VPN Logon from Non-Corporate ASN (Impossible Travel)

```yaml
title: VPN Authentication from Non-Corporate ASN
id: d6e24f50-7182-9012-defa-123456789012
status: experimental
description: >
  Detects VPN authentication from an IP address whose ASN does not match
  the organization's known corporate office ASNs. Requires ASN enrichment field.
  Based on AiTM credential theft pattern (LifeTech Pharma, Nov 2024).
author: LifeTech Pharma CTI
date: 2024/11/20
tags:
  - attack.initial_access
  - attack.t1133
  - attack.credential_access
  - attack.t1557
logsource:
  category: firewall
  product: palo_alto_globalprotect
detection:
  selection:
    event_type: 'globalprotect'
    status: 'success'
  filter_known_asn:
    source_asn:
      - 'AS[corporate_office_ASN_1]'
      - 'AS[corporate_office_ASN_2]'
  condition: selection and not filter_known_asn
falsepositives:
  - 'Employees working from hotels, ISPs, or mobile data — high FP without additional context'
  - 'Tuning: combine with off-hours condition to reduce FP rate significantly'
level: medium
fields:
  - user
  - source_ip
  - source_asn
  - source_country
  - timestamp
```

*Note: Effective ASN-based VPN rules require enrichment. Add `source_asn` field via MaxMind GeoIP or similar in the Elastic ingest pipeline.*

---

## Task 5 — Executive Summary (for CISO/Board)

> **Tools:** [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)* · [Obsidian](https://obsidian.md/) *(free, local)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> LibreOffice Writer: format the final one-page executive summary as a PDF for distribution — keep the document local if it contains incident details not yet cleared for cloud systems. Obsidian: draft in plain markdown with local encryption; link technical findings to the executive narrative without duplicating content. OpenCTI: generate a tiered intelligence report from the structured incident data — the executive summary is the top tier; the technical report is the same data with ATT&CK IDs and log excerpts shown.

**LifeTech Pharma — Security Incident Summary**
*Prepared for: Dr. Yael Mizrahi, CISO*
*Date: 20 November 2024 | Classification: Internal Confidential*

**What happened:** Between November 13 and 15, 2024, an unauthorized party gained access to LifeTech Pharma's internal network by tricking our CFO into providing access credentials through a fake email that looked like it came from a business partner. Using those credentials, the attacker reached an IT administrator's computer and copied approximately 2.4 gigabytes of files from our US licensing partnership folder — specifically the 47 documents related to the USPartner2024 transaction.

**Who did it:** The attack method and the targeting of active licensing deal documentation is consistent with state-affiliated actors that have previously targeted Israeli pharmaceutical companies to steal intellectual property. We assess with medium confidence that this was an intelligence-motivated attack, not financially motivated cybercrime. We cannot name a specific group without additional evidence.

**What was taken:** Research and licensing documents from the USPartner2024 folder. Legal hold has been placed on the relevant systems. Our US counsel has been notified regarding the potential impact on the licensing agreement.

**What has been done:** The compromised accounts have been disabled. The attacker's two known server addresses have been blocked. External VPN access has been temporarily restricted to approved corporate networks only.

**Immediate obligations:**
- Israeli Privacy Protection Law (PPL) — breach notification to the Privacy Protection Authority within 72 hours of confirmed scope determination
- US licensing partner notification — per the partnership agreement confidentiality clause; counsel is reviewing timing
- Israeli Drug Registration Regulations — no immediate notification obligation triggered; no clinical or regulatory submissions were accessed

**What is being done to prevent recurrence:** We have identified 12 detection rules that did not exist at the time of the incident. Engineering is deploying them this week. A vendor security assessment of our VPN and email gateway is underway.
