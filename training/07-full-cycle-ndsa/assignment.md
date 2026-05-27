# Assignment 7: Full CTI Cycle — Government Intelligence Program for National Digital Infrastructure

> **Sector:** Israeli Government / National Digital Services  
> **Organization Type:** National government agency — critical national infrastructure  
> **Regulatory Framework:** INCD-CID, Israeli Biometric Database Law, MATZBEN, Israeli Government Information Security Standard  
> **Scenario Type:** Strategic (full cycle) — build a CTI program from post-incident state  
> **Estimated Effort:** 55–75 hours  
> **Level:** CTI Lead / Security Program Manager

---

## Preface

This assignment begins where Assignments 5 and 6 end: NDSA has survived a breach (Assignment 5), successfully launched GovID 2.0 (Assignment 6), and is now 3 months post-launch. Leadership has directed the CISO to build a permanent, institutionalized CTI program — not reactive, not ad-hoc, but a formal intelligence cycle with government-grade stakeholder management. The complexity here is not technical. It is institutional. Building a CTI program inside a government agency means navigating INCD's dual role as both intelligence producer AND oversight authority, managing classification tiers that restrict who can read what, sharing intelligence with other ministries who are simultaneously customers and political competitors, and justifying program cost to a Finance Ministry that does not understand threat intelligence.

---

## Section 1: Organizational Context

### 1.1 NDSA at the Start of This Assignment

**Date:** 1 January 2026 (3 months post-GovID 2.0 launch)  
**Current State:**

- GovID 2.0 is operational; serving 3.1M authentication events per day
- The biometric breach from Assignment 5 (March 2025) is in the public record; Knesset committee hearing completed; report tabled
- NDSA has received an INCD remediation directive requiring a formal CTI program within 6 months (by 1 July 2026)
- The INCD remediation directive specifies: PIR-driven collection plan, quarterly intelligence products, formal sharing agreements with CERT-IL and at least 2 other government agencies
- CISO Col. (Res.) Dror Nativ has been given a budget of ₪8.5M/year for the CTI program and has 6 months to stand it up
- IR Lead Shai Rotenberg is being promoted to CTI Lead — this is his first CTI program management role

**New Personnel:**

| Role | Name | Notes |
|---|---|---|
| CTI Lead (new role) | Shai Rotenberg | Promoted; strong DFIR background; needs to build strategic thinking |
| Senior CTI Analyst (new hire, starts Week 6) | Maya Dvir | 8 years experience; former CERT-IL; starts in 6 weeks — Rotenberg must plan without her initially |
| Junior Analyst (new hire, starts Week 10) | Itai Ben-Levi | Recent Technion graduate; strong data skills; limited CTI experience |
| INCD Liaison | Lt. Col. (Res.) Oren Friedman | Continues; dual role as INCD producer AND NDSA oversight contact creates tension |

### 1.2 Stakeholder Landscape

NDSA's CTI program must serve a complex stakeholder environment:

| Stakeholder | Role | Intelligence Need | Classification Tier They Can Receive |
|---|---|---|---|
| DG Dr. Ayelet Shamir | Primary consumer | Strategic threat picture; decisions about program investment | Unclassified + Secret (briefed) |
| CISO Col. Nativ | Program sponsor | Operational and tactical; threat-to-control mapping | Top Secret |
| GovID 2.0 Ops Team (Hila Shapiro) | Technical consumer | Threats to GovID specifically; indicators for tuning | Unclassified (limited classification access) |
| SOC (Gila Ben-Moshe) | Detection consumer | Indicators, hunting hypotheses, detection requirements | Confidential |
| Legal (Tamar Goldstein) | Compliance consumer | Regulatory threat changes; breach obligations | Unclassified |
| INCD | Oversight + producer | NDSA feeds intelligence BACK to INCD; INCD provides threat picture | TLP:RED via Friedman (Top Secret route) |
| CERT-IL | Peer agency + consumer | Sector threat sharing; Israeli government sector collective defense | TLP:AMBER (via formal MOU) |
| Ministry of Interior (MoI) | Downstream consumer | Threats to their systems that use GovID 2.0 authentication | Unclassified only (no sharing agreement yet) |
| Ministry of Finance | Budget authority | Justification for program cost | Unclassified |
| Israel Tax Authority (ITA) | Peer agency + potential consumer | Parallel CTI maturity journey; same contractor (HavayaIT) | TLP:AMBER (via proposed MOU) |
| Knesset Interior Committee | Oversight | Breach post-mortems; systemic risk | Unclassified (committee testimony) |

**INCD's dual role tension:** Friedman is simultaneously:
- NDSA's primary source for classified threat intelligence
- INCD's auditor/enforcer of NDSA's INCD-CID compliance obligations (including the remediation directive)
- A person with personal professional interest in NDSA not having another breach that INCD could be criticized for failing to prevent

This creates an information asymmetry: Rotenberg must build a CTI program that Friedman will audit, using intelligence that Friedman partially controls access to.

### 1.3 Existing CTI Capability Baseline

**What NDSA already has:**
- 5 Elastic SIEM detection rules (from Assignment 5 response)
- 15 detection backlog items (from Assignment 6 planning)
- One threat report (the Assignment 5 post-incident assessment)
- Informal relationship with CERT-IL (no MOU)
- MISP instance (deployed but empty; no feeds configured)
- INCD embedded liaison (Friedman)

**What NDSA does not have:**
- Formal PIR/SIR framework
- Collection plan
- Intelligence production process
- Any structured output to stakeholders
- DarkOwl, Recorded Future, or other commercial CTI subscriptions (proposed but not yet procured)
- Formal sharing agreements with peer agencies

---

## Section 2: Stakeholder Requirements Definition

### 2.1 Stakeholder Interviews (Simulated)

You have conducted structured interviews with each stakeholder. Excerpts below represent what they said.

**DG Dr. Shamir:**

> "I need to understand, six months from now, whether we are safer than we were when the breach happened. I need to understand that before the Knesset committee asks me. I cannot walk into committee and say 'we hired a CTI team' — I need to say 'we had intelligence that X was targeting us, and here is what we did about it.' The program must produce something I can defend."
>
> "I also need to know about things that have not happened yet. The previous system only told us about things that already happened to us. That is not acceptable for a system that 9.5 million citizens depend on."

**CISO Col. Nativ:**

> "I want two things. First, I want to know what techniques and tools the Iranian-nexus actors are using against government targets so I can tell my detection engineers what to build. Second, I want to know when a new capability or attack is coming before it arrives — not 10 days after we've been breached. If I can't get warning, what is the intelligence for?"
>
> "I'm also aware that I have a classification problem. My SOC can't read TLP:RED. My GovID team doesn't have clearances. I need the intelligence to be actionable by the people who do the work, not just by me."

**Gila Ben-Moshe (SOC Manager):**

> "Give me indicators. Give me hunting hypotheses. Tell me what to look for. Don't give me 40-page reports — I have 12 analysts running 24/7 shifts. I need a one-pager every week that tells me: here's what we think is coming, here's the indicator to look for, here's the hunting query."

**Tamar Goldstein (Legal):**

> "My concern is regulatory. If there's a new INCD directive or a new PPL amendment, I need to know about it before we're in breach. I also need to know if there's been a breach elsewhere in the government that creates an obligation for us — like the ITA situation from last year."

**INCD Liaison Friedman:**

> "The remediation directive requires a quarterly intelligence product. But more than that — INCD wants NDSA to feed intelligence back to us. You know GovID threat actors better than anyone in the government right now. Your telemetry is unique. I need you to produce intelligence that helps the whole sector, not just yourselves."
>
> "I also want to see a collection plan that's actually realistic. Last year we had three agencies submit collection plans that were just wish lists. NDSA needs to show it understands what it can actually collect vs. what it needs external sources for."

**Ministry of Interior (MoI) representative (informal conversation with Shapiro):**

> "We use GovID 2.0 for 14 of our services. If someone is attacking GovID, we need to know about it — but we can't always read your reports because of classification. We need something at the unclassified level that tells us what indicators to watch for in our own logs."

---

## Section 3: Tasks

### Task 1: Priority Intelligence Requirements (PIRs) and Standing Intelligence Requirements (SIRs)

**Requirements:**

1. Based on the stakeholder interviews and NDSA's organizational profile, produce a **PIR Framework** of 5–7 PIRs. For each PIR:
   - PIR number and title
   - Stakeholder(s) this PIR serves
   - Intelligence question in precise analytical form
   - Why this question is answerable (vs. a PIR that is too vague or too broad)
   - Review cadence (quarterly, triggered, rolling)
   - Success criterion: what does an answer to this PIR look like?

   One PIR **must** be dedicated to each of:
   - GovID 2.0 specific threats
   - Supply chain threats (contractors, vendors)
   - Israeli government sector threats (collective picture)
   - Regulatory and notification obligation changes
   - Adversary capability evolution (Iranian-nexus specifically)

2. Produce **SIRs** (Standing Intelligence Requirements) for the SOC and Detection Engineering teams — these are operational-level, always-on collection requirements that feed daily/weekly analytical outputs. Minimum 4 SIRs.

3. Produce a **PIR-to-Stakeholder Matrix**: a table mapping each PIR to the stakeholder who owns it, who produces the intelligence answer, what classification tier the answer will be produced at, and how it will be disseminated.

4. Explain how you handle the **INCD dual-role tension** at the PIR level: PIR-005 (Iranian-nexus capability) will draw heavily on INCD classified sources that Friedman controls. How do you structure the PIR and collection plan so that NDSA is not entirely dependent on Friedman for the most critical intelligence question?

5. Write a **PIR validation memo** (1 page) documenting the process by which PIRs were derived from stakeholder requirements — this is required by the INCD remediation directive to demonstrate that the program is stakeholder-driven, not self-directed.

---

### Task 2: Collection Plan

**Requirements:**

1. Produce a **Collection Plan** mapping each PIR to specific collection sources and methods. The plan must cover all four collection categories:
   - **Technical collection (NDSA-internal):** What can NDSA's own infrastructure produce? (SIEM telemetry, DNS, VPN logs, GovID 2.0 API logs, VRID access logs)
   - **OSINT collection:** What can NDSA collect from open sources? (CERT-IL bulletins, ClearSky reports, Check Point Research, NVD, threat actor domain registration monitoring)
   - **Shared intelligence:** What can NDSA receive from sharing partners? (INCD, CERT-IL, proposed MOU with ITA)
   - **Commercial intelligence:** What requires procurement? (Threat intelligence platform, dark web monitoring, malware analysis service)

2. For each collection source, assess:
   - Current availability (already have / available with MOU / requires procurement)
   - Intelligence value for each relevant PIR
   - Classification tier of the source's output
   - Data handling requirements (TLP, classification marking, retention)

3. Identify **collection gaps**: what PIRs cannot be adequately serviced by the planned collection sources? For each gap, propose a solution (additional source, collection method, or intelligence requirement modification).

4. Produce a **procurement recommendation** for commercial intelligence capabilities: based on budget (₪8.5M/year total; internal staff costs approximately ₪3.2M/year; infrastructure ₪1.8M/year; remaining ~₪3.5M for subscriptions and services), recommend specific capability categories to procure. You do not need to name specific vendors — describe capability requirements. Prioritize by PIR coverage.

5. Design the **MISP configuration** for NDSA's intelligence sharing platform:
   - What feeds should be configured (CERT-IL, INCD, open MISP communities)?
   - What taxonomy and tagging scheme should NDSA apply to maintain TLP compliance?
   - How should MISP be used to share indicators downstream to the SOC (unclassified) vs. to INCD (classified)?

---

### Task 3: Intelligence Production Cycle

**Requirements:**

1. Design the **intelligence production process** for NDSA. Produce a process diagram (text-based is acceptable) and written procedure covering:
   - Collection (sources, frequency, responsible analyst)
   - Processing (triage, deduplication, MISP ingestion, classification tagging)
   - Analysis (structured analytic techniques, confidence level assignment, peer review)
   - Production (which templates to use, classification marking, version control)
   - Dissemination (channel per stakeholder tier, handling caveats)
   - Feedback (how consumers provide feedback; how feedback informs PIR review)

2. Design **intelligence product templates** for each stakeholder tier:
   - **Strategic product (quarterly):** For DG and Minister; 3–4 pages; unclassified or Secret; covers threat landscape changes and implications for NDSA program
   - **Operational product (monthly):** For CISO and GovID team; 6–8 pages; Confidential or Secret; covers active threat campaigns, new TTPs, detection recommendations
   - **Tactical product (weekly):** For SOC; 1 page; Unclassified or Confidential; covers indicators, hunting hypotheses, priority monitoring items
   - **Peer sharing report (quarterly):** For CERT-IL and ITA; TLP:AMBER; covers sector-relevant threat intelligence that NDSA can share

3. Design an **analytical standards document** (3 pages maximum) for NDSA's CTI team, covering:
   - How to apply confidence levels (use ACE framework or similar: Admiralty Scale for source/information; probabilistic language for assessments)
   - Attribution discipline rules (when can NDSA name a threat actor vs. "Iranian-nexus cluster")
   - Peer review requirements (all assessments with a confidence ≥B2 must be reviewed by a second analyst)
   - What constitutes a "finding" vs. an "observation" vs. a "hypothesis"

4. Address the **understaffing problem**: For the first 6 weeks, Rotenberg is the only CTI analyst. For weeks 6–10, he has Dvir but not Ben-Levi. The INCD remediation directive requires the first operational quarterly report by Week 24.
   - Build a **staffing-adjusted production plan** for the first 24 weeks showing what is realistically deliverable at each staffing level
   - Identify which PIRs cannot be serviced in the first 6 weeks
   - Identify the minimum viable program state that satisfies the INCD compliance obligation

5. Design the **PIR review and update process**: PIRs should not be static. Build a structured review cycle that ensures PIRs remain relevant as the threat landscape changes and stakeholder priorities shift.

---

### Task 4: Sharing Architecture and Inter-Agency Intelligence Exchange

**Requirements:**

1. Design the **CERT-IL sharing MOU** framework. The MOU must cover:
   - What NDSA shares with CERT-IL (indicator types, classification, frequency)
   - What CERT-IL shares with NDSA (bulletins, MISP feeds, ad-hoc notifications)
   - Classification and TLP handling obligations
   - Incident notification obligations (beyond the INCD-CID statutory requirement)
   - Contact protocols for emergency sharing (outside business hours)
   - MOU review period (recommend 12-month review cycle)

2. Design the **ITA peer-sharing MOU** framework. ITA is a potential peer intelligence consumer with shared threat exposure (same contractor, HavayaIT; some overlapping Iranian-nexus targeting). This MOU is more sensitive because ITA and NDSA are distinct agencies with separate oversight chains.
   - What information can NDSA share with ITA without INCD approval?
   - What requires INCD coordination before sharing?
   - How do you handle the conflict of interest where information about HavayaIT's security posture is relevant to both agencies but may also have legal implications?

3. Address the **Ministry of Interior unclassified sharing problem**: MoI uses GovID 2.0 for 14 services but has no classification access. Design a **sanitization process** for converting Secret-level GovID threat intelligence into an unclassified format that is still operationally useful for MoI's IT team. Define what can be safely declassified vs. what must be omitted, and what the residual value of a fully sanitized product is.

4. Address **INCD's requirement for NDSA to feed intelligence back**. NDSA has:
   - GovID 2.0 telemetry (3.1M auth events/day — unique visibility into authentication abuse patterns)
   - VRID access logs (database query patterns relevant to data exfiltration detection)
   - Contractor access patterns (patterns of contractor behavior across multiple agencies via HavayaIT)

   Design a **NDSA-to-INCD intelligence feed** covering: what NDSA collects, what intelligence products it produces for INCD, what classification level, and what the operational benefit to INCD is. Include a proposed data sharing agreement covering privacy and PPL compliance (authentication logs contain citizen behavioral data — what can NDSA share with INCD under PPL?).

5. Write a **Cyber 5 engagement strategy**: Israel participates in the Cyber 5 group (informal cooperation among Five Eyes-adjacent nations including Israel). NDSA may have intelligence relevant to Iranian-nexus biometric targeting that is valuable to international partners (e.g., UAE, UK GCHQ). Outline the decision criteria for escalating domestic threat intelligence to the international level, the classification considerations, and the role of INCD in approving international disclosures.

---

### Task 5: Program Governance and Metrics

**Requirements:**

1. Design the **CTI Program Charter** for NDSA (4 pages maximum):
   - Mission statement
   - Scope (what is in-scope; what is out-of-scope — e.g., "this program does not conduct offensive intelligence operations")
   - Authorities (what decisions can the CTI Lead make independently; what requires CISO approval; what requires DG approval)
   - Resources (headcount, budget, tool inventory)
   - Stakeholder map
   - Review and update cycle

2. Design a **metrics framework** for the CTI program. The framework must satisfy two audiences:
   - **Internal (CISO, DG):** Program health and effectiveness
   - **External (INCD compliance):** Program activity and output as required by the remediation directive

   Include at least 8 metrics, covering both output metrics (what the program produces) and outcome metrics (whether the intelligence actually improved security decisions). Explain why output-only metrics are insufficient and how you avoid "intelligence theater" — producing reports that look good but don't change decisions.

3. Write the **INCD remediation directive compliance plan**: a structured response to the remediation directive specifying each requirement, the NDSA implementation approach, the target completion date, the evidence of completion, and the responsible owner. The plan must demonstrate that NDSA's 6-month deadline is achievable.

4. Address the **program sustainability risk**: Rotenberg has no CTI program management experience. Dvir (the senior hire) has strong analytical skills but no management experience. Build a **capability development plan** for the first 12 months that addresses: structured analytical training, CTI program management frameworks (MITRE CTI-Blueprints, FIRST CTI taxonomy), mentorship (propose using CERT-IL's experienced analysts), and the handover risk if Rotenberg departs.

5. Produce a **Year 1 budget justification** (2 pages) for the Finance Ministry. The Finance Ministry does not understand CTI. They know NDSA was breached. They know there's a mandate. They need to approve ₪8.5M/year on an activity that produces reports. Write a budget justification that:
   - Translates threat intelligence into business value (cost of breach vs. cost of prevention)
   - Uses the Assignment 5 breach as a concrete example (estimated direct cost to NDSA; estimated reputational/political cost)
   - Demonstrates return on investment using metrics from Task 5.2
   - Avoids jargon that will cause the Finance Ministry reviewer to stop reading

---

### Task 6: First Quarterly Intelligence Product

Produce the first operational quarterly intelligence report for NDSA.

**Requirements:**

1. Write the **Q1 2026 NDSA Threat Landscape Assessment** — a 6–8 page operational intelligence product for the CISO, classified Confidential. This is the first real output of the new CTI program; it will also be reviewed by INCD as part of the compliance audit.

   The assessment must cover:
   - Executive summary (1/2 page)
   - Threat actor assessment: Iranian-nexus targeting of Israeli government digital infrastructure (updated since Assignment 5 post-incident report)
   - Key events in Q4 2025 relevant to NDSA (use plausible fictional events consistent with the scenario timeline)
   - GovID 2.0 threat picture: what threats materialized vs. were prevented since launch
   - Collection gaps: what NDSA still cannot see with current collection capability
   - Recommendations: 3–5 priority recommendations for the CISO

2. Produce the corresponding **Weekly SOC Flash** for the same week as the quarterly report: a 1-page tactical product for Gila Ben-Moshe. It must contain: 3–5 indicators with context, 1 hunting hypothesis, and 1 priority monitoring item. It must be derived from the quarterly assessment but written in plain SOC-friendly language.

3. Write the **Peer Sharing Summary** (TLP:AMBER, for CERT-IL and ITA): a 2-page sanitized version of the quarterly assessment that removes NDSA-specific operational details but retains sector-relevant threat intelligence. Address the sanitization decisions explicitly — what did you remove and why?

---

## Section 4: Deliverables Summary

| # | Deliverable | Audience | Classification | Format |
|---|---|---|---|---|
| 1 | PIR framework (5–7 PIRs) | CISO, DG | Unclassified | Table + narrative |
| 2 | SIRs (4+) | CTI Lead, SOC | Unclassified | Table |
| 3 | PIR-to-stakeholder matrix | CISO | Unclassified | Table |
| 4 | PIR validation memo | INCD (compliance) | Unclassified | 1-page memo |
| 5 | Collection plan | CTI Lead, CISO | Confidential | Structured table + narrative |
| 6 | Procurement recommendation | CISO, Finance | Unclassified | 2-page recommendation |
| 7 | MISP configuration plan | CTI Lead | Confidential | Technical document |
| 8 | Intelligence production process | CTI Lead | Unclassified | Process diagram + procedure |
| 9 | Intelligence product templates (4 tiers) | CTI team | Varies | 4 templates |
| 10 | Analytical standards document | CTI team | Unclassified | 3-page document |
| 11 | Staffing-adjusted production plan (24 weeks) | CTI Lead, CISO | Unclassified | Timeline table |
| 12 | CERT-IL MOU framework | Legal, CISO | Unclassified | Framework document |
| 13 | ITA MOU framework | Legal, CISO | Unclassified | Framework document |
| 14 | MoI sanitization process | CTI Lead | Unclassified | Process document |
| 15 | NDSA-to-INCD intelligence feed design | CTI Lead, INCD | Confidential | Design document |
| 16 | CTI Program Charter | DG, CISO | Unclassified | 4-page charter |
| 17 | Metrics framework (8+ metrics) | CISO, INCD | Unclassified | Table + narrative |
| 18 | INCD remediation compliance plan | CISO, INCD | Unclassified | Compliance matrix |
| 19 | Year 1 budget justification | Finance Ministry | Unclassified | 2-page document |
| 20 | Q1 2026 Threat Landscape Assessment | CISO | Confidential | 6–8 page report |
| 21 | Weekly SOC Flash (sample) | SOC | Unclassified | 1-page flash |
| 22 | Peer sharing summary (TLP:AMBER) | CERT-IL, ITA | TLP:AMBER | 2-page summary |

---

## Section 5: Assessment Criteria

| Criterion | Weight | What Examiners Look For |
|---|---|---|
| PIR/SIR quality and stakeholder alignment | 20% | PIRs answerable, stakeholder-driven, not self-referential |
| Collection plan realism | 15% | Honest gap identification; budget-realistic procurement |
| Production process design | 15% | Viable under staffing constraints; INCD-compliant |
| Sharing architecture | 15% | Legal accuracy (PPL, TLP); inter-agency complexity handled |
| Program governance and metrics | 15% | Outcome-oriented metrics; sustainability planning |
| Intelligence products quality | 20% | Q1 report demonstrates analytical standards; SOC flash is actionable |

---

## Appendix A: INCD Remediation Directive Requirements Summary (Fictional)

Per INCD remediation directive INCD-REM-2025-047 issued to NDSA, the following program elements must be operational by 1 July 2026:

| Requirement ID | Requirement | Evidence Required |
|---|---|---|
| REM-001 | Formal PIR framework with stakeholder sign-off | Signed PIR document |
| REM-002 | Collection plan covering internal + external sources | Collection plan document |
| REM-003 | Quarterly intelligence product issued to CISO and DG | Product copies + distribution records |
| REM-004 | Formal sharing agreement with CERT-IL | Signed MOU |
| REM-005 | Formal sharing agreement with ≥1 peer government agency | Signed MOU |
| REM-006 | MISP instance operational with ≥2 INCD-approved feeds | MISP configuration screenshot + feed list |
| REM-007 | CTI analyst with ≥3 years experience on staff | HR record |
| REM-008 | Annual program review process documented | Review procedure document |

---

## Appendix B: Israeli Government Classification Tiers (NDSA Context)

| Tier | Hebrew Term | Access | Relevant Notes |
|---|---|---|---|
| Top Secret | Sodi Beyoter | DG, CISO, Friedman; cabinet-level | Rarely used for CTI products |
| Secret | Sodi | Senior NDSA leadership; cleared contractors | Used for advanced threat assessments |
| Confidential | Meuvan | NDSA management; all professional staff | Standard operational intelligence products |
| Internal | Pnimi | All NDSA staff + cleared contractors | Tactical indicators; hunting hypotheses |
| Unclassified | — | All NDSA + peer agencies + public where appropriate | SOC flash; ministerial summaries |

*Note: TLP markings are applied in addition to classification markings for shared products. A TLP:AMBER product distributed at the Confidential classification level is marked: `CONFIDENTIAL // TLP:AMBER`.*

---

*This scenario is fictional and created for educational purposes. All individuals, organizations, regulatory details beyond the named real-world frameworks, and operational specifics are invented for training use.*
