# Solution: Assignment 3 — Full CTI Cycle: TechPay Israel

> **Model answer. All data is fictional.**

---

## Task 1 — PIR Framework

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)*
>
> OpenCTI: store PIRs as structured "Case" or "Report" objects linked to the stakeholder who requested them — enables traceability from collection through production to the original intelligence need. MISP: tag incoming intelligence events with PIR reference tags so analysts can instantly filter which events serve which requirement. ATT&CK Navigator: map PIR-implicated techniques as a heatmap layer to visualize which ATT&CK areas the PIR framework covers and where collection gaps exist.

### Stakeholder Requirements → PIR Derivation

| Stakeholder | Key Quote | Intelligence Need | PIR Derived |
|---|---|---|---|
| CISO Yael Mizrahi | "I need to know about PayNext risks before they become our risks" | Threat assessment of acquired company's inherited attack surface | PIR-001 |
| Ronen Katz (SOC Manager) | "Give me indicators not essays" | Tactical feed of actionable IOCs and hunting hypotheses | SIR-001 |
| Dana Levi (Legal) | "What does BoI-CD 362 actually require from us right now?" | Regulatory compliance horizon; gap between current state and BoI-CD 362 Section 4/6/8 | PIR-004 |
| Board | "Can this be defended to the Bank of Israel Supervisor?" | Strategic threat picture defensible under regulatory scrutiny | PIR-005 |
| Fraud team | "DarkOwl is flagging TechPay-related credential leaks monthly" | Dark web credential and data exposure monitoring | SIR-002 |

### PIR Table

| # | Title | Intelligence Question | Decision Supported | Owner | Cadence | Classification | Success Criterion |
|---|---|---|---|---|---|---|---|
| PIR-001 | Israeli Payment Processor Threat Landscape | *"Which threat actors are actively targeting Israeli payment processors and fintech companies, and what are their current access vectors and objectives?"* | Detection engineering prioritization; vendor risk decisions | CISO | Quarterly + triggered on peer incident | Confidential | Answer names ≥1 active campaign; maps TTPs to current TechPay attack surface |
| PIR-002 | PayNext Acquisition Threat Inheritance | *"What are the specific threat exposures inherited from the PayNext Solutions Ltd. acquisition that have not yet been remediated, and which pose the highest risk to TechPay's core payment infrastructure?"* | Integration security roadmap; risk acceptance decisions | CISO | Monthly for first 12 months post-acquisition; then quarterly | Confidential | Answer identifies top 3 inherited exposures with remediation timelines |
| PIR-003 | Insider and Third-Party Access Risk | *"Are any current employees, contractors, or departing personnel — specifically including Avi Ben-David — in possession of TechPay-sensitive access or intelligence that could benefit a threat actor or competitor?"* | HR security decisions; offboarding procedures; NDA enforcement | CISO + Legal | Triggered (on all senior departures); quarterly for contractor review | Secret (personnel-sensitive) | Answer provides specific access inventory for flagged individuals; recommendation on access revocation |
| PIR-004 | Regulatory Compliance Threat Horizon | *"What changes to BoI-CD 362, Israeli PPL, or Bank of Israel supervisory expectations are anticipated in the next 6 months that would affect TechPay's reporting obligations or detection requirements?"* | Legal and compliance preparation | Legal | Quarterly | Unclassified | Answer identifies ≥1 regulatory change with implementation timeline and TechPay-specific impact |
| PIR-005 | Adversary Capability Evolution — Financial Sector | *"Has the primary threat cluster targeting Israeli payment infrastructure changed its tooling, persistence mechanisms, or evasion techniques in the past 90 days in ways that reduce effectiveness of current TechPay detections?"* | Detection rule update prioritization | CISO + Detection Engineering | Quarterly | Confidential | Answer maps any new techniques to TechPay detection inventory; identifies rules requiring update |

### SIR Table

| # | SIR | Source | Frequency | Output | Consumer |
|---|---|---|---|---|---|
| SIR-001 | Monitor CERT-IL FinCERT feed (once membership is reinstated) and Israeli payment sector MISP community for new indicators matching payment processors | CERT-IL FinCERT; MISP | Daily auto-ingest; manual triage within 4 hours | SIEM watchlist + MISP tagged events | SOC |
| SIR-002 | Monitor DarkOwl for TechPay-related credential leaks, domain mentions, and payment data dumps | DarkOwl (existing contract) | Daily | Alert to fraud team and SOC within 2 hours of match | Fraud team, SOC |
| SIR-003 | Monitor CERT-IL and NVD for CVEs affecting TechPay payment processing stack: [specific vendors and versions] | NVD, CERT-IL | Daily | Patch priority recommendation to IT within 24 hours of publication | IT Operations |
| SIR-004 | Monitor domain registrations for lookalike domains targeting TechPay brands (`techpay-il.com` variants, `techpay-payment` variants) | Passive DNS / brand monitoring | Daily | Alert to SOC; block recommendation within 4 hours | SOC, Brand/Legal |

---

## Task 2 — Collection Plan

> **Tools:** [MISP](https://www.misp-project.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [Yeti](https://yeti-platform.io/) *(open-source)* · [Shodan](https://www.shodan.io/) *(freemium)* · [SpiderFoot](https://www.spiderfoot.net/) *(open-source)*
>
> MISP: ingest structured feeds (CERT-IL TAXII, FS-ISAC) directly via MISP feeds module; auto-correlate across sources on import. OpenCTI: manage collection sources as "data source" objects with PIR linkages; track feed health and last-ingest timestamps. Yeti: OSINT-focused indicator storage for unstructured collection sources (blogs, Twitter/X, paste sites); tag by confidence and source. Shodan: active collection against PayNext's exposed infrastructure — identify services that confirm or refute PIR-003 (acquisition risk). SpiderFoot: automated OSINT collection against PayNext domains and IP ranges; feeds into collection plan gap analysis.

### Collection Source Matrix

| Source | PIRs Served | Availability | Classification | Cost | Gap? |
|---|---|---|---|---|---|
| TechPay SIEM (Elastic) internal telemetry | PIR-001, -002, -005 | Available now | Unclassified | ₪0 | Partial — PayNext logs not yet integrated |
| CERT-IL FinCERT MISP | PIR-001, -005, SIR-001 | Requires MOU renewal (lapsed 9 months) | TLP:AMBER | ₪0 | **MOU lapsed — critical gap** |
| DarkOwl dark web monitoring | PIR-002, SIR-002 | Available (active contract) | Unclassified | Existing contract | None |
| CyberShield Ltd. pentest reports | PIR-002 | Available (historical; quarterly engagement) | Confidential | Existing contract | Limited — pentests quarterly, not continuous |
| OSINT (ClearSky, Check Point Research, public threat reports) | PIR-001, -003, -005 | Available now | Unclassified | ₪0 | Incomplete — no structured analyst time allocated |
| Bank of Israel Supervisor publications | PIR-004 | Available now | Unclassified | ₪0 | None |
| Commercial threat intel platform (Recorded Future / similar) | PIR-001, -003, -005 | Requires procurement | TLP:AMBER | ₪180K/year estimated | **Not procured** |
| PayNext legacy SIEM/EDR logs (integration pending) | PIR-002 | Integration project underway (8 weeks) | Confidential | Integration labor cost | **Gap: 8-week window** |

### Critical Collection Gaps

| PIR | Gap | Impact | Resolution | Timeline |
|---|---|---|---|---|
| PIR-001 / SIR-001 | CERT-IL FinCERT MOU lapsed | No sector-specific Israeli payment threat feed; relying on public CERT-IL bulletins only | Renew MOU immediately — Legal action item | 2 weeks |
| PIR-001, -005 | No commercial threat intel platform | Cannot search for TechPay-specific infrastructure mentions; cannot track adversary TTP evolution systematically | Procure platform within Q1 | 6 weeks |
| PIR-002 | PayNext logs not integrated | Cannot see PayNext-specific threat indicators during 8-week gap | Manual log review from PayNext SIEM weekly until integration complete | 8 weeks |

### Procurement Recommendation

**Immediate (Q1, ₪180K budget):** Commercial threat intelligence platform with:
- Israeli financial sector threat actor tracking
- Infrastructure monitoring (domain, IP)
- API integration with Elastic SIEM for automated indicator ingestion
- Coverage for PIR-001 and PIR-005

**Medium-term (Q2, ₪60K budget):** Brand protection / domain monitoring service to support SIR-004 with automated lookalike domain alerts.

**Total additional procurement: ₪240K/year** — within the intelligence program budget allocation.

---

## Task 3 — Intelligence Production Process

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [TheHive + Cortex](https://thehive-project.org/) *(open-source)* · [Yeti](https://yeti-platform.io/) *(open-source)*
>
> OpenCTI: the backbone of the production process — from raw indicator ingestion through relationship analysis to finished report generation; maintains audit trail of every analytical step. MISP: processing layer for structured indicators — auto-deduplication, TLP enforcement, and PIR tagging on ingest. TheHive + Cortex: automated enrichment at the processing stage; Cortex analyzers run WHOIS, VirusTotal, and Shodan lookups without manual analyst effort. Yeti: unstructured OSINT storage — paste-site finds and blog monitoring outputs land here before being promoted to MISP/OpenCTI after analyst review.

```
COLLECTION (daily/continuous)
  ↓ SIEM telemetry + DarkOwl alerts + CERT-IL (once MOU renewed) + OSINT
PROCESSING (within 4h for critical; 24h for routine)
  ↓ Triage by CTI Lead (Avi Ben-David for 5 weeks; then successor)
  ↓ MISP ingestion; TLP tagging; PIR relevance tag; duplicate check
ANALYSIS
  ↓ Structured technique: ACH for competing hypotheses; Key Assumptions Check before attribution
  ↓ Confidence level assigned (Admiralty Scale for source + information)
  ↓ Probabilistic language applied (see standards below)
  ↓ Peer review: CISO reviews all A1/B1 confidence assessments
PRODUCTION
  ↓ Template-based (4 tiers; see below)
  ↓ Classification marked on every page
  ↓ Version controlled in CTI repository
DISSEMINATION
  ↓ SOC: SIEM watchlist auto-push + weekly Slack summary
  ↓ CISO: Monthly email + quarterly briefing doc
  ↓ Legal: Quarterly regulatory horizon memo
  ↓ CERT-IL FinCERT: TLP:AMBER quarterly peer product
FEEDBACK (quarterly PIR review)
  ↓ Stakeholder survey: "Did this intelligence change a decision?"
  ↓ PIR relevance review: any PIR unanswered for 2+ quarters → revise
```

### Product Templates

**Tactical SOC Flash (weekly, 1 page, Unclassified):**
```
TECHPAY CTI — WEEKLY SOC FLASH | Week [YYYY-WW]
─────────────────────────────────────────────────
PRIORITY MONITORING ITEM
  [1 specific thing to watch; detection query]
─────────────────────────────────────────────────
INDICATORS — ADD TO WATCHLIST
  [Type] | [Value] | [Conf] | [Context — 1 sentence]
  [Type] | [Value] | [Conf] | [Context]
─────────────────────────────────────────────────
HUNTING HYPOTHESIS
  [1 sentence hypothesis]
  KQL: [query]
  FP population: [low/medium; specific FP scenario]
─────────────────────────────────────────────────
CONTEXT: [2 sentences. Why this week?]
```

**Monthly Operational Report (8 pages, Confidential) — Table of Contents:**
1. Executive Summary (½ page)
2. Active Threat Campaigns Relevant to TechPay (ATT&CK-mapped; with indicators)
3. PayNext Integration Threat Update (PIR-002 status)
4. New or Changed Adversary TTPs (PIR-005)
5. Detection Engineering Recommendations (3–5 specific items with priority)
6. Intelligence Gaps and Collection Actions

**Quarterly Strategic Assessment (5 pages, Confidential) — Table of Contents:**
1. Executive Summary — suitable for Board presentation
2. Israeli Payment Sector Threat Landscape (PIR-001 answer)
3. TechPay-Specific Risk Assessment (implications for TechPay from landscape)
4. BoI-CD 362 Compliance Horizon (PIR-004 answer)
5. Program Health and PIR Review

---

## Task 4 — Avi Ben-David Departure Risk

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [GitLab](https://about.gitlab.com/) *(open-source)*
>
> OpenCTI: knowledge transfer is a platform export — all relationships, reports, and analytical products created by the departing analyst are retained in the platform; new analyst inherits the full intelligence graph without manual handoff. MISP: all indicators, source relationships, and CERT-IL sharing trust settings are stored in MISP — not in the analyst's personal knowledge; revoke analyst API keys and re-assign source contacts without data loss. GitLab: CTI runbooks and collection procedures should be in a versioned repository — if not, the departure risk assessment becomes the forcing function to create them.

**Intelligence risk from departing CTI analyst:**

Avi Ben-David holds:
- Full access to TechPay SIEM and CTI repository
- Knowledge of collection methods and source identities
- Classified CERT-IL FinCERT contact relationships
- Knowledge of ongoing investigations (PIR-002 PayNext assessment in progress)
- Knowledge of current intelligence gaps (collection methods; what TechPay cannot see)

**PIR-003 preliminary answer:**

> *"Avi Ben-David is assessed as presenting a medium intelligence exposure risk during the 5-week departure window. This is not an insider threat assessment — it is a collection protection concern. A competitor or threat actor that recruits Ben-David within 12 months of departure would gain knowledge of TechPay's current threat visibility gaps, collection sources, and ongoing assessments. Recommended mitigation: (1) Immediate access review and tiered access reduction beginning Week 3 of notice period; (2) Knowledge transfer sessions documented with classification markings; (3) NDA reminder and post-employment confidentiality obligations; (4) Expedite successor hire to reduce gap window."*

**Transition plan — staffing gap (5 weeks without senior CTI analyst):**

| Week | Capability | Risk |
|---|---|---|
| 1–3 | Full capacity (Ben-David + CISO) | Low |
| 4–5 | Ben-David on transition; reduced production | Medium — delay monthly report |
| 6–12 | CISO covers with external CERT-IL support; no succession yet | High — PIR-002 PayNext work paused |
| 13+ | New hire begins | Low |

Minimum viable program during gap: SIR-001/002 auto-ingestion continues; DarkOwl auto-alerts; CERT-IL FinCERT MOU renewed before departure; Ben-David documents PIR-002 PayNext findings fully before Week 4.

---

## Task 5 — CERT-IL FinCERT MOU Renewal

> **Tools:** [MISP](https://www.misp-project.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> MISP: the sharing mechanism for the MOU — configure a MISP sync connection with CERT-IL FinCERT's MISP instance; TLP and sharing group settings enforce the MOU boundary automatically; no manual distribution required. OpenCTI: link the CERT-IL FinCERT organization object to TechPay's sharing architecture in OpenCTI; track which reports and indicators were shared vs. received under the MOU for compliance audit purposes.

**Why this is urgent:** The FinCERT MOU lapsed 9 months ago. During this period, TechPay has missed sector-specific threat intelligence shared only to FinCERT members. The recent near-miss (€2.1B settlement incident) would have been flagged by FinCERT to members 3 months before it materialized — TechPay was not a member at that time.

**MOU Framework:**

*What TechPay shares with CERT-IL FinCERT:*
- Anonymized indicators observed in TechPay infrastructure (malicious IPs, domains, hashes) — TLP:AMBER
- Payment fraud patterns relevant to sector (anonymized transaction anomalies) — TLP:AMBER
- Post-incident reports (anonymized, 30 days after incident closure) — TLP:AMBER

*What TechPay receives from CERT-IL FinCERT:*
- Sector-specific threat bulletins (Israeli payment sector focus) — TLP:AMBER
- MISP feed access (payment sector tags) — TLP:AMBER automated
- Emergency out-of-hours notification for active campaigns against payment processors — TLP:RED via designated contact

*Prohibited uses:* TLP:AMBER material may not be cited in public communications; may not be shared with non-FinCERT member organizations without explicit CERT-IL approval.

---

## Task 6 — Sample Quarterly Intelligence Product

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)* · [Obsidian](https://obsidian.md/) *(free, local)*
>
> OpenCTI: generate the quarterly threat assessment directly from the platform's intelligence graph — Section 1 (threat landscape) pulls from threat actor profiles; Section 2 (technical analysis) pulls from technique and indicator objects; no manual duplication. MISP: export a TLP:AMBER-marked MISP event as a structured annex to the quarterly report for technical readers — the same data, machine-readable format alongside the prose report. LibreOffice Writer: format the final quarterly assessment as a classified PDF for CISO + DG distribution — maintain local copies; do not upload to cloud storage if content is TLP:AMBER or above. Obsidian: draft the report from linked analytical notes; use templates to enforce the Section 1/2/3/SOC Flash structure across quarterly cycles.

**TechPay Israel CTI — Q4 2024 Threat Landscape Assessment**
*Classification: CONFIDENTIAL | TLP:AMBER | For CISO + DG Distribution*
*Issued: January 2025 | PIR-001, PIR-002 response*

**Executive Summary**

TechPay Israel faces an elevated threat environment in Q4 2024 entering Q1 2025. The primary threat is financially motivated adversary activity targeting Israeli payment processors via supply chain access and credential theft, with secondary espionage interest from Iranian-nexus actors in the PayNext customer data set (140,000 Israeli merchants, ₪2.1B transaction volume). Three operational conclusions for the CISO:

1. The PayNext integration introduces two immediately exploitable attack paths that require remediation before integration is complete (see Section 3).
2. CERT-IL FinCERT membership must be restored in Q1 2025 — TechPay has operated without sector-specific threat intelligence for 9 months, a period during which FinCERT shared 7 TLP:AMBER advisories relevant to payment processors.
3. Current detection coverage for AiTM credential theft — the primary assessed access vector — is zero. This must be addressed in Q1 2025 detection engineering sprint.

**Section 1: Israeli Payment Sector Threat Landscape (PIR-001)**

*Assessed active threats to Israeli payment processors (Q4 2024):*

> Financially motivated actors targeting card processing infrastructure remain the persistent baseline threat to Israeli payment processors. Observed techniques focus on credential theft from processing personnel, SWIFT/payment API manipulation, and insider-enabled fraud schemes. Iranian-nexus state-affiliated actors have demonstrated secondary interest in Israeli payment infrastructure with an espionage objective — specifically, high-value merchant transaction patterns and Israeli SME financial data. Confidence: B2.

*New or changed TTPs in Q4 2024 (PIR-005):*

> ClearSky Cyber Security (November 2024) documented Iranian-nexus use of AiTM phishing kits targeting Israeli fintech companies. The phishing kits now include TOTP session token capture capability, bypassing SMS and authenticator-app MFA. This is assessed as a direct evolution of techniques previously documented against pharma and telecom (see LifeTech Pharma incident, Nov 2024). TechPay's VPN authentication infrastructure is potentially vulnerable if the same kit is used; detection engineering recommendation: deploy impossible-travel / non-corporate ASN VPN rule as P1.

**Section 2: PayNext Acquisition Threat Inheritance (PIR-002)**

*Top 3 inherited threat exposures:*

1. **PayNext developer credential exposure** — DarkOwl monitoring identified 14 PayNext-email credentials in dark web forums over the past 6 months, prior to acquisition announcement. Current status: credentials were issued to former PayNext developers; access was revoked at acquisition close. Residual risk: credentials may have been used to access PayNext staging environment before acquisition — investigation recommended.

2. **PayNext third-party payment processor API integrations** — PayNext had 12 third-party API integrations with Israeli payment processors, some using legacy non-MFA API keys. Three of these integrations remain active in the TechPay environment as of this assessment. Each represents a potential API credential abuse vector.

3. **PayNext merchant onboarding portal (140,000 merchants)** — The portal runs on a legacy codebase with an unpatched authentication bypass CVE (score 8.1) discovered in September 2024. Remediation is scheduled for Sprint 14 (Q1 2025). Exploitable from the internet.

**Section 3: Detection Recommendations for CISO**

| Priority | Recommendation | PIR Reference | Owner | Target Date |
|---|---|---|---|---|
| P1 | Deploy AiTM / impossible-travel VPN rule | PIR-001 / PIR-005 | Detection Engineering | End of January |
| P1 | Patch PayNext merchant portal CVE | PIR-002 | IT (PayNext integration team) | Sprint 14 |
| P1 | Renew CERT-IL FinCERT MOU | Collection gap | Legal + CISO | End of January |
| P2 | Revoke / audit 3 legacy PayNext API integrations | PIR-002 | IT + Finance | End of February |
| P2 | Investigate 14 pre-acquisition dark web credential exposures | PIR-002 | CTI + IT Security | End of February |

---

**WEEKLY SOC FLASH — Week 2025-04**
*Classification: UNCLASSIFIED | For SOC Distribution*

```
TECHPAY CTI — WEEKLY SOC FLASH | 2025-W04
──────────────────────────────────────────
PRIORITY: AiTM PHISHING CAMPAIGN TARGETING ISRAELI FINTECH
ClearSky documented an active phishing kit targeting Israeli fintech
employees with MFA bypass. Watch for VPN logons from Turkish or Romanian
exit nodes outside business hours from any TechPay or PayNext employee.

INDICATORS — ADD TO WATCHLIST
  IP   | 185.220.100.77 | Medium | Exit node used in 2 confirmed Israeli fintech AiTM attacks
  IP   | 91.108.4.44    | Low    | Possible AiTM proxy; seen in ClearSky report
  Domain | techpay-account-verify[.]com | High | Lookalike registered 2025-01-18; likely phishing
  Domain | techpay-il-secure[.]net | Medium | Registered 2025-01-12; no confirmed malicious use yet

HUNTING HYPOTHESIS
  "TechPay VPN session established from non-corporate ASN in past 30 days"
  KQL (index: filebeat-paloalto-*):
    event.action: "globalprotect-auth"
    AND user.name: * AND NOT source.as.number: (12345 OR 67890)
  Expected FP: Medium — work-from-home employees; suppress by correlating
  with shift schedule. Kill condition: <3 unique non-corporate ASN sessions
  per week with no credential anomaly.

CONTEXT: ClearSky Nov 2024 report documented AiTM attacks against 4
Israeli fintech companies. PayNext was one of the sectors mentioned. We
have a pre-acquisition credential exposure on DarkOwl for 14 addresses.
Priority is detecting if any of those credentials are being used actively.
```
