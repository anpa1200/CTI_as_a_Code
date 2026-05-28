# CTI as a Code: Complete Step-by-Step Methodology

**Version-controlled threat intelligence — from first call to deployed Sigma rule.**

---

## Why This Methodology Exists

Most CTI work degrades in three predictable ways:

**The evidence problem.** An analyst writes "the adversary used T1078" in a report. Six months later nobody can answer: what log line supports that claim? Was it confirmed or inferred? What alternative hypotheses were ruled out? The claim exists in a PDF but the reasoning is gone.

**The detection problem.** A detection rule gets written after an incident. It sits in the SIEM with no documentation of which adversary technique it covers, which evidence motivated it, or whether it was ever validated. When the technique evolves, nobody knows which rules to update.

**The institutional knowledge problem.** The analyst who ran the investigation leaves. The entire understanding of what happened, how it was analyzed, and what was decided goes with them. The next incident starts from zero.

CTI as a Code solves all three. Every claim traces to evidence. Every detection traces to a technique. Every decision is a git commit. The investigation is reproducible by anyone with access to the repository.

---

## The Four Operational Modes

Before picking up a tool, identify which mode you are in:

| Mode | When to use | Starting artifact | Primary output |
|---|---|---|---|
| **Reactive** | An incident has occurred or is in progress | Evidence artifacts: logs, memory images, netflow, EDR telemetry | Timeline, claims ledger, ATT&CK gap matrix, Sigma rules, executive brief |
| **Proactive** | No incident; intelligence signals a threat | Trigger intelligence: CERT advisory, peer incident, vendor risk report | Crown jewels analysis, attack scenarios, detection backlog |
| **Full Cycle** | Building or maturing a standing CTI program | Organizational mandate: compliance directive, board decision, post-incident remediation | PIR framework, collection plan, sharing agreements, governance structure |
| **Adversary Emulation** | Validating whether built detections actually work | A CTI report describing adversary TTPs | Emulation plan, PASS/PARTIAL/FAIL matrix, compliance evidence |

The four modes share the same scaffold, the same analytical discipline, and the same git workflow. The difference is which steps you run and in what order.

---

## Setup: Get the Repository and Start the Lab

### Clone the repository

```bash
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cd CTI_as_a_Code
```

Repository structure:

```
CTI_as_a_Code/
├── docker-compose.yml          ← full lab stack (OpenCTI, TheHive, Elastic, Cortex)
├── .env.example                ← all secrets in one place; copy to .env before starting
├── scripts/
│   ├── setup.sh                ← first-time initialization (connectors, indexes, users)
│   └── health-check.sh         ← confirms all services return HTTP 200
├── templates/                  ← blank investigation scaffolds — copy these to start
│   ├── reactive/
│   ├── proactive/
│   ├── full-cycle/
│   └── adversary-emulation.md
└── training/                   ← 8 fully populated case folders with worked solutions
    ├── A01-reactive-lifetech/
    ├── A02-proactive-celltronx/
    └── ...
```

### Start the lab (optional but recommended)

```bash
cp .env.example .env
# Open .env and set all passwords before the next command
nano .env

# Elasticsearch requires this kernel parameter
sudo sysctl -w vm.max_map_count=262144

docker compose up -d
./scripts/setup.sh          # runs once; configures MITRE ATT&CK connector, indexes, initial users
./scripts/health-check.sh   # all services should return HTTP 200
```

Once running:

| Service | URL | What it does |
|---|---|---|
| OpenCTI | http://localhost:8080 | STIX2 intelligence platform — actor profiles, TTP graph, IOC management, sharing |
| TheHive 5 | http://localhost:9100 | Case management — evidence custody chain, observable tracking, case notes |
| Cortex | http://localhost:9002 | Automated enrichment — runs VirusTotal, Shodan, passive-DNS against observables |
| Kibana / SIEM | http://localhost:5601 | Detection rule management, alert triage, timeline visualization |
| Elasticsearch | http://localhost:9200 | Shared data store for all services |

You do not need the lab to run the methodology. The minimum-viable path at the end of this article covers what to use instead.

---

## Step 1: Initial Information Gathering — Ask Before You Look

**This is the step most analysts skip. It is the most important step.**

Before you open a log file, before you run a query, before you create a case — you need to understand what the reporter knows, what has already been touched, and what constraints exist. Getting this wrong means analyzing the wrong systems, missing the actual entry point, or tainting evidence that could later matter to regulators or legal.

This step applies to all modes:
- **Reactive**: gather from the person who reported or discovered the incident
- **Proactive**: gather from the person who assigned the assessment (CISO, management, compliance)
- **Full Cycle**: gather from the sponsor of the program build
- **Emulation**: gather from the authorization chain

Run this as a structured conversation — a call, a meeting, or a written intake form filled in by the requester. Take verbatim notes. Do not interpret or analyze during this step; just capture.

---

### Intake Template: First Critical Questions

Copy this template to `00-scope/intake.md` and fill it in during or immediately after the initial call.

```markdown
# Investigation Intake — [Project Name] — [Date]

Completed by: [analyst name]
Intake call with: [name, role]
Call time: [date] [time] [timezone]

---

## 1. What was reported?

**1.1 What did you see or receive that caused you to raise this?**
(Exact words from the reporter — do not paraphrase yet)


**1.2 Where did this first come to your attention?**
[ ] Alert from SIEM / EDR / AV
[ ] User complaint or helpdesk ticket
[ ] External notification (CERT-IL, partner, vendor)
[ ] Periodic log review
[ ] Other: _______________


**1.3 When did you first notice it?**
Date: __________ Time: __________ Timezone: __________


**1.4 Do you believe the activity is still ongoing?**
[ ] Yes — still active
[ ] No — appears to have stopped (when? ___________)
[ ] Unknown


---

## 2. What is already known?

**2.1 What systems, accounts, or services appear to be involved?**
(List hostnames, IPs, usernames exactly as the reporter knows them — we will verify later)


**2.2 What was the observed behavior?**
(Exact description — "database was slow", "account locked", "file appeared on server", etc.)


**2.3 Has anyone else already investigated or looked into this?**
[ ] Yes — who: ______________ what did they do: ______________
[ ] No
[ ] Unknown

If yes: **what did they touch or change?** This is critical for evidence integrity.


**2.4 What do you think happened?**
(Their hypothesis — we are not confirming it yet, just capturing it)


---

## 3. Timeline of discovery

**3.1 When do you believe the activity started?**
[ ] Known: __________
[ ] Estimated: approximately __________
[ ] Unknown — this needs to be determined

**3.2 How long do you estimate the activity has been occurring?**
(Hours / Days / Weeks / Unknown)

**3.3 Is there a specific event that triggered the alert or complaint?**
(e.g., "user reported they couldn't log in", "SOC saw an alert at 03:14", "customer called about unauthorized charges")


---

## 4. What has already been done?

> This section determines whether evidence has been preserved or potentially tainted.

**4.1 Has any system been rebooted, shut down, or reimaged since the activity was discovered?**
[ ] Yes — which systems: ______________ when: ______________
[ ] No
[ ] Unknown

**4.2 Have any credentials, tokens, or API keys been rotated or revoked?**
[ ] Yes — which: ______________ when: ______________
[ ] No
[ ] Unknown

**4.3 Has any network access been blocked or firewall rules been changed?**
[ ] Yes — what: ______________
[ ] No
[ ] Unknown

**4.4 Has any malware been deleted or quarantined?**
[ ] Yes — by whom: ______________ was a copy preserved: [ ] Yes [ ] No
[ ] No
[ ] Unknown

**4.5 Has anyone notified external parties (regulators, law enforcement, CERT, customers)?**
[ ] Yes — who was notified: ______________ when: ______________
[ ] No — are there notification obligations that may apply? (see section 7)
[ ] Unknown


---

## 5. Systems and access

**5.1 What logging is expected to exist for the affected systems?**
(Ask what they know — we will verify against what we actually find)
- Endpoint logs (Sysmon, Winlogbeat, EDR): [ ] Yes [ ] No [ ] Unknown
- VPN / authentication logs: [ ] Yes [ ] No [ ] Unknown
- Database audit logs: [ ] Yes [ ] No [ ] Unknown
- Network flow / firewall logs: [ ] Yes [ ] No [ ] Unknown
- Email gateway logs: [ ] Yes [ ] No [ ] Unknown
- Cloud provider logs (Azure AD, AWS CloudTrail, GCP): [ ] Yes [ ] No [ ] Unknown

**5.2 What tools and access does the analyst have?**
- [ ] Admin access to affected hosts (remote or physical)
- [ ] Read access to SIEM
- [ ] Access to EDR console
- [ ] Access to network equipment / firewall logs
- [ ] Access to cloud console
- [ ] Access to email gateway
- [ ] VPN / jump host credentials
- [ ] TheHive / OpenCTI lab access

**5.3 Are there any systems the analyst should NOT touch?**
(Legal hold, systems under active monitoring by law enforcement, production critical systems)


---

## 6. Business impact

**6.1 What business processes are affected or at risk?**


**6.2 Is customer data, employee data, or regulated data potentially involved?**
[ ] Yes — what type: ______________
[ ] No
[ ] Unknown

**6.3 What is the financial exposure if this is confirmed?**
(Rough estimate — for prioritization only)

**6.4 Is there a hard deadline driving this investigation?**
(Regulatory notification window, board meeting, press disclosure, customer SLA)
[ ] Yes — deadline: ______________
[ ] No


---

## 7. Regulatory and legal constraints

**7.1 Are there applicable notification requirements?**
| Regulation | Applicable? | Deadline | Notified? |
|---|---|---|---|
| INCD (Israeli critical infrastructure) | [ ] Yes [ ] No [ ] TBD | 72h from discovery | [ ] Yes [ ] No |
| Biometric Database Authority | [ ] Yes [ ] No [ ] TBD | Per Biometric Database Law | [ ] Yes [ ] No |
| BoI-CD 362 (Israeli financial) | [ ] Yes [ ] No [ ] TBD | 24h initial, 72h full | [ ] Yes [ ] No |
| GDPR | [ ] Yes [ ] No [ ] TBD | 72h from awareness | [ ] Yes [ ] No |
| PCI-DSS | [ ] Yes [ ] No [ ] TBD | Immediate | [ ] Yes [ ] No |
| Other: ______________ | | | |

**7.2 Is there an active legal hold on any systems or data?**
[ ] Yes — what systems: ______________
[ ] No
[ ] Unknown — escalate to legal before collecting

**7.3 Has legal counsel been notified?**
[ ] Yes [ ] No — should they be? ______________


---

## 8. Stakeholders and communication

**8.1 Who commissioned this investigation?**
Name: ______________ Role: ______________ Contact: ______________

**8.2 Who receives updates and deliverables?**
| Name | Role | Update frequency | TLP limit |
|---|---|---|---|
| | | | |

**8.3 Who should NOT be told about this investigation yet?**
(Suspect insider, pending law enforcement action, need-to-know restriction)


**8.4 What is the classification/TLP for this investigation?**
[ ] TLP:RED (recipients only)
[ ] TLP:AMBER (organization and trusted partners)
[ ] TLP:GREEN (community)
[ ] TLP:CLEAR (public)


---

## 9. Analyst assessment after intake

> Fill this in after the call — your initial read before opening any logs.

**9.1 What is your initial hypothesis based on intake alone?**


**9.2 What are the 3 most important questions this investigation must answer?**
(These become the basis for PIRs)
1.
2.
3.

**9.3 What is the highest-risk gap you identified in the intake?**
(Evidence that may have been tainted, logging that may not exist, notification deadline at risk)


**9.4 What is your recommended immediate action before analysis begins?**
(e.g., "Preserve HOST-01 memory image before any reboot", "Verify DB audit logging is enabled",
"Notify legal before collecting from db-01")


**9.5 Estimated investigation complexity:**
[ ] Simple — single system, clear timeline, < 1 day analysis
[ ] Moderate — 2–5 systems, some log gaps, 1–3 day analysis
[ ] Complex — multiple systems, significant gaps, regulatory exposure, > 3 days
```

---

### Why each section matters

**Section 4 (what has already been done)** is the most commonly skipped and the most dangerous to miss. If a system was rebooted before collection, volatile memory evidence is gone. If malware was quarantined without preserving a copy, you cannot analyze it. If credentials were rotated before you can correlate session IDs, the trail goes cold. You need to know this before you touch a single log.

**Section 5.3 (systems not to touch)** prevents contaminating law enforcement evidence or triggering monitoring that alerts the adversary. If someone is under investigation for insider threat and you start querying their account in the SIEM, you may blow the operation.

**Section 7 (regulatory)** sets hard deadlines that override your investigation timeline. If INCD notification is due in 72 hours from discovery, and discovery was 48 hours ago, you have 24 hours before a regulator gets a call regardless of where your analysis is. This needs to be on the table from minute one.

**Section 9 (analyst assessment)** prevents you from starting analysis without a hypothesis. The intake is the moment you form your first working theory. Write it down before looking at logs — it forces you to be explicit about what you're looking for and what would contradict it.

---

## Step 2: Create Your Project Folder from the Template

After intake, create the project folder and commit the intake document into it:

```bash
# Choose the template matching your mode
cp -r CTI_as_a_Code/templates/reactive/   investigations/myorg-incident-2025-03/

cd investigations/myorg-incident-2025-03/
git init
git add .
git commit -m "PROJ-001: scaffold initialized"

# Copy your intake notes into the project
cp /path/to/intake-notes.md 00-scope/intake.md
git add 00-scope/intake.md
git commit -m "PROJ-001: intake complete — initial hypothesis: AiTM contractor credential theft"
```

The intake document becomes the first record in the investigation's git history. Every subsequent commit builds on it. When the investigation is reviewed three months later, the git log shows what was known when, and what the analyst's reasoning was at each stage.

---

## Step 3: Scope the Project

**File:** `00-scope/scope.md` | **Role:** Team Lead | **Time:** 30 min

The scope document translates the intake into a formal project definition. It is signed off by the stakeholder before analysis begins. Scope changes during the investigation require a new commit with explicit justification — this prevents scope creep and keeps the git history honest.

```markdown
# Scope — PROJ-001 — MyOrg Incident 2025-03

Signed off by: CISO (Rachel K.) | Date: 2025-03-18 09:00 IST

## In scope
- Systems: HOST-01, HOST-02, vpn-gw-01, db-01
- Time range: 2025-03-15 00:00 IST — 2025-03-18 23:59 IST
- Evidence: Winlogbeat JSONL, VPN gateway logs, DB audit log, netflow

## Out of scope
- Cloud infrastructure — separate authorization required; pending CISO approval
- Employee endpoints outside the affected /24 subnet

## PIRs (Priority Intelligence Requirements)
These are the specific questions this investigation must answer. Analysis is complete
when all PIRs have an assessed answer or are explicitly closed as unanswerable.

- PIR-001: Did the adversary access or exfiltrate biometric records from db-01?
- PIR-002: What was the initial access vector — how did they get in?
- PIR-003: Is there any indication of ongoing access or persistence as of 2025-03-18?

## Stakeholders
- Commissioned by: CISO
- Deliverables to: CISO, IR Lead, Legal
- Scope change authority: CISO only — any scope expansion requires written approval

## Evidence handling
- TLP: AMBER — share with CERT-IL only with explicit CISO approval
- Legal hold on all artifacts pending INCD notification decision — do not delete anything
- Do not access db-01 production environment directly — use log copies only
```

Commit and get written sign-off (Slack, email, or a note in the case):

```bash
git add 00-scope/
git commit -m "PROJ-001: scope signed off by CISO — PIR-001 through PIR-003, TLP AMBER, legal hold"
```

---

## Reactive Mode: Full Walkthrough

### Step R1: Collect and Inventory Evidence

**File:** `01-evidence/README.md` | **Time:** 2–8 h depending on evidence volume

Before any analysis, build the complete evidence inventory. The rule: **you do not analyze what you have not inventoried.** Working from untracked evidence is how findings get missed and how the chain of custody breaks.

**Collection with Velociraptor (remote, no reboot required):**

```bash
# Collect Windows Security event log from HOST-01
velociraptor -v artifacts collect Windows.EventLogs.Evtx \
  --args EventLog=Security \
  --output HOST-01-security.jsonl

# Collect Sysmon (process creation, network, file events)
velociraptor -v artifacts collect Windows.EventLogs.Evtx \
  --args EventLog="Microsoft-Windows-Sysmon/Operational" \
  --output HOST-01-sysmon.jsonl

# Collect PowerShell script block logging
velociraptor -v artifacts collect Windows.EventLogs.Evtx \
  --args EventLog="Microsoft-Windows-PowerShell/Operational" \
  --output HOST-01-powershell.jsonl
```

**Hash all collected evidence immediately:**

```bash
sha256sum HOST-01-security.jsonl HOST-01-sysmon.jsonl vpn-gw-2025-03-17.jsonl \
  > evidence-checksums.sha256

git add evidence-checksums.sha256
git commit -m "PROJ-001: evidence checksums — chain of custody established"
```

**Build the inventory table:**

```markdown
| Source | File | Systems | Time Range | Gap | SHA256 | Usability |
|---|---|---|---|---|---|---|
| Windows Security log | HOST-01-security.jsonl | HOST-01 | 2025-03-15 – 2025-03-18 | None | a3f1... | High |
| Sysmon | HOST-01-sysmon.jsonl | HOST-01 | 2025-03-15 – 2025-03-18 | GAP-001: 03:00–07:00 IST on 03-17 | b2e4... | High (with gap) |
| VPN gateway | vpn-gw-2025-03-17.jsonl | vpn-gw-01 | 2025-03-17 only | None | c9d7... | High |
| DB audit log | vrid-audit-2025-03-17.jsonl | db-01 | 2025-03-17 00:00–06:00 | Post-06:00 log rotation lost | d4a2... | Medium |
| Netflow | govnet-ops-2025-03-17.jsonl | All | 2025-03-17 | None | e8b3... | High |
```

**Document every gap explicitly:**

```markdown
## GAP-001 — HOST-01 Sysmon | 2025-03-17 03:00–07:00 IST

Missing event types: process creation (EID 1), network connections (EID 3), file creation (EID 11)
Duration: 4 hours
Root cause: Sysmon service crash; restart at 07:02 confirmed in System log
What does cover this window: Security log (EID 4624, 4688 partial) — some process activity visible
Confidence impact: T1059, T1055, T1136, T1543 activity during this window CANNOT be confirmed
  or ruled out. Any claim about adversary actions between 03:00–07:00 must be labeled HYPOTHESIZED
  unless supported by netflow or DB audit log.
```

**Normalize to super-timeline with Plaso:**

```bash
log2timeline.py --storage-file PROJ-001.plaso \
  HOST-01-security.jsonl \
  HOST-01-sysmon.jsonl \
  vpn-gw-2025-03-17.jsonl \
  vrid-audit-2025-03-17.jsonl \
  govnet-ops-2025-03-17.jsonl

psort.py -o l2tcsv PROJ-001.plaso \
  --slice "2025-03-17T00:00:00" \
  --slice_size 1440 \
  > supertimeline-2025-03-17.csv
```

**Rapid Sigma triage with Hayabusa before Timesketch setup:**

```bash
hayabusa csv-timeline \
  --directory ./evtx/ \
  --output hayabusa-triage.csv \
  --profile verbose \
  --min-level medium

# Sort by severity to find high-confidence hits first
sort -t',' -k5 -r hayabusa-triage.csv | head -50
```

```bash
git add 01-evidence/
git commit -m "PROJ-001: evidence inventory — 5 sources, GAP-001 documented (4h Sysmon outage on 03-17)"
```

---

### Step R2: Build the Timeline with Evidence Labels

**File:** `03-analysis/timeline/timeline.md` | **Time:** 4–20 h

The timeline is a chronological log of every relevant event with three things that most timelines omit: **evidence citations, evidence labels, and ATT&CK technique mappings**.

**Evidence label system — every event gets one:**

| Label | What it means | Can it go in the executive brief? |
|---|---|---|
| **CONFIRMED** | Seen in two or more independent sources | Yes |
| **CORROBORATED** | Single source; consistent with adjacent confirmed events | Technical report only |
| **INFERRED** | Logical inference from confirmed events; step not directly observed | Technical report with explicit qualifier |
| **HYPOTHESIZED** | Plausible; no supporting evidence — open question | No — document as question only |
| **GAP** | No evidence covers this window | Yes — as a finding, not a claim |

**Why labels matter:** Without them, analysts conflate what they saw with what they inferred. The label forces explicit acknowledgment of how strong each piece of evidence is. When an executive asks "are you sure they took the data?", the answer is "CONFIRMED — two independent sources (DB audit log and netflow) both show 892 MB outbound" not "we think so."

**Example timeline entries:**

```markdown
## 2025-03-17 02:09:41 IST | CORROBORATED | T1566.001
Email gateway: message delivered to contractor-07@myorg.il from spoofed.vendor@mailpro[.]cc
Attachment: Q1-Invoice-2025.docx (SHA256: 4a7f...)
Single source — email gateway log only; no AV alert (attachment not flagged at delivery)
Note: This is the suspected initial delivery. No click/open event confirmed yet.

## 2025-03-17 02:14:23 IST | CONFIRMED | T1078.001
VPN gateway: authentication from 185.234.x.x, UserID: contractor-07
Source 1: vpn-gw-2025-03-17.jsonl line 4,471 — SessionID: VPN-20250317-8821
Source 2: RADIUS auth log — same SessionID, same source IP, same timestamp ±2s
No prior VPN session history for contractor-07 from this IP. HR confirmed contractor-07
was not working on 2025-03-17. Two independent sources → CONFIRMED.
PIR-002 status: partial answer — likely credential theft prior to this event

## 2025-03-17 02:17–02:44 IST | INFERRED | T1021.001
Adversary likely moved laterally from contractor jump host to db-01 during this window.
Inference basis: VPN session established at 02:14 (CONFIRMED); DB access at 02:47 (CONFIRMED);
no direct evidence of the lateral movement path — jump host Sysmon logs not available.
This step is inferred from the 30-minute gap between VPN auth and DB access.
Cannot confirm the specific technique (RDP, SMB, other) without jump host logs.

## 2025-03-17 02:47:11 IST | CONFIRMED | T1048.003
DB audit log: SELECT * on biometric_records from 185.234.x.x
Source 1: vrid-audit-2025-03-17.jsonl line 892 — full-table SELECT, 340,218 rows
Source 2: netflow — 892.4 MB outbound from db-01 to 185.234.x.x at 02:47:11–02:51:33
PIR-001 status: ANSWERED YES — biometric records accessed and exfiltrated

## 2025-03-17 03:00–07:00 IST | GAP (GAP-001)
Sysmon coverage lost. Security log partial. Cannot confirm or rule out:
- T1059.001/003 (command execution)
- T1136 (account creation / persistence)
- T1105 (tool staging)
See GAP-001 in evidence inventory for impact assessment.
```

---

### Step R3: Claims Ledger

**File:** `03-analysis/claims/claims-ledger.md` | **Time:** 1–2 h

The claims ledger is the single most important document in the investigation. It is what transforms a timeline narrative into structured, auditable analysis.

**Every row answers five questions:**
1. What is the specific assertion? (One sentence, falsifiable)
2. What evidence supports it? (File path and line number)
3. How confident are we? (High / Medium / Low with rationale)
4. What alternative explanations were considered? (And why were they ruled out or left open)
5. Which PIR does this answer?

```markdown
| ID | Claim | Evidence | Confidence | Competing Hypotheses | PIR |
|---|---|---|---|---|---|
| CL-001 | Adversary authenticated to the VPN using valid credentials for contractor-07 at 02:14 IST on 2025-03-17 | vpn-gw.jsonl:4471 + RADIUS log (same SessionID) | High | Legitimate login — ruled out: no prior session from this IP; contractor confirmed offline by HR; IP geolocates to Iranian hosting provider | PIR-002 |
| CL-002 | The biometric_records database was fully exfiltrated (340,218 rows, 892.4 MB) at 02:47–02:51 IST | db-audit.jsonl:892 (SELECT *) + netflow (892.4 MB from db-01 to 185.234.x.x) | High | Scheduled backup — ruled out: backup confirmed at 04:00; no authorized job at 02:47; db-admin confirmed no maintenance scheduled | PIR-001 |
| CL-003 | Initial credential theft was via AiTM phishing, not brute force or purchase | Session token replay pattern in VPN auth (no prior failed auths, immediate successful auth from new IP); email delivery confirmed 5 min before VPN auth | Medium | Credential purchase / insider — cannot fully rule out without forensic analysis of contractor-07 endpoint | PIR-002 |
| CL-004 | Persistence mechanism is unknown; cannot be determined | No log coverage during GAP-001 (03:00–07:00); no scheduled task, registry, or service evidence outside this window | Insufficient | Unknown — GAP-001 prevents assessment | PIR-003 |
| CL-005 | No confirmed evidence of access after 2025-03-17 07:02 IST (Sysmon restart) | All log sources show no activity from 185.234.x.x after 03:21 | Medium | Adversary using different infrastructure after initial exfil — cannot rule out; recommend threat hunt | PIR-003 |
```

The claims ledger drives everything downstream:
- Executive brief cites CL-IDs, not raw log lines
- SOC handoff uses claims to justify IOC confidence
- Attribution assessment cites claims as the evidence basis
- Sigma rules reference which claim they would have detected

```bash
git add 03-analysis/claims/ 03-analysis/timeline/
git commit -m "PROJ-001: analysis — 16-event timeline, 5 claims; PIR-001 YES (CL-002), PIR-002 MEDIUM (CL-001/CL-003)"
```

---

### Step R4: ATT&CK Mapping with Gap Classification

**File:** `03-analysis/attck-mapping/attck-mapping.md` | **Time:** 1–2 h

The ATT&CK mapping has two purposes: documenting what happened (intelligence) and measuring detection coverage (operations). The **Gap Type** column is the operational output — it tells the SOC and engineering teams exactly what kind of work is needed for each missed technique.

```markdown
| # | Tactic | Technique | Sub | Evidence | Confidence | Rule Fired? | Gap Type | Remediation |
|---|---|---|---|---|---|---|---|---|
| 1 | Initial Access | T1566.001 | — | Email gateway log | High | Partial | Coverage incomplete | Fix email gateway rule to extract attachment hash |
| 2 | Credential Access | T1557 | — | VPN timing pattern (CL-003) | Medium | No | Rule missing | Write Sigma rule DET-002; VPN logs are in SIEM |
| 3 | Initial Access | T1078.001 | — | VPN auth (CL-001) | High | No | Rule missing | Write Sigma rule DET-003 for anomalous VPN auth |
| 4 | Lateral Movement | T1021.001 | — | Inferred (CL-002 timing) | Low | Unknown | Data source missing | Jump host logs not ingested — engineering ticket |
| 5 | Collection/Exfil | T1048.003 | — | DB audit + netflow (CL-002) | High | No | Data source missing | DB audit log not in SIEM — Logstash pipeline needed |
| 6 | Impact (unknown) | Unknown | — | GAP-001 | — | Unknown | Architectural gap | Sysmon reliability improvement — separate track |
```

**Gap taxonomy (each type requires different remediation):**

| Gap Type | What it means | Who fixes it | Estimated effort |
|---|---|---|---|
| Rule missing | Data source is in SIEM; no detection rule deployed | Detection engineer | 1–4 h per rule |
| Data source missing | Log source exists but not ingested into SIEM | SOC engineering | Days to weeks |
| Coverage incomplete | Rule fires but with wrong severity, missing fields, or high latency | Detection engineer | 2–8 h per rule |
| Architectural gap | Log source cannot be enabled or doesn't exist | IT architecture | Weeks to months |
| Not applicable | Technique out of scope for this engagement | — | — |

Export the Navigator layer and commit it:

```bash
# In ATT&CK Navigator: build your coverage layer (green=detected, yellow=partial, red=missed)
# Export as JSON: Layer → Download as JSON
# Save to: 03-analysis/attck-mapping/navigator-layer.json

git add 03-analysis/attck-mapping/
git commit -m "PROJ-001: ATT&CK mapping — 6 techniques; 2 rule-missing, 2 data-source-missing, 1 incomplete, 1 arch-gap"
```

---

### Step R5: Attribution Assessment

**File:** `03-analysis/attribution/attribution.md` | **Time:** 1–2 h

Write the attribution section only after the claims ledger is complete. Attribution that precedes the evidence analysis is a hypothesis, not a conclusion. The sequence matters.

**The confidence ladder — use the correct language for the evidence you have:**

| Confidence | Evidence required | What to write |
|---|---|---|
| **High** | Infrastructure overlap + tooling match + TTP overlap + independent CERT/ISAC confirmation | "Attributed to [cluster] with high confidence" |
| **Medium-High** | TTP overlap + infrastructure match; no independent confirmation | "Assessed as [cluster] activity based on TTP and infrastructure overlap" |
| **Medium** | TTP overlap only; no infrastructure overlap; no independent confirmation | "Tradecraft consistent with [actor] operations; insufficient evidence for attribution" |
| **Low** | Broadly consistent TTPs; single vector; no corroboration | "Activity shares characteristics with [actor] tradecraft; attribution is inconclusive" |
| **Insufficient** | Single IOC; no technique context; no corroboration | "Insufficient evidence to attribute to a named group or cluster" |

Infrastructure pivoting for attribution — run from the C2 IP before enrichment ages:

```bash
# Passive DNS and co-hosting
curl "https://api.shodan.io/shodan/host/185.234.x.x?key=YOUR_KEY" | jq '.hostnames, .ports, .data[].banner'

# VirusTotal for prior detection history and passive DNS
# Certificate transparency — find co-hosted domains by SAN entries
# MISP cross-correlation — does this IP appear in prior community events?
```

```markdown
## Attribution Assessment — PROJ-001

### Evidence available
- AiTM credential interception via reverse proxy: consistent with CERT-IL CB-2025-041 actor profile
- C2 IP 185.234.x.x: passive DNS shows co-hosting with domains flagged in CERT-IL events
  CB-2025-039 and CB-2025-031 (confirmed via MISP cross-correlation)
- Tooling: cannot assess — no malware recovered due to GAP-001
- TTP overlap: T1557 + T1078.001 + T1048.003 consistent with cluster profile from CB-2025-041

### Confidence: Medium
Two data points (TTP overlap + infrastructure overlap with prior CERT-IL events) provide
corroborating evidence. Independent confirmation would require: (a) toolset match from
contractor-07 endpoint forensics, or (b) CERT-IL deconfliction confirming this IP in an
active track. Neither is currently available.

### Language for deliverables
"Activity assessed as consistent with the Iranian-nexus contractor-targeting cluster
documented in CERT-IL CB-2025-041 (medium confidence), based on AiTM tradecraft overlap
and C2 infrastructure observed in two prior CERT-IL-flagged events. Toolset confirmation
is not possible due to evidence gap GAP-001."
```

---

### Step R6: Derive Sigma Rules for Every Missed Technique

**Files:** `04-detections/sigma/DET-NNN-name.yml` | **Time:** 30–60 min per rule

For each "Rule missing" or "Coverage incomplete" entry in the ATT&CK mapping, write a Sigma rule. The Sigma file references the investigation, the technique, and the validation result — creating a permanent link between intelligence and detection:

```yaml
title: Anomalous VPN Authentication — New Source IP for Known User
id: 7a3c9b1d-5678-4321-efab-9876543210cd
status: experimental
description: >
  Detects a VPN authentication from a source IP with no prior history for the authenticating user.
  Consistent with AiTM credential replay (T1078.001 + T1557).
  Derived from PROJ-001 — initial access step, CL-001 (high confidence).
author: CTI Team — PROJ-001
date: 2025-03-19
logsource:
    category: network
    product: palo_alto_vpn        # adjust to your VPN product
detection:
    selection:
        event.action: vpn_auth_success
        user.name|exists: true
    filter_known:
        source.ip|cidr:
            - '10.0.0.0/8'         # corporate NAT ranges
            - '172.16.0.0/12'
    condition: selection and not filter_known
falsepositives:
    - VPN access from legitimate travel (new country/IP) — validate against HR travel records
    - New contractor onboarding from home IP — coordinate with IT
level: medium
tags:
    - attack.initial_access
    - attack.credential_access
    - attack.t1078.001
    - attack.t1557
# PROJ-001: DET-003 | Gap: ATT&CK row 3 (Rule missing)
# Validated: PASS | 2025-03-19 | hayabusa against PROJ-001 evtx set
```

**Validation before deployment:**

```bash
# Step 1: Confirm the rule fires on the known true-positive event in the incident evtx set
hayabusa csv-timeline \
  --directory ./evtx/ \
  --rules ./04-detections/sigma/DET-003-vpn-new-source-ip.yml \
  --output validate-DET-003.csv

# Check the output includes the 02:14 event from contractor-07
grep "contractor-07" validate-DET-003.csv

# Step 2: Convert to Elastic Lucene for deployment
pip install pySigma-backend-elasticsearch sigma-cli
sigma convert -t lucene -p ecs_windows \
  04-detections/sigma/DET-003-vpn-new-source-ip.yml

# Step 3: Convert to ES|QL (alternative format for newer Elastic stacks)
sigma convert -t esql -p ecs_windows \
  04-detections/sigma/DET-003-vpn-new-source-ip.yml
```

```bash
git add 04-detections/
git commit -m "PROJ-001: detections — DET-001 through DET-004 written and validated PASS via Hayabusa"
```

---

### Step R7: Produce Deliverables

**Files:** `05-deliverables/` | **Time:** 2–4 h

**Executive brief — maximum 1 page, no technical artifacts:**

```markdown
# Incident Brief — PROJ-001 [TLP: AMBER]
2025-03-19 | For: CISO, IR Lead, Legal

## What happened
An assessed Iranian-nexus actor accessed the NDSA biometric records database on 2025-03-17
using stolen VPN credentials belonging to contractor-07, exfiltrating approximately 340,218
biometric records. Initial entry occurred at 02:14 IST; exfiltration completed by 02:51 IST.

## Business impact
INCD notification is required within 72 hours of discovery (deadline: 2025-03-20 02:14 IST).
Biometric Database Authority notification required under Section 12 of the Biometric Database Law.
No confirmed evidence of ongoing access as of investigation date.

## Key findings
- The adversary used valid contractor credentials obtained through suspected phishing — no brute
  force or technical exploit was required to enter the network
- The full biometric records table (340,218 records) was extracted in a single session lasting 4 minutes
- Three of five adversary techniques had no detection coverage at the time of the incident;
  none of the five triggered an alert

## What was not detected
The credential theft, the VPN login from an unrecognized IP, and the database exfiltration
all occurred without generating a single security alert. The incident was discovered through
a retrospective log review 36 hours after it concluded, not through real-time detection.

## Recommended actions
1. [IR Lead — by 18:00 today] Revoke and rotate all contractor VPN credentials
2. [CISO — by 02:14 IST 2025-03-20] File INCD notification using the PROJ-001 incident report
3. [SOC Lead — by end of week] Deploy detection rules DET-001 through DET-004 to Kibana; submit
   DB audit log pipeline to engineering as P0 ticket
```

**SOC handoff contains the operational package — not narrative, only actionable data:**

```markdown
# SOC Handoff — PROJ-001

## Current IOCs (valid as of 2025-03-19)
| Type | Value | Confidence | TTL | Action |
|---|---|---|---|---|
| IPv4 | 185.234.x.x | High | 30 days | Block at perimeter; alert on any new connections |
| Domain | spoofed.vendor@mailpro[.]cc | High | 30 days | Block at email gateway |
| SHA256 | 4a7f... (Q1-Invoice-2025.docx) | Medium | 90 days | Block at endpoint |

## Rules deployed / pending
| Rule ID | Status | CAB ticket | Covers |
|---|---|---|---|
| DET-001 | Deployed 2025-03-19 14:00 | CAB-2025-0341 | T1566.001 email delivery |
| DET-003 | Deployed 2025-03-19 14:00 | CAB-2025-0341 | T1078.001 anomalous VPN auth |
| DET-002 | Pending — blocked on VPN log pipeline | ENG-0234 | T1557 AiTM session replay |
| DET-004 | Pending — blocked on DB audit pipeline | ENG-0235 | T1048.003 DB exfiltration |

## Hunting queries (residual activity)
Hunt for additional sessions from the same ASN as 185.234.x.x in the 30 days before the incident.
Hunt for any contractor accounts that authenticated successfully from IPs with no prior history.

## Escalation criteria
Escalate immediately if:
- Any new connection from 185.234.x.x or the /24 subnet
- Any authentication from contractor-07 or other contractor accounts outside working hours
- Any new SELECT * queries against the biometric_records table
```

---

## Proactive Mode: Full Walkthrough

### Step P1: Copy the Template

```bash
cp -r CTI_as_a_Code/templates/proactive/ assessments/myorg-threat-model-2025-q2/
cd assessments/myorg-threat-model-2025-q2/
git init && git add . && git commit -m "PROJ-002: proactive scaffold initialized"
```

Proactive template structure:

```
proactive/
├── 00-scope/scope.md
├── 01-trigger-intelligence/
│   ├── trigger-assessment.md           ← summary across all triggers
│   └── triggers/
│       ├── TRG-001-cert-il-advisory.md
│       └── TRG-NNN-name.md             ← one file per trigger
├── 02-crown-jewels/
│   └── crown-jewels.md
├── 03-threat-model/
│   ├── attack-paths.md                 ← paths from entry to crown jewels
│   └── scenarios/
│       └── SCN-NNN-name.md             ← one per attack path
├── 04-detection-backlog/
│   └── detection-backlog.md
└── 07-deliverables/
    ├── executive-brief.md
    └── technical-brief.md
```

---

### Step P2: Run the Intake

Use the same intake template as reactive, adapted for proactive context. Key questions to add:

```markdown
## Proactive-specific intake questions

**What is the trigger for this assessment?**
(What happened externally or internally that caused this work to be commissioned now?)

**Is there a hard deadline?**
(Product launch, compliance audit, board review, contract renewal — any of these set a fixed end date)

**What detection capability currently exists?**
(What SIEM rules are already deployed? What log sources are already ingested?)

**What is the budget for detection backlog work?**
(How many engineering sprints are available? This determines how many P1 items can realistically land)

**What threat actor context is already available?**
(Prior incident reports, CERT advisories, threat intel subscriptions)
```

---

### Step P3: Assess Trigger Intelligence

**Files:** `01-trigger-intelligence/triggers/TRG-NNN-name.md` | **Time:** 2–4 h per trigger cycle

A trigger is an intelligence input that changes the threat assessment for this specific organization. Write one file per trigger:

```markdown
# TRG-001 — CERT-IL CB-2025-041: AiTM Campaign Targeting Government Contractors

## What happened
CERT-IL advisory CB-2025-041 (2025-04-03) describes an active AiTM phishing campaign targeting
contractors with access to Israeli government identity and biometric systems. Three confirmed
victims in the municipal sector in March 2025. The adversary cluster replays intercepted session
tokens within 4–8 hours of interception.

## Source reliability
Source: CERT-IL — rating A (completely reliable; official government advisory from direct investigation)
Information: 1 (confirmed — CERT-IL investigated the victim cases directly)
Combined: High

## Relevance to THIS organization
- MyOrg operates contractor VPN with the same architecture described in CB-2025-041
- Contractor class accounts have direct read access to the biometric records database
- Two MyOrg contractors use the same IdP flagged in the advisory
- MyOrg's MFA is not enforced on VPN re-authentication for valid sessions — identical gap

## ATT&CK techniques implied
- T1557 — AiTM session token interception
- T1078.001 — VPN authentication with stolen credentials
- T1048 — data exfiltration via authorized session (no alert triggered in victim cases)

## Detection action implied
PRIORITY: Verify whether VPN authentication logs are ingested into the SIEM.
If not — this is a P0 pipeline gap that blocks detection of the primary technique.
If yes — write AiTM detection rule immediately.

## Confidence
High — authoritative source, directly applicable to our architecture, confirmed active campaign.
```

---

### Step P4: Crown Jewels Analysis

**File:** `02-crown-jewels/crown-jewels.md` | **Time:** 2–4 h

Tier every asset by the business impact of compromise. Be specific — vague tier assignments produce vague threat models:

```markdown
## Tier 1 — Critical (compromise triggers regulatory notification or irreversible harm)

| Asset | System | Why Tier 1 | Notification trigger |
|---|---|---|---|
| Biometric records database | db-01 | 340K+ biometric records; Biometric Database Law §12 | Biometric Database Authority + INCD |
| Payment gateway | pay-gw-01 | PCI-DSS scope; real-time payment processing | BoI-CD 362 immediate notification |
| Active Directory | dc-01 | Domain takeover enables access to all Tier 1 systems | All downstream triggers |
| GovID authentication service | govid-svc-01 | National identity system; 2.1M citizen accounts | INCD mandatory notification |

## Tier 2 — High (enables attack on Tier 1)

| Asset | System | Attack path to Tier 1 |
|---|---|---|
| Contractor VPN gateway | vpn-gw-01 | Entry point; contractor accounts have db-01 read access |
| Contractor jump host | jump-01 | Pivot from DMZ to internal db-01 segment |
| Identity provider | idp-01 | Credential validation for all internal services |
| SIEM / logging infrastructure | siem-01 | Attacker visibility if compromised; evidence destruction risk |

## Tier 3 — Medium (operational impact, no regulatory trigger)
- Internal wikis and collaboration tools
- Development and staging environments (non-production data only)
- Monitoring dashboards
```

---

### Step P5: Model Attack Scenarios

**Files:** `03-threat-model/scenarios/SCN-NNN-name.md` | **Time:** 1–2 h per scenario

For each path from perimeter (or insider) to a Tier 1 asset, write a scenario. The scenario is not a story — it is a structured model that maps directly to detection tasks:

```markdown
# SCN-001 — Contractor AiTM Phishing → Biometric Database Exfiltration

## Trigger basis
TRG-001 (CERT-IL CB-2025-041) — confirmed active campaign using this exact path

## Kill chain

| Step | Technique | Procedure | Current coverage |
|---|---|---|---|
| 1 | T1566.001 | Spearphishing link to spoofed VPN login page | Partial rule — browser-based phishing not covered |
| 2 | T1557 | AiTM proxy intercepts session token | No rule — VPN auth logs NOT in SIEM |
| 3 | T1078.001 | Token replay to VPN gateway | No rule — same pipeline gap |
| 4 | T1021.001 | RDP from jump host to db-01 | No rule — jump host Sysmon not collected |
| 5 | T1048.003 | Full-table SELECT; HTTPS exfil to C2 | No rule — DB audit log not in SIEM |

## Coverage verdict
0 of 5 techniques covered. All 5 require detection backlog entries.
3 of 5 are blocked by pipeline gaps (steps 2–4) — these require engineering work before rules can be written.

## Impact if scenario executes undetected
- 340K+ biometric records exfiltrated
- INCD and Biometric Database Authority notifications mandatory
- Estimated regulatory exposure: significant
```

---

### Step P6: Build the Detection Backlog

**File:** `04-detection-backlog/detection-backlog.md` | **Time:** 1–2 h

The detection backlog translates scenario analysis into sprint-ready engineering work. Every item has enough information to be picked up by a detection engineer without further context:

```markdown
| Pri | ID | Technique | Scenario | Pre-condition | Owner | Sprint | Status |
|---|---|---|---|---|---|---|---|
| P0 | ENG-001 | Pipeline | SCN-001 steps 2–3 | VPN auth logs must be ingested into SIEM before DET-B001/B002 can be written | Engineering | Sprint 1 | Blocked — pipeline |
| P0 | ENG-002 | Pipeline | SCN-001 step 5 | DB audit log must be ingested before DET-B003 | Engineering | Sprint 1 | Blocked — pipeline |
| P1 | DET-B001 | T1557 (AiTM) | SCN-001 step 2 | Requires ENG-001 | Detection | Sprint 2 | Waiting on ENG-001 |
| P1 | DET-B002 | T1078.001 | SCN-001 step 3 | Requires ENG-001 | Detection | Sprint 2 | Waiting on ENG-001 |
| P1 | DET-B003 | T1048.003 | SCN-001 step 5 | Requires ENG-002 | Detection | Sprint 2 | Waiting on ENG-002 |
| P2 | DET-B004 | T1021.001 | SCN-001 step 4 | Jump host Sysmon deployment needed | Detection | Sprint 3 | — |
| P2 | DET-B005 | T1566.001 | SCN-001 step 1 | Partial rule exists — needs browser phishing coverage added | Detection | Sprint 2 | Tuning existing rule |
```

**P0 items are not detection rules — they are infrastructure prerequisites.** The backlog separates these explicitly so the sprint plan is realistic: you cannot write an AiTM detection rule if the VPN logs are not in the SIEM. Making this visible prevents teams from reporting "rule written" while the actual gap remains open.

```bash
git add .
git commit -m "PROJ-002: proactive complete — SCN-001 modeled, detection backlog 7 items (2 blocked on pipeline)"
```

---

## Full Cycle Mode: Building a CTI Program

Full Cycle applies when the task is not a single investigation but building the capability to run investigations continuously. It produces a governance structure, a PIR framework, and a collection plan.

```bash
cp -r CTI_as_a_Code/templates/full-cycle/ programs/myorg-cti-program-2025/
cd programs/myorg-cti-program-2025/
git init && git add . && git commit -m "PROJ-003: full-cycle scaffold initialized"
```

**Key outputs of full-cycle mode:**

**Stakeholder map** — who receives what intelligence, at what classification level, on what schedule:

```markdown
| Stakeholder | Role | Products | TLP | Cadence |
|---|---|---|---|---|
| CISO | Executive sponsor | Strategic brief, program metrics | AMBER | Monthly |
| SOC Lead | Operational consumer | Tactical alert, IOC packages | RED | On-demand |
| Detection Engineering | Technical consumer | Sigma backlog, hunting hypotheses | RED | Weekly sprint |
| Legal / Compliance | Regulatory | Incident reports, regulatory notifications | AMBER | Per incident |
| CERT-IL | External sharing | Anonymized IOC packages | GREEN | Per incident |
```

**PIR register** — every PIR linked to a stakeholder decision:

```markdown
| ID | PIR | Stakeholder | Decision it drives | Review cadence |
|---|---|---|---|---|
| PIR-001 | Is the Iranian-nexus AiTM cluster from CERT-IL CB-2025-041 actively targeting our contractor VPN? | CISO | Contractor access architecture review | Monthly |
| PIR-002 | What is the current detection coverage rate across our top-10 adversary techniques? | SOC Lead | Sprint prioritization and backlog ordering | Bi-weekly |
| PIR-003 | Are any of our third-party suppliers under active targeting by nation-state actors? | Legal / Procurement | Supplier risk assessment and contract reviews | Quarterly |
```

**Collection plan** — sources mapped to PIRs, with gaps made explicit:

```markdown
| Source | PIRs | Reliability | Current status | Gap |
|---|---|---|---|---|
| CERT-IL advisories | PIR-001, PIR-003 | A/1 (High) | Active MOU — weekly digest | None |
| Internal SIEM alerts | PIR-002 | A/1 (High) | Active | VPN logs not ingested — ENG-001 |
| Recorded Future | PIR-001, PIR-002 | B/2 (Medium-High) | No subscription | Procurement Q3 2025 |
| Sector ISAC | PIR-003 | B/2 (Medium-High) | Membership lapsed | Renewal in progress |
```

Collection gaps that block PIR answers are tracked as program risks with owners and deadlines — not just technical notes. A PIR that cannot be answered because a log source is not ingested is a program failure, not a SIEM problem.

---

## Adversary Emulation Mode: Validating Coverage

Emulation runs after detections have been built. It answers the question: do these rules actually work against a real adversary executing these techniques?

```bash
cp CTI_as_a_Code/templates/adversary-emulation.md \
   exercises/myorg-emulation-q3-2025.md
```

**Build the emulation plan from a CTI report:**

```markdown
# Emulation Plan — Operation Desert Cipher (Q3 2025)

## Authorization
Authorized by: CISO — ref: AUTH-2025-Q3-001
Scope: JUMPHOST-LAB and TARGET-LAB only; no production systems
Date: 2025-07-14 through 2025-07-16

## Threat intelligence basis
CTI report: training/A04-emulation-techpay/01-cti-report/operation-desert-cipher.md
Actor: Assessed Iranian-nexus cluster

## Module table
| # | Technique | Procedure | Tool | Expected alert | Pre-check |
|---|---|---|---|---|---|
| MOD-01 | T1566.001 | Send .docx with embedded macro | GoPhish | Email gateway + EDR | Email gateway logs ingested? |
| MOD-02 | T1557 | AiTM proxy against lab VPN portal | Evilginx2 | VPN auth anomaly rule | VPN logs in SIEM? |
| MOD-03 | T1078.001 | Replay captured session token | curl | Anomalous auth rule | DET-003 deployed? |
| MOD-04 | T1021.001 | RDP from jump host to target | mstsc | Lateral movement rule | Jump host Sysmon running? |
| MOD-05 | T1059.001 | Execute PowerShell from RDP session | powershell.exe | T1059 rule | DET-005 deployed? |
| MOD-06 | T1048.003 | Exfil dummy file via HTTPS | curl | Egress detection | DB audit rule deployed? |
| MOD-07 | T1070.001 | Clear Windows event logs | wevtutil | Log-clearing alert | DET-007 deployed? |
```

**Execute and score:**

```bash
# Post-execution: scan lab evtx with all Sigma rules
hayabusa csv-timeline \
  --directory ./lab-evtx/ \
  --output emulation-results-$(date +%Y%m%d).csv \
  --profile verbose

# Check which modules fired
grep -E "T1557|T1078|T1059|T1048|T1021|T1070|T1566" emulation-results-*.csv
```

**Coverage matrix with root cause for every FAIL:**

```markdown
| Module | Technique | Result | Root Cause | Remediation |
|---|---|---|---|---|
| MOD-01 | T1566.001 | PARTIAL | Rule fired; attachment hash missing — email gateway log field not parsed | Fix Logstash parser for email gateway |
| MOD-02 | T1557 | FAIL | Rule not deployed — VPN log pipeline not complete at exercise date | ENG-001 still open; reschedule after pipeline completes |
| MOD-03 | T1078.001 | PASS | Alert within 90 seconds | — |
| MOD-04 | T1021.001 | PASS | Alert within 2 min | — |
| MOD-05 | T1059.001 | PASS | Alert within 45 seconds | — |
| MOD-06 | T1048.003 | FAIL | Data source missing — DB audit log pipeline not complete | ENG-002 still open |
| MOD-07 | T1070.001 | PASS | Alert within 20 seconds | — |

## Summary: 4 PASS (57%) | 1 PARTIAL (14%) | 2 FAIL (29%)
## Both FAILs trace to open engineering tickets, not missing detection rules.
```

---

## Git Discipline — The Same for All Modes

The git log is the audit trail. Commit phase by phase with informative messages:

```bash
# After intake
git add 00-scope/intake.md
git commit -m "PROJ-001: intake — initial hypothesis AiTM contractor theft; 3 PIRs identified"

# After scope sign-off
git add 00-scope/scope.md
git commit -m "PROJ-001: scope — signed off by CISO 2025-03-18; TLP AMBER; legal hold"

# After evidence inventory
git add 01-evidence/
git commit -m "PROJ-001: evidence — 5 sources, GAP-001 (4h Sysmon 03-17), checksums committed"

# After timeline and claims
git add 03-analysis/
git commit -m "PROJ-001: analysis — 16 events, 5 claims; PIR-001 answered YES (CL-002)"

# After ATT&CK mapping
git add 03-analysis/attck-mapping/
git commit -m "PROJ-001: ATT&CK mapping — 6 techniques, 2 rule-missing, 2 data-missing, 1 incomplete"

# After detections validated
git add 04-detections/
git commit -m "PROJ-001: detections — DET-001 to DET-004 validated PASS via Hayabusa"

# After deliverables complete
git add 05-deliverables/
git commit -m "PROJ-001: deliverables — executive brief and SOC handoff; INCD notification ready"
```

**Rules:**
- One commit per completed phase — not one bulk commit at the end
- Never edit a committed evidence file — create a new amendment document and commit that
- Commit messages: project ID + phase + factual one-line summary of what changed
- When an assessment changes (e.g., CL-003 confidence downgraded), commit the change with a message explaining why

---

## Minimum-Viable Path: No Lab Required

The full methodology runs without Docker. Replace each lab component:

| Lab component | What to use instead |
|---|---|
| OpenCTI | `02-sources/source-registry.md` and `03-analysis/attck-mapping/attck-mapping.md` maintained manually in Markdown |
| TheHive | The project folder in git — `00-scope/scope.md` is your case record |
| Timesketch | `grep`, `jq`, or a spreadsheet — export to `03-analysis/timeline/timeline.md` |
| ATT&CK Navigator | [navigator.attack.mitre.org](https://mitre-attack.github.io/attack-navigator/) in the browser — export the layer JSON and commit it |
| Sigma deployment | [Uncoder.io](https://uncoder.io/) for ad-hoc conversion; paste the Elastic KQL into your SIEM directly |
| Hayabusa validation | Run locally against collected `.evtx` — no SIEM required |

The intake template, evidence labels, claims ledger, ATT&CK gap taxonomy, and git commit discipline apply identically with or without the lab stack.

---

## The Ecosystem

CTI as a Code is one part of a practitioner ecosystem:

| Project | Role | Use when |
|---|---|---|
| [CTI as a Code](https://anpa1200.github.io/CTI_as_a_Code/) | Lab stack, investigation scaffolds, training assignments | Running an investigation or building detection coverage |
| [CTI Analyst Field Manual](https://anpa1200.github.io/cti-analyst-field-manual/) | Analytic tradecraft standard | Need the full methodology behind evidence labels, PIR design, attribution, CTI-to-detection |
| [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/) | Israeli sector threat knowledge base | Working on any Israeli government, CII, or public sector engagement |
| [Customer-Driven AI CTI](https://anpa1200.github.io/customer-driven-ai-cti-project/) | CTI delivery methodology | Turning CTI work into a managed customer engagement with quality gates |

See the [Ecosystem page](https://anpa1200.github.io/CTI_as_a_Code/ecosystem) for end-to-end cross-project workflows.

---

## Where to Start

```bash
# Get the project
git clone https://github.com/anpa1200/CTI_as_a_Code.git
cd CTI_as_a_Code

# Reactive: copy the template, run intake, start scoping
cp -r templates/reactive/ ../my-first-investigation/
cd ../my-first-investigation/
git init && git add . && git commit -m "PROJ-001: scaffold initialized"
cp 00-scope/scope.md 00-scope/intake.md   # use the intake template from this article
# fill in intake.md during the first call, then scope.md after

# Or open a fully worked example to see the complete methodology applied
ls CTI_as_a_Code/training/A01-reactive-lifetech/
```

The 8 training assignments in the repository are fully populated: project brief, synthetic evidence data, all analytical files, and worked solutions. **A01** (reactive, 52-hour Iranian-nexus breach) is the best starting point for reactive work. **A02** (proactive, nation-state telecom targeting) for proactive. **A04** and **A08** for adversary emulation.

The methodology in this article is exactly what runs through all 8 assignments.

---

*Tags: Threat Intelligence · CTI · Detection Engineering · Incident Response · Sigma · MITRE ATT&CK · Blue Team · Cybersecurity*
