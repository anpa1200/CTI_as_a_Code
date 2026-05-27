# Assignment 3: Full CTI Cycle — PIR/SIR-Driven Intelligence Program

> **Level:** CTI Lead / Senior Analyst / Intelligence Manager
> **Estimated time:** 50–70 hours
> **Deliverable language:** English

---

## 1. Title and Objective

**Full title:** Full CTI Cycle: PIR/SIR-Driven Intelligence Program

**Assignment objective:**

Build a complete CTI program from scratch for a specific organization — from stakeholder identification and PIR formulation through production-ready Intelligence Products, a dissemination plan, feedback loop, and success metrics. The program must be operationally integrated with SOC, Detection Engineering, IR, and leadership — not exist as an isolated IOC-collection function.

---

## 2. Scenario

### 2.1 Organization

**TechPay Israel Ltd.** — an Israeli payment processor and card acquirer, headquartered in Tel Aviv with offices in New York and London.

**Business model:**
- **Transaction processing:** 2.3 billion transactions per year across 47 countries; peak throughput 18,400 TPS during Black Friday 2023
- **Acquiring services:** acquiring and settlement for 180,000 merchants; average settlement cycle 48 hours
- **B2B API payment platform:** 350 corporate clients (fintech, retailers, neobanks); white-label payment infrastructure for 7 of the top 20 Israeli fintechs
- **Interchange settlement:** Real-time settlement with 12 core banking partners via SWIFT and TARGET2

**Critical systems:**
- **HSM cluster (Thales payShield 10K):** Payment key storage and PIN processing; PCI-DSS Scope 1; 99.999% uptime SLA
- **Payment Switch (Volante VolPay):** 24/7 transaction routing; 6-node active-active cluster; any outage directly halts revenue
- **Card Data Vault (CDV):** Tokenization platform for 340M stored card tokens; PCI-DSS Scope 1
- **Fraud Detection Engine (FDE):** ML-based real-time fraud scoring; processes every transaction in <15ms; trained on 18 months of CDR; **if compromised, enables undetected fraud**
- **Settlement Database (Oracle RAC):** Interbank clearing records; €4.2B in pending settlement at any given time
- **API Gateway (Kong Enterprise):** Client integrations; 350 corporate clients' payment flows pass through this; compromise = access to all client transaction data

**Regulatory environment:**
- **PCI-DSS Level 1:** QSA assessment scheduled in 7 months; last assessment had 3 minor findings that are still open
- **Bank of Israel Cyber Directive 362 (BoI-CD 362):** Full compliance required by January 2025 — **4 months away**; BoI-CD 362 Section 4 requires ICT threat intelligence as a formal function; BoI-CD 362 Section 8 requires Threat-Led Penetration Testing (TLPT) for systemic payment institutions within 36 months of designation
- **Israeli PPL:** 340M tokenized records; indirect PII association via merchant IDs
- **Bank of Israel Supervisor / Capital Markets Authority (CMA):** Israeli financial regulators; all require incident notification within 4 hours of detection
- **SWIFT CSP:** Annual SWIFT Customer Security Programme self-attestation; current attestation score: 84/100 (passing, but 3 mandatory controls are at "partially implemented" status)

**Employees:** 2,400 (including 180 in security function: 12-person SOC, 4-person Detection Engineering, 3-person IR, 2-person Vuln Management, 4-person Cloud Security, 8 others).

### 2.2 Current State of the CTI Function — A Failing Approach

FinServe's current "CTI function" is a cautionary tale that the new CTI Lead is being hired to fix:

**What currently exists:**
- One junior analyst (Avi Ben-David, 2 years experience, promoted from SOC L2) spending ~30% of time on "threat intel" while also maintaining SIEM rules as his primary role
- Subscription to Recorded Future Basic (€18K/year) — primarily used to score IOCs in Splunk
- MISP instance with 3 public feeds (CIRCL OSINT, Feodo Tracker, abuse.ch URLhaus) — last admin action: 6 weeks ago
- A weekly "CTI Digest" email that Marcus sends to the SOC team — typically a compilation of vendor blog links with no FinServe-specific analysis

**What exists on paper but does not function:**
- "PIR document" created 2 years ago by a consultant — contains 4 generic questions like "What are the main threats to the financial sector?" — no stakeholder buy-in, no review cycle, never produced a deliverable
- "Threat Intel runbook" in Confluence — last updated 14 months ago; describes a process that nobody follows

**What does not exist at all:**
- Intelligence Products differentiated by audience
- Collection Plan
- Intelligence cycle with defined cadence
- Feedback loop from SOC or Detection Engineering
- Formal relationship with CERT-IL FinCERT (membership lapsed due to administrative error 9 months ago — nobody noticed until the BoI-CD 362 pre-assessment flagged it)
- Any CTI input to the Detection Engineering sprint planning
- CTI-informed IR playbooks

**The consequence:** When the IR team responds to an incident, they receive no pre-existing threat actor context from CTI. When the Detection Engineering team plans sprints, they rely entirely on vendor blog posts and their own judgment. The SOC receives raw IOC alerts with no campaign context, leading to poor triage decisions.

### 2.3 Trigger Events and Forcing Functions

**Why the program is being built NOW — five concurrent pressures:**

**Pressure 1: BoI-CD 362 Deadline — 4 months (January 2025)**
BoI-CD 362 Section 4(2) states that financial entities must put in place **ICT threat intelligence** as part of their ICT risk management framework. Article 11(1)(b) requires threat-based scenario analysis for business continuity planning. FinServe's BoI-CD 362 gap assessment (completed 3 months ago by an external firm) identified the absence of a formalized CTI function as a **Level 2 Critical Gap** — the highest severity in their framework. Bank of Israel Supervisor has been informed of the gap and is monitoring remediation progress. A follow-up assessment is scheduled for November 2024.

**Pressure 2: The Near-Miss Incident (6 weeks ago)**
The SOC received a CrowdStrike alert at 03:14 AM on a Saturday for lateral movement behavior on the Settlement Database server. The Tier 1 analyst escalated to IR, who declared a P1 incident and began isolation procedures. Over 4 hours, three Settlement Database nodes were isolated — effectively halting €2.1B in pending settlement transactions. At 07:30 AM, the root cause was identified: this was the authorized quarterly pentest conducted by CyberShield Ltd., which had not been properly communicated to the SOC team. The isolation caused settlement delays affecting 47 merchants and triggered a Bank of Israel Supervisor notification obligation (resolved as a false alarm, but the notification process was initiated).

**Post-incident analysis revealed:** The CTI team had no awareness of the pentest schedule; IR had no threat actor context to quickly rule out known campaign patterns; the SOC had no escalation criteria for lateral movement on financial infrastructure. **The absence of a CTI function directly caused a €2.1B settlement disruption and a near-miss regulatory notification.** The IR post-incident report explicitly recommended establishing a formal CTI function.

**Pressure 3: Recorded Future Alert — Active Campaign (3 weeks ago)**
The Recorded Future Basic subscription generated an alert: FinServe's primary domain (`techpay-il.com`) appeared in a phishing campaign template targeting Israeli payment processors. The template email was designed to impersonate FinServe correspondence to their 350 corporate clients. Recorded Future's score: 87/100 (high confidence malicious). Marcus forwarded this to the SOC but took no further action — no campaign investigation, no client notification assessment, no updated IOC deployment, no stakeholder communication. The CISO found out about the alert 10 days later through an indirect channel and was not pleased.

**Pressure 4: PCI-DSS Assessment in 7 months**
The upcoming PCI-DSS Level 1 QSA assessment requires evidence of:
- Requirement 12.10.3: Processes to detect and respond to security incidents (CTI feeds the detection component)
- Requirement 6.3.3: Security vulnerability trending information (CTI should inform vuln prioritization)
- Requirement 12.3.2: Targeted risk analysis for customized controls — requires threat intelligence input

The QSA pre-assessment identified the absence of a documented threat intelligence process as a gap against Requirement 12.3.2.

**Pressure 5: PayNext Solutions Ltd. Acquisition — Integration Required**
TechPay Israel acquired PayNext Solutions Ltd. (a Tel Aviv-based fintech startup, 340 employees, $160M AUM) 5 months ago. The security integration of PayNext is still incomplete. PayNext's security posture:
- SIEM: None (Splunk Cloud trial in progress)
- EDR: SentinelOne (70% endpoint coverage)
- No threat intelligence capability
- Custom Django-based payment application with 3 unpatched CVEs (CVSS 7.2, 8.1, 9.0)
- AWS environment (separate account, not yet integrated with FinServe's Prisma Cloud)
PayNext handles payments for 140,000 Israeli merchants. Their systems will be fully integrated into FinServe's infrastructure within 12 months. Until then, PayNext represents an unmonitored attack surface.

### 2.4 Organizational Dynamics — Complications You Must Navigate

**Detection Engineering Team — Damaged Relationship:**
The Detection Engineering team (4 analysts) has had 3 incidents in the past 5 months where "CTI-recommended" IOCs were deployed as SIEM rules and generated unacceptable false positive rates. The most damaging: a Recorded Future IOC block rule that blocked legitimate payment API traffic from a major merchant for 6 hours, causing a €340K SLA breach. The DE Lead (Sarah Chen) has stated that she will not implement any CTI-sourced detection without "a signed-off quality review" and "clear evidence the rule was tested against known-good traffic." Your relationship with the DE team needs to be rebuilt on trust and quality, not just information sharing.

**Fraud Team Silo:**
The Fraud Analytics team has an independent contract with a dark web monitoring vendor (DarkOwl) at €45K/year. They monitor for compromised card data and dark web mentions of FinServe. They do not share their findings with the security team, citing "data sensitivity." The result: the CTI/SOC team has no awareness of fraud-relevant intelligence. Two months ago, the Fraud Team received an alert about a 120,000 card batch from FinServe merchants on a dark web forum — they notified the merchants directly without notifying the Security team. The Security team only found out 3 weeks later. This organizational silo is a direct intelligence blind spot.

**CERT-IL FinCERT Membership Lapsed:**
FinServe's CERT-IL FinCERT membership lapsed 9 months ago when the invoicing contact left the company and the renewal was missed. The annual membership fee is €18K for Standard access. During the lapsed period, FinServe has had no access to financial sector-specific TLP:AMBER intelligence sharing, including two significant payment processor incident briefs that CERT-IL FinCERT distributed. Renewing the membership requires CISO approval and procurement processing — estimated 3–4 weeks.

**The Outgoing Analyst:**
Avi Ben-David, the current de-facto CTI analyst, has accepted a position at a competing firm and will be leaving in **5 weeks**. He is the only person who knows the current Recorded Future configuration, the MISP setup, and the existing (if dysfunctional) processes. His knowledge transfer documentation is minimal. You have 5 weeks to extract whatever institutional knowledge exists before it walks out the door.

**CISO Mandate and Pressure:**
The CISO (Yael Mizrahi) has a board presentation in **90 days** where she must demonstrate measurable progress on the CTI/BoI-CD 362 gap. Her explicit requirement: "I need to show the board a working CTI program that meets BoI-CD 362 Section 4, has measurable outputs, and can be defended to Bank of Israel Supervisor. I don't need perfection — I need demonstrable progress and a credible roadmap."

### 2.5 Intelligence Environment

**Available intelligence infrastructure (functional):**
- Recorded Future Basic (currently operational, €18K/year, 6 months remaining on contract)
- MISP 2.4 (self-hosted, operational but neglected — 3 public feeds, low data quality)
- Splunk ES (SIEM, primary detection platform; CTI should integrate here)
- Microsoft Sentinel (secondary SIEM for Azure/M365 workloads)
- SentinelOne (PayNext — separate console, not integrated)

**Available intelligence infrastructure (broken/unavailable):**
- CERT-IL FinCERT membership: lapsed — requires CISO approval + €18K + 3–4 weeks to restore
- Europol IOCTA: no formal sharing relationship established
- No dark web monitoring for security team (Fraud Team has DarkOwl separately)
- No premium threat intel feed for payment-specific intelligence (Recorded Future Basic does not include the Financial Services sector module)

**Known intelligence needs (from post-incident review, BoI-CD 362 gap, PCI-DSS gap):**
- Which threat actors and crimeware groups target Israeli payment processors?
- Which CVEs in FinServe's tech stack are actively exploited against financial infrastructure?
- Which IOCs are active against payment processors this week?
- What are the TTPs of the actors who recently targeted Israeli payment processors (post-Patel account, Scattered Spider, etc.)?
- Are there dark web discussions about FinServe specifically? (Currently blind — Fraud Team has this but doesn't share)
- What fraud technique patterns are emerging from PayNext's merchant base?

---

## 3. Learning Objectives

1. Identify and structure intelligence stakeholders in a complex financial organization with organizational dysfunction
2. Develop PIRs and SIRs that are genuinely **business-driven** — address the BoI-CD 362 compliance timeline, the near-miss incident, and the PayNext integration as concrete drivers, not generic questions
3. Build a collection plan that acknowledges existing gaps (lapsed CERT-IL FinCERT, no dark web coverage for security) and proposes a realistic path to closing them
4. Apply structured analytic techniques: competing hypotheses, confidence levels, assumption checking
5. Produce Intelligence Products that are **differentiated by audience** — after the near-miss incident, the IR team needs different content than the Fraud Team
6. Address the Fraud Team silo as an intelligence collection problem, not just a reporting problem
7. Build a feedback loop designed to **repair the DE team's trust** after the false positive incidents
8. Define CTI metrics that can be presented to the board in 90 days AND satisfy BoI-CD 362 Section 4 requirements
9. Develop a 90-day roadmap that is honest about what can realistically be achieved given Marcus's departure in 5 weeks and the BoI-CD 362 deadline in 4 months

---

## 4. Stakeholder Map

Create a complete stakeholder map. The following 9 stakeholders are defined; the student must complete all fields and identify any additional stakeholders (e.g., PayNext CISO, CERT-IL FinCERT liaison, legal counsel for BoI-CD 362 notifications):

---

**SH-01: CISO (Yael Mizrahi)**

| Field | Content |
|---|---|
| Role | Chief Information Security Officer — executive owner of BoI-CD 362 compliance and PCI-DSS |
| What matters | Demonstrable BoI-CD 362 compliance in 4 months; board presentation deliverable in 90 days; Bank of Israel Supervisor relationship management |
| Decisions requiring intelligence | Board-level risk statements; regulatory notification decisions; incident escalation to executive team; CTI budget allocation |
| Required intelligence | Strategic threat landscape for Israeli payment processors; top 3 risks in plain language; peer incidents that inform FinServe's posture; BoI-CD 362 compliance evidence |
| Preferred format | Executive Brief (1–2 pages, PDF); monthly dashboard; talking points for board |
| Cadence | Monthly + ad-hoc for significant sector incidents |
| Key constraint | She trusts CTI output only if it is clearly separated from raw IOC data; the Recorded Future alert that was not escalated has made her skeptical of current CTI quality |

---

**SH-02: SOC Manager (Ronen Katz)**

| Field | Content |
|---|---|
| Role | Head of Security Operations — 12-person SOC (3 Tier 3, 4 Tier 2, 5 Tier 1); 24/7 operations |
| What matters | Alert quality (low FP rate), actionable escalation criteria, context for payment infrastructure alerts |
| Decisions | Alert prioritization; incident declaration; escalation to IR; real-time blocking decisions |
| Required intelligence | Current IOCs for blocking (with quality score and expiry); context for payment sector campaigns; what to look for NOW; clear escalation criteria for financial infrastructure alerts |
| Key pain point | The 3 CTI-sourced rule failures damaged trust; Thomas wants CTI to "prove quality before volume" — one high-quality IOC with full context is better than 100 low-quality IOCs with no context |

---

**SH-03: Detection Engineering Team (Lead: Sarah Chen)**

| Field | Content |
|---|---|
| Role | 4 engineers building and maintaining SIEM rules across Splunk ES and Sentinel |
| What matters | Detection quality, low FP rate, procedure-level detail to write effective rules |
| Key pain point | The 3 false positive incidents (including the €340K SLA breach) — Sarah Chen will not implement CTI-sourced detections without quality review and testing evidence |
| Required intelligence | Procedure-level TTP detail (specific command strings, not just technique names); evidence that the IOC/rule was tested against known-good traffic; rationale for why this specific variant requires a new rule vs. updating existing |
| Required relationship | Weekly sync; CTI submits detection requests as formal tickets with full evidence; DE team reviews before implementation |

---

**SH-04: Incident Response Team (Lead: Felix Bauer)**

| Field | Content |
|---|---|
| Role | IR Lead + 2 analysts; on-call 24/7 for P1 incidents |
| Key pain point | The near-miss incident: IR declared a P1 on authorized pentest activity because there was no threat actor context to rule it out quickly. The 4-hour disruption cost the company €2.1B in settlement delays. Felix wants CTI to provide "context that helps us rule out benign explanations faster" |
| Required intelligence | Pre-incident: quarterly threat actor profiles so IR knows what to expect during incidents; Pentest schedule visibility (CTI as the coordination point between IR and security testing teams); During incident: immediate threat actor context within 15 minutes of IR engagement |
| Required relationship | CTI must be on-call for IR escalation; quarterly briefing; access to all IR post-incident reports |

---

**SH-05: Vulnerability Management (Lead: Anna Kowalski)**

| Field | Content |
|---|---|
| Role | 2-person team managing Tenable.io + manual tracking for PayNext; monthly patch cycles |
| What matters | Prioritizing the 3 unpatched CVEs on PayNext (CVSS 7.2, 8.1, 9.0) against operational risk |
| Key need | Which of PayNext's 3 open CVEs are being actively exploited against fintech? Is there a known threat actor using these specific CVEs against payment processors? |
| Required intelligence | Weekly: Which CVEs in our stack are in CISA KEV or actively exploited by financial sector threat actors? Specific: PayNext CVE assessment — patch priority for each |

---

**SH-06: Cloud Security Team**

| Field | Content |
|---|---|
| Role | 4 engineers managing AWS (FinServe) + Azure + separate AWS account (PayNext — not yet integrated) |
| What matters | Cloud IAM posture, container security (EKS), PayNext AWS integration timeline |
| Key need | Cloud-specific TTPs targeting payment processors; IAM privilege escalation patterns; Kubernetes threat scenarios for EKS |
| Required intelligence | Monthly Cloud Threat Brief; immediate notification for CVEs in AWS services or Kubernetes versions in use |

---

**SH-07: Fraud Team (Lead: Dieter Müller)**

| Field | Content |
|---|---|
| Role | 8-person fraud analytics team with independent DarkOwl dark web monitoring contract |
| Key tension | The Fraud Team operates as an intelligence silo — their DarkOwl intelligence is not shared with security, and they prefer it that way (citing "data sensitivity"). The 120,000 compromised card alert that bypassed security was a failure of organizational design, not just individual behavior |
| Required intelligence | New fraud techniques (BIN attacks, card-not-present fraud); compromised card batch patterns; dark web FinServe merchant discussions |
| Required relationship | This stakeholder relationship requires active negotiation — the CTI Lead must propose a formal intelligence sharing protocol between the Fraud Team and Security, defining what gets shared, at what TLP level, and through what channel |

---

**SH-08: Legal / Compliance (Lead: Dana Levi)**

| Field | Content |
|---|---|
| Role | Head of Legal and Compliance; owns BoI-CD 362 and PCI-DSS compliance programs; Bank of Israel Supervisor notification liaison |
| Key pain point | The near-miss incident generated a Bank of Israel Supervisor notification that turned out to be a false alarm — Dana had to call the regulator to retract the notification, an embarrassing and relationship-damaging episode |
| Required intelligence | Factual incident scope; confidence level on data compromise; attribution assessment for regulatory purposes; peer sector incidents relevant to FinServe's PCI-DSS and BoI-CD 362 obligations |
| Special requirement | BoI-CD 362 Section 4 compliance documentation — CTI must produce evidence that threat intelligence is systematically used in risk management; this documentation will go to Bank of Israel Supervisor |

---

**SH-09: Executive Leadership (CEO / CFO / Board)**

| Field | Content |
|---|---|
| What matters | Business risk in financial terms; reputational exposure; competitor comparison |
| Required intelligence | Top 3 cyber risks to FinServe's business in one sentence each; financial exposure estimate; peer incidents that board members may have read about; progress on BoI-CD 362 compliance |
| Required format | Board Quarterly Slide (1 slide); quarterly threat report executive summary only |
| Key fact | Board members read the financial press — they are aware of several recent major payment processor breaches; they will ask if FinServe is exposed to the same risks |

---

## 5. PIR Development

Develop **8–10 Priority Intelligence Requirements** specific to TechPay Israel Ltd.'s current situation. Each PIR must be grounded in the scenario's concrete pressures (BoI-CD 362 deadline, near-miss incident, PayNext integration, Fraud Team silo, etc.) — not generic financial sector questions.

Provide the full format for each PIR. The following 8 PIRs are defined; the student must validate them against the stakeholder map and refine the questions to ensure they are genuinely business-driven:

---

**PIR-001: Threat Actor Landscape — Israeli Payment Processors**

| Field | Content |
|---|---|
| PIR ID | PIR-001 |
| Stakeholder | CISO, IR Lead, Detection Engineering |
| Supported Decision | Detection Backlog prioritization; IR preparedness; BoI-CD 362 Section 4 threat intelligence documentation |
| Intelligence Question | Which threat actors and crimeware groups have targeted Israeli payment processors and acquiring banks in the past 12 months, and what TTPs are most relevant to FinServe's specific infrastructure (VolPay switch, Kong API Gateway, Oracle RAC, AWS/Azure)? |
| Business Relevance | Direct input to Detection Backlog; IR playbook development; BoI-CD 362 compliance evidence |
| BoI-CD 362 Reference | Article 9(2) — ICT threat intelligence; Article 11(1)(b) — threat-based scenario analysis |
| Time Sensitivity | Strategic (quarterly review) |
| Priority | P1 |
| Expected Output | Quarterly Threat Actor Assessment (5–7 pages) |
| Key Complexity | The previous "PIR document" produced generic answers; this PIR must produce answers specific enough to drive a Detection Backlog item within 2 weeks of publication |

---

**PIR-002: Active TTP Landscape — Payment Infrastructure Targeting**

| Field | Content |
|---|---|
| PIR ID | PIR-002 |
| Stakeholder | Detection Engineering (Sarah Chen), SOC Manager (Ronen Katz) |
| Supported Decision | Detection Engineering sprint planning — specifically the sprint immediately following each monthly TTP Brief |
| Intelligence Question | Which ATT&CK techniques — at procedure level — have been actively used against payment processors and fintech in the past 90 days? Which of these are currently undetected in FinServe's environment? |
| Key Constraint | Detection Engineering requires **procedure-level detail** (specific command strings, process ancestry, not just T1059) to write effective rules without generating false positives. Generic technique lists will not be accepted. |
| Time Sensitivity | Operational (monthly) |
| Priority | P1 |
| Expected Output | Monthly TTP Intelligence Brief — with procedure-level evidence and a specific detection rule proposal for each new technique |

---

**PIR-003: Actively Exploited CVEs in FinServe's Technology Stack**

| Field | Content |
|---|---|
| PIR ID | PIR-003 |
| Stakeholder | Vulnerability Management (Anna Kowalski), CISO |
| Supported Decision | Emergency patching prioritization; specifically the 3 unpatched PayNext CVEs |
| Intelligence Question | Which CVEs in FinServe and PayNext's technology stack are actively exploited in the wild against financial sector targets, and what is the realistic exploitation timeline before a threat actor weaponizes each? |
| PayNext Context | Three specific CVEs: [CVSS 9.0 — Django custom app], [CVSS 8.1 — SentinelOne version], [CVSS 7.2 — AWS SDK version] — assess exploitation probability for each |
| Time Sensitivity | Tactical (weekly, ad-hoc for critical CVEs) |
| Priority | P1 |
| Expected Output | Weekly Vulnerability Intelligence Note + immediate advisory for CISA KEV additions |

---

**PIR-004: High-Confidence IOCs — Active Campaigns Against Fintech**

| Field | Content |
|---|---|
| PIR ID | PIR-004 |
| Stakeholder | SOC (Ronen Katz), IR (Felix Bauer) |
| Supported Decision | Real-time blocking; alert context for SOC L1 triage |
| Key Quality Requirement | Given the 3 prior false positive incidents, IOCs must be scored for quality (Recorded Future score > 75 or corroborated by ≥2 independent sources) before deployment. The IOC feed must include TTL (time-to-live) and source attribution. |
| Intelligence Question | Which high-confidence IOCs (score ≥ 75) are associated with active campaigns against fintech in the past 30 days and are not yet blocked in FinServe's environment? |
| Time Sensitivity | Tactical (real-time monitoring; weekly curated digest) |
| Priority | P1 |
| Expected Output | Automated IOC feed (quality-gated) + Weekly IOC Digest with campaign context |

---

**PIR-005: Peer Incident Review — Israeli Payment Sector**

| Field | Content |
|---|---|
| PIR ID | PIR-005 |
| Stakeholder | CISO, Executive, Legal/Compliance, IR |
| Supported Decision | Board presentation; BoI-CD 362 scenario analysis; PCI-DSS Requirement 12.3.2 targeted risk analysis |
| Intelligence Question | What significant security incidents affected Israeli payment processors and acquiring banks in the past quarter, and do any expose FinServe to the same attack vectors? |
| Board Context | Board members read financial press; CTI should proactively address incidents they may have read about before the board asks |
| Time Sensitivity | Strategic (quarterly) |
| Priority | P2 |
| Expected Output | Quarterly Sector Incident Review with explicit FinServe applicability assessment |

---

**PIR-006: Fraud Intelligence — Dark Web and Emerging Techniques**

| Field | Content |
|---|---|
| PIR ID | PIR-006 |
| Stakeholder | Fraud Team (Dieter Müller — if intelligence sharing protocol is established), SOC |
| Supported Decision | Fraud rule updates; compromised card batch response; PayNext merchant risk assessment |
| Key Complexity | FinServe Security has no dark web monitoring. The Fraud Team has DarkOwl but does not share. This PIR requires either (a) negotiating intelligence sharing with the Fraud Team, or (b) recommending a separate security-oriented dark web monitoring capability |
| Intelligence Question | What fraud techniques (BIN attacks, account takeover, card-not-present fraud) are emerging against Israeli payment processors? Are FinServe or PayNext merchant data specifically mentioned in dark web forums or markets? |
| Time Sensitivity | Operational (weekly) |
| Priority | P2 |
| Expected Output | Weekly Fraud Intelligence Note (contingent on resolving the DarkOwl sharing protocol) |

---

**PIR-007: Cloud-Specific Threat Intelligence — AWS and Azure Targeting**

| Field | Content |
|---|---|
| PIR ID | PIR-007 |
| Stakeholder | Cloud Security Team, Detection Engineering |
| Supported Decision | Cloud IAM hardening priorities; EKS configuration; PayNext AWS integration risk |
| Intelligence Question | Which cloud-specific TTPs (AWS IAM abuse, Kubernetes exploitation, Azure Entra ID targeting) are actively used against cloud-native fintech and payment processors, and how do they apply to FinServe's AWS + PayNext AWS architecture? |
| Time Sensitivity | Operational (monthly) |
| Priority | P2 |
| Expected Output | Monthly Cloud Threat Brief |

---

**PIR-008: Supply Chain and Third-Party Risk Intelligence**

| Field | Content |
|---|---|
| PIR ID | PIR-008 |
| Stakeholder | CISO, Architecture, Legal |
| Supported Decision | Vendor security requirements; software integrity monitoring; PayNext vendor risk |
| BoI-CD 362 Reference | Article 21(2)(d) — supply chain security; Article 28 — ICT third-party risk |
| Intelligence Question | Are there known compromises, vulnerabilities, or threat actor interest in software or hardware vendors in FinServe's payment infrastructure stack (Thales HSM, Volante VolPay, Kong Enterprise, Oracle RAC, SentinelOne)? |
| Time Sensitivity | Strategic-operational (monthly + ad-hoc) |
| Priority | P2 |
| Expected Output | Monthly Supply Chain Intelligence Note |

---

## 6. SIR Development

For each PIR, develop 2–3 Specific Intelligence Requirements. The student must develop SIRs for all 8 PIRs. Four example SIRs are provided:

---

**SIR-001a** *(PIR-001 — Threat Actor Landscape)*

| Field | Content |
|---|---|
| Specific Question | Which financially motivated groups (ransomware affiliates, initial access brokers, BEC actors) have been publicly attributed to incidents at Israeli payment processors or acquiring banks in the past 12 months, specifically in the DACH/Benelux region? |
| Required Data | Vendor threat reports (Mandiant, CrowdStrike, Recorded Future), CERT-IL FinCERT sharing (TLP:AMBER — once membership is restored), Europol IOCTA, ENISA Threat Landscape |
| Collection Method | Manual review + Recorded Future query for "payment processor" + "acquiring" actor tags |
| Frequency | Quarterly + when significant incident reports are published |
| Owner | CTI Analyst (Avi Ben-David until departure; then successor) |
| Output | Threat Actor Profile sections for Quarterly Assessment |

---

**SIR-002a** *(PIR-002 — Active TTP Landscape)*

| Field | Content |
|---|---|
| Specific Question | Which ATT&CK techniques (at procedure level) appeared in public incident reports involving payment processors or fintech in the past 90 days, and which of these are not currently covered by FinServe's SIEM rules? |
| Required Data | Vendor blog posts (Mandiant, MSTIC, CrowdStrike), CERT-IL FinCERT TLP:AMBER reports (once available), Recorded Future campaign intelligence |
| Collection Method | Manual curation + Recorded Future "recent" filter for financial sector campaigns + SIEM coverage cross-reference |
| Coverage Cross-Reference | Sarah Chen (Detection Engineering) must confirm current rule coverage for each identified technique |
| Frequency | Monthly |
| Output | Monthly TTP Brief Section 3 — procedure-level detail for new techniques; Section 7 — specific detection rule proposals |
| Quality Gate | Each technique must include: command string or process ancestry example, specific log source, why current rules do not cover this variant |

---

**SIR-003a** *(PIR-003 — CVEs in Stack)*

| Field | Content |
|---|---|
| Specific Question | Which CVEs from CISA KEV affect: (1) FinServe's current versions of Splunk, Oracle RAC, Windows Server, AWS services, Kong Enterprise, Thales payShield firmware; (2) PayNext's specific Django version, SentinelOne version, and AWS SDK version? |
| Required Data | CISA KEV (daily feed), NVD, vendor security bulletins, Exploit-DB PoC availability tracking |
| Collection Method | Automated CISA KEV feed cross-referenced with FinServe CMDB (asset inventory from Tenable.io) + PayNext asset list (manual — PayNext is not yet in Tenable) |
| PayNext Gap | PayNext's assets are not in Tenable.io. This SIR cannot be fully answered until PayNext's CMDB is provided. This is an explicit gap that must be communicated to the Vulnerability Management team. |
| Frequency | Daily monitoring (automated), weekly summary |
| Owner | CTI Analyst + Vuln Management (Anna Kowalski) |

---

**SIR-006a** *(PIR-006 — Fraud Intelligence / DarkOwl Resolution)*

| Field | Content |
|---|---|
| Specific Question | Is FinServe's primary domain, any merchant-facing subdomain, or any PayNext domain mentioned in dark web markets, paste sites, or fraud forums in the past 90 days? |
| Collection Method Option A | Negotiate intelligence sharing with Fraud Team (Dieter Müller) — DarkOwl data available to Security at TLP:RED, shared weekly |
| Collection Method Option B | Acquire a separate dark web monitoring feed for Security (e.g., Flashpoint, Kela, or add Recorded Future Premium's dark web module) — budget estimate: €35–55K/year |
| Collection Method Option C | Manual hunt using free/open sources (OnionSearch, dark web forum scanning) — high effort, low coverage |
| Recommended approach | Option A (preferred — intelligence already exists, budget impact minimal); Option B as fallback if Fraud Team refuses |
| Frequency | Weekly |
| Dependency | Requires either Fraud Team negotiation or budget approval — this SIR is currently uncollectable |

---

## 7. Collection Plan

Build a complete Collection Plan with explicit gaps (where collection is currently not possible) and remediation actions:

### 7.1 Public / Open-Source Sources

| Source | PIR/SIR | Reliability | Access | Frequency | Current Status | Gap |
|---|---|---|---|---|---|---|
| MITRE ATT&CK Groups | PIR-001, PIR-002 | A/1 | Free | Quarterly | Available | Not systematically used |
| CISA Advisories | PIR-001, PIR-003 | A/1 | Free, RSS | Real-time | Available | Not integrated into workflow |
| CISA KEV | PIR-003, SIR-003a | A/1 | Free, API | Daily | Available — CMDB cross-ref needed | PayNext not in CMDB |
| ENISA Reports | PIR-001, PIR-005 | A/2 | Free | Quarterly | Available | Not systematically used |
| Vendor Blogs (Mandiant, CrowdStrike, MSTIC) | PIR-001, PIR-002 | B/2 | Free | Variable | Used ad-hoc by Marcus | No systematic collection |
| NVD / CVE | PIR-003 | A/1 | Free, API | Daily | Available | No automation |
| Abuse.ch (MalwareBazaar, ThreatFox) | PIR-004 | B/1 | Free, API | Real-time | Active in MISP | Low quality; 30% FP rate observed |

### 7.2 Commercial Sources

| Source | PIR/SIR | Current Status | Action Required |
|---|---|---|---|
| Recorded Future Basic | PIR-003, PIR-004 | Active (€18K/year, 6 months remaining) | Upgrade to Insikt Group Financial Services module recommended (€65K/year additional) |
| CERT-IL FinCERT (TLP:AMBER) | PIR-001–006 | **Lapsed** — membership expired 9 months ago | CISO approval + €18K renewal + 3–4 week processing |
| Europol IOCTA | PIR-001, PIR-006 | No formal relationship | Partnership application via Bank of Israel Supervisor liaison channel |
| DarkOwl (Fraud Team) | PIR-006 | Active (Fraud Team contract — €45K/year) | Negotiation required with Dieter Müller |
| CERT-IL FinCERT (TLP:WHITE) | PIR-005 | Available free at White level | Implement immediately — no cost, no approval |

### 7.3 Internal Sources

| Source | PIR/SIR | Current Status | Gap | Remediation |
|---|---|---|---|---|
| Splunk SIEM | PIR-002, PIR-004 | Available | Marcus is the only person who runs CTI queries | Document all saved searches before Marcus departs |
| Incident history | PIR-001, PIR-002 | Partial (IR post-incident reports exist) | CTI not in IR debrief process | Add CTI to IR post-incident review |
| Tenable.io (asset inventory) | PIR-003 | Available (FinServe scope) | PayNext not in Tenable | Add PayNext to Tenable.io — 3-month project |
| PayNext asset list | PIR-003 | Not available | Manual tracking only | Request from PayNext CISO |
| SOC Alert Feedback | PIR-004 | No formal mechanism | Ronen Katz's team has no CTI feedback process | Establish weekly SOC retrospective with CTI |
| Pentest Schedule | (Near-miss context) | IR does not receive pentest schedules | The near-miss incident direct cause | CTI must be added to change management process for all security testing |

### 7.4 Source Evaluation (Admiralty Scale)

Apply the Admiralty Scale to every source in the Collection Plan:
- **Reliability:** A (Completely Reliable) through F (Cannot be Judged)
- **Credibility:** 1 (Confirmed) through 6 (Cannot be Judged)

Note on Recorded Future: RF Basic tier IOC scores should be treated as **B/2 at most** for high-stakes blocking decisions — the Financial Services module upgrade would improve this to A/1 for sector-specific intelligence. The DE team's false positive experience resulted from treating RF Basic scores as A/1 without corroboration. This must be documented as a **collection plan lesson learned** and a policy correction.

---

## 8. Structured Analytic Methodology

### 8.1 Hypothesis Generation

For every significant analytic judgment, formulate at least 2–3 competing hypotheses before concluding.

**Applied example — the Recorded Future alert about FinServe's domain in a phishing campaign:**

*Observation:* FinServe's domain appeared in a phishing campaign template targeting Israeli payment processors (Recorded Future score 87/100, 3 weeks ago).

- Hypothesis 1: FinServe is a **specific, intended target** of this campaign — the domain was used because the actor has chosen FinServe as a victim (Confidence: Medium — score is high, but domain could appear incidentally)
- Hypothesis 2: FinServe's domain was **harvested by scrapers** and included in a mass-phishing template targeting all Israeli payment processors — not a specific targeting of FinServe (Confidence: Medium — common behavior)
- Hypothesis 3: The alert is a **false positive** — the Recorded Future data contains an error or the phishing template repurposed legitimate FinServe branding without specific targeting intent (Confidence: Low — score of 87 makes this unlikely)

ACH must be applied; additional collection must be specified to reduce uncertainty.

### 8.2 Analysis of Competing Hypotheses (ACH)

*Applied to the Fraud Team Intelligence Silo:*

The 120,000 compromised card alert was handled by the Fraud Team without security team involvement. What explains this?

| Evidence | H1: Process failure (forgot to notify security) | H2: Intentional silo (different business unit, different mandate) | H3: Data sensitivity concern (security team doesn't have need-to-know) |
|---|---|---|---|
| No documented process for Fraud → Security sharing | Consistent | Consistent | Consistent |
| Fraud Team DarkOwl contract predates Security's MISP | Inconsistent | Consistent | Consistent |
| Fraud Team stated "data sensitivity" when asked | Inconsistent | Consistent | Consistent |
| Security found out 3 weeks later via indirect channel | Consistent | Consistent | Inconsistent |

*ACH result:* H2 (intentional silo) and H3 (data sensitivity) are most consistent. Recommendation: negotiate a formal TLP-based sharing protocol rather than assuming process failure.

### 8.3 Confidence Level Framework

All Intelligence Products must use a consistent confidence framework:

| Level | Description | Phrase |
|---|---|---|
| **High** | Multiple independent, reliable sources; minimal alternative explanations | "We assess with high confidence that..." |
| **Medium** | Several sources; some alternative explanations | "We assess with moderate confidence that..." |
| **Low** | Limited or single source; significant uncertainty | "We believe, but with low confidence, that..." |
| **Insufficient** | Insufficient data | "Available data is insufficient to assess..." |

**Special application:** The Recorded Future alert about FinServe's domain must carry an explicit confidence level with rationale. Marcus's failure to escalate with a confidence level was part of why the CISO was not informed appropriately.

### 8.4 Linguistic Markers

| Category | Phrases |
|---|---|
| **Observed** | "We observed...", "Confirmed in telemetry...", "Present in logs..." |
| **Reported** | "According to report X...", "Vendor Y reports...", "CERT-IL FinCERT indicates..." |
| **Assessed** | "We assess...", "Our assessment:", "With [X] confidence..." |
| **Inferred** | "Available data suggests...", "Pattern is consistent with..." |
| **Unknown** | "Source of compromise remains unknown", "Data is insufficient..." |

### 8.5 Assumption Checking

For each key judgment in any Intelligence Product, document:
- **Assumption:** what is taken as true but not proven
- **If wrong:** how the conclusion changes
- **How to verify:** what would confirm or refute the assumption

*Applied to PIR-001:* The key assumption is that FinServe faces the same threat actor landscape as generic Israeli payment processors. This assumption would be wrong if FinServe's government client relationships (PayNext contracts with Polish government entities) attract state-sponsored actors not typical of pure-play payment processors. Verification: cross-reference CERT.pl advisories and Europol IOCTA for Polish fintech targeting.

---

## 9. Intelligence Products

### 9.1 Quarterly Threat Actor Assessment (CISO / Executive)

**Special requirements for FinServe context:**
1. **Key Judgements** section must explicitly address: (a) whether the Recorded Future domain alert represents targeted or opportunistic exposure, (b) whether PayNext's acquisition introduces new threat actor interest, (c) BoI-CD 362 compliance confidence statement
2. **Peer Incident Section** must reference any recent major payment processor incidents from CERT-IL FinCERT or public sources
3. **Defensive Recommendations** must map to specific PIR/SIR and to BoI-CD 362 Section 4 documentation requirements

---

### 9.2 Monthly TTP Intelligence Brief (SOC / Detection Engineering)

**Special requirements for FinServe context:**
- Every technique listed must include a **"Current Coverage" field** confirmed by the Detection Engineering team
- Any technique proposed for a new detection rule must include **procedure-level detail** (command string, process ancestry, log source) — generic technique names will not be accepted by the DE team
- A **"False Positive Risk Assessment"** section must be included for any proposed rule — this addresses the DE team's core concern after the €340K SLA breach incident

---

### 9.3 SOC Brief (SOC L1/L2)

**Special requirements:**
- All IOCs must include: source, RF score (if available), TTL, associated campaign name
- A **"Context for Payment Infrastructure Alerts"** section addressing what to do when an alert fires on the Settlement Database, Card Data Vault, or Payment Switch — these require different escalation criteria than general corporate IT alerts
- **Pentest Awareness:** a "Known Security Testing" section listing active authorized pentests, red team exercises, or security scanning activity that SOC may see in alerts — this directly addresses the root cause of the near-miss incident

---

### 9.4 Detection Engineering Brief (Sarah Chen's team)

**Special requirements — rebuilding trust with the DE team:**
- All detection proposals must include: evidence source, procedure-level example (not just technique), expected log query, and an explicit **"FP Mitigation Strategy"** section
- Each proposed rule must include a reference to the **specific log source** that generates the telemetry, with confirmation that the log source is (a) connected to Splunk and (b) generating parseable data
- A **"Rule Testing Checklist"** section: what the CTI team did to validate this rule against known-good traffic before proposing it to DE

---

### 9.5 IR Brief (Felix Bauer's team)

**Special requirements — addressing the near-miss incident:**
- Quarterly Preparedness Brief must include: top-3 threat actor attack sequences for FinServe's infrastructure (payment switch, card vault, settlement DB)
- **Pentest Deconfliction Section:** CTI must maintain and distribute a "Known Security Testing Calendar" covering all authorized pentest, red team, and security scanning activity for the next 90 days. This is a direct lesson learned from the near-miss incident.
- During an active incident, CTI must provide a **15-minute preliminary brief** on potential threat actors and their expected TTPs within 15 minutes of IR engagement

---

### 9.6 Vulnerability Intelligence Note (Anna Kowalski)

**Special PayNext focus:**
- Each note must include a **PayNext CVE Section** specifically assessing the 3 open CVEs:
  - CVE-A (CVSS 9.0): Django custom app — is there a public exploit? Is this CVE in CISA KEV? Are there threat actors known to exploit this in fintech?
  - CVE-B (CVSS 8.1): SentinelOne version — is this a security tool bypass? If yes, priority escalation
  - CVE-C (CVSS 7.2): AWS SDK version — cloud-specific exploitation context

---

### 9.7 Fraud Intelligence Weekly (Dieter Müller's team)

**Precondition:** This Intelligence Product cannot be produced until the intelligence sharing protocol with the Fraud Team is negotiated. The student must describe:
1. What the student would propose to Dieter Müller as a sharing protocol
2. What TLP level would apply to Fraud Team intelligence when shared with Security
3. What security team intelligence would be offered in exchange (reciprocal sharing)
4. What the escalation process would be for incidents involving both fraud and security (like the 120,000 card alert)

---

## 10. Dissemination Plan

| Product | Audience | Frequency | Format | Channel | Owner | Feedback Mechanism |
|---|---|---|---|---|---|---|
| Quarterly Threat Actor Assessment | CISO, Exec, IR Lead | Quarterly | PDF, 5–7 pages | Email + SharePoint | CTI Lead | Quarterly review meeting + CISO rating (1–5) |
| Monthly TTP Brief | SOC Mgr, Detection Engineering | Monthly | Markdown + JIRA tickets for rule proposals | Confluence + JIRA | CTI Analyst | Monthly DE sync — formal review of previous month's proposals |
| Weekly IOC Package | SOC L1/L2 | Weekly | STIX2 → Splunk lookup | MISP → Splunk API | CTI Automation | SOC: IOC hit/miss report — feeds IOC decay tracking |
| Weekly SOC Brief | SOC L1/L2 | Weekly | PDF/Markdown, 1 page + IOC table | Teams channel #soc-cti | CTI Analyst | Alert false positive tags in Splunk |
| Detection Engineering Brief | Sarah Chen's team | Bi-weekly | Markdown + JIRA tickets | JIRA + Teams #det-eng-cti | CTI Lead | DE sprint review — every proposal reviewed; rejection reasons documented |
| IR Brief (Pentest Calendar included) | Felix Bauer + SOC | Quarterly (brief) + ad-hoc (incidents) | PDF | Secure SharePoint + Teams #ir-cti | CTI Lead | Post-incident debrief — 5 business days after incident closure |
| Weekly Vuln Note | Anna Kowalski + PayNext CISO | Weekly | Email, 1 page | Email | CTI Analyst | Patch confirmation within SLA — tracked in JIRA |
| Fraud Intelligence Weekly | Dieter Müller (if sharing agreed) | Weekly | Email (TLP:RED) | Secure email | CTI Analyst 2 | Fraud team sync — weekly 15-minute call |
| Board Quarterly Slide | CEO, CFO, Board | Quarterly | PPT, 1 slide | Board package via CISO | CTI Lead + CISO | Board feedback channel (via CISO) |

---

## 11. Feedback Loop

### 11.1 SOC Feedback (Rebuilding Ronen Katz's trust)

After every alert linked to a CTI IOC, the SOC L2 must complete:
1. Did the IOC result in a true positive or false positive?
2. Was the campaign context in the SOC Brief sufficient for triage?
3. Did the IOC TTL reflect its actual operational lifetime?

**CTI Action:** IOCs generating >20% FP rate are immediately removed from the feed and flagged for RF quality review. Monthly IOC accuracy metric reported to CISO.

### 11.2 Detection Engineering Feedback (Rebuilding Sarah Chen's trust)

After each sprint, the DE team reviews:
1. Were all CTI-sourced proposals accompanied by procedure-level evidence and FP mitigation?
2. Were any proposals implemented? If rejected, what was the reason?
3. Did any implemented rules generate unexpected FPs?

**CTI Action:** Rejected proposals are analyzed for quality failures and fed back into the SIR collection process. A running "rejection log" tracks why proposals fail — this log is reviewed monthly to improve CTI quality.

### 11.3 IR Feedback (Addressing the near-miss root cause)

After every incident (including authorized pentest deconfliction errors):
1. Did CTI have relevant threat actor context available?
2. Was the pentest calendar up to date and accessible?
3. Could earlier CTI involvement have reduced IR response time?

**CTI Action:** Update IR playbooks and pentest calendar after every debrief. Track metric: "Average time for CTI to provide initial threat actor context after IR engagement" — target: 15 minutes.

### 11.4 Fraud Team Feedback (Resolving the silo)

Once the sharing protocol is established:
1. Monthly review: what intelligence did the Fraud Team share? What did Security share in return?
2. Was there any incident where cross-team intelligence would have improved response?

### 11.5 PIR Review Cycle

- **Quarterly:** Full PIR review with all stakeholders — are the questions still relevant?
- **Event-triggered:** BoI-CD 362 TLPT requirement (when activated — Article 26 TLPT), PayNext integration milestone, major sector incident

---

## 12. CTI Metrics

### 12.1 Operational Metrics (BoI-CD 362 Section 4 Documentation)

| Metric | Description | Target | Measurement | BoI-CD 362 Reference |
|---|---|---|---|---|
| PIR Answer Rate | % PIRs answered with Intelligence Product on time | > 85% | Quarterly | Article 9(2) |
| Detection Conversion Rate | % TTP proposals converted to rules within 60 days | > 60% | Monthly | Article 9(2)(e) |
| IOC Accuracy | % IOCs generating true positive alerts | > 30% | Monthly | — |
| IOC False Positive Rate | % IOC-based alerts that are false positives | < 15% | Monthly | — (rebuilding DE trust) |
| Pentest Calendar Currency | % of authorized security tests on the CTI calendar | > 95% | Monthly | — (near-miss lesson) |
| Fraud Intelligence Sharing | Number of intelligence items shared Fraud→Security per month | ≥ 4 | Monthly | — |

### 12.2 Qualitative Metrics

| Metric | Target | Measurement |
|---|---|---|
| Intelligence Timeliness | Avg time from first indicator to Intelligence Product < 48h for P1 | Timestamp tracking |
| Stakeholder Satisfaction | Survey score ≥ 3.5/5 from SOC, DE, IR within 90 days | Quarterly survey |
| DE Team Trust Recovery | Zero CTI-sourced rules generating >20% FP within first 90 days | FP rate tracking |
| IR Response Time | CTI initial brief provided within 15 min of IR engagement | IR engagement log |

### 12.3 Strategic Metrics (Board Presentation in 90 days)

| Metric | 90-day target |
|---|---|
| BoI-CD 362 Section 4 compliance | Documented CTI function with evidence of systematic threat intelligence use |
| Detection coverage improvement | +15% ATT&CK technique coverage from baseline |
| CERT-IL FinCERT membership restored | Yes/No |
| PayNext CVEs patched | 2 of 3 open CVEs patched or mitigated |
| Fraud Team sharing protocol | Agreed and operational |

---

## 13. 90-Day Implementation Roadmap

This roadmap must be honest about the Avi Ben-David departure (5 weeks) and the BoI-CD 362 deadline (4 months). It cannot assume capabilities that don't exist at Day 1.

### Days 1–30: Foundations Before Marcus Leaves

| # | Action | Owner | Deadline | Success Criteria |
|---|---|---|---|---|
| 1 | Knowledge transfer sessions with Marcus — document all Recorded Future queries, MISP config, saved Splunk searches | CTI Lead + Marcus | Day 14 | Runbook documented in Confluence |
| 2 | Stakeholder interviews — all 9 stakeholders; 30-min each | CTI Lead | Day 21 | Interview notes + stakeholder validation |
| 3 | Negotiate Fraud Team intelligence sharing protocol with Dieter Müller | CTI Lead | Day 25 | Protocol agreed or escalated to CISO |
| 4 | CISO approval for CERT-IL FinCERT membership renewal (€18K) | CTI Lead → CISO | Day 10 | Renewal initiated |
| 5 | Finalize PIR-001 – PIR-008 with stakeholder validation | CTI Lead | Day 28 | PIRs approved by CISO |
| 6 | Publish first Weekly SOC Brief | CTI Analyst | Day 7 | Distributed with IOC quality score included |
| 7 | Propose pentest calendar integration to IR and Security Testing team | CTI Lead | Day 14 | Calendar mechanism agreed |

### Days 31–60: Building Cadence

| # | Action | Owner | Success Criteria |
|---|---|---|---|
| 8 | Publish first Monthly TTP Brief (with procedure-level detail) | CTI Lead | Distributed; DE team accepts at least 2 proposals for sprint |
| 9 | Launch Weekly Vulnerability Intelligence Note (PayNext CVE assessment included) | CTI Analyst | PayNext CVEs risk-classified; Vuln Mgmt confirms patch priority |
| 10 | First Detection Engineering Brief + JIRA tickets (with FP mitigation sections) | CTI Lead | DE team accepts 3+ proposals without rejection |
| 11 | Automate IOC pipeline (Recorded Future → MISP → Splunk) with quality gating (RF score ≥ 75) | CTI Analyst/Automation | Pipeline running; FP rate tracking starts |
| 12 | SOC feedback mechanism — weekly 15-min retro for CTI-sourced alerts | CTI Lead + Ronen Katz | First feedback received; IOC hit rate tracked |
| 13 | Quarterly Threat Actor Assessment research — draft | CTI Lead | Draft includes FinServe-specific risk analysis, Recorded Future domain alert assessment |

### Days 61–90: First Cycle Completion (Board Presentation Readiness)

| # | Action | Owner | Success Criteria |
|---|---|---|---|
| 14 | Publish first Quarterly Threat Actor Assessment | CTI Lead | CISO approves; distributed to all SH-01 through SH-09 |
| 15 | Board Quarterly Slide (BoI-CD 362 Section 4 compliance evidence) | CTI Lead + CISO | Board presentation delivered; BoI-CD 362 gap closed on paper |
| 16 | First Stakeholder Satisfaction Survey | CTI Lead | Responses from ≥ 7/9 stakeholders; DE team satisfaction ≥ 3/5 |
| 17 | PayNext CTI integration assessment — what's needed for Year 2 | CTI Lead | PayNext CISO alignment; roadmap for integration |
| 18 | PIR Review Session with CISO | CTI Lead + Yael Mizrahi | PIRs updated; Year 2 PIRs drafted |
| 19 | BoI-CD 362 TLPT readiness assessment | CTI Lead + Legal | TLPT trigger assessment completed; timeline proposed |

---

## 14. Required Deliverables

| # | Deliverable | Audience |
|---|---|---|
| D1 | CTI Programme Overview (1–2 pages) | CISO, Leadership — includes BoI-CD 362 Section 4 compliance statement |
| D2 | Stakeholder Map (complete, 9+ stakeholders with PayNext context) | CTI Lead, CISO |
| D3 | PIR Table (8–10 PIRs, complete format — BoI-CD 362 reference column included) | CISO, all stakeholders |
| D4 | SIR Table (2–3 SIRs per PIR, complete format) | CTI Analysts |
| D5 | Collection Plan (with gap column and remediation actions) | CTI Lead |
| D6 | Source Evaluation Matrix (Admiralty Scale) | CTI Lead, Management |
| D7 | Analytic Methodology (including ACH applied to Recorded Future alert and Fraud Team silo) | CTI Team |
| D8 | Quarterly Threat Actor Assessment (draft) | CISO, Executive |
| D9 | Monthly TTP Brief (one instance with procedure-level detail + FP mitigation sections) | SOC, Detection Eng |
| D10 | SOC Brief (one instance — includes pentest calendar section) | SOC |
| D11 | Detection Engineering Brief (one instance — rebuilt-trust format) | Detection Engineering |
| D12 | IR Brief (one instance — includes near-miss lesson learned) | IR Team |
| D13 | Vulnerability Intelligence Note (PayNext CVE section included) | Vuln Management |
| D14 | Dissemination Plan (complete table) | CTI Lead |
| D15 | Feedback Loop Design (addresses DE trust + Fraud Team silo + IR near-miss) | CTI Lead, CISO |
| D16 | CTI Metrics Framework (BoI-CD 362 Section 4 compliance mapping included) | CTI Lead, CISO |
| D17 | 90-Day Implementation Roadmap (Marcus departure + BoI-CD 362 deadline honored) | CTI Lead, CISO |

---

## 15. Evaluation Rubric (100 points)

| Category | Points | Criteria |
|---|---|---|
| Stakeholder Understanding | 10 | All 9 stakeholders complete; DE team trust issue explicitly addressed; Fraud Team silo has a proposed solution; PayNext context included |
| PIR/SIR Quality | 20 | PIRs are genuinely business-driven (BoI-CD 362, near-miss, PayNext); SIRs produce actionable collection tasks; Recorded Future alert addressed in PIR-001 |
| Collection Plan | 15 | Lapsed CERT-IL FinCERT explicitly addressed; DarkOwl silo addressed; RF quality limitations documented; collection gaps acknowledged |
| Source Evaluation | 10 | Admiralty Scale applied; RF Basic tier scored correctly (B/2 not A/1); DE false positive lesson reflected |
| Analytic Rigor | 15 | ACH applied to Recorded Future alert; confidence levels explicit; near-miss incident analyzed as assumption failure |
| Intelligence Product Quality | 15 | Products differentiated by audience; DE brief has FP mitigation sections; SOC brief has pentest calendar; IR brief addresses near-miss |
| Operational Integration | 10 | CTI connected to SOC, DE, IR, Vuln Mgmt, Fraud Team; pentest calendar process established |
| Metrics & Feedback | 5 | BoI-CD 362 Section 4 metrics; DE trust recovery tracked; 90-day board presentation metrics realistic |

**Excellent (90–100):** All 17 deliverables; BoI-CD 362 Section 4 explicitly documented; near-miss incident root cause addressed in IR brief and pentest calendar; Fraud Team sharing protocol designed; DE trust rebuilt through quality-gated detection proposals; 90-day roadmap accounts for Marcus departure.

**Good (75–89):** Most deliverables; BoI-CD 362 addressed but not fully; near-miss lesson acknowledged but solution incomplete.

**Weak (55–74):** PIRs generic; Fraud Team silo treated as simple communication issue; DE trust issue not addressed; BoI-CD 362 as checkbox.

**Failing (<55):** Near-miss incident not analyzed; no PIR addressing PayNext; no Fraud Team solution; no 90-day realistic roadmap.

---

## 16. Professional Value

This assignment demonstrates the ability to build a CTI program from scratch in a dysfunctional organizational environment — which is the reality at most organizations. The specific complications (damaged DE team relationship, intelligence silo, analyst departure, BoI-CD 362 deadline, near-miss incident) are each drawn from real-world CTI program building challenges. An analyst who navigates all of these demonstrates the strategic thinking of a CTI Lead, not just a practitioner.

---

## 17. Common Mistakes

1. **Ignoring the near-miss incident** — it is the most important trigger event; it must appear in PIR development, IR Brief design, and the pentest calendar process
2. **Proposing CERT-IL FinCERT as "currently available"** — it is lapsed; the roadmap must include renewal as a Day 1–10 action
3. **Treating the Fraud Team as a simple communication problem** — they are an organizational silo with different mandate and culture; a formal sharing protocol is required
4. **PIRs that are generic** — "What are the main threats to payment processors?" is not a PIR; it is a Google search
5. **Detection Engineering Brief without FP mitigation** — after the €340K SLA breach, the DE team will reject any proposal without explicit FP risk analysis
6. **Roadmap that ignores Marcus's departure** — he is leaving in 5 weeks; any process that depends on his knowledge must be documented before Day 35

---

## 18. Portfolio Value

This assignment is the only deliverable that demonstrates **CTI program management under adversarial organizational conditions** — not building a CTI program in an ideal greenfield environment, but building one while an analyst is leaving, relationships are damaged, key memberships are lapsed, and a regulatory deadline is 4 months away. Present D3 (PIR Table with BoI-CD 362 references), D8 (Quarterly Assessment), and D17 (90-Day Roadmap honoring real constraints) as a set that shows a hiring manager you understand how organizations actually work.
