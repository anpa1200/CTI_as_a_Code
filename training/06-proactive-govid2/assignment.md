# Assignment 6: Proactive CTI — Government Biometric Gateway Threat Modeling and Detection Backlog

> **Sector:** Israeli Government / National Digital Services  
> **Organization Type:** National government agency — critical national infrastructure  
> **Regulatory Framework:** INCD-CID, Israeli Biometric Database Law (5769-2009), MATZBEN, Israeli PPL  
> **Scenario Type:** Proactive (pre-incident) — threat-led detection planning for high-stakes platform launch  
> **Estimated Effort:** 35–50 hours  
> **Level:** Senior CTI Analyst / Detection Engineering Lead

---

## Preface

This assignment simulates the hardest kind of proactive CTI work: you have a specific, imminent capability launch, four credible threat signals, and four months to improve the security posture before go-live. Government context adds constraints private-sector analysts rarely face: classification tiers that prevent full threat intelligence sharing downward, formal change control processes that mean every detection rule requires 5 business days to deploy, and a political cost to being wrong that no CISO in the private sector has to carry.

Your job is not to alarm everyone. Your job is to be right.

---

## Section 1: Organizational Context

### 1.1 Organization and Launch Context

**Organization:** National Digital Services Authority (NDSA)  
**Project:** GovID 2.0 — Next-generation biometric authentication gateway  
**Launch Target:** 4 months from scenario start (1 October 2025)  
**Regulatory Milestone:** GovID 2.0 must be certified by INCD under INCD-CID Annex C (critical authentication infrastructure) before launch

**What GovID 2.0 Does:**
- Replaces the existing GovID 1.x system (hardware token-based, 2009 architecture)
- Provides biometric authentication (fingerprint + facial recognition) for all 47 government digital services
- Serves as the authentication backbone for 22 ministries
- Handles estimated 3.4 million authentication events per day at steady state
- Stores biometric templates for 9.5 million Israeli citizens
- Is the single point of authentication failure for the entire national e-government stack

**GovID 2.0 Architecture Overview:**
```
Citizen Browser / Mobile App
    ↓ HTTPS (TLS 1.3)
[GovID 2.0 Frontend Cluster] — 8 nodes, AWS GovCloud IL (INCD-certified region)
    ↓ mTLS
[Biometric Matching Engine] — On-premise NDSA datacenter, Jerusalem
    ↓ Encrypted API
[VRID 2.0 Database] — On-premise, GOVNET Classified Segment
    ↓ Read-only data feed
[Ministry Integration Bus v2] — API gateway to 22 ministry systems
```

**Key Personnel:**

| Role | Name | Notes |
|---|---|---|
| CISO | Col. (Res.) Dror Nativ | Responsible for INCD certification; personal accountability |
| GovID 2.0 Project Lead | Hila Shapiro | Engineering background; CTI not her domain |
| CTI Lead | Shai Rotenberg | IR background; GovID 2.0 is his first large proactive engagement |
| INCD Liaison | Lt. Col. (Res.) Oren Friedman | Access to classified threat picture; handles sensitive threat info |
| Contractor: HavayaIT Systems Ltd. | Amir Halevi (dev), Yoav Stern (network) | NOTE: This is the SAME contractor from Assignment 5 — a separate timeline |
| Legal Counsel | Tamar Goldstein | Biometric Database Law compliance lead |
| Biometric Engine Vendor | BiometricTech IL Ltd. | Third-party vendor; source code not available to NDSA |

**Budget for GovID 2.0 Security Controls:** ₪12M allocated; ₪4.2M already spent on infrastructure; ₪7.8M remaining for security controls and detection capability

### 1.2 Current Security Posture — Detection Inventory

**Existing detections relevant to GovID 2.0 (from Assignment 5 legacy):**

| Detection ID | Rule Name | Coverage | Known Issues |
|---|---|---|---|
| GOV-DET-001 | Contractor VPN off-hours logon | Contractor DMZ | Too broad — fires on 11 PM shifts |
| GOV-DET-002 | Lateral movement from Contractor DMZ | Contractor DMZ → Ops | 30-minute delay in correlation |
| GOV-DET-003 | BITS job to non-Microsoft ASN | VRID-SRV-01 only | Not deployed on GovID 2.0 nodes yet |
| GOV-DET-004 | wevtutil log clear | Domain-wide | Confirmed working post-Assignment 5 fix |
| GOV-DET-005 | Full-table SELECT on VRID | VRID-SRV-01 only | Not applicable to GovID 2.0 architecture |

**Assessment:** 5 existing detections, all created reactively post-Assignment 5 incident. None designed for GovID 2.0 attack surface. Zero detections exist for biometric API abuse, authentication gateway bypass, or supply chain attacks on the BiometricTech IL Ltd. vendor component.

---

## Section 2: Four Trigger Events

You receive all four of the following intelligence items within a 3-week window, approximately 4 months before GovID 2.0 launch. Each trigger arrives with different confidence levels and from different sources.

### Trigger 1: UAE Government Peer Incident

**Source:** INCD TLP:AMBER advisory (received via Friedman, shared to Nativ and Rotenberg only)  
**Date:** Received 02 June 2025  
**Classification:** TLP:AMBER — NOT for distribution outside NDSA leadership without INCD approval

**Summary of advisory content:**

> A government agency in the United Arab Emirates operating a national digital identity platform experienced a significant compromise in April 2025. The threat actor gained access to the agency's biometric authentication API layer using credentials stolen from a third-party biometric engine vendor. The actor used the vendor credentials to make authenticated API calls that extracted biometric templates in bulk — 1.7 million records over a 96-hour window. The exfiltration was not detected until the vendor's anomaly detection flagged abnormal API call volumes 4 days after initial access.

> The biometric engine vendor involved is not named in the advisory. The advisory notes that the same vendor supplies biometric technology to multiple Middle East and European government identity platforms.

> Assessed adversary: Iranian-nexus threat cluster. No further attribution details in this tier of the advisory.

**INCD advisory footnote:** *"Recipient agencies operating biometric authentication platforms should review vendor API access controls as a priority."*

**Complicating factor:** Friedman tells Rotenberg that BiometricTech IL Ltd. — the vendor supplying NDSA's GovID 2.0 biometric engine — was identified in the classified tier of the advisory as a potentially affected vendor, but INCD cannot share the classified confirmation without a formal read-in procedure that takes 3 weeks. Rotenberg must design threat models based on "possible" vendor compromise while INCD processes the read-in.

### Trigger 2: CERT-IL TLP:AMBER Bulletin on Iranian Biometric Targeting

**Source:** CERT-IL public bulletin CB-2025-041 (TLP:AMBER, published 08 June 2025)  
**Classification:** TLP:AMBER — shareable within NDSA

**Relevant excerpt:**

> CERT-IL has observed increased Iranian-nexus threat actor interest in civilian biometric databases maintained by Israeli government agencies. Observed techniques include:
> 
> - Spearphishing campaigns targeting developers and integration engineers working on biometric authentication systems
> - Credential harvesting from GitHub repositories belonging to contractors working on government biometric projects
> - API credential abuse against biometric verification services using legitimate vendor tokens
> - Attempts to register lookalike domains impersonating Israeli government authentication portals
>
> Specific indicators are provided in the MISP feed (TLP:AMBER) published 08 June 2025. Agencies are advised to review developer access controls, API rate limiting, and credential scanning on code repositories as a priority.
>
> Confidence: Medium-High (B2 on Admiralty Scale)

**Related MISP indicators (summary):**

| Type | Value | Confidence | Notes |
|---|---|---|---|
| Domain | `govid-il-auth[.]net` | High | Registered 22 May 2025; lookalike of GovID platform |
| Domain | `biometric-verify-gov-il[.]com` | High | Registered 15 May 2025; lookalike |
| IP | 185.220.101.47 | Medium | Exit node; seen in CERT-IL and ClearSky reports |
| IP | 91.108.4.188 | Medium | Possible C2; Telegram-linked ASN |
| Email Subject | "GovID 2.0 Developer Access Update" | High | Spearphishing lure subject seen in wild |
| Email Subject | "INCD API Security Review — Action Required" | High | Spearphishing lure subject seen in wild |

### Trigger 3: GitHub Credential Leak — HavayaIT Developer Repository

**Source:** NDSA SOC analyst performing routine external exposure monitoring  
**Date:** Discovered 14 June 2025  
**Classification:** Unclassified / Internal

**Finding:**

During routine scanning of GitHub for NDSA-related credential exposure, SOC analyst Gila Ben-Moshe discovers a public GitHub repository belonging to HavayaIT developer `yoav-stern-dev` (matching Yoav Stern, HavayaIT network engineer with NDSA Contractor DMZ access). The repository contains:

1. A `.env` file committed 3 June 2025 containing:
   ```
   NDSA_API_KEY=ndsa_prod_7f3k9m2x...  [truncated]
   GOVID_STAGING_URL=https://govid2-staging.ndsa.gov.il
   GOVID_STAGING_TOKEN=eyJhbGciOiJSUzI1NiJ9...  [JWT, 30-day expiry]
   HAVAYAIT_VPNCRED=y.stern / [password redacted by GitHub's secret scanning — but visible in git history]
   ```

2. The commit was made 11 days ago. GitHub's secret scanning flagged it 8 days ago and notified the repository owner. No evidence that Stern has acted on the notification.

3. The JWT token `GOVID_STAGING_TOKEN` has a 30-day expiry from issue date of 30 May 2025 — it is still valid.

4. The NDSA GovID 2.0 staging environment is network-accessible from the internet on a subdomain `govid2-staging.ndsa.gov.il`. It contains a near-complete copy of the GovID 2.0 production codebase and synthetic biometric test data for 50,000 fictitious individuals — but the staging environment API endpoints are not fully isolated from the production VRID database for some query types (a known gap that was scheduled to be fixed in Sprint 23, which starts in 3 weeks).

**Immediate action already taken:** The SOC invalidated the JWT token and rotated the NDSA_API_KEY at 16:45 IST on 14 June. The staging environment subdomain is still accessible.

**Unresolved questions:**
- Was the credential accessed by anyone between commit date (3 June) and discovery (14 June) — the 11-day exposure window?
- What were Stern's reasons for committing credentials to a public repository?
- Did the exposure overlap with the CERT-IL bulletin on credential harvesting from contractor repositories (Trigger 2 published 8 June)?

### Trigger 4: BiometricTech IL Ltd. Staging Environment Anomaly

**Source:** BiometricTech IL Ltd. vendor security team, informal notification to NDSA GovID 2.0 Project Lead Hila Shapiro  
**Date:** Received 17 June 2025  
**Classification:** Sensitive / Vendor Confidential

**BiometricTech IL Ltd. email to Shapiro (paraphrased):**

> "Our security team has noticed unusual API call patterns on the GovID 2.0 integration test environment in the past 10 days. We're seeing repeated calls to the `/verify/bulk` endpoint from an IP address (185.220.101.47) that is not in our authorized integration test IP allowlist. The calls are using a valid vendor API token but are returning 403 errors because the endpoint requires an NDSA-signed request header. The volume is approximately 2,400 calls per day. We believe this may be automated scanning or probing of the API surface. We have not yet determined if the token is legitimately issued or stolen. We're sending this to you informally because we're not sure if this rises to the level of a formal security incident on our side. Let us know how you want to handle this."

**Critical intersection:** IP 185.220.101.47 appears in the CERT-IL MISP indicators from Trigger 2. The threat actor appears to be probing the GovID 2.0 API surface using what may be a stolen BiometricTech IL vendor token — consistent with the UAE incident described in Trigger 1.

**Shapiro forwarded the email to Rotenberg on 18 June, 9 days after she received it (she thought it was a vendor support question, not a security issue).**

---

## Section 3: Tasks

### Task 1: Threat Intelligence Synthesis and Confidence Assessment

Before building any detection capability, establish what you actually know.

**Requirements:**

1. For each of the four triggers, complete a **Source Reliability / Information Credibility assessment** using the Admiralty Scale (A–F for source, 1–6 for information). Provide explicit reasoning for each rating. Note: TLP:AMBER INCD advisories from Friedman come with a classification handling caveat — how does that affect your ability to cite them in your deliverables?

2. Produce a **Synthesized Threat Picture** (2 pages maximum) that integrates all four triggers into a single coherent assessment. Address:
   - What is the adversary apparently trying to do with respect to GovID 2.0 specifically?
   - What is the current phase of their operation (reconnaissance, initial access, pre-exploitation, exploitation)?
   - Are all four triggers likely the same adversary, or could there be multiple actors?
   - What is the highest-confidence conclusion you can draw from trigger correlation?

3. Build an **Intelligence Gap Analysis**: what questions remain unanswered after reviewing all four triggers, and what collection activities could close each gap before the launch date?

4. Identify the **most dangerous unresolved uncertainty** — the single intelligence gap that, if answered adversarially (worst case), would most change your risk assessment for the GovID 2.0 launch. Explain your reasoning.

5. Write a **Threat Summary** for non-technical stakeholders (DG and Project Lead Shapiro) that explains the threat picture in plain language without referencing TLP:AMBER material from Trigger 1 (which cannot be shared with Shapiro under INCD handling rules). This requires communicating risk without being able to cite your strongest evidence source.

---

### Task 2: Threat Modeling — GovID 2.0 Attack Surface

Map the attack surface of GovID 2.0 before a single detection rule is written.

**Requirements:**

1. Produce a **Threat Model** for GovID 2.0 using a structured methodology (STRIDE or PASTA — state which you are using and why). The model must cover:
   - All components in the GovID 2.0 architecture (frontend cluster, biometric matching engine, VRID 2.0, Ministry Integration Bus, developer/staging environment)
   - All trust boundaries (citizen → internet, internet → frontend, frontend → biometric engine, biometric engine → VRID, VRID → classified segment, vendor API access, contractor access)
   - All external entities with privileged access (BiometricTech IL Ltd., HavayaIT developers, INCD, ministry IT teams)

2. Produce a **Crown Jewels Analysis** for GovID 2.0: which data assets and system capabilities, if compromised, would cause the highest harm? Rank in priority order with justification. Include assets that are not obvious (e.g., the biometric template matching algorithm itself — if extracted, it could enable adversarial spoofing attacks).

3. Identify the **top 5 attack scenarios** for GovID 2.0. For each scenario:
   - Scenario title and narrative (3–4 sentences)
   - Prerequisite capabilities the adversary must have
   - ATT&CK technique mapping (pre-attack + post-access)
   - Likelihood assessment (based on trigger intelligence)
   - Impact if successful (scale: 1–5 across confidentiality, integrity, availability)
   - Primary detection opportunity

4. Produce a **Vendor Trust Risk Matrix** for BiometricTech IL Ltd. and HavayaIT:
   - What access does each vendor have to GovID 2.0 production/staging?
   - What would a compromised vendor credential enable?
   - What controls exist to limit blast radius of vendor compromise?
   - What controls are missing?

5. Assess the **staging environment risk** from Trigger 3 specifically: given the 11-day exposure window and the known Sprint 23 gap (staging API partially connected to production VRID), is it possible that the adversary has already accessed production VRID data through the staging environment? Produce a **go/no-go recommendation** for Launch Date with explicit conditions.

---

### Task 3: Detection Backlog and Prioritization

Convert the threat model into a prioritized, actionable detection program.

**Requirements:**

1. Produce a **Detection Backlog** of minimum 15 detection items, each with:
   | Field | Description |
   |---|---|
   | Item ID | DET-GOV-0xx |
   | Title | Short descriptive name |
   | Scenario Covered | Which attack scenario from Task 2 |
   | ATT&CK Technique | Primary technique |
   | Log Source Required | What must be ingested |
   | Detection Logic Summary | What the rule looks for (prose, not code at this stage) |
   | Priority | P1 (critical, before launch) / P2 (before launch if possible) / P3 (post-launch) |
   | Estimated Engineering Effort | Hours |
   | Dependencies | What must be in place before this detection works |

2. Identify the **detection items that are blocked by architectural gaps** (i.e., cannot be implemented without infrastructure changes). For each blocked item:
   - State what architectural change is needed
   - Estimate time and cost
   - Determine whether the gap can be mitigated by a compensating control before launch

3. Apply the **INCD-CID detection coverage requirement**: INCD Annex C requires that authentication infrastructure must have detection coverage for at minimum: credential stuffing attacks, bulk API extraction, and unauthorized privileged access. For each required category:
   - Which backlog items provide coverage?
   - Is the coverage complete or partial?
   - What is the gap before launch?

4. Write a **Detection Roadmap** in three phases:
   - **Phase 1 (Pre-launch, 4 months):** What must be operational on Day 1 of launch
   - **Phase 2 (30-day post-launch):** What must be operational within the first month
   - **Phase 3 (90-day post-launch):** Mature coverage state

5. Estimate **total detection program cost** for all 15 backlog items:
   - Engineering hours (at ₪800/hour blended rate)
   - Infrastructure costs (log ingestion volume, SIEM licensing, additional tooling)
   - Determine whether the program fits within the remaining ₪7.8M security controls budget

---

### Task 4: Immediate Response to Active Threat Indicators

The four triggers indicate active adversary interest. You cannot wait for the detection program — you need immediate actions today.

**Requirements:**

1. Produce an **Immediate Action Plan** (to be presented to CISO Nativ within 48 hours of receiving the last trigger). The plan must cover:
   - Actions to be taken in the next 72 hours
   - Owner for each action
   - How each action reduces risk based on trigger evidence
   - What can be done without disrupting the GovID 2.0 development timeline
   - What cannot be done without disrupting the timeline and requires a risk acceptance decision

2. Regarding **BiometricTech IL Ltd.** (Trigger 4):
   - Is the probing of `/verify/bulk` by IP 185.220.101.47 an active threat or a false alarm?
   - What must BiometricTech do to their API access controls within 48 hours?
   - What additional information must NDSA demand from BiometricTech to assess whether this is a vendor-side compromise (as in the UAE incident)?
   - Write a **formal security request letter** from NDSA CISO to BiometricTech IL Ltd. CISO demanding specific information within 24 hours.

3. Regarding **HavayaIT GitHub leak** (Trigger 3):
   - The JWT token has been rotated. Is that sufficient?
   - Design a **credential exposure investigation**: what steps does NDSA take to determine whether the 11-day exposure was exploited?
   - Should Stern's NDSA access be suspended pending investigation? Write a risk-balanced recommendation that considers the ongoing GovID 2.0 development work Stern is contributing to.

4. Address the **staging environment production API leak** (Sprint 23 gap):
   - Recommend whether to accelerate Sprint 23 (pulling engineer resources from GovID 2.0 launch features) or implement a compensating control
   - Write the specific compensating control technical specification if you choose that path

5. Address the **INCD read-in delay** for the BiometricTech IL vendor identification:
   - You believe (medium confidence) that BiometricTech is a compromised vendor based on trigger correlation, but INCD hasn't confirmed it
   - What actions are you authorized to take against a vendor based on "medium confidence, unconfirmed" intelligence?
   - What is the risk of taking aggressive action (e.g., suspending vendor API access) vs. waiting for INCD confirmation?
   - Write a **risk acceptance memo** for CISO Nativ to sign, documenting the decision either way.

---

### Task 5: INCD Certification Threat Modeling Deliverable

INCD requires NDSA to submit a threat model as part of the GovID 2.0 INCD-CID Annex C certification.

**Requirements:**

1. Review INCD-CID Annex C requirements for biometric authentication infrastructure certification. The requirements include:
   - Threat model covering top-5 threat scenarios with ATT&CK mapping
   - Detection coverage matrix demonstrating coverage for INCD-defined threat categories
   - Evidence of vendor security review
   - Incident response plan for authentication platform compromise

2. Produce a **draft INCD-CID Annex C submission** covering all four required elements above, using material from your Tasks 1–4 analysis. The submission must:
   - Be suitable for INCD review
   - Not include TLP:AMBER material in the unclassified submission (note what has been deliberately omitted and why)
   - Be defensible if a certification reviewer challenges any threat assessment finding

3. Identify the **certification gap**: given the BiometricTech vendor situation, can NDSA honestly certify that vendor security has been reviewed? Write a paragraph recommending whether to: (a) complete the vendor review before submitting for certification; (b) submit with a noted pending item; or (c) request a certification extension from INCD. Provide a recommended course of action with rationale.

---

### Task 6: Intelligence-Led Launch Decision

In 4 months, NDSA leadership must decide: launch GovID 2.0 on schedule, launch with residual risk accepted, or delay.

**Requirements:**

1. Produce a **Launch Risk Assessment Matrix** covering:
   - Risk ID, Risk Description, Likelihood (1–5), Impact (1–5), Risk Score
   - Current mitigations in place
   - Residual risk score after mitigations
   - Minimum required mitigations before launch is acceptable

2. Define **launch criteria** — the minimum conditions that must be met before GovID 2.0 goes live. Base your criteria on the threat intelligence picture and the detection coverage gaps.

3. Write a **CISO Recommendation Memo** (1 page) to DG Dr. Shamir recommending launch, conditional launch, or delay, with explicit reasoning based on your intelligence assessment. Address: what happens if you launch with the current BiometricTech uncertainty vs. what happens if you delay by 6 weeks to resolve it.

4. Estimate the **political cost of delay** vs. the **security cost of compromise**: NDSA has committed publicly to a 1 October 2025 launch. A breach of 9.5 million biometric records after launch would be catastrophic. Frame this trade-off clearly for a non-technical decision-maker.

---

## Section 4: Deliverables Summary

| # | Deliverable | Audience | Format |
|---|---|---|---|
| 1 | Threat intelligence synthesis (4 triggers → unified picture) | CISO, DG | 2-page report |
| 2 | Intelligence gap analysis | CTI Lead | Table + narrative |
| 3 | Non-technical threat summary (no TLP:AMBER refs) | DG, Project Lead | 1 page |
| 4 | GovID 2.0 threat model (STRIDE or PASTA) | CISO, INCD | Structured model |
| 5 | Crown jewels analysis | CISO, DG | Table + narrative |
| 6 | Top-5 attack scenarios | SOC, Detection Eng | Structured report |
| 7 | Vendor trust risk matrix | CISO, Legal | Table |
| 8 | Detection backlog (15+ items) | Detection Eng | Table |
| 9 | Detection roadmap (3 phases) | CISO, Program | Roadmap table |
| 10 | Immediate action plan (72-hour) | CISO | Action plan |
| 11 | BiometricTech formal security request letter | CISO → BiometricTech CISO | Formal letter |
| 12 | Credential exposure investigation plan | SOC, IR Lead | Process document |
| 13 | Risk acceptance memo (vendor action decision) | CISO | Signed memo |
| 14 | Draft INCD-CID Annex C certification submission | INCD | Formal submission |
| 15 | Launch risk assessment matrix | DG, CISO, Project Lead | Matrix |
| 16 | CISO recommendation memo (launch/delay decision) | DG | 1-page memo |

---

## Section 5: Assessment Criteria

| Criterion | Weight | What Examiners Look For |
|---|---|---|
| Intelligence synthesis and confidence discipline | 20% | Correct Admiralty Scale application; TLP handling; multi-source integration |
| Threat modeling rigor | 20% | Methodology consistency; full attack surface coverage; vendor trust analysis |
| Detection backlog quality | 20% | Prioritization logic; architectural gap identification; INCD compliance mapping |
| Immediate action quality | 15% | Risk-proportionate actions; decision-making under uncertainty |
| INCD certification deliverable | 15% | Regulatory accuracy; honest certification gap treatment |
| Launch decision quality | 10% | Trade-off articulation; political/security balance |

---

## Appendix A: GovID 2.0 Critical Assets Inventory (Seed Data)

| Asset | Classification | Value | Breach Impact |
|---|---|---|---|
| Biometric template database (9.5M records) | Secret | Existential | Identity fraud at national scale; non-replaceable |
| Biometric matching algorithm (BiometricTech IP) | Confidential | Critical | Algorithm extraction enables adversarial spoofing |
| GovID authentication session tokens (transient) | Internal | High | Session hijacking for any of 47 government services |
| Ministry Integration Bus API keys (22 ministries) | Secret | Critical | Cross-ministry data access; lateral movement vector |
| VRID 2.0 database schema | Internal | Medium | Enables precise data extraction without discovery |
| GovID 2.0 source code | Confidential | High | Vulnerability discovery; API surface mapping |
| Developer credentials (staging) | Internal | High | Enables full staging access; partial production risk |

---

## Appendix B: INCD-CID Annex C — Authentication Infrastructure Requirements Summary

Per INCD-CID Annex C (Version 3.1, 2024), biometric authentication platforms classified as national critical infrastructure must demonstrate:

- **A-1:** Documented threat model with minimum 5 adversary scenarios and ATT&CK mapping
- **A-2:** Detection coverage for: (i) credential stuffing, (ii) bulk API data extraction, (iii) unauthorized privileged access, (iv) supply chain compromise indicators
- **A-3:** Vendor security review for all vendors with API access to biometric data
- **A-4:** Incident response plan specifically for authentication platform compromise, tested within 12 months
- **A-5:** Annual third-party penetration test; last results on file
- **A-6:** Biometric data retention and destruction policy compliant with Biometric Database Law

---

*This scenario is fictional and designed for educational use. All organizations, individuals, domains, and regulatory details are either fictional or used in a fictitious context for training purposes. No real system or person is referenced.*
