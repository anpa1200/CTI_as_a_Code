---
id: proactive-walkthrough
title: "CTI as a Code in Practice: Proactive Threat Assessment — CelltronX Telecom"
sidebar_position: 3
---

# CTI as a Code in Practice: Proactive Threat Assessment — CelltronX Telecom

**A complete walkthrough of the proactive methodology: how four intelligence triggers, a contractor supply chain threat, and an INCD compliance gap become a sprint-ready detection backlog.**

*All organizations, names, and data are fictional. This is training assignment A02 from the CTI as a Code repository.*

---

## Contents

- [The Scenario](#the-scenario)
- [Step 0: Intake — Capturing the Commission Before the Analysis](#step-0-intake--capturing-the-commission-before-the-analysis)
- [Step P3: Trigger Intelligence Assessment — Four Signals, One Picture](#step-p3-trigger-intelligence-assessment--four-signals-one-picture)
- [Step P4: Crown Jewels Analysis — What Would Be Irreversible](#step-p4-crown-jewels-analysis--what-would-be-irreversible)
- [Step P5: Attack Scenarios — From Crown Jewels to Kill Chain](#step-p5-attack-scenarios--from-crown-jewels-to-kill-chain)
- [Step P6: Detection Backlog — Intelligence Translated to Sprint Work](#step-p6-detection-backlog--intelligence-translated-to-sprint-work)
- [The 72-Hour Immediate Action Plan](#the-72-hour-immediate-action-plan)
- [Deliverables — The CISO Decision Brief](#deliverables--the-ciso-decision-brief)
- [The Git History: What a Proactive Assessment Looks Like](#the-git-history-what-a-proactive-assessment-looks-like)
- [Key Lessons](#key-lessons)

---

## The Scenario

**CelltronX Ltd.** is an Israeli telecommunications provider with 4.2 million mobile subscribers. It operates SS7 signaling infrastructure, a network management system (ENM) for routing control, and billing systems handling 8 million subscriber records per month. Three months ago it was awarded a $210 million government contract to provide connectivity for the Israeli Prime Minister's Office — a fact disclosed on TASE (the Tel Aviv Stock Exchange).

There has been no incident. The SOC has received no alerts. Nobody has called the CTI team with a problem.

But four intelligence signals have arrived in the past three weeks. The CISO has commissioned a threat assessment.

---

## Step 0: Intake — Capturing the Commission Before the Analysis

The assessment begins with an intake call, not with opening a threat report. The intake establishes what the analysis must answer, who it must serve, and what constraints exist.

```markdown
# Proactive Assessment Intake — ASSESS-2024-002 — 2024-10-15

Completed by: CTI Lead
Commissioned by: Dr. Rotem Katz, CISO (hired 90 days ago; Board mandate: 
  "Demonstrate measurable improvement in security posture within 6 months")

## Assessment trigger
CERT-IL TLP:AMBER bulletin received 10 days ago. Peer company incident 3 weeks ago.

## What questions must this assessment answer?
- Is CelltronX currently targeted by the same actor that hit MobileTech IL?
- What is the realistic attack path from the contractor access to our crown jewels?
- What detection capabilities do we need to deploy in the next 30 days?

## Expected deliverable
Technical brief for security team + executive brief for CISO/Board + 
detection backlog with prioritization.

## Hard deadline
INCD-CID pre-audit is in 6 months. Board review in 4 weeks.

## Engineering capacity for detection backlog
Detection team: 3 analysts, 6–8 rules per 30-day sprint.
Currently backlogged: 14 pending rule requests.

## Analyst assessment (initial)
Threat relevance: HIGH. Same contractor type as confirmed victim.
Top 3 risks: (1) ENM access via contractor, (2) billing API credential abuse, 
(3) PM Office connectivity disruption.
```

The engineering capacity constraint (6–8 rules per sprint) is captured in intake because it directly determines the scope of the detection backlog. Writing 30 rules for a team that can deploy 8 in a month wastes analysis time. The backlog must be realistic from day one.

```bash
git init && git add .
git commit -m "ASSESS-002: scaffold initialized"

git add 00-scope/intake-2024-10-15.md
git commit -m "ASSESS-002: intake — 4 triggers, INCD audit in 6mo, 6-8 rules/sprint capacity"
```

---

## Step P3: Trigger Intelligence Assessment — Four Signals, One Picture

A proactive assessment is triggered by intelligence, not by an incident. The first analytical step is to assess each trigger rigorously: what is the source reliability, what is the information reliability, what is the specific relevance to this organization?

| # | Source | Date | TLP | Admiralty Source | Admiralty Info | Key Claim | Relevance to CelltronX |
|---|---|---|---|---|---|---|---|
| TRG-001 | Peer company incident — MobileTech IL Ltd. | 3 weeks ago | AMBER | B (usually reliable) | 2 (probably true) | Iranian-nexus actor compromised Israeli telecom via contractor maintenance account — same vendor type as CelltronX uses | **Critical** — CelltronX uses NetSys Solutions Ltd., same access model as confirmed victim |
| TRG-002 | CERT-IL TLP:AMBER bulletin | 10 days ago | AMBER | B (usually reliable) | 2 (probably true) | Iranian-nexus actor targeting Israeli telecom billing and roaming data via vendor API abuse | **High** — CelltronX billing system API accessible to contractors; same target data type |
| TRG-003 | Domain intelligence (OSINT) | 8 days ago | WHITE | C (fairly reliable) | 3 (possibly true) | Three domains registered impersonating CelltronX targeting NOC staff logins and fake software update lures | **High** — Pre-attack infrastructure; phishing campaign against NOC engineers imminent |
| TRG-004 | Threat actor profile — CEDAR-SIGNAL | Internal | — | A (completely reliable, internal analysis) | 1 (confirmed) | CEDAR-SIGNAL cluster: AiTM credential theft, telecom targeting, disruption capability, active against Israeli sector since Q3 2024 | **High** — CEDAR-SIGNAL capability matches all three triggers |

**Synthesized threat picture:**

An adversary assessed as Iranian-nexus is currently operating against Israeli telecommunications providers through contractor supply chain access. TRG-001 confirms they successfully used this vector against a peer organization. TRG-002 confirms billing and roaming data is their target. TRG-003 shows they have already built phishing infrastructure specifically targeting CelltronX's NOC staff. TRG-004 provides the actor profile.

CelltronX must treat its contractor access as potentially compromised until audited. This is not a theoretical threat — the adversary has already executed this attack against a peer company in the same sector using the same access model.

```bash
git add 01-trigger-intelligence/
git commit -m "ASSESS-002: trigger intelligence — 4 signals, synthesized picture: CEDAR-SIGNAL active, contractor access at risk"
```

---

## Step P4: Crown Jewels Analysis — What Would Be Irreversible

The crown jewels analysis answers: if this threat actor gets in, what can they reach, and what would be the consequence? It forces scope discipline — the detection backlog only covers paths to crown jewels.

| ID | Asset | Why Critical | Breach Consequence | Current Exposure | Priority |
|---|---|---|---|---|---|
| CJ-001 | Subscriber billing records (4.2M customers) | Revenue engine; INCD-CID designated Critical Infrastructure | Mass identity theft; Israeli PPL fine; TASE disclosure obligation; reputational | API accessible to contractors; no rate limiting; logs not in SIEM | **Critical** |
| CJ-002 | Network Management System / ENM | Controls routing for all 4.2M subscribers; PM Office contract dependency | Service disruption or selective blackout; national security incident | ENM CVE-2023-44481 unpatched (v21.4.8); contractor remote access active | **Critical** |
| CJ-003 | PM Office connectivity contract ($210M) | Government CII designation; politically sensitive | Contract loss; national security incident; government review | Dependent on CJ-002 protection; no independent access control | **Critical** |
| CJ-004 | SS7 signaling network | Subscriber call/SMS/location interception capability | SIGINT value to foreign intelligence; subscriber surveillance | Accessible via NMS once NMS is compromised; not logged or monitored | **Critical** |
| CJ-005 | Roaming data (UAE, Cyprus, Romania) | International travel patterns; foreign intelligence value | Foreign intelligence collection on Israeli subscribers | API access from NMS segment; no anomaly detection | High |
| CJ-006 | NOC contractor access credentials | Single gateway to CJ-001 through CJ-005 | All above compromised via one actor | AiTM phishing infrastructure targeting NOC already deployed (TRG-003) | **Critical** |

**The exposure scoring reveals the cascade.** CJ-006 (contractor credentials) scores highest exposure because phishing infrastructure targeting it already exists. But CJ-002 (ENM) scores highest independently because a known CVE is unpatched and exploitable without any credential theft at all. An attacker who does not have valid credentials can still enter via CVE-2023-44481. These are two independent paths to the same crown jewel.

```bash
git add 02-crown-jewels/
git commit -m "ASSESS-002: crown jewels — 6 assets; CJ-006 (contractor creds) and CJ-002 (ENM) highest exposure; CVE-2023-44481 unpatched"
```

---

## Step P5: Attack Scenarios — From Crown Jewels to Kill Chain

Each scenario maps a realistic path from the threat actor's current capability (documented in triggers) to a crown jewel, with every step mapped to ATT&CK and coverage assessed at each step.

### Scenario 1 (HIGH risk): NOC Contractor Compromise → ENM Access → SS7 Collection

**Why this scenario is rated HIGH:** Same vendor access model as TRG-001 victim. Same AiTM technique documented in TRG-002. CEDAR-SIGNAL is documented using this exact path. CelltronX uses the same contractor type. Likelihood is not "could happen" — it is "this has already happened to our peer."

**Kill chain:**

| Step | Technique | Procedure | Current Coverage |
|---|---|---|---|
| 1 | T1566.001 | Spearphishing with ISO lure → fake NOC tool update notification (TRG-003 infrastructure) | Partial — no ISO-specific rule; ATP SCL threshold not tuned |
| 2 | T1557 | AiTM proxy intercepts NOC employee M365 session during fake authentication page | **None** — no AiTM session token detection |
| 3 | T1078.002 | Replays stolen credentials to contractor VPN — no MFA re-challenge on valid session | **None** — no anomalous contractor VPN auth rule |
| 4 | T1190 | Exploits CVE-2023-44481 on unpatched ENM v21.4.8 (alternative to step 3 — no credentials needed) | **None** — no WAF rule for ENM; patch not applied |
| 5 | T1021.001 | RDP from contractor DMZ to ENM/NMS operational segment | Partial — rule exists but 30-min alert delay |
| 6 | T1040 | SS7 MAP queries from NMS access to subscriber records | **None** — SS7 MAP traffic not logged |
| 7 | T1048.003 | Exfiltration via DNS TXT record tunneling | **None** — DNS TXT responses not monitored |

**Coverage verdict: 0 of 7 techniques have adequate coverage. Steps 3, 4, 6, and 7 have complete absence.**

**The CVE finding is the most urgent issue.** Step 4 (CVE-2023-44481) means the adversary does not need to succeed at steps 1–3. If the phishing fails, they can still enter directly. Patching the ENM is not a detection task — it is an emergency remediation item that must run in parallel with detection development.

### Scenario 2 (HIGH risk): Billing API Credential Abuse → Subscriber Record Exfiltration

**Kill chain:**

| Step | Technique | Procedure | Current Coverage |
|---|---|---|---|
| 1 | T1078.003 | Stolen billing API credentials (obtained from compromised contractor laptop or code repository) | **None** — billing API logs not in SIEM |
| 2 | T1530 | Authenticated bulk API calls mimicking legitimate maintenance queries; below any volume threshold | **None** — no rate limiting; no volume anomaly rule |
| 3 | T1048 | Exfiltration over HTTPS using valid API session | **None** — indistinguishable from legitimate API traffic without volume baseline |

**Coverage verdict: 0 of 3 steps covered. Primary blocker: billing API logs are not in the SIEM.**

Unlike Scenario 1, this attack leaves no anomalous process execution, no lateral movement, no registry changes. It looks identical to legitimate contractor maintenance queries until a volume baseline is established. The only detection surface is API log anomaly detection — and those logs are not in the SIEM.

### Scenario 3 (MEDIUM risk): NMS Configuration Change → PM Office Connectivity Disruption

**Prerequisite:** Requires successful Scenario 1 first. Current likelihood: Low (actor appears in reconnaissance/pre-positioning phase). Impact: Critical.

This scenario is rated MEDIUM not because the impact is manageable — a targeted disruption of government connectivity is a national security incident — but because it requires Scenario 1 as a prerequisite. If Scenario 1 detections are deployed, Scenario 3 is automatically harder to execute.

```bash
git add 03-threat-model/
git commit -m "ASSESS-002: scenarios — SCN-001/002/003; 0/7 techniques covered in SCN-001; CVE-2023-44481 emergency patch required"
```

---

## Step P6: Detection Backlog — Intelligence Translated to Sprint Work

The detection backlog is not a wishlist. Every item has: which scenario it covers, what pre-condition must be true before the rule can be written, and which sprint it belongs to given the team's 6–8 rule capacity.

| ID | Detection | Scenario | ATT&CK | Pre-condition | Priority | Sprint | Blocked? |
|---|---|---|---|---|---|---|---|
| DET-001 | Contractor VPN auth from non-corporate ASN, off-hours | SCN-001 step 3 | T1133 + T1557 | ASN enrichment on VPN logs | P1 | Sprint 1 | No |
| DET-002 | RDP from Contractor DMZ to ENM segment, off-hours | SCN-001 step 5 | T1021.001 | None | P1 | Sprint 1 | No |
| DET-003 | ENM authentication failure spike (CVE-2023-44481 probing) | SCN-001 step 4 | T1190 | ENM logs ingested | P1 | Sprint 1 | No |
| DET-004 | NetSys contractor account authentication outside business hours | SCN-001 step 3 | T1078.002 | Contractor account list from HR | P1 | Sprint 1 | No |
| DET-005 | LSASS dump via comsvcs.dll on ENM hosts | SCN-001 | T1003.001 | Sysmon on ENM hosts | P1 | Sprint 1 | **Check — Sysmon deployment** |
| DET-006 | Billing API bulk query from non-standard IP | SCN-002 step 1 | T1078.003 | **Billing API logs in SIEM** | P1 | Sprint 2 | **Yes — no SIEM integration** |
| DET-007 | Billing API call volume anomaly (>N records in M minutes) | SCN-002 step 2 | T1530 | **Billing API logs in SIEM + 30-day baseline** | P1 | Sprint 3 | **Yes — baseline needed** |
| DET-008 | NMS configuration write outside change window | SCN-003 | T1565.001 | **NMS audit logs in SIEM** | P1 | Sprint 2 | **Yes — NMS logs not in SIEM** |

**Blocked items are explicit.** DET-006, DET-007, and DET-008 cannot be written yet because the required log sources are not in the SIEM. The backlog separates these clearly so the sprint plan is realistic: the detection team spends Sprint 1 deploying DET-001 through DET-005 while the engineering team works on the billing API and NMS log pipelines for Sprint 2.

**Compensating controls for blocked items:**
- DET-006 (blocked): SOC runs daily manual review of billing API access logs — 30-minute review of any access volumes > 10,000 records or from non-approved IPs
- DET-008 (blocked): Network Operations conducts weekly NMS configuration diff against last-known-good snapshot

These are not detection rules. They are temporary, human-executed compensating controls that are explicitly documented as such — with an owner and a sunset date (when the log pipeline is complete).

```bash
git add 04-detection-backlog/
git commit -m "ASSESS-002: detection backlog — 8 items; Sprint 1: DET-001–005 (unblocked); Sprint 2: DET-006+008 unblock work; compensating controls documented"
```

---

## The 72-Hour Immediate Action Plan

Not everything waits for the sprint cycle. Some actions are so high-confidence and low-effort that they must happen this week, before the detection backlog is built.

| Action | Trigger | Owner | Deadline | Risk of Not Acting |
|---|---|---|---|---|
| Block 3 impersonation domains at DNS/email gateway | TRG-003 — phishing infrastructure targeting NOC staff is active now | SOC | 24 hours | NOC engineer clicks a link this week before detections are deployed |
| Alert NOC team about the threat | TRG-003 — specific, current targeting | CTI + NOC Lead | 24 hours | Social engineering succeeds because staff don't know they're being targeted |
| Request emergency ENM patch (CVE-2023-44481) from Ericsson | ENM CVE is directly exploitable; Scenario 1 step 4 bypasses all credential detection | NOC Engineering + Ericsson TAC | 48 hours | Adversary exploits CVE before detection is in place — SCN-001 executes without step 1–3 |
| Audit all active NetSys contractor sessions in past 30 days against known working hours | TRG-001 — same vendor confirmed compromised at peer company | SOC + CISO | 24 hours | Ongoing compromise is already present; delay extends dwell time |
| Force MFA re-enrollment for all NetSys contractor accounts | TRG-002 — AiTM session token theft bypasses existing MFA; re-enrollment forces fresh credential binding | IT + CISO decision | 48 hours | Stolen session tokens remain valid for extended periods after AiTM interception |
| Send formal security audit request to NetSys | TRG-001 — peer company victim used same vendor | CISO → NetSys CISO (contract manager) | 24 hours | If NetSys is compromised, CelltronX access is actively at risk |

The 72-hour plan is the bridge between intelligence and action — the things the analysis team recommends that do not require sprint cycles, CAB approvals, or detection engineering capacity. They are immediate, high-signal, low-cost. The CISO needs to make one decision: suspend NetSys remote access pending the audit (Option A — disrupts maintenance) or maintain access with enhanced monitoring and force MFA re-enrollment (Option B — lower disruption, requires DET-001 and DET-004 live within 24 hours).

---

## Deliverables — The CISO Decision Brief

The executive brief is one page. It leads with the bottom line, quantifies the exposure, and ends with a specific decision request.

---

**Executive Brief — CEDAR-SIGNAL Threat to CelltronX**
**TLP:AMBER | For: CISO Dr. Katz | Date: 2024-10-15**

**Bottom line:** An Iranian-linked threat group that recently compromised a peer Israeli telecom through a contractor access arrangement is targeting CelltronX through the same vector. Three impersonation domains targeting our NOC staff were registered this week. A critical vulnerability in our network management platform is unpatched and directly exploitable.

**Why now:** The same hacker group that compromised MobileTech IL's network management system three weeks ago is now deploying phishing infrastructure against CelltronX. CelltronX uses the same type of contractor arrangement as the victim. The attacker has already built fake login portals that mimic our internal systems.

**Current exposure:**

| What's at Risk | Exposure | Why |
|---|---|---|
| ENM (network management) | Critical | CVE-2023-44481 unpatched — accessible without credentials |
| Contractor VPN access | High | Same access model as confirmed victim; phishing active |
| Billing records (4.2M subscribers) | High | Billing API logs not monitored; no rate limiting |
| PM Office connectivity contract | High | Dependent on ENM protection; no independent failsafe |

**What we are doing this week:** Block 3 impersonation domains. Brief NOC team. Request emergency Ericsson patch. Audit NetSys contractor access history.

**Decision required — by end of week:** Suspend NetSys remote access for 5 business days pending security audit (disrupts scheduled maintenance) **or** maintain access with enhanced monitoring and mandatory MFA re-enrollment (requires two detection rules live within 24 hours).

**Recommendation:** Option B (maintain access, force MFA, deploy rules within 24h) escalating to Option A if NetSys does not provide clean audit confirmation within 5 business days.

**Confidence:** High — based on 4 independent triggers including a government advisory and a confirmed peer incident.

---

## The Git History: What a Proactive Assessment Looks Like

```
4d7a2f1  ASSESS-002: deliverables — CISO brief, technical brief, SOC 72h plan
2c9b5e8  ASSESS-002: detection backlog — 8 items, Sprint 1 unblocked, compensating controls
7f3a1c4  ASSESS-002: scenarios — SCN-001 (0/7 covered), SCN-002 (0/3 covered), CVE emergency patch
1e6d8b3  ASSESS-002: crown jewels — 6 assets, CJ-006 highest exposure, ENM CVE critical
9a2c5f7  ASSESS-002: trigger intelligence — 4 signals; synthesized: contractor access at risk
6b8f4d1  ASSESS-002: scope — signed off; 3 PIRs, 6-8 sprint capacity, 6mo INCD deadline
3e1a7c9  ASSESS-002: intake — 4 triggers, INCD audit in 6mo, engineering capacity documented
0d4b6f2  ASSESS-002: scaffold initialized
```

Every commit in a proactive assessment is a decision about what the threat means for this organization. The git history is how the CISO can see that the assessment was systematic — not that someone read a threat report and wrote a list of controls.

---

## Key Lessons

**Intelligence without context is noise.** The CERT-IL bulletin (TRG-002) on its own says "Iranian actor targeting Israeli telecom." That describes half the sector. What makes it actionable is TRG-001 (confirmed peer incident using the same contractor), TRG-003 (impersonation domains targeting CelltronX specifically), and TRG-004 (actor profile matched to the other triggers). Each trigger alone is incomplete. Together they form a specific, actionable threat picture.

**The crown jewels define scope.** Without the crown jewels analysis, the detection backlog would be generic best-practice rules. With it, every backlog item traces to a specific asset (ENM, billing system, PM Office contract) and a specific attack path. The SOC engineer writing DET-001 knows which crown jewel they are protecting and which scenario it covers. That context changes how the rule is tuned.

**Blocked items must be visible.** The most dangerous outcome of a detection backlog is reporting "12 rules delivered" when 4 of them cannot be written because the log sources are not ingested. The sprint plan must separate "rule ready to deploy" from "rule blocked on pipeline." Blocked items need compensating controls and owners, not placeholders.

**A CVE can render all credential detection moot.** ENM CVE-2023-44481 does not need the contractor's credentials to be stolen. It is a direct exploitation path. Writing a perfect AiTM detection rule (DET-001) has zero impact on an adversary who uses the CVE instead. The technical brief to the CISO must make this explicit — detection investment and patch management must be coordinated, not sequential.

**The 72-hour plan is not an afterthought.** The most immediate risk (NOC staff clicking phishing links from TRG-003 infrastructure before any detection is deployed) is addressed by the 72-hour plan, not the sprint cycle. Domain blocking, user awareness, and contractor access audit cost almost nothing and can happen today. They buy the time needed to build the real detection coverage.

---

*This scenario is training assignment A02 from the [CTI as a Code repository](https://github.com/anpa1200/CTI_as_a_Code). The full evidence set, template, and worked solution are available there.*

*Tags: Threat Intelligence · CTI · Proactive Assessment · Threat Modeling · Detection Engineering · MITRE ATT&CK · Blue Team · Supply Chain Security*
