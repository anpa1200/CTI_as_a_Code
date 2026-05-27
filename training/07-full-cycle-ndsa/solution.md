# Solution: Assignment 7 — Full CTI Cycle (Gov): NDSA CTI Program

> **Model answer. All data is fictional.**

---

## Task 1 — PIR Framework

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)*
>
> OpenCTI: store PIRs as structured "Case" objects with the requesting stakeholder as the author — traceability from PIR derivation through collection, analysis, and product delivery to the original stakeholder need. MISP: tag incoming INCD bulletins, CERT-IL alerts, and OSINT events with PIR reference tags on import — analysts can filter the entire event collection by PIR instantly. ATT&CK Navigator: map each PIR to the ATT&CK techniques it covers to identify collection gaps — PIR-003 (GovID pre-launch) maps to 15+ techniques; ATT&CK Navigator shows which have no collection source.

### Stakeholder Analysis

| Stakeholder | Key Need | PIR Derived |
|---|---|---|
| DG Dr. Shamir | Defensible threat picture for Knesset; proof program works | PIR-001 (sector landscape); PIR-005 (NDSA-specific) |
| CISO Col. Nativ | Early warning; TTP-to-detection bridge; classification-to-SOC problem | PIR-002 (adversary capability); PIR-004 (detection relevance) |
| SOC (Ben-Moshe) | Weekly indicators + hunting hypotheses; not essays | SIR-001, SIR-002 |
| Legal (Goldstein) | Regulatory changes before they create exposure | PIR-003 |
| INCD Liaison (Friedman) | NDSA feeds intelligence back to INCD; GovID telemetry is unique | PIR-005 (feeds INCD-to-NDSA and back) |
| MoI (downstream) | Unclassified signals about GovID threats they can act on | SIR-003 (sanitized product) |

### PIR Table

| # | Title | Intelligence Question | Decision | Owner | Cadence | Classification | Success Criterion |
|---|---|---|---|---|---|---|---|
| PIR-001 | Israeli Government Digital Infrastructure Threat Landscape | *"Which threat actors are actively targeting Israeli civilian government digital platforms and what are their current access vectors and primary objectives?"* | Detection engineering priority; INCD reporting | CISO | Quarterly | Confidential | Names ≥1 active campaign; maps TTPs to NDSA attack surface; Admiralty B2 minimum |
| PIR-002 | Iranian-Nexus Adversary Capability Evolution | *"Has the primary Iranian-nexus threat cluster targeting Israeli government biometric and identity infrastructure changed its tooling, persistence mechanisms, or evasion techniques in the past 90 days?"* | Detection rule update cadence; hunting hypothesis refresh | CISO / Detection Eng | Quarterly | Confidential – Secret | Answer maps any new techniques to GovID 2.0 and VRID detection inventory |
| PIR-003 | Regulatory and Compliance Horizon | *"What changes to INCD-CID, Israeli PPL, Biometric Database Law, or MATZBEN are anticipated in the next 6 months that would affect NDSA's incident notification obligations or detection requirements?"* | Legal preparation; compliance roadmap | Legal | Quarterly | Unclassified | Answer identifies ≥1 anticipated change with NDSA-specific impact and implementation timeline |
| PIR-004 | Contractor and Supply Chain Threat | *"Are any contractors or vendors with privileged access to NDSA systems (specifically HavayaIT and BiometricTech IL Ltd.) known to be compromised, targeted, or exhibiting anomalous access patterns?"* | Contractor access suspension / enhanced monitoring decisions | CISO | Monthly; triggered on vendor security signal | Confidential | Answer provides specific vendor risk rating with recommendation |
| PIR-005 | GovID 2.0 Platform-Specific Threat | *"What adversary capabilities, infrastructure, and tradecraft are specifically targeting the GovID 2.0 authentication platform, and what are the primary indicators that would signal an imminent attack?"* | GovID 2.0 operations; INCD feed; precursor detection | CISO + INCD | Quarterly; triggered on any new GovID threat signal | Confidential – Secret | Answer maps threat to GovID 2.0 architecture; produces ≥3 indicators for SOC watchlist |

### SIRs

| # | SIR | Source | Frequency | Output | Consumer |
|---|---|---|---|---|---|
| SIR-001 | Monitor CERT-IL MISP for new indicators matching: Israeli government, biometric, identity, GovID sector tags | CERT-IL MISP (formal MOU) | Daily auto-ingest; analyst triage within 4h | SIEM watchlist update + MISP event tags | SOC |
| SIR-002 | Monitor INCD advisories (via Friedman) for signals relevant to NDSA Crown Jewels | INCD (classified route) | On publication / Friedman notification | Triage note; PIR relevance tag; downgrade process if applicable | CTI Lead → CISO → SOC (after downgrade) |
| SIR-003 | Monitor GovID 2.0 API access logs for anomalies matching known adversary patterns (volume, source IP, token abuse) | NDSA SIEM (internal) | Continuous / daily summary | Alert to SOC + anomaly report to CTI Lead weekly | SOC; MoI (sanitized weekly summary) |
| SIR-004 | Monitor lookalike domain registrations targeting GovID / NDSA / biometric brands | Passive DNS / brand monitoring tool | Daily | Alert if new lookalike registered; recommend block within 4h | SOC; Legal (brand) |

---

## Task 2 — Collection Plan

> **Tools:** [MISP](https://www.misp-project.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [Yeti](https://yeti-platform.io/) *(open-source)* · [SpiderFoot](https://www.spiderfoot.net/) *(open-source)* · [Shodan](https://www.shodan.io/) *(freemium)*
>
> MISP: configure TAXII 2.1 sync with INCD's MISP instance and CERT-IL's TAXII feed — most structured collection is automated; the NDSA analyst's job is gap analysis and quality review, not manual ingestion. OpenCTI: manage all collection sources as "data source" objects with PIR linkages; track feed health, last-ingest timestamps, and collection plan gap status. Yeti: OSINT-focused collection for unstructured sources — Telegram monitoring, paste sites, blog tracking; tag by PIR relevance and confidence before promoting to MISP. SpiderFoot: automated OSINT collection against HavayaIT and BiometricTech infrastructure; flags new exposed services or credentials automatically. Shodan: active collection against contractor-exposed infrastructure for PIR-004 (BiometricTech risk).

### Collection Source Matrix

| Source | PIRs | Availability | Classification | Cost | Gap? |
|---|---|---|---|---|---|
| NDSA SIEM (Elastic) — internal telemetry | PIR-002, -004, -005, SIR-003 | Available now | Unclassified | ₪0 | Partial — MoI, BiometricTech API logs not integrated |
| CERT-IL MISP (TLP:AMBER feed) | PIR-001, -002, SIR-001 | Available with MOU (to be signed) | TLP:AMBER | ₪0 | MOU not signed — **Priority 1** |
| INCD classified advisories (via Friedman) | PIR-002, -004, -005, SIR-002 | Available via Friedman | TLP:RED / Secret | ₪0 | Classification restriction; downgrade process needed |
| ClearSky Cyber Security reports (public) | PIR-001, -002 | Available now | Unclassified | ₪0 | Limited depth; no advance access |
| Check Point Research (public) | PIR-001 | Available now | Unclassified | ₪0 | None |
| Commercial threat intel platform | PIR-001, -002, -005 | Requires procurement | TLP:AMBER | ₪180K/year | Not procured |
| Passive DNS / domain monitoring | SIR-004, PIR-004 | Requires procurement | Unclassified | ₪40K/year | Not procured |
| ITA peer sharing (proposed MOU) | PIR-004 (HavayaIT cross-agency) | Requires MOU | TLP:AMBER | ₪0 | MOU not signed |
| BiometricTech IL vendor security reports | PIR-004, -005 | Requires contractual requirement | Vendor Confidential | ₪0 (contractual) | Not contractually required yet |

### Collection Gaps and Resolutions

| PIR | Gap | Resolution | Timeline |
|---|---|---|---|
| PIR-001, -002 | No commercial threat intel platform; OSINT-only | Procure platform (₪180K/year) | Q2 2026 |
| PIR-004 | No ITA peer sharing | Sign ITA MOU | 6 weeks |
| PIR-005 | Classified INCD advisories cannot reach SOC | Build classification downgrade process (CTI Lead → CISO review → sanitized SOC product) | 4 weeks (process design) |
| All | CERT-IL MISP MOU not signed | Priority legal action: sign CERT-IL MOU | 2 weeks |
| SIR-004 | No domain monitoring tool | Procure (₪40K/year) | Q2 2026 |

### Procurement Recommendation (₪3.5M available for tools/services)

| Tool Category | Justification | Estimated Cost | Priority |
|---|---|---|---|
| Commercial threat intel platform | PIR-001, -002, -005 coverage; advance actor tracking | ₪180K/year | P1 |
| Passive DNS / domain monitoring | SIR-004; GovID brand protection | ₪40K/year | P2 |
| MISP community infrastructure (operational) | Ingestion automation; MoI sharing capability | ₪30K/year (operational costs) | P1 |
| **Total Year 1** | | **₪250K** | Within budget |

---

## Task 3 — Production Process

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [TheHive + Cortex](https://thehive-project.org/) *(open-source)* · [Yeti](https://yeti-platform.io/) *(open-source)*
>
> OpenCTI: production process backbone — raw intelligence enters as reports, gets analyzed as relationships between actors/techniques/indicators, and exits as finished intelligence products; maintains an auditable trail of every analytical decision. MISP: processing layer for all structured indicator data — auto-deduplication, TLP enforcement, PIR tagging, and CERT-IL/INCD sharing group enforcement. TheHive + Cortex: automated enrichment of incoming indicators at the processing stage; Cortex analyzers run WHOIS, passive DNS, and VirusTotal without analyst manual effort. Yeti: unstructured OSINT collection (Telegram, paste sites, Israeli dark web forums) lands here before analyst review and promotion to MISP/OpenCTI.

### Production Cycle

```
COLLECTION (daily/continuous)
  SIR-001: CERT-IL MISP auto-ingest → Elastic SIEM watchlist auto-push
  SIR-002: INCD advisories → Friedman → CTI Lead triage
  SIR-003: Internal SIEM telemetry → daily anomaly summary
  SIR-004: Domain monitoring alerts → SOC same-day action

PROCESSING (critical: 4h; routine: 24h)
  CTI Lead triages all incoming
  MISP ingestion: TLP tag + PIR relevance tag + classification marking
  Duplicate check against existing MISP events

ANALYSIS
  Structured technique: Key Assumptions Check before attribution
  Confidence level: Admiralty Scale (source A–F; information 1–6)
  Probabilistic language: see standards below
  Peer review: all B2+ confidence → CISO review before dissemination

PRODUCTION (template-based; classification on every page)
  Strategic: Quarterly → DG + CISO (Secret/Confidential)
  Operational: Monthly → CISO + Detection Eng (Confidential)
  Tactical Flash: Weekly → SOC (Unclassified)
  Peer product: Quarterly → CERT-IL + ITA (TLP:AMBER)

DISSEMINATION
  SOC: Slack message + MISP auto-push (same-day)
  CISO: Email + quarterly briefing
  DG: Quarterly briefing doc (3–4 pages, plain language)
  INCD: Formal quarterly submission + ad-hoc PIR-005 feed
  MoI: Sanitized weekly summary (Unclassified)

FEEDBACK (quarterly)
  Stakeholder survey: "Did this change a decision this quarter?"
  PIR review: any PIR unanswered for 2 quarters → revise
```

### Analytical Standards

**Confidence language:**
| Phrase | Probability | When |
|---|---|---|
| "Almost certainly" | >85% | Multi-source; confirmed TTP overlap |
| "Likely" | 55–85% | Good evidence with some gaps |
| "Possibly" / "We assess" | 25–55% | Limited evidence; hypothesis |
| "Unlikely" | <25% | Evidence points away |

**Attribution rule for NDSA:**
> Before naming a threat cluster, require: (1) ATT&CK technique overlap with documented cluster; (2) infrastructure overlap with documented cluster; OR (3) INCD or CERT-IL confirmation at B2 minimum.
> Default formulation: *"assessed as [motivation]-driven activity consistent with [cluster type]; insufficient evidence for definitive attribution to [named group]."*

**Classification downgrade process for INCD advisories:**

1. CISO + CTI Lead review original TLP:RED advisory
2. CTI Lead produces sanitized version: removes source-identifying language, specific indicators from classified tiers, and any operational details that reveal collection methods
3. Sanitized version labeled: `UNCLASSIFIED // TLP:AMBER // NDSA-DERIVED`
4. Sanitized version reviewed by Legal (PPL / classification compliance)
5. Distributed to SOC and operational consumers
6. Original retained in classified repository; sanitized copy in unclassified repository

---

## Task 4 — Sharing Architecture

> **Tools:** [MISP](https://www.misp-project.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [Yeti](https://yeti-platform.io/) *(open-source)*
>
> MISP: the primary sharing mechanism for all MOU relationships — configure TAXII 2.1 sync connections with CERT-IL, INCD, and ITA MISP instances; TLP and sharing group settings enforce MOU boundaries automatically. OpenCTI: manage sharing architecture at the organizational level — partner organizations appear as entities with documented sharing relationships; STIX 2.1 export for cross-platform compatibility with partners who use non-MISP platforms. Yeti: manage indicator sharing with the MoI and other consumers who need structured feeds without full MISP access — Yeti's REST API enables lightweight integration with consumers' existing tools.

### CERT-IL Sharing MOU Framework

*What NDSA shares with CERT-IL:*
- GovID 2.0 authentication abuse indicators (volume anomalies, token misuse patterns) — anonymized; TLP:AMBER
- Post-incident assessments (30 days post-closure) — anonymized; TLP:AMBER
- Lookalike domain indicators targeting GovID brand — TLP:AMBER; immediately on discovery

*What CERT-IL shares with NDSA:*
- MISP TLP:AMBER feed: government sector, biometric, identity tags
- Emergency notifications for active campaigns against Israeli government platforms
- Quarterly FinCERT-equivalent government sector threat bulletin

*Emergency protocol:* Friedman's direct line serves as emergency escalation for TLP:RED material outside business hours; CERT-IL designated 24/7 contact provided.

*Review period:* 12-month review; either party can modify scope with 60-day notice.

### ITA MOU Framework

*Scope rationale:* ITA and NDSA share the same contractor (HavayaIT), creating a unique shared threat exposure. Intelligence about HavayaIT access anomalies is relevant to both agencies.

*What NDSA shares with ITA:*
- HavayaIT access anomaly indicators (without revealing NDSA-specific system details) — TLP:AMBER
- General adversary TTPs relevant to government digital infrastructure — TLP:AMBER

*What ITA shares with NDSA:*
- Same category for ITA systems
- Any indicators related to HavayaIT activity on ITA infrastructure

*INCD coordination requirement:* Any intelligence about HavayaIT that originates from INCD sources requires INCD approval before sharing with ITA. Friedman is the coordination point.

*Conflict of interest management:* Information about HavayaIT's security failures that has legal implications (contract breach, negligence) must be reviewed by Legal before inclusion in any shared product. Legal determination of what can be shared without creating privileged disclosure issues.

### MoI Sanitization Process

*What can be safely included in unclassified MoI product:*
- Behavioral descriptions of attack techniques ("attacker probes GovID API using unusual query volumes")
- Generic indicators without attribution ("monitor for high-volume API requests from single IP to /verify endpoints")
- Recommended detection actions in plain language

*What must be omitted:*
- Source identification (INCD advisory, classified tier)
- Specific infrastructure indicators that reveal NDSA collection methods
- Confirmation that specific threat actors are actively targeting GovID 2.0 (this would create alarm without MoI being able to act on it; better handled via direct CISO-to-MoI CISO communication)

### NDSA-to-INCD Intelligence Feed

*What NDSA can uniquely provide to INCD:*
- **GovID 2.0 authentication abuse patterns**: 3.1M auth events/day provides unique visibility into authentication stuffing, token misuse, and API anomalies across all Israeli government digital services
- **Biometric API access anomalies**: VRID query patterns that may indicate pre-attack reconnaissance
- **HavayaIT contractor cross-agency access patterns**: NDSA sees HavayaIT access to NDSA; ITA sees HavayaIT access to ITA; INCD can correlate across both if both agencies feed INCD

*Privacy / PPL compliance:* Authentication log sharing with INCD must be covered by a specific legal basis under PPL. Recommended: INCD-CID Section 11 (national security data sharing authority) — Legal to confirm. Authentication metadata (source IP, timestamp, authentication result) does not constitute "personal data" under PPL if it cannot be linked to a specific citizen without a separate cross-reference. Biometric hash data sharing requires Biometric Database Authority approval.

---

## Task 5 — Program Governance and Metrics

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [GitLab](https://about.gitlab.com/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> VECTR: track detection program metrics (detections deployed, validated, coverage percentage) in a dedicated project — provides the "# detections deployed based on CTI recommendation" metric without manual counting. GitLab: version-control the program charter, PIR framework, and collection plan; track PIR reviews and governance changes as merge requests — provides an immutable audit trail for INCD compliance reviews. OpenCTI: export quarterly metrics from the platform's built-in dashboards — number of reports published, indicators shared, stakeholder queries answered — directly from the data rather than manually assembled.

### Program Charter Summary

| Element | Content |
|---|---|
| **Mission** | Provide actionable intelligence to NDSA decision-makers to protect national digital identity infrastructure and GovID 2.0 from adversary threats. |
| **In-scope** | Threat intelligence for NDSA Crown Jewels (VRID, GovID 2.0, MIB); contractor security intelligence; regulatory intelligence; intelligence sharing with approved partners |
| **Out-of-scope** | Offensive operations of any kind; SOC alert triage (separate function); IT vulnerability management; physical security |
| **Authorities** | CTI Lead: publish products at Confidential and below; add indicators to SIEM watchlist; engage CERT-IL on routine sharing. CISO: publish Secret products; authorize intelligence sharing; contractor security decisions. DG: authorize international disclosures; INCD formal submissions |
| **Budget** | ₪8.5M/year: ₪3.2M staff; ₪1.8M infrastructure; ₪3.5M tools/services |
| **Review** | Annual program review (INCD compliance); quarterly PIR review |

### Metrics Framework (8 metrics)

| Metric | Type | Measurement | Target | Why |
|---|---|---|---|---|
| # quarterly products published on time | Output | Count per quarter | 100% | Stakeholder trust |
| # PIRs with actionable answer per quarter | Output | Count vs. total PIRs | ≥4/5 PIRs | Production completeness |
| Mean time from threat bulletin to SIEM indicator deployed | **Outcome** | Days | <2 days | Operational agility |
| # detections deployed based on CTI recommendation | **Outcome** | Count per quarter | ≥5/quarter | CTI → action conversion |
| # threat campaigns identified before CERT-IL public bulletin | **Outcome** | Count | ≥1/quarter | Proactive value |
| % stakeholder responses citing CTI in a decision | **Outcome** | Quarterly survey | ≥60% | Program value; anti-theater |
| # intelligence gaps closed (new collection source added or PIR answered after gap) | **Outcome** | Count per quarter | ≥2/quarter | Collection improvement |
| INCD compliance items: % on schedule | Process | Count | 100% | Regulatory obligation |

**Anti-theater test:** Each quarter, ask: "If the CTI program had produced nothing this quarter, would any operational decision have changed?" If the answer is "probably not," the program is producing output without impact. Address by reviewing PIR relevance and stakeholder engagement.

---

## Task 6 — Sample Products

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)* · [Obsidian](https://obsidian.md/) *(free, local)*
>
> OpenCTI: generate the quarterly threat assessment and SOC flash directly from the intelligence graph — Section 1 (threat landscape) pulls from threat actor profiles; Section 2 (technical analysis) pulls from technique and indicator objects; no manual transcription. MISP: auto-generate the SOC flash indicator watchlist from the MISP event export — push to the SIEM watchlist via the MISP-Elastic integration. LibreOffice Writer: format the classified quarterly assessment as a signed PDF for CISO distribution — maintain local copies; do not use cloud editors for TLP:AMBER content. Obsidian: draft all products from the same linked note structure; use templates to enforce consistent section structure across quarterly cycles without duplication.

### Q1 2026 Threat Landscape Assessment (excerpt)

**NDSA CTI — Q1 2026 Threat Landscape Assessment**
*Classification: CONFIDENTIAL | TLP:AMBER | CISO Distribution*
*PIR-001, PIR-002 response | Issued: January 2026*

**Executive Summary**

NDSA's threat environment in Q1 2026 is characterized by continued Iranian-nexus interest in the GovID 2.0 platform following its successful launch in October 2025. Post-launch, the adversary shifted from API surface reconnaissance (documented in Q2 2025) to authenticated credential abuse attempts targeting GovID session management. Three conclusions for the CISO:

1. **Detection gap identified:** The SvcHostMonitor persistence technique from the March 2025 incident has been observed in a peer Israeli government agency compromise reported to CERT-IL in December 2025, suggesting the same tool cluster is still active and our detections must cover all target hosts, not just VRID-SRV-01.
2. **HavayaIT risk elevated:** CERT-IL TLP:AMBER advisory (December 2025) identifies HavayaIT Systems Ltd. as a confirmed target of Iranian-nexus spearphishing. This is a direct PIR-004 trigger requiring immediate contractor access review.
3. **Regulatory horizon:** PPL amendment pending (Q2 2026) will reduce individual notification timeline from "reasonable timeframe" to 30 days; Legal must begin process design now.

**Iranian-Nexus Activity Update (PIR-002):**

> The adversary cluster assessed as responsible for the March 2025 NDSA incident and the Operation Desert Cipher campaign (Assignment 4 reference) has not changed its core toolset in Q4 2025. BITS-based persistence, LSASS credential dumping via comsvcs.dll, and wevtutil log clearing remain the primary post-access techniques. One new capability noted: use of scheduled tasks (T1053.005) as a secondary persistence mechanism alongside service installation — observed in the peer government incident (December 2025). NDSA does not currently have a scheduled task creation rule on VRID-SRV-01 or GovID 2.0 nodes. **Recommendation P1: deploy scheduled task anomaly rule this sprint.** Confidence: B2.

---

### Weekly SOC Flash — 2026-W04

```
NDSA CTI — WEEKLY SOC FLASH | 2026-W04
Classification: UNCLASSIFIED | For SOC Distribution
CTI Lead: Shai Rotenberg

═══════════════════════════════════════════
PRIORITY MONITORING ITEM
═══════════════════════════════════════════
CERT-IL TLP:AMBER (Dec 2025) confirms HavayaIT is an active Iranian-nexus
spearphishing target. Watch ALL HavayaIT contractor VPN sessions this week
for off-hours logons from non-HavayaIT ASNs. GOV-DET-001 is your primary
alert. Do not dismiss as FP without checking source ASN.

═══════════════════════════════════════════
INDICATORS — ADD TO WATCHLIST
═══════════════════════════════════════════
Domain | havayait-secure-portal[.]net | High | Registered 2026-01-14; lookalike
Domain | ndsa-contractor-update[.]com  | High | Registered 2026-01-09; lookalike
IP     | 185.220.101.47               | High  | Active since Assignment 6; re-check
IP     | 5.188.86.172                 | Medium| New; seen in Dec 2025 CERT-IL MISP

═══════════════════════════════════════════
HUNTING HYPOTHESIS
═══════════════════════════════════════════
"HavayaIT contractor VPN sessions initiated from non-HavayaIT ASN in
the past 14 days — possible pre-attack credential test"

KQL (filebeat-paloalto-*):
  event.action: "globalprotect-auth"
  AND user.name: (a.halevi OR y.stern OR [full HavayaIT account list])
  AND NOT source.as.number: [HavayaIT_corporate_ASN]
  AND @timestamp: [now-14d TO now]

Expected FP: Low — HavayaIT staff rarely work from non-corporate IPs;
check with HavayaIT account manager if any hits found.
Kill condition: Zero non-corporate ASN sessions in 14-day lookback.

═══════════════════════════════════════════
CONTEXT
═══════════════════════════════════════════
CERT-IL confirmed HavayaIT is targeted. This is the same contractor access
path used in the March 2025 NDSA breach. We are watching for a repeat.
New lookalike domains registered this week suggest active phishing preparation.
```

---

### INCD Remediation Compliance Plan

| Req | Requirement | NDSA Approach | Target Date | Evidence | Owner | Status |
|---|---|---|---|---|---|---|
| REM-001 | Formal PIR framework with stakeholder sign-off | PIR framework documented; stakeholder review meeting scheduled | Feb 2026 | Signed PIR document | CTI Lead | In Progress |
| REM-002 | Collection plan | Collection plan drafted (this document) | Feb 2026 | Collection plan v1.0 | CTI Lead | In Progress |
| REM-003 | Quarterly intelligence product | Q1 2026 product issued (see above) | March 2026 | Product + distribution records | CTI Lead | On Track |
| REM-004 | Formal CERT-IL sharing MOU | MOU draft complete; Legal review underway | Feb 2026 | Signed MOU | Legal + CISO | In Progress |
| REM-005 | Peer agency MOU (ITA) | ITA MOU framework drafted; pending ITA CISO approval | March 2026 | Signed MOU | Legal + CISO | In Progress |
| REM-006 | MISP with ≥2 INCD-approved feeds | MISP deployed; CERT-IL feed pending MOU; INCD feed via Friedman active | March 2026 | MISP screenshot + feed list | CTI Lead + IT | In Progress |
| REM-007 | CTI analyst ≥3 years experience on staff | Maya Dvir (8 years; starts Week 6); Itai Ben-Levi (junior; starts Week 10) | Week 6 | HR record | HR | On Track |
| REM-008 | Annual review process | Annual program review procedure drafted | April 2026 | Review procedure document | CTI Lead | Pending |

**Overall compliance status: ON TRACK for 1 July 2026 deadline.**

---

### Year 1 Budget Justification (Finance Ministry excerpt)

**Why NDSA needs a Cyber Threat Intelligence program — in plain terms**

In March 2025, NDSA suffered a data breach affecting 340,000 Israeli citizens. A government contractor's email was compromised, and an attacker used those credentials to steal citizen identity and biometric records. This attack was not random. It was specifically planned, targeted at NDSA, and designed to steal exactly the data that was stolen. INCD warned us — in classified form — that this type of attack was coming, 8 days before it happened. We did not have a system in place to translate that warning into action.

A Cyber Threat Intelligence program is the system that translates warnings into actions. It is the difference between "we heard there might be an attack" and "we deployed a detection rule that would have caught this specific attack 12 hours before the data was taken."

**What the ₪8.5M/year buys:**
- Two analysts who do nothing but monitor for threats to NDSA — specifically
- Tools that automatically scan for hacker groups talking about attacking government systems
- A formal information-sharing agreement with CERT-IL so we receive the same warnings that other Israeli government agencies receive
- The ability to answer the question "are we under attack right now?" without waiting for a breach notification

**The alternative cost:** The March 2025 breach cost NDSA an estimated ₪14M in direct response costs (forensics, legal, notifications, Knesset preparation, operational disruption). It generated national news coverage for 3 days. It resulted in an INCD remediation directive that now mandates this program. The program costs ₪8.5M/year. One prevented breach pays for 1.6 years of the program.
