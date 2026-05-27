# Solution Template: Adversary Emulation and Detection Validation

> Use this template when validating whether deployed detections work against documented adversary TTPs.
> Input: a CTI report or threat actor profile. Output: a coverage matrix and gap backlog.

---

## PART 1 — TTP Extraction **MANDATORY**

> **Purpose:** Build the emulation target list directly from the CTI report — ensures every test module traces to explicit, evidence-backed adversary behavior rather than analyst assumption.  
> **Input:** CTI report or threat actor profile documenting observed adversary TTPs.  
> **Output:** Extracted TTP table with evidence quotes, confidence ratings, and yes/no emulation decisions with justification.  
> **Target:** Emulation plan design (PART 2); authorization documentation; traceability chain from test result back to the intelligence source.

> **Tools:** [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [Sigma](https://sigmahq.io/) *(open-source)* · [tram](https://github.com/center-for-threat-informed-defense/tram) *(open-source)*
>
> ATT&CK Navigator: create a layer from extracted techniques; color-code by confidence; export as JSON for comparison with coverage layer. OpenCTI: import the CTI report as an OpenCTI Report object; extracted TTPs auto-link to ATT&CK technique objects via relationship graph. MISP: tag report indicators with ATT&CK Galaxy entries for structured extraction. TRAM (Threat Report ATT&CK Mapper): ML-assisted tool from CTID that auto-suggests ATT&CK technique mappings from free-text threat reports — use as a first-pass draft, then validate manually. Sigma: once techniques are extracted, search the SigmaHQ rule repository for existing community rules covering each technique.

### Extraction from CTI Report

For each described behavior in the source CTI report, extract exactly one ATT&CK technique mapping.

**Extraction rules:**
- Map to the most specific sub-technique available
- Every mapping must cite a specific paragraph or sentence from the source report
- Do not map inferred behaviors — only what is explicitly described
- If a behavior could map to multiple techniques, list all and state which you will emulate and why

### Extracted TTP Table

| # | Behavior (from report) | Tactic | Technique ID | Sub-technique | Evidence Quote | Confidence | Emulate? | Reason if No |
|---|---|---|---|---|---|---|---|---|
| 1 | "Actor deploys BITS job to download second-stage payload" | Persistence | T1197 | — | *"[exact quote from report]"* | High | Yes | — |
| 2 | "Lateral movement via RDP from jump host" | Lateral Movement | T1021.001 | — | *"[exact quote]"* | High | Yes | — |
| 3 | "Possible DCSync observed (unconfirmed)" | Credential Access | T1003.006 | — | *"[exact quote]"* | Low | No | Low confidence; cannot safely emulate against partial evidence |

**Total extracted:** [N] techniques
**Emulation candidates:** [N] (exclude techniques with confidence < Medium or that require destructive execution in lab)

---

## PART 2 — Emulation Scenario Design **MANDATORY**

> **Purpose:** Design executable test modules for each emulated technique before any lab work begins — the completed module form is the authorization and safety document.  
> **Input:** Emulation candidate list from PART 1.  
> **Output:** Complete test module form per technique (exact command, pass/fail/partial criteria, safety considerations); kill-chain-ordered emulation sequence.  
> **Target:** Lab execution team (PART 3); Security Officer sign-off; INCD or regulator pre-notification package.

> **Tools:** [Atomic Red Team](https://github.com/redcanaryco/atomic-red-team) *(open-source)* · [MITRE CALDERA](https://caldera.mitre.org/) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)* · [Invoke-AtomicRedTeam](https://github.com/redcanaryco/invoke-atomicredteam) *(open-source)* · [MITRE ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)*
>
> Atomic Red Team: the largest open library of pre-built atomic tests (single-technique executions) — covers 90%+ of ATT&CK techniques; each atomic maps directly to a technique ID. Invoke-AtomicRedTeam: PowerShell wrapper for Atomic Red Team; run and log atomics from a script with minimal setup. CALDERA: agent-based adversary emulation platform; chain atomics into multi-step scenarios; built-in ATT&CK mapping; requires more setup than Atomic Red Team but supports autonomous operation. VECTR: plan, track, and document emulation modules from pre-execution through results — the project management layer for the emulation program.

### Test Module Structure

For each emulated technique, a test module must have all of the following fields. Do not proceed to execution without completing this form.

---

**MODULE [N]: [Technique name]**

| Field | Value |
|---|---|
| Module ID | MOD-[NN] |
| ATT&CK Technique | T[ID] — [Name] |
| Source CTI Reference | [Report name, page/section] |
| Detection Under Test | [Rule ID] or "NONE — testing for gap" |
| Target System | [Lab replica hostname] |
| Emulation Command | `[exact command or action]` |
| Execution Account | [privilege level required] |
| Pass Criterion | [Alert fires within [N] min; fields captured: [list]] |
| Fail Criterion | [No alert after [N+5] min] |
| Partial Criterion | [Alert fires but missing field X, or fires after [N+5] min] |
| Safety Considerations | [What happens to the lab system; rollback procedure] |
| Pre-conditions | [What must be true before this module can run] |

---

### Emulation Sequence

Order matters. Run modules in kill chain order to test correlation rules that depend on sequence:

1. **Initial access** modules first (may not fire SIEM rules but establishes baseline session)
2. **Discovery** modules (establish adversary enumeration pattern)
3. **Lateral movement** (cross trust boundaries — tests boundary-crossing rules)
4. **Persistence** (tests service/registry/BITS rules)
5. **Credential access** (tests LSASS/credential rules)
6. **Collection** (tests data access anomaly rules)
7. **Exfiltration** (tests outbound volume/destination rules)
8. **Defense evasion** (test LAST — log clear will destroy evidence of prior modules if run earlier)

---

## PART 3 — Execution and Results **MANDATORY**

> **Purpose:** Execute test modules against the lab environment and record detection outcomes with precision — distinguishes rule failures from log source failures, and both from architectural gaps.  
> **Input:** Completed test modules (PART 2); lab environment; SIEM access; timestamped Invoke-AtomicRedTeam execution logs.  
> **Output:** Test results table (PASS/PARTIAL/FAIL per module); root-cause failure analysis for every non-PASS result.  
> **Target:** Coverage matrix (PART 4), gap backlog (PART 5), corrected rules (PART 6).

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [Elastic Security / Kibana](https://www.elastic.co/security) *(open-source core)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)* · [Invoke-AtomicRedTeam](https://github.com/redcanaryco/invoke-atomicredteam) *(open-source)*
>
> VECTR: record PASS/FAIL/PARTIAL per module; track time-to-detection; generate coverage percentage reports automatically. Elastic SIEM: primary detection validation surface — query alert index for each module's expected alert after execution. Hayabusa: if SIEM doesn't fire, run Hayabusa against the collected `.evtx` from the lab host to check whether the event was even generated (separates "rule didn't fire" from "event wasn't logged"). Chainsaw: rapid Sigma-based scan of local event logs — confirm whether the raw evidence existed before blaming the SIEM rule. Invoke-AtomicRedTeam: `--ExecutionLogPath` flag saves a timestamped execution log per atomic — cross-reference with SIEM alert timestamps.

### Test Report Table

| Module | Technique | Expected | Actual | Time to Detection | Alert Fields Captured | Result | Root Cause (if fail) |
|---|---|---|---|---|---|---|---|
| MOD-01 | T1197 BITS | Alert within 10 min | Alert at 4 min | 4 min | job_name, dst_domain, src_host | **PASS** | — |
| MOD-02 | T1021.001 RDP | Alert within 35 min | No alert after 60 min | N/A | — | **FAIL** | Rule deployed on VRID-SRV-01 only; not on GovID 2.0 nodes |
| MOD-03 | T1003.001 LSASS | Alert within 5 min | Alert at 3 min; FP suppression fired also | 3 min | GrantedAccess, pid | **PARTIAL** | FP suppression catches backup tool AND comsvcs.dll; rule needs tighter condition |

**Results summary:**
- PASS: [N] / [total] ([%])
- PARTIAL: [N] / [total] ([%])
- FAIL: [N] / [total] ([%])
- NOT TESTED: [N] (with reason)

### Detection Failure Analysis Template

For each FAIL or PARTIAL:

**[Module ID] — Failure Analysis**

*Failure type:* [Rule logic error / Log ingestion gap / Deployment scope gap / Timing issue / Architectural gap]

*Specific condition that caused failure:*
> [Precise description — not "rule didn't work" but "rule checks Image field for `bitsadmin.exe` but BITS jobs can also be created via COM objects that do not spawn bitsadmin.exe as a child process"]

*Evidence of failure:*
> [What was observed in SIEM vs. what was expected]

*Risk of leaving gap unaddressed:*
> [Adversary can [specific action] without detection for [dwell time] before any other rule fires]

*Remediation:*
> [Specific rule change, architectural change, or compensating control]

*Estimated time to remediate:* [N days / weeks]

---

## PART 4 — Coverage Matrix **MANDATORY**

> **Purpose:** Consolidate test results into a complete view of detection coverage per technique-system pair, including techniques that were not tested.  
> **Input:** Test results (PART 3); full technique list including not-tested items (classified, destructive, out-of-scope).  
> **Output:** Full coverage matrix with status (Full/Partial/Gap/Theoretical) and gap priority per row; percentage calculations by category.  
> **Target:** Gap backlog (PART 5), compliance report (PART 7), CISO briefing (PART 8) — this is the single authoritative coverage record for the exercise.

> **Tools:** [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> DeTT&CT: the purpose-built tool for this step — score data sources, detection rules, and visibility per ATT&CK technique; produces coverage YAML files that render as Navigator layers; PASS/PARTIAL/GAP maps directly to its scoring model. ATT&CK Navigator: overlay the emulation results layer against the threat scenario layer — gaps are visually obvious where scenario techniques appear but detection layer is empty or red. VECTR: export coverage matrix directly from recorded test results — no manual table construction. OpenCTI: link coverage status to threat actor objects so the gap backlog is visible in context of the threat that motivated the emulation.

### Full Coverage Matrix

| # | Technique | Sub-technique | System | Rule ID | Emulation Result | Coverage Status | Gap Priority |
|---|---|---|---|---|---|---|---|
| 1 | T1197 BITS Jobs | — | VRID-SRV-01 | GOV-DET-003 | PASS | Full | — |
| 2 | T1197 BITS Jobs | — | GovID 2.0 Frontend | GOV-DET-003 | FAIL (not deployed) | Gap | P1 |
| 3 | T1021.001 RDP | — | VRID-SRV-01 → Ops | GOV-DET-002 | PASS (30-min delay) | Partial | P2 |
| 4 | T1003.001 LSASS | comsvcs.dll | VRID-SRV-01 | GOV-DET-010 | PARTIAL (FP issue) | Partial | P1 |
| 5 | T1070.001 Log Clear | — | All hosts | GOV-DET-004 | PASS | Full | — |
| 6 | [Technique] | [Sub] | [System] | NONE | NOT TESTED (no rule) | Gap | P1 |
| 7 | [Technique — classified segment] | — | GOVNET Classified | [theoretical only] | NOT TESTED (no lab equiv) | Theoretical | [N/A] |

### Coverage Percentage Calculation

| Category | Total Techniques | Fully Covered | Partially Covered | Gap | Coverage % (full only) | Coverage % (full+partial) |
|---|---|---|---|---|---|---|
| Confirmed adversary TTPs | [N] | [N] | [N] | [N] | [%] | [%] |
| Projected adversary TTPs | [N] | [N] | [N] | [N] | [%] | [%] |
| **Total** | **[N]** | **[N]** | **[N]** | **[N]** | **[%]** | **[%]** |

---

## PART 5 — Gap Backlog **MANDATORY**

> **Purpose:** Convert every coverage gap into a tracked, prioritized remediation work item with a named owner and effort estimate.  
> **Input:** Coverage matrix (PART 4) — every row with Gap or Partial status.  
> **Output:** Prioritized gap backlog with root cause category, remediation approach, effort estimate, and compliance risk flag.  
> **Target:** Detection engineering team; P1 gaps flow directly to the compliance report (PART 7); CISO needs the P1 count to make remediation prioritization and budget decisions.

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [GitLab Issues / GitHub Issues](https://about.gitlab.com/) *(open-source option)* · [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [Jira](https://www.atlassian.com/software/jira) *(commercial)*
>
> VECTR: export gap items directly from test result records — no manual table construction; each FAIL and PARTIAL becomes a backlog entry automatically. GitLab / GitHub Issues: free and self-hostable backlog tracking with label-based priority management (P1/P2/P3 labels; milestone for remediation deadline). DeTT&CT: generates a gap map from your coverage YAML — cross-reference with backlog items to ensure every scored gap is in the backlog. ATT&CK Navigator: overlay the gap layer against the threat scenario layer — missing coverage is immediately visible, which helps prioritize which gaps matter most for this specific threat. Jira: if the organization already uses Jira for engineering work, link gap backlog items to detection engineering tickets for end-to-end traceability.

| ID | Gap Description | ATT&CK | System | Root Cause | Detection Approach | Effort | Priority | Compliance Risk |
|---|---|---|---|---|---|---|---|---|
| GAP-001 | [What adversary can do undetected] | T[ID] | [System] | [Rule missing / Rule failed / Architectural] | [How to fix] | [N days] | P1 | [Yes/No] |

**Backlog summary:**
- P1 gaps (critical, affects launch or compliance): [N]
- P2 gaps (important, address within 30 days): [N]
- P3 gaps (should address, no immediate compliance risk): [N]
- Architectural gaps (require infrastructure change, not just rule): [N]

---

## PART 6 — Corrected and New Detection Rules

> **Purpose:** Write the corrected or new detection rule for each failed detection so the next emulation cycle produces a PASS for that module.  
> **Input:** Gap backlog (PART 5); failure analyses from PART 3; the original rule logic and the specific condition that caused the failure.  
> **Output:** Corrected Sigma rules with the key change documented inline; verification test plan covering both TP and FP scenarios.  
> **Target:** SIEM/CAB deployment process after Security Officer review; re-test validation in the next emulation cycle.

> **Tools:** [Sigma](https://sigmahq.io/) *(open-source)* · [Uncoder.io](https://uncoder.io/) *(free web tool)* · [Hayabusa](https://github.com/Yamato-Security/hayabusa) *(open-source)* · [Chainsaw](https://github.com/WithSecureLabs/chainsaw) *(open-source)* · [Elastic Security](https://www.elastic.co/security) *(open-source core)*
>
> Sigma: write the corrected rule once in vendor-neutral YAML; convert to any SIEM query with pySigma or sigmac. Uncoder.io: browser-based Sigma ↔ SIEM converter — paste your corrected Sigma YAML and get Elastic KQL, Splunk SPL, or QRadar LEEF in seconds with no install. Hayabusa: validate the corrected rule against the original test's `.evtx` files before deploying — confirms the rule fires on the known-good TP event. Chainsaw: rapid Sigma scan of local event logs; run both the TP scenario and the FP scenario to verify the corrected filter logic without touching the SIEM. Elastic Security: deploy and activate the corrected rule via API or UI; run both TP and FP test cases against the lab index before enabling in production.

For each failed or gap detection, write the corrected rule.

### Rule Correction Template

**Original rule problem:**
> [What the original rule checked; why it failed]

**Corrected Sigma rule:**
```yaml
title: [Title]
id: [UUID]
# --- KEY CHANGE FROM ORIGINAL ---
# Original: [what the original condition was]
# Changed to: [what was changed and why]
# ---
detection:
  selection:
    [corrected field]: [corrected value]
  filter_corrected:
    [tighter filter that addresses FP or coverage gap]
  condition: selection and not filter_corrected
```

**Verification test:** After deploying the corrected rule, re-run the original failed module and confirm:
- [ ] True positive fires within expected window
- [ ] Known FP scenario does NOT fire (run FP simulation)
- [ ] Alert fields captured include all required fields

---

## PART 7 — Compliance Report Structure

> **Purpose:** Package exercise results in the structured format required by the applicable regulatory obligation — not an optional summary, but a legally mandated submission.  
> **Input:** Test results (PART 3), coverage matrix (PART 4), gap backlog (PART 5), corrected rules (PART 6).  
> **Output:** Compliance report with results summary, gap analysis, remediation plan with dates and owners, compensating controls, and required signatures.  
> **Target:** Regulator (INCD Section 8, BoI-CD auditor, or equivalent); CISO; Compliance Officer/Liaison — must be signed before submission.

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [DFIR-IRIS](https://dfir-iris.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)* · [Obsidian](https://obsidian.md/) *(free, local)*
>
> VECTR: generate the results summary table and coverage percentage automatically from test records — the compliance report's methodology and results sections assemble from VECTR exports. DFIR-IRIS: if the emulation exercise triggered a live incident response action, DFIR-IRIS provides the evidentiary audit trail required by regulators. OpenCTI: link the compliance report to the threat actor object that motivated the exercise — auditors can see the intelligence basis for the technique selection. LibreOffice Writer: draft the full compliance report document locally — critical when the report contains classified content that must not be uploaded to cloud services. Obsidian: structure the compliance narrative from markdown notes; use local encryption for sensitive findings before formatting for submission.

If the emulation is tied to a compliance obligation (INCD Section 8, BoI-CD 362 Section 6, etc.):

### Compliance Report Required Sections

1. **Executive Summary** — 1 paragraph; pass rate; highest-priority gap; status (compliant / non-compliant pending remediation)
2. **Scope and Methodology** — systems tested; techniques emulated; period of testing; who executed
3. **Results Summary Table** — condensed coverage matrix
4. **Gap Analysis and Remediation Plan** — gap backlog with dates; owner; success criteria
5. **Compensating Controls** — what is in place for P1 gaps while remediation is pending
6. **Signatures** — CTI Lead; CISO; Compliance Officer / Liaison acknowledgment

### Compliance Status Determination

| Status | Criteria |
|---|---|
| **Compliant** | All P1 techniques covered (PASS or PARTIAL); no unaddressed P1 gaps; report submitted within deadline |
| **Compliant with conditions** | P1 gaps exist but have documented remediation plan and compensating controls accepted by regulator |
| **Non-compliant** | P1 gaps with no remediation plan; or testing not conducted within required period; or report not submitted |

---

## Part 8 — Communication Deliverables

> **Purpose:** Communicate exercise findings to non-technical leadership in a format that drives prioritization and funding decisions.  
> **Input:** Coverage percentage and gap backlog summary (PARTS 4–5); compliance status determination (PART 7).  
> **Output:** 15-minute CISO briefing structure (situation → findings → highest risk → actions); 1-page DG executive summary with plain-language harm statement.  
> **Target:** CISO (decision: remediation funding priority); DG (decision: is the compliance status acceptable to the organization).

> **Tools:** [LibreOffice Impress](https://www.libreoffice.org/) *(open-source)* · [Obsidian](https://obsidian.md/) *(free, local)* · [VECTR](https://vectr.io/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> LibreOffice Impress: build the CISO briefing slide deck locally — no cloud upload required for sensitive gap findings; export as PDF for distribution. Obsidian: draft both the technical and non-technical summaries from the same set of linked notes; use a template to ensure the DG executive summary stays on one page. VECTR: export a coverage percentage chart directly from test results — embed as a visual in the CISO briefing to replace the wall of numbers. OpenCTI: generate a tiered intelligence product from the same data model — technical version (with ATT&CK IDs and Sigma references) vs. executive version (plain-language harm narrative) without duplicating content.

### CISO Briefing (15-minute format)

Structure: **Situation → What we found → Highest risk → Immediate actions → Timeline**

1. **Situation (2 min):** Purpose of the exercise; scope; compliance obligation served
2. **What we found (8 min):** Pass rate; top 3 findings (PASS/FAIL/PARTIAL); comparative trend if repeat exercise
3. **Highest risk (2 min):** Single most dangerous gap; what an adversary could do with it; how long remediation takes
4. **Actions (3 min):** What happens in the next 2 weeks; what requires CISO decision

### DG Executive Summary (1 page)

```
[Heading]: Detection Validation Exercise — [Month Year]

WHAT WE TESTED: We tested whether our security monitoring systems can detect
the attack techniques used against [peer org] / documented in [report].

WHAT WE FOUND: [N] of [total] detection checks passed. [N] gaps were identified.
The most significant gap affects [system] — an attacker could [plain-language harm].

WHAT WE ARE DOING ABOUT IT: [3 bullets, plain language, with timelines]

ARE WE COMPLIANT: [Yes / Compliant with conditions — explain briefly]
```

---

## Common Mistakes to Avoid

| Mistake | Why It Matters | Correct Approach |
|---|---|---|
| Running defense evasion (log clear) before other modules | Destroys evidence of earlier modules | Always run log clear LAST |
| Calling a detection "PASS" if it fires but with wrong fields | A rule that fires without identifying the account is not useful | Inspect every alert field; PARTIAL if fields are missing |
| Testing in prod instead of lab replica | Risk of affecting live systems; no safety net | Lab replica only; document architectural differences |
| Not testing FP suppression logic | Suppression that is too broad silently swallows true positives | Run both: TP test AND FP simulation |
| Treating "not tested (classified)" as covered | Unvalidated theoretical coverage is not coverage | Mark explicitly; document compensating controls |
| Submitting compliance report without signatures | Compliance documents without ownership are legally unenforceable | Require CTI Lead + CISO signature on every compliance submission |
