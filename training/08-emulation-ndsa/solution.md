# Solution: Assignment 8 — Adversary Emulation (Gov): NDSA Detection Validation

> **Model answer. All data is fictional.**

---

## Task 1 — Pre-Emulation Planning

> **Tools:** [Atomic Red Team](https://github.com/redcanaryco/atomic-red-team) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [MITRE CALDERA](https://caldera.mitre.org/) *(open-source)*
>
> Atomic Red Team: identify the exact atomic test IDs for each of the 11 techniques before submitting the INCD pre-notification — the Security Officer's plain-language approvals reference specific commands, which must be known in advance. VECTR: document all 11 test modules with target systems, execution accounts, pass criteria, and safety considerations before any lab access — the module design is the authorization document reviewed by INCD. ATT&CK Navigator: create the pre-notification technique layer (all 11 modules color-coded by tactic) — the Navigator export is the technique list submitted to INCD. MITRE CALDERA: plan the 11-module scenario as a CALDERA adversary profile before execution; allows INCD reviewers to see the planned execution sequence in a structured format.

### INCD Section 8 Pre-Notification Package

```
NDSA — INCD-CID SECTION 8 ADVERSARY EMULATION PRE-NOTIFICATION
Classification: CONFIDENTIAL — INCD CHANNEL
Date: [5 business days before exercise]
Submitted by: Col. (Res.) Dror Nativ, CISO, NDSA
INCD Liaison: Lt. Col. (Res.) Oren Friedman

1. EXERCISE IDENTIFICATION
   Title: NDSA Annual Detection Validation Exercise 2026
   Authority: INCD-CID Section 8 annual requirement
   INCD notification code: [to be assigned]

2. SCOPE
   Systems: Lab replicas only.
     - JUMPHOST-CONTRACTOR-LAB (replica of JUMPHOST-CONTRACTOR-01)
     - VRID-LAB-SRV (replica of VRID-SRV-01)
     - NDSA-CONTRACTOR-VPN-TEST (isolated test gateway)
     - GovID 2.0 Frontend Lab Cluster (isolated, no production data)
   Production systems: NOT in scope. Zero interaction with production.
   GOVNET Classified Segment: NOT in scope; no lab equivalent.

3. TECHNIQUES TO BE TESTED (plain language)
   T1: VPN logon simulation from non-corporate network location
   T2: Internal network discovery commands after VPN access
   T3: Remote desktop connection between network segments
   T4: Memory access attempt on security process (credential dumping)
   T5: Background file transfer to external test server
   T6: System service creation in unusual folder
   T7: Windows registry startup entry modification (user-level)
   T8: Database query tool misuse — full record export
   T9: Large-volume data transfer to external test server
   T10: PowerShell with encoded command
   T11: Security log clearing

4. EXECUTION TEAM
   Internal: NDSA SOC (Gila Ben-Moshe, lead) + CTI Lead (Shai Rotenberg)
   External: CyberShield Ltd. red team (2 engineers; NDSA contractor clearance)
   Note: CyberShield does not have MATZBEN clearance; operates in lab only.

5. CONTAINMENT MEASURES
   - All lab systems on isolated VLAN with no production network routing
   - External C2 server: CyberShield-controlled test domain (IP confirmed
     to NDSA and INCD in advance; pre-blocked on production perimeter)
   - All test commands logged to a separate evidence store
   - Exercise director (Rotenberg) has authority to halt any module

6. EXERCISE WINDOW
   Date: [date]; 08:00–17:00 IST
   Emergency halt contact: Col. Nativ [secure line]
   INCD acknowledgment requested by: [date - 2 business days]
```

---

### Security Officer Approval Package (Maj. Cohen — Plain Language)

| Module | Plain Title | What It Does | System Risk | If Something Goes Wrong | Safety Measures |
|---|---|---|---|---|---|
| MOD-01 | Simulated contractor login from wrong location | We log in to a test VPN using a test account from an internet connection instead of the office. We check if our alarm system notices. | **None** — test VPN only; no production access | No production effect possible | Test VPN is isolated; cannot route to production |
| MOD-02 | Looking around the network after login | After logging into the test network, we run standard commands to look up users and computers. We check if our system notices this reconnaissance. | **None** — read-only commands; test environment | These commands only read; cannot damage anything | Test domain only; read-only |
| MOD-03 | Moving between network areas via remote desktop | We use Remote Desktop to connect from one test computer to another, crossing a simulated security boundary. | **None** — test computers only | Test system may require restart if RDP crashes | Lab isolation; rollback: reboot |
| MOD-04 | Accessing security process memory (credential check) | We attempt to read a Windows security process to see if we can extract a password — the same technique used in the March 2025 incident. This is done on a test computer with no real credentials. | **Low** — test computer only; dump file immediately deleted | Dump file is deleted at end of module regardless of outcome | Dump file written to isolated temp folder; deleted after test; test machine has no real credentials |
| MOD-05 | Background file download from test server | We run the same background download command used in the March 2025 attack, downloading a harmless test file from a server we control. | **Low** — test file is a text document; no code execution | Test file is not executable; cannot spread | Test file pre-verified as benign; lab machine only |
| MOD-06 | Installing a test service in an unusual folder | We create a Windows service that starts from a non-standard folder, mimicking how attackers persist on systems. The service does nothing. | **Low** — service runs a benign "echo" command; removed after test | Service removed immediately after test; no function | Service uninstalls automatically at module end |
| MOD-07 | Adding a startup entry in the registry | We write a startup entry in a user's registry to run a harmless test file automatically. We check if our alarm notices this persistence method. | **Low** — test machine only; entry deleted after test | Registry entry is reverted after test | Automated cleanup script runs after module |
| MOD-08 | Running a test database query | We run a full-table database query on a test database containing fake data. We check if our system notices unusual query patterns. | **None** — test database with synthetic data | Test database only; no real citizen records anywhere in lab | Verified synthetic data before exercise; no real data in lab |
| MOD-09 | Sending a large test file to our test server | We transfer 100MB of dummy data to a server we control, simulating the way attackers sent stolen files in March 2025. | **None** — test data only; sent to our own server | Our own server receives the file; no external party involved | Test data has no real content; server is NDSA/CyberShield controlled |
| MOD-10 | Running a PowerShell command with encoded text | We run a PowerShell script where the commands are hidden in encoded text, the same way malware hides its activity. The command just prints "test". | **None** — the script only prints text | Nothing to recover; no effect | Script pre-verified; only outputs text; no system changes |
| MOD-11 | Clearing the security log (RUN LAST) | We delete the Windows security log — exactly as the attacker did in March 2025 — and check if our alarm fires. **This is run last so it does not erase evidence of earlier tests.** | **Low** — test machine security log is cleared; no production impact | Production logs are on separate systems; lab log clearing does not affect them | Lab logs backed up before this module; production isolated |

---

### Change Request Package (Draft Rules GOV-DET-006 through GOV-DET-009)

**CR-2026-CTI-001: Deploy GOV-DET-006 — Bulk API Extraction Detection**

| Field | Content |
|---|---|
| Change Type | Deploy new SIEM detection rule |
| Priority | High |
| Systems Affected | Elastic SIEM; GovID 2.0 Frontend Cluster (API log ingestion) |
| Business Justification | INCD Section 8 compliance; P1 gap from Assignment 6 threat modeling |
| Rollback Plan | Delete rule from SIEM; no system changes required |
| Risk of Not Deploying | Zero detection for bulk biometric extraction — primary Iranian-nexus attack vector |
| Test Evidence | MOD-07 lab results (to be appended after exercise) |

*(GOV-DET-007, -008, -009 follow same CR structure — omitted for brevity)*

---

## Task 2 — Emulation Execution and Results

> **Tools:** [Invoke-AtomicRedTeam](https://github.com/redcanaryco/invoke-atomicredteam) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)* · [Elastic Security / Kibana](https://www.elastic.co/security) *(open-source core)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)*
>
> Invoke-AtomicRedTeam: execute atomics with `--ExecutionLogPath` flag to save a timestamped execution log per module — this is the execution record submitted to INCD for deconfliction. VECTR: record PASS/PARTIAL/FAIL per module in real time; log detection time, alert fields captured, and root cause for every failure. Elastic Security: primary detection validation surface — query the SIEM alert index after each module execution; confirm alert fields against the pass criterion. Hayabusa: when Elastic doesn't fire, run Hayabusa against the lab host `.evtx` immediately — distinguishes "rule didn't fire" from "event wasn't logged" before declaring a failure. Chainsaw: rapid Sigma scan of local `.evtx` to confirm raw evidence exists for each technique before blaming the SIEM rule or ingest pipeline.

### Test Results Table

| Module | Technique | Expected | Actual | Time to Detect | Alert Fields | Result | Root Cause (failures) |
|---|---|---|---|---|---|---|---|
| MOD-01 | T1133 VPN off-hours/non-ASN | Alert ≤5 min | Alert at 2 min | 2 min | user, source_ip, source_asn, timestamp | **PASS** | — |
| MOD-02 | T1087.002 + T1016 Discovery | No alert (gap test) | No alert | — | — | **FAIL (gap confirmed)** | No net.exe detection rule deployed |
| MOD-03 | T1021.001 RDP DMZ→Ops | Alert ≤35 min | Alert at 28 min | 28 min | src_host, dst_host, user | **PARTIAL** | logon_type field absent in alert; pipeline mapping gap |
| MOD-04 | T1003.001 LSASS comsvcs | Alert ≤5 min (TP) + suppressed (FP) | TP: alert at 3 min; FP: no alert | 3 min | GrantedAccess, Image, CommandLine | **PASS** (both TP and FP test) | — |
| MOD-05 | T1197 BITS download | Alert ≤10 min | Alert at 6 min; src_host missing | 6 min | job_name, dst_domain | **PARTIAL** | Winlogbeat agent.hostname vs host.name field mapping |
| MOD-06 | T1543.003 Service from Temp | Alert ≤5 min | Alert at 4 min | 4 min | ServiceName, ServiceFileName, path_flag | **PASS** | — |
| MOD-07 | T1547.001 Registry HKCU | Alert ≤5 min | No alert | — | — | **FAIL** | Sysmon config covers HKLM only; HKCU gap |
| MOD-08 | T1005 DB full-table | Alert ≤5 min | Alert at 3 min | 3 min | query_text, db_user, table_name | **PASS** | — |
| MOD-09 | T1041 Exfil volume | Alert ≤10 min | No alert | — | — | **FAIL** | No exfiltration volume rule deployed |
| MOD-10 | T1059.001 PowerShell enc | Alert ≤5 min | Alert at 1 min | 1 min | CommandLine, decoded_command | **PASS** | — |
| MOD-11 | T1070.001 Log clear | Alert ≤2 min | Alert at 1 min | 1 min | EventID 1102, host, timestamp | **PASS** | — |

**Summary: 6 PASS / 2 PARTIAL / 3 FAIL**
- Pass rate (full only): 55% (6/11)
- Pass rate (full + partial): 73% (8/11)

---

### Detection Failure Analyses

**MOD-02 — Net.exe Discovery: Gap Confirmed**

*Failure type:* Rule missing — no detection for `net.exe` domain enumeration commands

*Specific condition:* `net user /domain` and `net group "NDSA-VRID-Admins" /domain` execute as standard Windows commands. No Sigma rule or KQL query monitors for these in any NDSA SIEM index.

*Risk:* In the March 2025 incident, this reconnaissance phase took 8 minutes and provided the actor with full knowledge of the VRID access group membership — a necessary precondition for the lateral movement that followed. This phase was completely invisible. An actor entering NDSA's contractor network today would complete this reconnaissance with zero detection.

*Remediation:* Deploy net.exe enumeration rule (see corrected rules section). Effort: 1 day.

---

**MOD-03 — RDP Lateral Movement: logon_type Field Missing**

*Failure type:* Rule logic partially correct; field mapping gap in Elastic ingest pipeline

*Specific condition:* The Elastic ingest pipeline for Winlogbeat EID 4624 does not map the `LogonType` raw field to the normalized `winlog.event_data.LogonType` ECS field consistently. The alert fires correctly (the IP-based boundary crossing is detected), but the alert lacks the `logon_type` field, which is required to distinguish an RDP logon (Type 10) from a network logon (Type 3) in the SOC review workflow.

*Risk:* Alert fires but SOC analyst cannot immediately classify severity without manual log lookup. Adds 5–10 minutes to response. Acceptable for 4-hour dwell times; not acceptable for fast attackers.

*Remediation:* Add Elastic ingest processor: `field: winlog.event_data.LogonType → target_field: event.outcome_detail`. Same pipeline fix resolves both MOD-03 and MOD-05.

---

**MOD-07 — Registry HKCU: Sysmon Architectural Gap**

*Failure type:* Architectural — Sysmon EID 13 default configuration excludes `HKCU`

*Specific condition:* Sysmon registry event monitoring (EID 13 — RegistryEvent SetValue) is configured to monitor `HKLM\Software\Microsoft\Windows\CurrentVersion\Run` but not `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`. The GOV-DET-REG-001 rule correctly queries for HKCU, but no events are generated because Sysmon never captures them.

*Risk:* User-level persistence (no admin rights needed) is invisible. An adversary who obtains user-level access (not SYSTEM) can persist via HKCU with zero detection. This is especially relevant for contractor accounts like a.halevi — not domain admins.

*Root cause explanation for Security Officer Cohen:* "Sysmon is our security sensor inside Windows. It watches certain folders and registry locations. We forgot to tell it to watch the user-level startup folder. An attacker can put a program in that folder and it will start automatically every time the user logs in — and we would not know."

*Remediation:* Update Sysmon configuration XML to add HKCU registry paths to EID 13 monitoring. Requires: CAB change request; Sysmon config update on all endpoints; test on lab host first. Estimated: 3 engineering days.

---

**MOD-09 — Exfiltration Volume: No Rule**

*Failure type:* Rule missing — no large-volume outbound HTTPS detection

*Specific condition:* No Elastic SIEM rule exists that detects large-volume outbound HTTPS transfers. In the March 2025 incident, 413 MB was transferred in 8 chunks over 78 minutes to a C2 server. This entire exfiltration phase was undetected.

*Risk:* **Critical.** This is the final and most consequential phase of the attack. All prior detection failures could theoretically be compensated for by detecting this. Without a volume rule, a full biometric database exfiltration is invisible.

*Remediation:* Build Elastic aggregation-based threshold rule: sum(network.bytes_toserver) > 200MB per source IP per 6-hour window to non-CDN/non-approved destination ASN. Requires NetFlow or GovID frontend network logs in Elastic. Estimated: 5 engineering days (rule + log pipeline).

---

## Task 3 — Coverage Matrix

> **Tools:** [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> DeTT&CT: produce a coverage YAML from the NDSA rule set scored against data source quality — PASS/PARTIAL/GAP maps directly to its scoring model; export as a Navigator layer. ATT&CK Navigator: overlay the NDSA coverage layer against the March 2025 incident technique layer — visually shows which March techniques would still go undetected today. VECTR: export the coverage matrix directly from test results records — the INCD Section 8 compliance submission uses this table directly. OpenCTI: link coverage status to the March 2025 campaign object to show regulators which gaps are connected to the actual incident that prompted the Section 8 exercise.

| # | Technique | System | Rule | Result | Coverage | Gap Priority |
|---|---|---|---|---|---|---|
| 1 | T1566.001 Spearphishing (AiTM) | Email / personal endpoint | Email gateway policy | Not emulated | Partial (blocks EXE; macros not blocked) | P2 |
| 2 | T1557 AiTM session capture | VPN GW | GOV-DET-001 (proxy) | PASS (proxy detection) | Partial | P1 |
| 3 | T1133 External VPN access | VPN GW | GOV-DET-001 | PASS | Full | — |
| 4 | T1087.002 Domain Discovery | JUMPHOST / any | None | FAIL | **Gap** | P2 |
| 5 | T1016 Network Config Discovery | JUMPHOST / any | None | FAIL | **Gap** | P3 |
| 6 | T1021.001 RDP Lateral | DMZ → Ops | GOV-DET-002 | PARTIAL (field) | Partial | P2 |
| 7 | T1003.001 LSASS comsvcs | VRID-SRV, GovID | GOV-DET-010 | PASS | Full | — |
| 8 | T1197 BITS download | VRID-SRV | GOV-DET-003 | PARTIAL (field) | Partial | P2 |
| 9 | T1543.003 Service install | Any | GOV-DET-006 | PASS | Full | — |
| 10 | T1547.001 Registry HKCU | Any | GOV-DET-007 | FAIL (Sysmon gap) | **Gap** | P1 |
| 11 | T1059.001 PowerShell enc | Any | GOV-DET-PS | PASS | Full | — |
| 12 | T1005 DB full-table | VRID-SRV | GOV-DET-005 | PASS | Full | — |
| 13 | T1041 Exfil volume HTTPS | Network | None | FAIL | **Gap** | P1 |
| 14 | T1070.001 Log clear | All | GOV-DET-004 | PASS | Full | — |
| 15 | T1530 Bulk API extraction | GovID 2.0 | GOV-DET-006 (draft) | Not deployed; lab test pending | **Gap (pre-deployment)** | P1 |
| 16 | T1078.003 Vendor token abuse | GovID 2.0 API | GOV-DET-007 (draft) | Not deployed | **Gap** | P1 |
| 17 | [Classified segment techniques] | GOVNET Classified | Classified SIEM | NOT TESTED | **Theoretical only** | N/A |

**Coverage:**
- Full: 6 / 16 tested = 38%
- Full + Partial: 8 / 16 = 50%
- Gaps (not counting classified): 5 P1 gaps + 2 P2 gaps

---

## Task 4 — Gap Backlog

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [GitLab Issues](https://about.gitlab.com/) *(open-source option)* · [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)*
>
> VECTR: export FAIL and PARTIAL records as backlog items automatically — each pre-populated with technique ID, test result, failure analysis, and INCD risk flag. GitLab Issues: create one issue per gap; P1/P2 labels and INCD Section 8 compliance milestone make the backlog visible to CISO and auditors without exposing classified technical details. DeTT&CT: cross-reference each gap against data source quality scores — GAP-001 (NetFlow missing) and GAP-002 (Sysmon config) are data-source gaps with different remediation owners than rule-logic gaps.

| ID | Gap | ATT&CK | Root Cause | Remediation | Effort | Priority | INCD Risk |
|---|---|---|---|---|---|---|---|
| GAP-001 | No exfil volume rule — 413 MB left NDSA undetected in March 2025 | T1041 | Rule missing; requires NetFlow in Elastic | Build threshold aggregation rule + enable NetFlow on VRID and GovID nodes | 5d | P1 | **Yes** |
| GAP-002 | HKCU registry persistence invisible | T1547.001 | Sysmon config excludes HKCU | Update Sysmon config on all endpoints | 3d | P1 | **Yes** |
| GAP-003 | Bulk GovID API extraction not detected | T1530 | GOV-DET-006 not deployed (CAB pending) | CAB approval + API log pipeline + rule deployment | 2d (+ CAB) | P1 | **Yes** |
| GAP-004 | Vendor token abuse on GovID API | T1078.003 | GOV-DET-007 not deployed; token IP-binding not implemented | BiometricTech IP-binding requirement + GOV-DET-007 CAB | 3d (+ vendor) | P1 | **Yes** |
| GAP-005 | Net.exe domain discovery invisible | T1087.002 | Rule missing | Deploy net.exe enumeration rule | 1d | P2 | No |
| GAP-006 | RDP alert missing logon_type field | T1021.001 | Elastic pipeline field mapping | Fix ingest processor alias | 0.5d | P2 | No |
| GAP-007 | BITS job alert missing src_host field | T1197 | Same pipeline issue as GAP-006 | Same fix (same change) | 0d | P2 | No |
| GAP-008 | Classified segment not validated | All classified techniques | No lab equivalent | Theoretical analysis only; compensating controls | N/A | N/A | Out of scope |

---

## Task 5 — Corrected and New Rules

> **Tools:** [Sigma](https://sigmahq.io/) *(open-source)* · [Uncoder.io](https://uncoder.io/) *(free web tool)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)* · [Elastic Security](https://www.elastic.co/security) *(open-source core)*
>
> Sigma: write all corrected and new rules in vendor-neutral YAML — the MATZBEN CAB submission for GOV-DET-007 and GOV-DET-008 uses Sigma format that non-SIEM engineers can review. Uncoder.io: convert Sigma YAML to Elastic KQL immediately for lab validation before the 5-business-day CAB wait begins. Hayabusa: validate each corrected rule against the `.evtx` from the original failed test run — confirms EID 13 (HKCU registry write) events are present in the Sysmon output after the config fix. Chainsaw: run both the TP scenario and the FP simulation against the corrected rule locally before the MATZBEN submission — required evidence that the rule works as intended.

### GOV-DET-NEW: net.exe Domain Enumeration

```yaml
title: Domain Enumeration via Net.exe with /domain Flag
id: a9b8c7d6-e5f4-3210-abcd-ef9876543210
status: test
description: >
  Detects net.exe execution with /domain flag or Group enumeration targeting
  privileged groups. Low-effort detection for common adversary reconnaissance.
author: NDSA CTI / Detection Engineering
date: 2026/01/20
tags:
  - attack.discovery
  - attack.t1087.002
logsource:
  category: process_creation
  product: windows
detection:
  selection_domain:
    Image|endswith: '\net.exe'
    CommandLine|contains: '/domain'
  selection_groups:
    Image|endswith: '\net.exe'
    CommandLine|contains:
      - 'Domain Admins'
      - 'Enterprise Admins'
      - 'VRID-Admins'
      - 'NDSA-'
  condition: selection_domain or selection_groups
falsepositives:
  - 'IT administrators running domain diagnostics — FP rate medium; reduce by time-of-day filter (off-hours only for high-signal version)'
level: medium
```

### GOV-DET-006 (Bulk API Rule — Production Version)

```yaml
title: GovID 2.0 Bulk API Extraction — High-Volume /verify/bulk Calls
id: b8c7d6e5-f403-2101-bcde-f08765432101
status: test
description: >
  Detects >50 calls to GovID 2.0 /verify/bulk endpoint from single source IP
  within 10 minutes. Excludes scheduled batch jobs from known internal IPs.
author: NDSA CTI / Detection Engineering
date: 2026/01/20
tags:
  - attack.collection
  - attack.t1530
logsource:
  category: webserver
  product: nginx  # GovID 2.0 frontend
detection:
  # Implemented as Elastic threshold rule
  # Field: url.path == "/verify/bulk" AND http.response.status_code != 401
  # Threshold: count > 50 grouped by source.ip within 10 minutes
  selection:
    url.path: '/verify/bulk'
    http.response.status_code|not: 401
  filter_internal_batch:
    source.ip:
      - '10.20.15.0/24'  # Internal API gateway (scheduled batch)
  condition: selection and not filter_internal_batch
falsepositives:
  - 'High-volume legitimate batch verification (e.g., annual electoral roll) — pre-approve source IPs and add to filter'
level: critical
```

**Elastic KQL (threshold rule):**
```
url.path: "/verify/bulk"
AND NOT http.response.status_code: 401
AND NOT source.ip: 10.20.15.0/24
```
*Rule type: Threshold — count > 50, grouped by source.ip, over 10 minutes*

---

## Task 6 — INCD Section 8 Compliance Report

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)* · [DFIR-IRIS](https://dfir-iris.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> VECTR: generate the results summary table, coverage percentage, and remediation plan directly from exercise records — the Section 8 report's methodology and results sections assemble from VECTR exports without manual transcription. LibreOffice Writer: format the CONFIDENTIAL compliance report as a signed PDF — mandatory for INCD submission; must not be drafted in cloud document editors given the classification level. DFIR-IRIS: if any emulation module triggered an actual SOC incident response (red team / real incident deconfliction), DFIR-IRIS provides the evidentiary audit trail INCD may request. OpenCTI: export the coverage matrix as a STIX 2.1 bundle alongside the prose report — provides INCD with a machine-readable format for their own analysis.

**NDSA Annual Detection Validation — INCD Section 8 Compliance Report**
*Classification: CONFIDENTIAL | Submitted to: INCD via Lt. Col. Friedman*
*Exercise Date: [date] | Report Date: [date + 14 days]*

**COMPLIANCE STATUS: COMPLIANT WITH CONDITIONS**

| Metric | Value |
|---|---|
| Techniques emulated (excluding classified) | 11 confirmed + 5 projected |
| PASS | 6 |
| PARTIAL | 2 |
| FAIL (gaps) | 3 |
| P1 gaps identified | 4 (requiring remediation plans) |
| P1 gaps with accepted compensating controls | 4 |
| Remediation plan submitted | Yes |
| P1 remediation deadline | 60 days from report date |

**Highest-severity finding:**
Zero detection coverage for large-volume HTTPS data exfiltration — the technique used to transfer 340,218 biometric records in the March 2025 incident. Compensating control: manual weekly NetFlow volume review by SOC analyst. Permanent fix: 5-day engineering effort; in sprint planning.

**Gap Remediation Schedule:**

| Gap | Owner | Deadline | Compensating Control Until Fixed |
|---|---|---|---|
| GAP-001 Exfil volume rule | SOC Engineering | [+60 days] | Manual NetFlow review weekly |
| GAP-002 HKCU registry | IT Operations | [+45 days] | Monitor HKLM Run key + service installs as proxy |
| GAP-003 Bulk API rule | SOC Engineering | [+30 days] (CAB pending) | BiometricTech daily manual report |
| GAP-004 Vendor token IP binding | BiometricTech (NDSA contractual req.) | [+30 days] | 185.220.101.47 and similar IPs blocked at perimeter |

**Classified Segment Note:**
GOVNET Classified Segment detections were not validated due to the absence of a certified lab equivalent. This gap is documented. Theoretical coverage analysis has been completed. NDSA requests INCD guidance on whether classified-segment detection validation can be performed under INCD exercise authority in the next annual cycle.

*Signed:*
Shai Rotenberg, CTI Lead, NDSA: ________________________
Col. (Res.) Dror Nativ, CISO, NDSA: ____________________
Lt. Col. (Res.) Oren Friedman, INCD Liaison: ____________
Date: ____________

---

### Vendor Security Findings Letter (HavayaIT)

```
NDSA — CONTRACTOR SECURITY REQUIREMENTS NOTICE
Date: [exercise date + 7 days]
From: Col. (Res.) Dror Nativ, CISO, NDSA
To:   HavayaIT Systems Ltd., CEO + CISO
Subject: Security Improvements Required — 90-Day Deadline

Following NDSA's annual detection validation exercise, we have identified
that the contractor VPN access pathway used by HavayaIT remains partially
exploitable under specific conditions (contractor credential compromise +
AiTM session token capture). The March 2025 incident was caused by this
exact pathway.

NDSA requires the following security improvements from HavayaIT within 90
days (deadline: [date]):

1. MANDATORY MFA ON ALL NDSA-ACCESS ACCOUNTS (no exceptions)
   All HavayaIT employees with NDSA contractor access must have MFA
   enabled with no exemptions. MFA seeds must not be stored in personal
   email accounts or personal cloud services. Attestation required by
   [deadline].

2. PROHIBITION ON CREDENTIAL SELF-FORWARDING
   HavayaIT must implement a DLP policy in Microsoft 365 that prevents
   employees from emailing their own credentials, MFA seeds, or VPN
   configuration details to personal accounts. Policy configuration
   screenshot required by [deadline].

3. SECURITY AWARENESS TRAINING — CONTRACTOR PHISHING
   All HavayaIT employees with NDSA access must complete a phishing
   awareness training module focused on government contractor targeting.
   Completion attestation required by [deadline].

4. DEVELOPER CREDENTIAL HYGIENE — CODE REPOSITORIES
   HavayaIT must implement pre-commit secret scanning on all code
   repositories used for NDSA-related work. GitHub Advanced Security or
   equivalent required. Evidence of deployment required by [deadline].

CONTRACT CONSEQUENCE OF NON-COMPLIANCE:
Failure to demonstrate compliance by [deadline] will result in suspension
of all HavayaIT contractor VPN access to NDSA systems pending a full
security audit, per Clause 14.3 of the HavayaIT Service Agreement.

NDSA is available to assist with technical implementation questions.

Col. (Res.) Dror Nativ | CISO, NDSA | [contact]
```
