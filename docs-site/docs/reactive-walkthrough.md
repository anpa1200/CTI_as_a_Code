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
- [Step 00: Clone, Initialize, and Fill the Template](#step-00-clone-initialize-and-fill-the-template)
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

## Step 00: Clone, Initialize, and Fill the Template

**Before the phone rings.** This step takes three minutes and is done once per investigation — ideally before the alert even comes in, or in the first five minutes after hanging up the initial call.

### 1. Clone the repository (one-time setup)

If you have not cloned `CTI_as_a_Code` yet, do this once on your analyst workstation:

```bash
cd ~
git clone https://github.com/anpa1200/CTI_as_a_Code.git
```

You will never modify this clone. It is your template source. Leave it as-is and pull updates periodically:

```bash
cd ~/CTI_as_a_Code && git pull
```

### 2. Create your investigations folder

```bash
mkdir -p ~/investigations
```

Use any path you prefer — just keep it consistent across all cases. Do not create investigations inside the `CTI_as_a_Code` clone.

### 3. Copy the reactive template for this case

```bash
cp -r ~/CTI_as_a_Code/templates/reactive/ ~/investigations/lifetech-2024-11
```

Naming convention: `[org-slug]-[YYYY-MM]`. One folder per case. Verify the structure:

```bash
ls ~/investigations/lifetech-2024-11/
```

Expected:
```
00-scope/   01-evidence/   02-sources/   03-analysis/
04-detections/   05-deliverables/   06-ai-outputs/   07-feedback/
README.md   intake-form.md   project.yml
```

### 4. Initialize git inside the case folder

```bash
cd ~/investigations/lifetech-2024-11
git init
git add .
git commit -m "PROJ-2024-001: scaffold initialized from reactive template"
```

This is commit zero. Its purpose is to prove — to a lawyer, an auditor, or yourself — exactly what state you started from before any analysis began.

### 5. Fill in `project.yml`

This file is the single source of truth for project metadata. Open it now:

```bash
nano project.yml
```

The template has blank fields. Fill every one:

```yaml
project:
  id: "PROJ-2024-001"
  name: "LifeTech Pharma — Targeted Intrusion"
  type: reactive
  classification: TLP:AMBER
  status: in-progress

analyst:
  name: "Your Name"
  role: "CTI Analyst"
  contact: "your@email.com"

timeline:
  incident_date: "2024-11-15"
  detection_date: "2024-11-15"
  investigation_start: "2024-11-15"
  report_due: "2024-11-17"         # INCD 72h clock — expires 18:47 IST Nov 17

pirs:
  - id: PIR-001
    question: "Was the US licensing formula package (SERVER-RD-02\\USPartner2024\\) accessed or exfiltrated? If so, what and when?"
    priority: high
    status: open
  - id: PIR-002
    question: "How did the adversary gain initial access — phishing, credential theft, or exploitation?"
    priority: high
    status: open
  - id: PIR-003
    question: "Is there evidence of ongoing access or persistence as of investigation date?"
    priority: high
    status: open

scope:
  systems:
    - WS-CFO-01
    - WS-IT-LEVI
    - SERVER-RD-02
    - SERVER-FIN-01
    - DC01
  threat_actor: unknown
  attck_techniques: []             # leave blank now — fill during R4

deliverables:
  - type: executive-brief
    status: pending
  - type: soc-handoff
    status: pending
  - type: sigma-rules
    count: 0
    status: pending

notes: "INCD 72h notification clock starts 2024-11-15 18:47 IST. Legal hold on WS-IT-LEVI — no hardware access, RTR only."
```

**Do not leave any field as `""` or `[]` if you know the value.** Unknown fields are fine — write `unknown` explicitly. A blank field means "forgot to fill in." `unknown` means "we looked and do not know yet."

### 6. Commit the filled metadata

```bash
git add project.yml
git commit -m "PROJ-2024-001: project.yml filled — 3 PIRs, INCD deadline 2024-11-17 18:47 IST, legal hold WS-IT-LEVI"
```

The folder is now named, scoped, and version-controlled. The intake call can begin.

---

## Step 0: Intake — What the First Call Captures

Before opening Splunk, before pivoting on the C2 IP, before forming a hypothesis — the intake call runs. This is 15 minutes with the Tier 2 escalation and the IR Lead before any analysis work begins.

The intake captures facts that change what you look for.

**Open the intake form before dialing:**

```bash
cp intake-form.md 00-scope/intake-2024-11-15.md
nano 00-scope/intake-2024-11-15.md
```

The template has 9 sections. Work through them in order during the call — do not paraphrase in real time, write what the reporter says verbatim. You will analyze it after. For LifeTech this call produces:

```markdown
# Investigation Intake — PROJ-2024-001 — 2024-11-15

Completed by: On-call CTI analyst (Yael Mizrahi)
Intake call with: Noa Ben-David (IR Lead), Ran Katz (SOC Manager)
Call time: 2024-11-15 18:55 IST

---

## 1. What was reported?

**1.1 What did you see or receive that caused you to raise this?**
"CrowdStrike fired a high-severity behavioral IOA on Michal Cohen's workstation —
PowerShell with base64 payload launched directly from Outlook. Tier 1 pulled the
network tab and found 3 outbound connections to 203.0.113.87 over the last 15
minutes. This is the CFO's machine. We escalated immediately."

**1.2 Where did this first come to your attention?**
- [x] Alert from SIEM / EDR / AV  ← CrowdStrike Falcon behavioral IOA, severity: High

**1.3 When did you first notice it?**
Date: 2024-11-15   Time: 18:47   Timezone: IST (UTC+2)

**1.4 Do you believe the activity is still ongoing?**
- [x] Yes — still active (C2 connections still firing at time of call)

---

## 2. What is already known?

**2.1 What systems, accounts, or services appear to be involved?**
- WS-CFO-01.lifetechpharma.local — Michal Cohen, CFO. Dell Latitude, Windows 11.
- 203.0.113.87 — external IP, destination of C2 connections. Not in any allowlist.
- OUTLOOK.EXE (PID 2240) → powershell.exe (PID 3784) — parent-child confirmed.
- No other hosts identified yet — investigation is 8 minutes old.

**2.2 What was the observed behavior?**
"PowerShell with -NonI -W Hidden -Enc flags spawned from Outlook. The encoded
command has not been decoded yet. Three separate TCP connections to 203.0.113.87
on port 443 over 15 minutes — looks like a beacon pattern."

**2.3 Has anyone else already investigated or looked into this?**
- [x] Yes — Tier 1 analyst (Omer Cohen) ran initial Splunk queries (last 1 hour only).
  What did they touch: read-only Splunk queries. No changes to the endpoint.

**2.4 What do you think happened?**
"Probably a phishing email with a malicious attachment — xlsm macro or something
similar. Michal must have opened it in the last few hours. We don't know if anyone
else was targeted."

---

## 3. Timeline of discovery

**3.1 When do you believe the activity started?**
- [ ] Known
- [x] Estimated: activity on WS-CFO-01 started approximately 18:42 IST (PowerShell
  launch timestamp from CrowdStrike event).

**3.2 How long do you estimate the activity has been occurring?**
Approximately 13 minutes from first PowerShell event to escalation call (18:42–18:55 IST).
However: unknown whether this is the beginning of the intrusion or a later stage.

**3.3 Is there a specific event that triggered the alert or complaint?**
CrowdStrike behavioral IOA fired at 18:42:33 IST on WS-CFO-01. Tier 1 escalated
at 18:47. IR Lead paged at 18:52. Intake call started at 18:55.

---

## 4. What has already been done?

**4.1 Has any system been rebooted, shut down, or reimaged since the activity was discovered?**
- [x] No — WS-CFO-01 is still running. Not yet isolated.

**4.2 Have any credentials, tokens, or API keys been rotated or revoked?**
- [x] No — no credential changes made yet.

**4.3 Has any network access been blocked or firewall rules been changed?**
- [x] No — 203.0.113.87 has not been blocked. Ran confirmed: "We wanted to check
  with you first before blocking — didn't want to tip them off."

**4.4 Has any malware been deleted or quarantined?**
- [x] No — CrowdStrike flagged the process but did not quarantine. Alert status: Detected,
  not Prevented (policy is set to Detect-only on this machine — CFO exception policy).

**4.5 Has anyone notified external parties?**
- [x] No — no external notification yet. INCD assessment pending scope confirmation.

---

## 5. Systems and access

**5.1 What logging is expected to exist for the affected systems?**
- Endpoint logs (Sysmon, CrowdStrike): [x] Yes — CrowdStrike on WS-CFO-01. Sysmon on
  WS-CFO-01. NOTE: Sysmon NOT deployed on server-class machines or DC01.
- VPN / authentication logs: [x] Yes — Cisco AnyConnect VPN, logs in Splunk.
- Database audit logs: [x] Yes — SQL audit on SERVER-RD-02 (partial EIDs only).
- Network flow / firewall logs: [x] Yes — Palo Alto NGFW. RETENTION: 14 days only.
  ⚠ SERVER-RD-02 outbound logs will expire 2024-11-29 for today's traffic.
- Email gateway logs: [x] Yes — M365 Message Trace, 30-day retention. ATP enabled.
  NOTE: ATP sandbox NOT enabled for xlsm files — policy gap identified.
- Cloud provider logs: [x] Yes — Azure AD sign-in logs, 30-day retention.

**5.2 What tools and access does the analyst have?**
- [x] Admin access to affected hosts (CrowdStrike RTR for WS-CFO-01, WS-CFO-01 CrowdStrike console)
- [x] Read access to SIEM (Splunk — full org)
- [x] Access to EDR console (CrowdStrike Falcon — full org view)
- [x] Access to network equipment / firewall logs (Palo Alto Panorama — read only)
- [x] Access to cloud console (Azure AD — Security Reader role)
- [x] Access to email gateway (M365 Security & Compliance — Message Trace)
- [ ] VPN / jump host credentials — not yet, request submitted
- [x] TheHive / OpenCTI lab access

**5.3 Are there any systems the analyst should NOT touch?**
⚠ WS-IT-LEVI (Paz Levi, IT Admin): LEGAL HOLD issued at 20:45 IST today.
  HR investigation underway — UNRELATED to this incident (employment matter).
  Hardware access BLOCKED for 48–72 hours per Legal counsel (Adv. Dina Shapiro).
  Remote CrowdStrike RTR is PERMITTED — confirmed by Legal.
  No memory image, no disk image, no physical access until hold lifted.

---

## 6. Business impact

**6.1 What business processes are affected or at risk?**
"The CFO's email and workstation are involved. If this is a full compromise, finance
data is at risk. We also have R&D server SERVER-RD-02 — it holds the formula files
for the US licensing deal. That deal closes in 6 weeks. If those files were touched,
we have an FDA NDA issue and a $52M deal at risk."

**6.2 Is customer data, employee data, or regulated data potentially involved?**
- [x] Yes — type: proprietary formula files under FDA NDA filing (USPartner2024 package,
  47 files, ~380 MB). Also: employee financial data on SERVER-FIN-01 if CFO path
  extended to finance server.

**6.3 What is the financial exposure if this is confirmed?**
Direct deal risk: $52M US licensing agreement. Regulatory exposure: Israeli Privacy
Protection Law (PPL) fines + FDA NDA breach penalties. Reputational exposure: US
partner disclosure obligation if formula data confirmed exfiltrated.

**6.4 Is there a hard deadline driving this investigation?**
- [x] Yes — deadline: INCD 72-hour notification window starts from discovery of
  breach (not discovery of alert). If formula data or critical infrastructure
  involvement confirmed: clock starts NOW → expires 2024-11-17 ~18:47 IST.

---

## 7. Regulatory and legal constraints

**7.1 Are there applicable notification requirements?**

| Regulation | Applicable? | Deadline | Notified? |
|---|---|---|---|
| INCD (Israeli critical infrastructure) | TBD — assess after scope confirmed | 72h from discovery | No |
| Biometric Database Authority | No — no biometric data at LifeTech | — | N/A |
| BoI-CD 362 (Israeli financial) | No — LifeTech is not a financial entity | — | N/A |
| GDPR | TBD — EU customers in export data? | 72h from awareness | No |
| PCI-DSS | No — no card processing at LifeTech | — | N/A |
| Israeli Privacy Protection Law | Yes — employee + partner data in scope | Per PPL — notify DPA if breach confirmed | No |
| FDA / NDA obligation | Yes — if formula files confirmed exfiltrated | Immediate notification to US partner | No |

**7.2 Is there an active legal hold on any systems or data?**
- [x] Yes — WS-IT-LEVI (Paz Levi). Legal hold issued 2024-11-15 20:45 IST.
  Contact: Adv. Dina Shapiro (Legal). Hold expected: 48–72 hours minimum.

**7.3 Has legal counsel been notified?**
- [x] Yes — Adv. Dina Shapiro notified of the security incident at 19:10 IST.
  Advised: do not touch WS-IT-LEVI hardware. RTR permitted with logging.

---

## 8. Analyst notes

(Raw notes taken during call — unprocessed)

- Ran (SOC): "The CFO is still at the office. We haven't told her yet. Should we?"
  → IR Lead decision: do not inform CFO until after memory dump. Risk: she might
  reboot the machine.
- The CrowdStrike policy on WS-CFO-01 is DETECT-ONLY (CFO exception policy).
  This is why the process was not killed automatically. SOC should evaluate
  moving to Prevent for exec machines after this incident.
- 203.0.113.87 — not blocklisted anywhere in org. Ran says: "It's clean on our
  end, never seen it before." Worth enriching immediately (VirusTotal, Shodan).
- Memory dump of WS-CFO-01 is urgent — C2 is still active. Process may have
  network artifact or decrypted payload in memory. Action: RTR memory dump NOW.
- No mention of SERVER-RD-02 during this call — IR Lead is not aware of the
  formula file risk yet. Will scope that separately after evidence inventory.
- p.levi (WS-IT-LEVI) is under HR investigation for unrelated reason. Legal hold
  is coincidental. However: IT admin access + legal hold + security incident
  creates a complex situation. Document carefully.

---

## 9. Next actions

| # | Action | Owner | Due |
|---|---|---|---|
| 1 | Take memory dump of WS-CFO-01 via CrowdStrike RTR before C2 session ends | Yael (CTI) | Immediate |
| 2 | Enrich 203.0.113.87 — VirusTotal, Shodan, passive DNS, ASN lookup | Yael (CTI) | Within 30 min |
| 3 | Pull M365 Message Trace for m.cohen last 48h — identify delivery vector | Omer (Tier 1) | Within 30 min |
| 4 | Retrieve Palo Alto firewall logs for WS-CFO-01 and SERVER-RD-02 — full available window | Ran (SOC) | Within 1h ⚠ retention risk |
| 5 | Check Azure AD sign-in logs for m.cohen and p.levi — last 30 days | Yael (CTI) | Within 1h |
| 6 | Confirm SERVER-RD-02 USPartner2024 directory access — pull EID 4663 from Splunk | Yael (CTI) | Within 2h |
| 7 | Open TheHive case PROJ-2024-001, attach this intake as first observable | Yael (CTI) | Within 30 min |
| 8 | Advise IR Lead on INCD 72h clock — confirm if formula data scope triggers mandatory notification | Noa (IR Lead) + Legal | Within 2h |

---

*Intake completed 2024-11-15 19:18 IST. File saved as 00-scope/intake-2024-11-15.md.*
*Case opened in TheHive: PROJ-2024-001.*
```

Two items in this intake change the entire investigation trajectory: the legal hold on `WS-IT-LEVI` (you cannot image it), and the potential for formula data in scope (Israeli PPL + FDA notification obligations). Both need to be on the table before analysis starts, not discovered mid-investigation.

The intake commits to git first:

```bash
git add 00-scope/intake-2024-11-15.md
git commit -m "PROJ-001: intake — CFO PowerShell alert, legal hold on WS-IT-LEVI, formula data in scope"
```

---

## Step 1–2: Project Setup and Scope

The folder and git repo already exist from Step 00. This step fills the scope document and gets stakeholder sign-off before any analysis begins. The rule: **you do not start looking at logs until the scope is committed.**

### 1. Open the scope document

```bash
nano 00-scope/scope.md
```

The template has six sections. Fill each one now:

**Header — fill the four metadata lines at the top:**
```
Project: PROJ-2024-001
Classification: TLP:AMBER
Date scoped: 2024-11-15
Scoped by: [your name]
Approved by: Noa Ben-David, IR Lead
```

**Incident Summary — one paragraph, what triggered this:**
```
CrowdStrike behavioral detection on WS-CFO-01 at 18:42 IST, November 15, 2024.
PowerShell spawned by OUTLOOK.EXE with base64-encoded payload, downloading from
203.0.113.87. Scope of compromise unknown. Formula files on SERVER-RD-02 are
potentially in scope — US licensing deal ($52M) requires regulatory assessment.
```

**In Scope — fill the asset table:**

| Asset / System | Owner | Justification |
|---|---|---|
| WS-CFO-01 | IT / Michal Cohen (CFO) | Triggering alert host |
| WS-IT-LEVI | IT / Paz Levi | Suspected initial access vector |
| SERVER-RD-02 | R&D | Formula file storage — PIR-001 asset |
| SERVER-FIN-01 | Finance | Lateral movement target — CrowdStrike alert |
| DC01 | IT | DCSync indicator from this host |

**Out of Scope — fill the exclusion table:**

| Asset / System | Reason for Exclusion |
|---|---|
| SharePoint Online | Cloud scope — requires separate authorization |
| Manufacturing SCADA | No evidence of involvement at this time |
| WS-IT-LEVI hardware | Legal hold — no hardware access, RTR only |

**PIRs — copy from project.yml, add due dates:**

| ID | Question | Priority | Due |
|---|---|---|---|
| PIR-001 | Was the US licensing formula package (SERVER-RD-02\\USPartner2024\\) accessed or exfiltrated? | High | 2024-11-16 02:00 IST |
| PIR-002 | How did the adversary gain initial access? | High | 2024-11-16 02:00 IST |
| PIR-003 | Is there evidence of ongoing access or persistence? | High | 2024-11-16 02:00 IST |

**Constraints and Assumptions — fill the four fields:**
```
Legal/regulatory: INCD 72h notification window expires 2024-11-17 18:47 IST.
  Israeli Privacy Protection Law + FDA NDA obligations if formula data confirmed.
Evidence limitations: Palo Alto firewall logs — 14-day retention.
  SERVER-RD-02 Nov 6 outbound logs expire 2024-11-20. Retrieve immediately.
  Sysmon absent from all server-class machines.
Access restrictions: WS-IT-LEVI — legal hold, no hardware access. RTR permitted.
Assumptions: All timestamps assumed UTC unless marked IST. Not converted in log excerpts.
```

**Definition of Done — check the boxes your team has agreed to:**
```
- [ ] All PIRs answered or formally deferred with reasoning
- [ ] Timeline covers full attacker dwell period (or gap documented)
- [ ] ATT&CK mapping reviewed and finalized
- [ ] At least one detection rule per confirmed TTP
- [ ] SOC handoff delivered and acknowledged
- [ ] Executive brief approved by Noa Ben-David (IR Lead)
- [ ] INCD notification filed if formula data confirmed
```

### 2. Save the file and commit

```bash
git add 00-scope/scope.md
git commit -m "PROJ-2024-001: scope signed off — 5 systems, 3 PIRs, INCD deadline 2024-11-17, firewall log retrieval urgent"
```

**The firewall log retention deadline drives everything.** SERVER-RD-02's November 6 outbound traffic expires November 20. That is the exfiltration confirmation window. If it closes, CL-003 becomes INFERRED, not CONFIRMED. Retrieve those logs before any other analysis.

---

## Step R1: Evidence Inventory — What Exists and What Is Missing

The evidence inventory runs before analysis. The rule: **you do not analyze what you have not inventoried.**

### 1. Open the source registry

```bash
nano 02-sources/source-registry.md
```

The template has two tables: Internal Sources and External Sources. Fill every row you have access to — and explicitly mark what is absent. Unknown coverage is not the same as no coverage.

### 2. Fill in what you have

For each log source, fill four fields: **Source name**, **System(s) it covers**, **Admiralty reliability rating**, and **any known gap**. Where a source is absent from a system that should have it, add a row with `— absent` in the Gap column. That absence is a finding.

For LifeTech, the completed source registry drives this inventory:

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

### 3. Create a GAP document for every gap

Each gap gets its own file. Create it now:

```bash
nano 01-evidence/GAP-001-ws-it-levi-sysmon.md
```

Paste the filled template:

```markdown
# GAP-001 — WS-IT-LEVI Sysmon | 2024-10-22 – 2024-11-01

Duration: 10 days (2024-10-22 11:31 UTC to 2024-11-01 09:14 UTC)
Root cause: Sysmon forwarder stopped. Coincides exactly with delivery
  of phishing email to p.levi at 11:23 UTC.
What is missing: EID 1 (process creation), EID 3 (network connections),
  EID 11 (file creation) for WS-IT-LEVI during this entire window.
Impact: Cannot confirm or rule out attacker activity during this period.
  All claims covering Oct 22–Nov 1 on this host are INFERRED or
  HYPOTHESIZED unless corroborated by VPN logs, DC auth logs, or
  firewall flows.
Possible cause: Deliberate — terminating Sysmon is T1562.001 (Impair
  Defenses). A gap coinciding with a malicious delivery is itself a
  finding, not merely an absence.
```

### 4. Commit the evidence inventory

```bash
git add 01-evidence/ 02-sources/source-registry.md
git commit -m "PROJ-2024-001: evidence inventory — 6 sources, GAP-001 (10-day Sysmon gap WS-IT-LEVI Oct 22–Nov 1), firewall log retrieval urgent before Nov 20"
```

---

## Step R2: Timeline — Two Paths, One Actor

### 1. Open the timeline file

```bash
nano 03-analysis/timeline/timeline.md
```

The template has a header block and a markdown table. Fill the header first:

```
Project: PROJ-2024-001
Analyst: [your name]
Last updated: 2024-11-15
Time range: 2024-10-18 – 2024-11-15
Evidence label key: CONFIRMED / CORROBORATED / INFERRED / HYPOTHESIZED / GAP
```

Then add one row per event. Every row needs: timestamp (UTC), host, what happened, which log source you saw it in, an evidence label, and the ATT&CK technique. If you do not have a technique yet, leave it blank and come back — do not skip the label.

### 2. Add events in chronological order

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

### 3. Save and commit

```bash
git add 03-analysis/timeline/timeline.md
git commit -m "PROJ-2024-001: timeline — 18 events Oct 18–Nov 15, dual-path confirmed, GAP-001 bounds established"
```

---

## Step R3: Claims Ledger — Every Assertion Traced to Evidence

### 1. Open the claims ledger

```bash
nano 03-analysis/claims/claims-ledger.md
```

The template has a table with six columns: ID, Claim, Evidence, Confidence, Competing Hypotheses, PIR. Start with an empty row for each major assertion you identified in the timeline — then fill each one completely before moving to the next.

**For each row, answer these five questions before typing a word:**
1. What is the exact assertion? (One sentence, falsifiable — could in principle be proven false)
2. Which file and line number is the evidence in? (Not "we saw in Splunk" — the actual log reference)
3. What confidence level and why? (High / Medium / Low / Insufficient — with explicit rationale)
4. What alternative explanations were considered — and why were they ruled out or left open?
5. Which PIR does this answer?

If you cannot answer question 4, the claim is not ready to write. Think first.

### 2. Fill in one claim per confirmed technique or PIR answer

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

### 3. Update project.yml PIR status

When a PIR is answered, open `project.yml` and change the status field immediately:

```bash
nano project.yml
```

Change:
```yaml
  - id: PIR-001
    status: open
```
To:
```yaml
  - id: PIR-001
    status: answered    # CL-003 — exfiltration confirmed, 381 MB, Nov 6
```

### 4. Commit the claims ledger

```bash
git add 03-analysis/claims/claims-ledger.md project.yml
git commit -m "PROJ-2024-001: claims — 6 claims; PIR-001 ANSWERED YES (CL-003 exfil confirmed); PIR-003 CONFIRMED ONGOING (CL-006 DCSync)"
```

---

## Step R4: ATT&CK Mapping — Where Detection Failed

### 1. Open the ATT&CK mapping file

```bash
nano 03-analysis/attck-mapping/attck-mapping.md
```

For each technique you identified in the timeline, add one row. The four columns that matter most operationally are: **Confidence** (how sure are you the technique was used), **Rule Fired?** (yes/no/partial — check your SIEM), and **Gap Type** (what kind of work is needed to close this detection hole).

**Gap types:** `Rule missing` / `Data source missing` / `Coverage incomplete` / `Architectural gap`. Pick one. If you are unsure, write your best guess and flag it for SOC review.

Also update `project.yml` — fill the `attck_techniques` list:

```bash
nano project.yml
```
```yaml
scope:
  attck_techniques:
    - T1566.001
    - T1557
    - T1133
    - T1078.002
    - T1059.001
    - T1003.001
    - T1003.006
    - T1021.003
    - T1197
    - T1047
    - T1070.001
    - T1547.001
```

### 2. Fill one row per technique

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

### 3. Commit the ATT&CK mapping

```bash
git add 03-analysis/attck-mapping/attck-mapping.md project.yml
git commit -m "PROJ-2024-001: ATT&CK mapping — 12 techniques, 7 rule-missing, 3 coverage-incomplete, 1 data-source-missing, 1 arch-gap"
```

---

## Step R5: Attribution Assessment — Same Actor or Two?

### 1. Open the attribution file

```bash
nano 03-analysis/attribution/attribution.md
```

Write attribution **only after the claims ledger is complete**. The attribution file has three sections: evidence for unification (or separation), confidence ladder scoring, and the exact language to use in deliverables. Fill them in that order.

**Do not start with a hypothesis.** Start with the evidence you have from the claims ledger, then see where it points.

### 2. Score the evidence against the confidence ladder

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

### 3. Paste the final language into attribution.md and commit

```bash
git add 03-analysis/attribution/attribution.md
git commit -m "PROJ-2024-001: attribution — single actor, Medium-High confidence, shared PE timestamp + secondary C2, Iranian-nexus tradecraft consistent"
```

---

## Step R6: Detection Rules — Four That Would Have Changed the Outcome

### 1. Create one file per rule

Each rule gets its own file in `04-detections/sigma/`:

```bash
cp 04-detections/sigma/SIGMA-TEMPLATE.yml 04-detections/sigma/DET-001-anomalous-vpn-auth.yml
cp 04-detections/sigma/SIGMA-TEMPLATE.yml 04-detections/sigma/DET-002-dcsync-non-dc.yml
cp 04-detections/sigma/SIGMA-TEMPLATE.yml 04-detections/sigma/DET-003-svc-account-offhours.yml
cp 04-detections/sigma/SIGMA-TEMPLATE.yml 04-detections/sigma/DET-004-wmiprvse-powershell.yml
```

Open the first one:

```bash
nano 04-detections/sigma/DET-001-anomalous-vpn-auth.yml
```

Every rule must reference the CL-ID it would have detected and the gap type it closes. That is how the detection backlog stays traceable to the investigation.

### 2. Fill each rule

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

### 3. Validate each rule against your evidence set

```bash
# Run Hayabusa against the collected logs to confirm rules fire on known-bad events
hayabusa csv-timeline -d 01-evidence/ -r 04-detections/sigma/ -o validation-results.csv
```

Review the output. A rule that does not fire on its own evidence set should not be deployed.

### 4. Update project.yml deliverables count and commit

```bash
nano project.yml
```

```yaml
deliverables:
  - type: sigma-rules
    count: 4
    status: complete
```

```bash
git add 04-detections/sigma/ project.yml
git commit -m "PROJ-2024-001: detections — DET-001 to DET-004 written and validated PASS against evidence set via Hayabusa"
```

---

## Step R7: Deliverables — What Each Stakeholder Gets

### 1. Open the deliverable templates

```bash
nano 05-deliverables/executive-brief.md
nano 05-deliverables/soc-handoff.md
```

The executive brief answers three questions only: what happened, what was confirmed stolen or compromised, and what must happen in the next 24 hours. One page. No technical jargon. Every PIR that is answered gets a one-line answer at the top.

The SOC handoff lists: current IOCs (with confidence ratings), detection rules deployed, hunting queries still open, and escalation criteria. The SOC receives this, not the executive brief.

### 2. Fill the executive brief

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

### 3. Update project.yml status to closed and commit everything

```bash
nano project.yml
```

```yaml
project:
  status: closed

pirs:
  - id: PIR-001
    status: answered    # CL-003
  - id: PIR-002
    status: answered    # CL-001
  - id: PIR-003
    status: answered    # CL-006 — ongoing, AD rotation required
```

```bash
git add 05-deliverables/ project.yml
git commit -m "PROJ-2024-001: deliverables — executive brief, SOC handoff, INCD notification ready; all PIRs answered; project closed"
```

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
