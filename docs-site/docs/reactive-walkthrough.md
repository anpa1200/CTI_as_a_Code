---
id: reactive-walkthrough
title: "CTI as a Code in Practice: Reactive Investigation — LifeTech Pharma"
sidebar_position: 2
---

# CTI as a Code in Practice: Reactive Investigation — LifeTech Pharma

**A complete walkthrough of the methodology applied to a real training scenario: pharmaceutical IP theft, dual entry points, and a DCSync that changes everything.**

*All organizations, names, and data are fictional. This is training assignment A01 from the CTI as a Code repository.*

---

## Contents

- [The Scenario](#the-scenario)
- [Step 0: Intake — What the First Call Captures](#step-0-intake--what-the-first-call-captures)
- [Step 1–2: Project Setup and Scope](#step-12-project-setup-and-scope)
- [Step R1: Evidence Inventory — What Exists and What Is Missing](#step-r1-evidence-inventory--what-exists-and-what-is-missing)
- [Step R2: Timeline — Two Paths, One Actor](#step-r2-timeline--two-paths-one-actor)
- [Step R3: Claims Ledger — Every Assertion Traced to Evidence](#step-r3-claims-ledger--every-assertion-traced-to-evidence)
- [Step R4: ATT&CK Mapping — Where Detection Failed](#step-r4-attck-mapping--where-detection-failed)
- [Step R5: Attribution Assessment — Same Actor or Two?](#step-r5-attribution-assessment--same-actor-or-two)
- [Step R6: Detection Rules — Four That Would Have Changed the Outcome](#step-r6-detection-rules--four-that-would-have-changed-the-outcome)
- [Step R7: Deliverables — What Each Stakeholder Gets](#step-r7-deliverables--what-each-stakeholder-gets)
- [The Git History: What a Completed Investigation Looks Like](#the-git-history-what-a-completed-investigation-looks-like)
- [Key Lessons](#key-lessons)

---

## The Scenario

**LifeTech Pharma Ltd.** is a mid-sized Israeli pharmaceutical company in Rehovot. It develops and manufactures generic drugs and biological APIs, exports to the US, EU, and MENA, and recently signed a $52 million licensing deal with a US biopharma partner. The signed formula files are stored on `SERVER-RD-02\\LicenseDeals\\USPartner2024\\` — 47 files, approximately 380 MB compressed.

On **Friday, 15 November 2024 at 18:47 IST**, the on-call SOC analyst receives a CrowdStrike behavioral detection:

```
ALERT: Suspicious PowerShell Activity
Severity: High — Behavioral IOA
Host: WS-CFO-01.lifetechpharma.local  [Michal Cohen, CFO]
Process: powershell.exe (PID 3784)
Parent: OUTLOOK.EXE (PID 2240)
CommandLine: powershell.exe -NonI -W Hidden -Enc JABjAD0ATgBlAHcA...
Timestamp: 2024-11-15T18:42:33Z
```

That's the visible trigger. The actual breach started **24 days earlier** — and the alert is the second of two entry points, not the first.

---

## Step 0: Intake — What the First Call Captures

Before opening Splunk, before pivoting on the C2 IP, before forming a hypothesis — the intake call runs. This is 15 minutes with the Tier 2 escalation and the IR Lead before any analysis work begins.

The intake captures facts that change what you look for:

```markdown
# Intake — PROJ-2024-001 — 2024-11-15

Completed by: On-call CTI analyst
Called with: IR Lead Noa Ben-David, SOC Manager
Time: 2024-11-15 18:55 IST

## What was reported?
CrowdStrike behavioral alert — PowerShell spawned by OUTLOOK.EXE on CFO workstation.
Tier 1 found 3 additional network connections to 203.0.113.87 in 15 minutes.

## What has already been done?
WS-CFO-01 — NOT yet isolated. Memory dump NOT yet taken.
SOC is running Splunk queries — no results beyond 1-hour window.

## What should NOT be touched?
WS-IT-LEVI — legal hold issued 20:45 IST. HR investigation underway (unrelated to incident).
Hardware access blocked for 48–72 hours. Remote CrowdStrike RTR permitted.

## Regulatory
Affected data MAY include formula files — Israeli Privacy Protection Law + FDA NDA filing.
INCD notification: assess after scope is confirmed.

## Analyst assessment (hypothesis before looking at logs)
Initial hypothesis: spearphishing → macro → PowerShell → C2 → lateral movement.
The alert is 2 hours old. This is probably not the beginning.
```

Two items in this intake change the entire investigation trajectory: the legal hold on `WS-IT-LEVI` (you cannot image it), and the potential for formula data in scope (Israeli PPL + FDA notification obligations). Both need to be on the table before analysis starts, not discovered mid-investigation.

The intake commits to git first:

```bash
git add 00-scope/intake-2024-11-15.md
git commit -m "PROJ-001: intake — CFO PowerShell alert, legal hold on WS-IT-LEVI, formula data in scope"
```

---

## Step 1–2: Project Setup and Scope

```bash
cp -r CTI_as_a_Code/templates/reactive/ investigations/lifetech-2024-11/
cd investigations/lifetech-2024-11/
git init
git add .
git commit -m "PROJ-001: scaffold initialized"
```

The scope document defines the boundary before analysis begins. Three PIRs are committed before looking at a single log:

```markdown
## PIRs

- PIR-001: Was the US licensing formula package (SERVER-RD-02\\USPartner2024\\) 
  accessed or exfiltrated? If so, what and when?
- PIR-002: How did the adversary gain initial access — phishing, credential theft, 
  or exploitation?
- PIR-003: Is there evidence of ongoing access or persistence as of investigation date?

## Out of scope
- Cloud (SharePoint Online) — separate authorization required
- Manufacturing SCADA systems — no evidence of involvement

## Evidence handling
TLP: AMBER. Legal hold on WS-IT-LEVI — no hardware access, RTR permitted.
14-day firewall log retention — SERVER-RD-02 outbound traffic expires Nov 20.
```

The firewall log retention deadline is the highest-priority time constraint. If SERVER-RD-02's November 6 outbound traffic is not retrieved by November 20, the exfiltration confirmation window closes permanently.

---

## Step R1: Evidence Inventory — What Exists and What Is Missing

The evidence inventory runs before analysis. The rule: **you do not analyze what you have not inventoried.**

| Source | System | Coverage | Reliability | Gap |
|---|---|---|---|---|
| CrowdStrike EDR | WS-CFO-01, SERVER-FIN-01 | Full — events available | High | EDR absent from all 12 research servers, DC01, SERVER-RD-02 |
| Sysmon | WS-CFO-01, WS-IT-LEVI | WS-CFO-01: full. WS-IT-LEVI: **10-day gap Oct 22–Nov 1** | High | Sysmon absent from all servers |
| Windows Security log | SERVER-RD-02, DC01 | Partial — EID 4624, 4662, 4663 only | Medium | Full DC log inaccessible; R&D server log is partial |
| Palo Alto DNS / NGFW | Perimeter | DNS: full. Firewall flows: **14-day retention** | High | SERVER-RD-02 Nov 6 outbound: retrieve before Nov 20 |
| M365 Message Trace | Exchange Online | Full — 30 days | High | ATP sandbox not enabled for `.xlsm` files |
| Azure AD sign-in | Cloud | Full | High | — |

**GAP-001 — WS-IT-LEVI Sysmon: October 22 – November 1, 2024**

```markdown
Duration: 10 days
Root cause: Unknown — Sysmon forwarder stopped. Coincides exactly with
  the day the IT admin received a phishing email.
What is missing: process creation (EID 1), network connections (EID 3),
  file creation (EID 11) for this host during this entire window.
Impact: Cannot confirm or rule out attacker activity on WS-IT-LEVI
  between Oct 22 and Nov 1. All claims about this period are INFERRED
  or HYPOTHESIZED unless supported by alternative sources (VPN logs,
  DC authentication logs, firewall flows).
Possible cause: Deliberate anti-forensic technique — terminating Sysmon
  service is a known evasion method.
```

The 10-day gap on the IT admin workstation starts the same day a phishing email was delivered to him. This is not coincidence — it is a finding.

```bash
git add 01-evidence/
git commit -m "PROJ-001: evidence inventory — 6 sources, GAP-001 (10-day Sysmon gap IT admin, Oct 22–Nov 1), firewall log retrieval urgent"
```

---

## Step R2: Timeline — Two Paths, One Actor

The timeline reveals what the CFO alert obscured: the breach started 24 days earlier through a completely different person.

| # | Timestamp (UTC) | Host | Event | Source | Label | ATT&CK | Notes |
|---|---|---|---|---|---|---|---|
| 1 | 2024-10-18 | (external) | `lifetechpharma-corp[.]eu` registered — typosquat | OSINT | CONFIRMED | T1583.001 | Pre-attack infra prep |
| 2 | 2024-10-22 11:23 | Exchange | Phishing email to p.levi: "MFA Re-enrollment Required" — AiTM HTML attachment | M365 ATP | CONFIRMED | T1566.001 | ATP SCL=4, delivered (threshold: 5) |
| 3 | 2024-10-22 11:31 | WS-IT-LEVI | Unknown — **GAP-001 begins** | — | GAP | — | Sysmon forwarder stopped |
| 4 | 2024-10-24 02:17 | Azure AD + VPN | VPN login as p.levi from Istanbul, Turkey (ASN: hosting/VPS). No MFA challenge recorded. 1h 12min session. | Azure AD sign-in | CONFIRMED | T1557, T1133 | 4:17 AM local time; Paz Levi lives in Rehovot |
| 5 | 2024-10-24 02:19 | DC01 | EID 4624: network logon for `svc_backup` from WS-IT-LEVI (10.10.3.22) — service account, outside business hours | Windows Security (Splunk) | CONFIRMED | T1078.002 | `svc_backup` has Domain Admin rights (see note) |
| 6 | 2024-10-25 03:41 | SERVER-FIN-01 | `svc_backup` accessed `\\SERVER-FIN-01\\FinanceReports\\2024\\` | File share audit (partial) | CORROBORATED | T1039 | Log incomplete — access timestamp only, not filenames |
| 7 | 2024-11-01 09:14 | WS-IT-LEVI | **GAP-001 ends**. First DNS query to `telemetry-cdn-services[.]biz` → 203.0.113.87. First C2 beacon from this host. | Palo Alto DNS | CONFIRMED | T1071.001 | Sysmon service and forwarder restart at same time — probable anti-forensics |
| 8 | 2024-11-01 09:18 | SERVER-RD-02 | EID 4624: `svc_backup` SMB Type 3 logon from WS-IT-LEVI | Windows Security | CONFIRMED | T1021.002 | Four minutes after C2 reconnection |
| 9 | 2024-11-06 02:09 | SERVER-RD-02 | EID 4624: `svc_backup` SMB logon from WS-IT-LEVI | Windows Security | CONFIRMED | T1021.002 | Off-hours access |
| 10 | 2024-11-06 02:10–02:14 | SERVER-RD-02 | EID 4663 ×47: `svc_backup` accessed all 47 files in `\\USPartner2024\\` — read + modified timestamp updated | Windows Security | CONFIRMED | T1039 | Each file individually accessed; timestamps modified suggests deliberate metadata manipulation |
| 11 | 2024-11-06 02:14 | SERVER-RD-02 | EID 5156: outbound HTTPS from SERVER-RD-02 to external IP, port 443, during file access window | Windows Security + firewall | CONFIRMED | T1041 | Destination IP confirmed in Palo Alto NGFW log: 198.51.100.44 — separate C2 from primary |
| 12 | 2024-11-06 02:48 | DC01 | EID 4662: `svc_backup` requested DS-Replication-Get-Changes on DC01 | Windows Security | CONFIRMED | T1003.006 | **DCSync indicator** — pentest scope did NOT include DCSync; pentest VLAN is 10.10.99.0/24, this event is from 10.10.3.22 |
| 13 | 2024-11-15 17:58 | Exchange | Phishing email to m.cohen (CFO): "Q4-2024 Licensing Agreement" — `.xlsm` attachment. SPF/DKIM/DMARC all fail. | M365 Message Trace | CONFIRMED | T1566.001 | **Second entry point — 24 days after first** |
| 14 | 2024-11-15 18:42 | WS-CFO-01 | Outlook → PowerShell -NonI -W Hidden -Enc → downloads second-stage from 203.0.113.87 | CrowdStrike + Sysmon EID 1 | CONFIRMED | T1059.001 | **Triggering alert** |
| 15 | 2024-11-15 18:46–20:52 | WS-CFO-01 | LSASS memory access (Sysmon EID 10, GrantedAccess 0x1010); persistence via Registry Run Key + scheduled task; BITS download of second-stage binary | Sysmon EID 10/11/13, EID 4698 | CONFIRMED | T1003.001, T1547.001, T1053.005, T1197 | svchost32.exe dropped to AppData\\Roaming |
| 16 | 2024-11-15 20:52 | SERVER-FIN-01 | WMI lateral movement: WmiPrvSE → PowerShell -Enc with different base64 payload | CrowdStrike | CONFIRMED | T1021.003, T1059.001 | `svc_finreport` credentials used |
| 17 | 2024-11-15 21:01 | SERVER-FIN-01 | Finance data staged: `FR_2024_consolidated.zip` created in `C:\\Windows\\Temp\\` | CrowdStrike EID 11 | CONFIRMED | T1039, T1560 | 2.8 MB upload confirmed in firewall logs at 21:14 |
| 18 | 2024-11-15 21:14 | WS-CFO-01 | `wevtutil.exe cl Security` — Windows Security log partially cleared | CrowdStrike | CONFIRMED | T1070.001 | Sysmon log intact (protected channel) |

**The evidence label system matters here.** Event 12 (DCSync) is CONFIRMED — it exists in DC01's Windows Security log, forwarded to Splunk, from an IP that is definitively WS-IT-LEVI and definitively not the pentest VLAN. That cannot be waved away as "possible pentest activity." Event 6 (finance server access) is CORROBORATED — single source with incomplete log — and can only appear in the technical report with an explicit qualifier, not in the executive brief as a stated fact.

---

## Step R3: Claims Ledger — Every Assertion Traced to Evidence

The claims ledger converts the timeline into auditable, falsifiable assertions. Each claim answers five questions: what, evidence, confidence, competing hypotheses, which PIR.

| ID | Claim | Evidence | Confidence | Competing Hypotheses | PIR |
|---|---|---|---|---|---|
| CL-001 | Initial access was via AiTM phishing against IT admin p.levi on October 22, 2024 | M365 ATP log (AiTM HTML lure delivered 11:23, opened 11:31); VPN login from Istanbul 02:17 Oct 24 with no MFA — stolen session token | High | Credential purchase / insider — cannot rule out without WS-IT-LEVI disk forensics (blocked by legal hold). However, AiTM lure + token replay pattern is more parsimonious. | PIR-002 |
| CL-002 | The adversary used `svc_backup` Domain Admin credentials to access SERVER-RD-02 and the formula files | EID 4624 on SERVER-RD-02 (svc_backup, Type 3, from WS-IT-LEVI); EID 4663 ×47 on formula files | High | Legitimate backup operation — ruled out: backup jobs run from SERVER-WSUS-01 (10.10.4.x), not WS-IT-LEVI; timestamp 02:09 UTC is outside maintenance window | PIR-002 |
| CL-003 | The 47 formula files in USPartner2024 were exfiltrated on November 6, 2024 | EID 4663 ×47 (files accessed); EID 5156 (outbound HTTPS from SERVER-RD-02 at same time); Palo Alto NGFW flow: 10.10.2.15 → 198.51.100.44:443, 381 MB outbound at 02:14–02:19 UTC | High | Files read for indexing/backup — ruled out: no backup job at this time; volume (381 MB) matches compressed formula package; destination IP not in allowlist and resolves to VPS hosting provider | PIR-001 **ANSWERED: YES** |
| CL-004 | DCSync was executed via `svc_backup` Domain Admin rights on November 6 at 02:48 UTC | DC01 EID 4662 with DS-Replication-Get-Changes GUID, from 10.10.3.22 (WS-IT-LEVI), SubjectUserName svc_backup | High | Legitimate AD replication — ruled out: event originates from a workstation IP, not a DC; authorized pentest scope explicitly excluded DCSync and used 10.10.99.x IPs only | PIR-003 |
| CL-005 | Path A (CFO, Nov 15) and Path B (IT admin, Oct 22) are the same threat actor | Shared PE fake compile timestamp (2018-04-09) in both `svchost32.exe` and `UpdateHelper.dll`; shared secondary C2 `sys-update-cdn[.]net` hard-coded in CFO implant and used in SERVER-RD-02 DNS | High | Coincidental — two actors happened to target same org simultaneously using near-identical toolchain: extremely implausible | PIR-002 |
| CL-006 | The adversary achieved full domain compromise via DCSync; all Active Directory credentials must be treated as compromised | CL-004 (DCSync confirmed); `svc_backup` held Domain Admin rights; DCSync requests krbtgt and privileged account hashes | High | DCSync may have been partial or failed — cannot confirm without DC01 full log access. Treating as full compromise is the conservative and correct operational response until disproven. | PIR-003 |

**CL-003 is the pivotal claim.** The US partner's formulas are gone. That drives the PIR-001 answer and the entire notification timeline. CL-004 and CL-006 change the scope of remediation from "contain these three hosts" to "rotate all AD credentials, treat all 80 servers as potentially compromised."

---

## Step R4: ATT&CK Mapping — Where Detection Failed

| # | Technique | Evidence | Confidence | Rule Fired? | Gap Type |
|---|---|---|---|---|---|
| T1566.001 | Phishing attachment (CFO xlsm) | M365 ATP log | High | Partial — ATP delivered (SCL=4, threshold 5) | Coverage incomplete — SCL threshold tuning |
| T1557 | AiTM credential theft (IT admin) | VPN login pattern + AiTM HTML lure | High | **No** | Rule missing — no AiTM session token detection |
| T1133 | VPN access with stolen credentials | VPN log: Istanbul, off-hours, no prior history | High | **No** | Rule missing — no anomalous VPN auth alert |
| T1078.002 | Valid account abuse (`svc_backup`) | EID 4624 (multiple) | High | **No** | Rule missing — service account off-hours logon undetected |
| T1059.001 | Encoded PowerShell (both hosts) | Sysmon EID 1, CrowdStrike | High | Yes (CFO only, via CrowdStrike behavioral) | Coverage incomplete — CFO only; IT admin host fired no alert |
| T1003.001 | LSASS memory access | Sysmon EID 10, GrantedAccess 0x1010 | High | **No** | Rule missing — Sysmon EID 10 not alerted on |
| T1003.006 | DCSync | DC01 EID 4662 | High | **No** | Rule missing — EID 4662 audit configured but no alert rule |
| T1021.003 | WMI lateral movement → SERVER-FIN-01 | CrowdStrike (WmiPrvSE → PowerShell) | High | **No** | Rule missing — WmiPrvSE parent alert not deployed |
| T1197 | BITS download (second stage) | Sysmon EID 1 (bitsadmin) | High | **No** | Rule missing — BITS external download not monitored |
| T1047 | WMI execution (lateral movement) | CrowdStrike log | High | **No** | Data source missing — WMI logging not in SIEM |
| T1070.001 | Event log cleared | CrowdStrike EID 1102 | High | **No** | Rule missing — wevtutil alert not deployed |
| T1547.001 | Registry Run Key persistence | Sysmon EID 13 | High | **No** | Coverage incomplete — EID 13 ingested but no alert rule on AppData\\Roaming paths |

**The gap taxonomy tells the engineering team exactly what work is required:**
- **Rule missing (7 techniques):** Data is in SIEM. A detection engineer can write and deploy the rule. These are sprint items.
- **Coverage incomplete (3 techniques):** Rule or data exists but is mis-tuned or partial. These require tuning, not new infrastructure.
- **Data source missing (1 technique):** WMI execution logging is not in the SIEM. This requires an infrastructure change before rules can be written.

The DCSync gap (T1003.006) is particularly stark: the Advanced Audit Policy that generates EID 4662 was correctly configured on DC01, the event was forwarded to Splunk, and the event was visible in Splunk. There was no alert rule. A single Splunk search rule on `source=WinEventLog:Security EventCode=4662 ObjectType="{19195a5b-6da0-11d0-afd3-00c04fd930c9}"` from a non-DC IP would have fired and contained this incident before the formula exfiltration.

---

## Step R5: Attribution Assessment — Same Actor or Two?

The investigation faces a key analytical question: Path A (CFO phishing, November 15) and Path B (IT admin AiTM, October 22) — are they the same actor?

**Evidence for unification (same actor):**

1. **Shared PE compile timestamp:** Both dropped binaries — `svchost32.exe` (CFO host) and `UpdateHelper.dll` (IT admin host) — carry an identical fake compile timestamp of `2018-04-09`. This is a known toolchain fingerprint. The probability of two unrelated actors both timestomping to the same date is extremely low.

2. **Shared secondary C2 domain in memory:** Strings extracted from `svchost32.exe` include `sys-update-cdn[.]net` — the domain that appeared only in SERVER-RD-02's DNS logs during the formula exfiltration. The CFO's implant knew about infrastructure used during the Path B operation. This is only explicable if the same actor controlled both implants.

3. **Coordinated operations timeline:** The CFO was targeted on the same day that the finance server data was being staged on SERVER-FIN-01 via lateral movement from the IT admin path. Two independent actors staging finance data simultaneously at the same target is implausible.

**Assessment: Single threat actor, dual delivery mechanism.**

The actor compromised the IT admin first (October 22), used that access for data theft (November 6), then independently targeted the CFO to expand access to finance data. The two phishing lures used different delivery infrastructure (different sender domains, different sending IPs from the same /24 block) — consistent with an actor who maintains parallel operational tracks.

**Attribution confidence: Medium-High.** Apply the [confidence ladder from Step R5 of the methodology](/docs/cti-as-a-code-methodology#step-r5-attribution-assessment) to score this case:

| Criterion | Present? | Notes |
|---|---|---|
| TTP overlap | Yes | AiTM + DCSync + pharmaceutical IP staging — consistent with Iranian-nexus industrial espionage (ClearSky, Mandiant) |
| Infrastructure match | Yes | Shared secondary C2 `sys-update-cdn[.]net` appears in both path artifacts; shared PE timestamp `2018-04-09` across both implants |
| Tooling match | Partial | Toolset is consistent with documented clusters but not definitively matched to a named cluster in public reporting |
| Independent CERT/ISAC confirmation | No | No CERT-IL deconfliction performed; no ISAC report cross-matched |

**Ladder tier: Medium-High** — TTP overlap + infrastructure match present; independent confirmation absent. The toolset has not been definitively matched to a named cluster, which prevents elevation to High.

**What to write:** *"Activity assessed as a single threat actor based on shared toolchain indicators (PE timestamp, secondary C2 domain). Tradecraft and targeting profile are consistent with Iranian-nexus industrial espionage operations targeting Israeli pharmaceutical IP. Attribution to a named cluster is not warranted without CERT-IL deconfliction or independent confirmation. Confidence: Medium-High."*

---

## Step R6: Detection Rules — Four That Would Have Changed the Outcome

Each rule is written with a reference to the claim it would have detected and the evidence gap it closes.

**DET-001: Anomalous VPN Authentication from Non-Corporate Source**

```yaml
title: Anomalous VPN Authentication — New Geography or Hosting ASN
id: a1b2c3d4-5678-9abc-def0-1234567890ab
status: experimental
description: >
  Detects VPN authentication success from a source IP with no prior history for
  this user, specifically from IPs geolocated outside Israel or from hosting/VPN
  ASNs. Covers T1133 and T1557 (session token replay after AiTM interception).
  Derived from PROJ-001 — CL-001, p.levi VPN from Istanbul at 02:17 UTC.
logsource:
  category: network
  product: cisco_anyconnect
detection:
  selection:
    event.action: vpn_auth_success
    user.name|exists: true
  filter_known:
    source.geo.country_iso_code: 'IL'
    source.as.number|not|startswith: ['AS47583', 'AS16276']   # hosting VPS ASNs
  condition: selection and not filter_known
falsepositives:
  - Legitimate international travel — validate against HR travel records
  - Remote contractors working abroad
level: high
tags:
  - attack.initial_access
  - attack.t1133
  - attack.credential_access
  - attack.t1557
```

**DET-002: DCSync Attack Detection**

```yaml
title: DCSync Attack via Non-DC Account
id: b2c3d4e5-6789-abcd-ef01-234567890abc
status: production
description: >
  Detects DCSync by looking for EID 4662 with the DS-Replication-Get-Changes
  GUID originating from a workstation IP rather than a domain controller.
  Derived from PROJ-001 — CL-004: svc_backup performed DCSync from WS-IT-LEVI
  using Domain Admin rights that were never revoked after an August 2024 
  emergency backup restoration.
logsource:
  category: windows
  product: windows
  service: security
detection:
  selection:
    EventID: 4662
    ObjectType: '{19195a5b-6da0-11d0-afd3-00c04fd930c9}'   # DS-Replication-Get-Changes
    Properties|contains:
      - '1131f6aa-9c07-11d1-f79f-00c04fc2dcd2'             # DS-Replication-Get-Changes-All
      - '89e95b76-444d-4c62-991a-0facbeda640c'             # DS-Replication-Get-Changes-In-Filtered-Set
  filter_legitimate_dc:
    IpAddress|startswith:
      - '10.10.1.10'   # DC01 — add all DC IPs here
      - '10.10.1.11'   # DC02
  condition: selection and not filter_legitimate_dc
falsepositives:
  - Azure AD Connect sync account — must be explicitly whitelisted
  - Authorized red team / pentest — validate scope before dismissing
level: critical
tags:
  - attack.credential_access
  - attack.t1003.006
```

**DET-003: Service Account Off-Hours Authentication**

```yaml
title: Service Account Authentication Outside Business Hours
id: c3d4e5f6-789a-bcde-f012-34567890abcd
status: experimental
description: >
  Detects authentication by a service account (accounts matching svc_* naming
  pattern) outside business hours (22:00–06:00) to a non-designated system.
  Covers T1078.002 (Valid Accounts: Domain Accounts) for svc_backup lateral
  movement in PROJ-001.
logsource:
  category: windows
  product: windows
  service: security
detection:
  selection:
    EventID: 4624
    LogonType: 3
    SubjectUserName|startswith: 'svc_'
  filter_business_hours:
    TimeCreated|windash|lt: '22:00:00'
    TimeCreated|windash|gt: '06:00:00'
  filter_known_backup_host:
    IpAddress: '10.10.4.15'   # SERVER-WSUS-01 — legitimate backup source
  condition: selection and not filter_business_hours and not filter_known_backup_host
falsepositives:
  - Scheduled tasks that legitimately run at night — review and whitelist specific pairs
level: medium
tags:
  - attack.lateral_movement
  - attack.t1078.002
```

**DET-004: WmiPrvSE Spawning PowerShell**

```yaml
title: WMI Remote Execution — PowerShell Child of WmiPrvSE
id: d4e5f6a7-89ab-cdef-0123-4567890abcde
status: production
description: >
  Detects WMI-based lateral movement (T1021.003) where WmiPrvSE.exe spawns
  PowerShell on a remote system. This is the pattern from PROJ-001 step 16:
  lateral movement from WS-CFO-01 to SERVER-FIN-01 via WMI using svc_finreport
  credentials. CrowdStrike detected the PowerShell on SERVER-FIN-01 but the
  originating WMI connection from the CFO host had no coverage.
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    ParentImage|endswith: '\WmiPrvSE.exe'
    Image|endswith: '\powershell.exe'
  suspicious_flags:
    CommandLine|contains:
      - '-Enc'
      - '-EncodedCommand'
      - '-NonI'
      - '-W Hidden'
  condition: selection and suspicious_flags
falsepositives:
  - SCCM WMI-based software deployment with PowerShell post-install scripts
level: high
tags:
  - attack.lateral_movement
  - attack.execution
  - attack.t1021.003
  - attack.t1059.001
```

**Validation:** All four rules were validated against the `PROJ-001` evidence set using Hayabusa before deployment. DET-001 fires on the October 24 Istanbul VPN login. DET-002 fires on the November 6 DCSync event. DET-003 fires on every `svc_backup` off-hours logon. DET-004 fires on the SERVER-FIN-01 WMI execution.

---

## Step R7: Deliverables — What Each Stakeholder Gets

**Executive brief (1 page, TLP:AMBER) — what the CISO needs in 90 minutes:**

> An adversary assessed as Iranian-nexus compromised LifeTech Pharma through two separate phishing attacks over 24 days. Using stolen IT administrator credentials, they accessed and exfiltrated the 47-file US licensing formula package on November 6, 2024. They also performed a DCSync attack on the domain controller, which means all Active Directory credentials must be treated as compromised.
>
> **PIR-001 ANSWERED:** The US partner formula package was exfiltrated. 381 MB outbound confirmed in firewall logs.
>
> **PIR-003 ANSWERED:** Active compromise ongoing. The CFO alert on November 15 is a second wave from the same actor, still active at time of investigation.
>
> **Immediate actions:** Full AD credential rotation; quarantine WS-CFO-01 and SERVER-FIN-01; notify INCD (72h clock from discovery: expires November 17 02:14 IST); brief the US licensing partner.

**SOC handoff (technical):**

Current IOCs: `203.0.113.87`, `198.51.100.44`, `telemetry-cdn-services[.]biz`, `sys-update-cdn[.]net`, `uslifepartner-group[.]com`, `lifetechpharma-corp[.]eu`.

Four detection rules deployed (DET-001 through DET-004). Two hunting queries: (1) pivot on C2 domains across all 838 endpoints — the 3 confirmed hosts may not be all; (2) hunt for any svc_backup authentication from non-WSUS IPs in the past 30 days.

---

## The Git History: What a Completed Investigation Looks Like

```
b9a2f1c  PROJ-001: deliverables — executive brief, SOC handoff, INCD notification ready
7c8d3e4  PROJ-001: detections — DET-001 through DET-004 validated PASS via Hayabusa
5f2a9b1  PROJ-001: attribution — single actor assessed (shared PE timestamp + secondary C2)
3e4c7d8  PROJ-001: ATT&CK mapping — 12 techniques, 7 rule-missing, 3 incomplete, 1 data-missing
1b6f2a5  PROJ-001: claims — 6 claims; PIR-001 ANSWERED YES (CL-003); PIR-003 CONFIRMED ONGOING (CL-006)
9a3e7c2  PROJ-001: timeline — 18 events Oct 22–Nov 15; dual-path confirmed, same actor assessed
6f1b4d9  PROJ-001: evidence inventory — 6 sources, GAP-001 documented, firewall log retrieval urgent
2c8a5e3  PROJ-001: scope — signed off 22:55 IST; PIR-001/002/003, TLP AMBER, legal hold WS-IT-LEVI
a1d7f4b  PROJ-001: intake — CFO PowerShell alert, legal hold WS-IT-LEVI, formula data in scope
0e9c2b7  PROJ-001: scaffold initialized
```

Each commit is a phase. Each message states the project ID, the phase, and a one-line summary of what was concluded. When a lawyer asks six months from now "what did you know and when did you know it?" — the git log answers.

---

## Key Lessons

**The alert was not the beginning.** The SOC received its first signal 52 hours after the breach was already in progress — and 15 days after the formula files were gone. The triggering alert was the second entry point. A detection rule on anomalous VPN authentication (DET-001) would have fired on October 24 at 02:17 UTC — before any lateral movement, before any data access.

**Gaps are findings, not absences.** The 10-day Sysmon gap on WS-IT-LEVI coincided exactly with the delivery of a phishing email. Stopping a logging service is T1562.001 — Impair Defenses. A gap is not "we don't know what happened." A gap that coincides with a malicious delivery is evidence of anti-forensics.

**DCSync changes everything.** The scope of remediation is not "three infected hosts." When DCSync is confirmed via Domain Admin rights, every credential in the AD is potentially compromised. The scope is all 80 servers. The IR Lead needs to know this before the 90-minute CISO brief, not after.

**Claims need competing hypotheses.** CL-003 (exfiltration confirmed) is only defensible as "high confidence" because specific alternative explanations were checked and explicitly ruled out — scheduled backup (wrong source IP, wrong timing), authorized developer activity (no jobs scheduled). Without the competing hypothesis analysis, a claim is an assertion. With it, it is analysis.

---

*This scenario is training assignment A01 from the [CTI as a Code repository](https://github.com/anpa1200/CTI_as_a_Code). The full evidence set, template, and worked solution are available there.*

*Tags: Threat Intelligence · Incident Response · CTI · DFIR · Detection Engineering · MITRE ATT&CK · Sigma · Blue Team*
