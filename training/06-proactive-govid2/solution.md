# Solution: Assignment 6 — Proactive CTI (Gov): GovID 2.0 Pre-Launch

> **Model answer. All data is fictional.**

---

## Task 1 — Intelligence Synthesis

> **Tools:** [MISP](https://www.misp-project.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [TheHive + Cortex](https://thehive-project.org/) *(open-source)* · [Yeti](https://yeti-platform.io/) *(open-source)*
>
> MISP: ingest each of the 4 triggers as a MISP event; Admiralty Scale taxonomy tags applied on import; automatic correlation flags that `185.220.101.47` (BiometricTech probing IP) appeared in Trigger 1's infrastructure indicator set. OpenCTI: link triggers to GovID 2.0 as the target system and to the assessed Iranian-nexus threat actor cluster from Assignment 5 — the intelligence graph reveals that the same adversary may be preparing a second operation. TheHive + Cortex: create a triage task per trigger; Cortex analyzers enrich the `185.220.101.47` indicator and the `y.stern` leaked credential automatically. Yeti: store the GitHub credential leak context and cross-reference with HavayaIT's other exposed repositories.

### Trigger Assessment

| # | Source | Date | TLP | Admiralty S | Admiralty I | Key Claim | Actionable? |
|---|---|---|---|---|---|---|---|
| 1 | INCD TLP:AMBER advisory (via Friedman) | 02 June 2025 | AMBER | A | 2 | UAE government biometric platform breached via BiometricTech-type vendor API; adversary: Iranian-nexus | **Yes — high priority; but classification restricts sharing to Nativ and Rotenberg only** |
| 2 | CERT-IL Bulletin CB-2025-041 | 08 June 2025 | AMBER | B | 2 | Iranian-nexus targeting Israeli government biometric systems; developer credential harvesting; lookalike domains | Yes — shareable within NDSA |
| 3 | GitHub credential leak (HavayaIT dev y.stern) | 14 June 2025 | Internal | A | 1 | NDSA API key, GovID 2.0 staging JWT, VPN credential exposed publicly for 11 days | **Yes — confirmed; immediate action required** |
| 4 | BiometricTech IL Ltd. API probing notification | 17 June 2025 (received) | Vendor Confidential | B | 2 | 185.220.101.47 probing `/verify/bulk` API endpoint 2,400 times/day with valid-format token | Yes — correlates directly with Triggers 1, 2 |

**Synthesized Threat Picture**

An Iranian-nexus adversary is actively targeting NDSA's GovID 2.0 platform in the pre-launch window. The evidence shows a coordinated, multi-vector approach:
- **Vendor infrastructure probing** (Trigger 4): active API surface reconnaissance using what may be a stolen BiometricTech vendor token — consistent with the UAE incident (Trigger 1)
- **Developer credential harvesting** (Triggers 2, 3): lookalike domains and active developer targeting; one NDSA credential exposure confirmed (Stern/GitHub)
- **Intelligence preparation** (Trigger 1 classified): the UAE pattern indicates the adversary progresses from vendor compromise to bulk extraction within 96 hours of gaining API access

**Current phase:** Pre-exploitation; adversary is in active reconnaissance of the GovID 2.0 API surface and may have partial credential access (Stern exposure window; BiometricTech token status unknown).

**Highest-confidence conclusion:** *"IP 185.220.101.47 — confirmed in CERT-IL MISP and BiometricTech notification — is actively probing the GovID 2.0 `/verify/bulk` endpoint using what appears to be a valid-format vendor token. This is the same IP and the same technique pattern documented in the UAE government biometric platform breach. NDSA is currently being actively probed."*

**Are all four triggers from the same adversary?** Assessed: **Likely yes** — IP 185.220.101.47 appears in both Trigger 2 (CERT-IL) and Trigger 4 (BiometricTech notification); the UAE incident (Trigger 1) uses the same vendor API abuse pattern as Trigger 4; developer credential harvesting (Trigger 2) aligns with the GitHub exposure (Trigger 3). Four independent signals pointing to the same attack chain = high synthesis confidence.

---

## Task 2 — GovID 2.0 Threat Model (STRIDE)

> **Tools:** [OWASP Threat Dragon](https://owasp.org/www-project-threat-dragon/) *(open-source)* · [draw.io / diagrams.net](https://www.diagrams.net/) *(free)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [PyTM](https://github.com/OWASP/pytm) *(open-source)*
>
> OWASP Threat Dragon: draw the GovID 2.0 dataflow diagram with trust boundaries marked; STRIDE threat enumeration per component produces the threat table automatically. draw.io: free diagramming for the BiometricTech API integration architecture — visualize where the trust boundary between NDSA and the vendor crosses; mark each crossing as a detection point. ATT&CK Navigator: map each STRIDE threat to its ATT&CK technique kill chain — creates the heatmap layer for the detection backlog in Task 3. PyTM: define GovID 2.0 components in Python code to auto-generate DFD and threat reports — useful for reproducible threat model updates as the architecture evolves.

**Methodology:** STRIDE — chosen because GovID 2.0 is a multi-component trust chain where each trust boundary maps cleanly to a threat category. STRIDE provides a structured checklist that ensures no boundary is overlooked.

### Crown Jewels Analysis

| # | Asset | Why Critical | Breach Consequence | Replaceability |
|---|---|---|---|---|
| 1 | Biometric template database (9.5M records in VRID 2.0) | Underlying authentication truth for all GovID services | Non-replaceable identity compromise for entire Israeli population | **Non-replaceable — biometrics cannot be reset** |
| 2 | BiometricTech matching algorithm + model | Enables adversarial template spoofing if extracted | GovID authentication defeats possible via synthetic biometric | Non-replaceable (vendor IP) |
| 3 | GovID session tokens (transient) | Authenticated access to 47 government services | Identity impersonation for any citizen with active session | Replaceable (rotation); systemic risk if bulk |
| 4 | Ministry Integration Bus API keys (22 ministries) | Cross-ministry data access | Lateral movement across full government digital estate | Replaceable but high-impact rotation |
| 5 | GovID 2.0 source code | Vulnerability map for entire platform | Enables precise exploitation without discovery | Replaceable but high recovery cost |

### Top 5 Attack Scenarios

---

**Scenario 1: BiometricTech Vendor API Token Abuse → Bulk Biometric Extraction**

*Narrative:* The adversary obtains a valid BiometricTech IL vendor API token (via BiometricTech employee compromise — see Trigger 4 + UAE incident pattern). Using this token, the adversary makes authenticated calls to the GovID 2.0 `/verify/bulk` API endpoint. Without a rate limit or anomaly detection, the adversary extracts up to 3.1M biometric template matches per day at the observed API throughput. The extraction is indistinguishable from legitimate BiometricTech batch operations.

*Prerequisites:* Valid BiometricTech vendor API token; knowledge of GovID 2.0 API structure (obtainable from staging environment or developer documentation)
*Likelihood:* **High** — active probing confirmed (Trigger 4); UAE precedent (Trigger 1)
*Impact:* C=5 I=2 A=1
*Detection opportunity:* API call volume anomaly; non-allowlisted source IP using vendor token

---

**Scenario 2: Staging Environment → Production VRID Partial Access (Sprint 23 Gap)**

*Narrative:* Using the stolen Stern GitHub credentials (11-day exposure window), the adversary accessed the GovID 2.0 staging environment. Due to the Sprint 23 unresolved gap (staging API partially connected to production VRID for some query types), certain queries made against staging return production VRID data. The adversary may have already exfiltrated limited production biometric data via this path during the 11-day exposure.

*Prerequisites:* JWT staging token (confirmed exposed; rotated at day 11); knowledge of which staging API calls trigger production queries
*Likelihood:* **Medium** — exposure confirmed; production API leak gap confirmed; whether adversary discovered the leak path is unknown
*Impact:* C=4 (limited scope) I=1 A=1
*Detection opportunity:* Staging → production API cross-query; JWT from non-NDSA IP in staging access logs

---

**Scenario 3: Developer Spearphishing → GovID 2.0 Source Code Exfiltration**

*Narrative:* Using lure subjects documented in CERT-IL CB-2025-041 ("GovID 2.0 Developer Access Update"; "INCD API Security Review — Action Required"), the adversary targets HavayaIT and NDSA developers. One successfully phished developer provides M365 access; the actor then uses that access to read internal GovID 2.0 developer documentation, API specifications, and source code repositories — enabling precise vulnerability identification before launch.

*Prerequisites:* Successful phish of one developer with code/documentation access
*Likelihood:* **Medium** — lure subjects confirmed in CERT-IL; developer credential targeting confirmed; GitHub exposure suggests HavayaIT developers have poor credential hygiene
*Impact:* C=4 I=1 A=1
*Detection opportunity:* M365 sign-in from non-corporate ASN; large repository access from anomalous account

---

**Scenario 4: GovID 2.0 Session Token Bulk Invalidation (Availability Attack)**

*Narrative:* Having established persistence via Scenario 3, the adversary modifies the GovID 2.0 session token validity parameters or performs a mass logout of active sessions, causing authentication failures across all 47 government services simultaneously. Timed to coincide with a politically significant event (election period, government crisis), the disruption creates maximum political impact.

*Prerequisites:* Persistent access with write access to GovID 2.0 configuration or session store
*Likelihood:* **Low** (current phase) — requires successful earlier scenario; current adversary appears in reconnaissance phase
*Impact:* C=1 I=4 A=5
*Detection opportunity:* Configuration change outside change window; mass session invalidation event; write operations by non-operational accounts

---

**Scenario 5: Supply Chain Compromise via HavayaIT (Assignment 5 Repeat)**

*Narrative:* The same contractor access pathway used in the March 2025 NDSA incident (Assignment 5) is re-exploited. HavayaIT developer Yoav Stern's credentials (exposed on GitHub for 11 days) may have been used to access the staging environment or to enumerate NDSA contractor VPN access. Even with the rotated JWT, the underlying VPN credentials remain valid until a forced password reset is completed.

*Prerequisites:* Stern GitHub credential exposure (confirmed); NDSA contractor VPN password not yet changed (confirmed as of date of this assessment)
*Likelihood:* **High** — credentials were live for 11 days; CERT-IL bulletin confirms active developer targeting
*Detection opportunity:* Contractor VPN logon from non-corporate ASN; staging environment access from Stern's account from non-HavayaIT IP

---

### Vendor Trust Risk Matrix

| Vendor | Access Scope | Compromised Credential Enables | Existing Controls | Missing Controls |
|---|---|---|---|---|
| BiometricTech IL Ltd. | API access to Biometric Matching Engine; vendor token for `/verify/bulk` and `/match` endpoints | Bulk biometric template extraction; authentication bypass research | API token issued; 403 on bulk without NDSA-signed header | **No rate limiting on `/verify/bulk`; no API call volume alerting; no IP allowlisting for vendor token** |
| HavayaIT Systems Ltd. | Contractor VPN + Contractor DMZ; GovID 2.0 staging environment access; source code repositories | Staging access; limited production via Sprint 23 gap; source code; VPN access to NDSA network | CyberArk PAM recording; VPN auth | **No MFA enforcement on HavayaIT developer accounts; TOTP seed backup in personal email (confirmed from Assignment 5); credentials committed to public repo** |

---

## Task 3 — Detection Backlog

> **Tools:** [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [Sigma](https://sigmahq.io/) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)*
>
> DeTT&CT: score GovID 2.0's current data sources per ATT&CK technique — directly generates the blocked items list by identifying techniques with no data source coverage. ATT&CK Navigator: overlay the 5 STRIDE scenario technique layers to find which techniques appear in multiple scenarios — those are the P1 items regardless of effort level. Sigma: write the detection logic in each backlog item as a Sigma rule draft — serves as the acceptance criterion when the rule is deployed. VECTR: track detection backlog items from "planned" through "deployed" and "validated" cycles.

| ID | Title | Scenario | ATT&CK | Log Source | Detection Logic | Priority | Effort | Blocked? |
|---|---|---|---|---|---|---|---|---|
| DET-G6-001 | GovID API bulk call volume anomaly from non-allowlisted IP | 1 | T1530 adapted | GovID 2.0 API access logs | >50 calls to `/verify/bulk` in 10 min from IP not in BiometricTech allowlist | P1 | 3d | Yes — GovID API logs not in SIEM |
| DET-G6-002 | BiometricTech vendor token used from non-allowlisted IP | 1 | T1078.003 | GovID API logs + token registry | Vendor API token used from IP not in token's registered source IP | P1 | 2d | Yes — token IP binding not implemented |
| DET-G6-003 | Staging environment JWT used from non-NDSA IP | 2 | T1078.002 | Staging access logs | Staging JWT used from source IP outside NDSA corporate IP range | P1 | 1d | No — JWT source IP is logged |
| DET-G6-004 | Staging API query triggering production VRID lookup | 2 | T1078.002 + T1005 | VRID DB audit logs | DB query originating from staging API IP range | P1 | 2d | No |
| DET-G6-005 | Contractor VPN off-hours from non-corporate ASN | 5 | T1133 + T1557 | VPN logs | Auth success + off-hours + non-corporate ASN (from Assignment 5 fix) | P1 | 1d | No — already developed post-Assignment 5 |
| DET-G6-006 | Developer M365 sign-in from non-corporate ASN | 3 | T1078.002 | HavayaIT M365 audit (requires HavayaIT cooperation) | Successful M365 sign-in for NDSA-project developers from non-HavayaIT ASN | P1 | 3d | Yes — HavayaIT M365 is not NDSA-controlled |
| DET-G6-007 | Lookalike domain resolution by NDSA/HavayaIT endpoints | 3 | T1566.001 | DNS resolver logs | DNS query matching known phishing domain patterns (regex: `govid-il.*`, `biometric-verify-gov-il.*`) | P2 | 2d | No |
| DET-G6-008 | Large-volume outbound HTTPS from GovID 2.0 frontend to non-approved destination | 1 | T1041 | NetFlow / GovID frontend logs | HTTPS outbound >200MB/6h to destination not in CDN/Ministry allowlist | P1 | 4d | Yes — requires NetFlow on GovID frontend cluster (AWS GovCloud) |
| DET-G6-009 | GovID 2.0 configuration change outside change window | 4 | T1565.001 | GovID app config audit logs | Write/modify config operation outside approved 02:00–04:00 IST Saturday change window | P2 | 2d | No |
| DET-G6-010 | Mass session invalidation / token revocation event | 4 | T1531 | GovID session management logs | >1000 session invalidations in 5-minute window outside scheduled maintenance | P2 | 2d | Yes — requires session log ingestion |
| DET-G6-011 | BITS downloader on GovID 2.0 nodes (from Assignment 5 pattern) | 1 | T1197 | Winlogbeat (GovID nodes) | bitsadmin to external non-Microsoft destination from GovID frontend nodes | P2 | 1d | No — GOV-DET-003 deployment needed on GovID nodes |
| DET-G6-012 | New service or registry run key on GovID 2.0 nodes | 1 | T1543.003 + T1547.001 | Winlogbeat + Sysmon | EID 7045 from non-standard path; HKCU Run key write | P2 | 1d | Partial — HKCU Sysmon gap from Assignment 5 |

### Blocked Items

| ID | Blocker | Unblock Timeline | Compensating Control |
|---|---|---|---|
| DET-G6-001 | GovID API logs not in Elastic SIEM | 2 weeks (log pipeline build) | BiometricTech to manually report anomalous API volumes daily until pipeline live |
| DET-G6-002 | No source IP binding on vendor tokens | 1 week (BiometricTech API config change) | Block 185.220.101.47 at perimeter immediately; require BiometricTech to implement IP-binding within 48h |
| DET-G6-006 | HavayaIT M365 not under NDSA control | Requires contractual requirement + HavayaIT deployment; 4 weeks | Require HavayaIT to report anomalous M365 sign-in events within 24h (contractual requirement) |
| DET-G6-008 | No NetFlow on AWS GovCloud IL tier | 3 weeks (AWS logging config) | AWS CloudTrail and VPC Flow Logs partially compensate; enable immediately |
| DET-G6-010 | Session logs not ingested | 2 weeks | Manual monitoring of GovID admin console session stats daily |

---

## Task 4 — Immediate Action Plan (72-Hour)

> **Tools:** [TheHive](https://thehive-project.org/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [VirusTotal](https://www.virustotal.com/) *(freemium)* · [Shodan](https://www.shodan.io/) *(freemium)* · [URLScan.io](https://urlscan.io/) *(free)*
>
> TheHive: create an immediate-response case; assign the 6 action items to owners with SLA deadlines; the 2-hour block action and 24-hour credential rotation are tracked as high-priority tasks. MISP: share 185.220.101.47 and the BiometricTech probing pattern with CERT-IL as a TLP:AMBER event immediately — CERT-IL may have additional context from the UAE incident report. VirusTotal: verify 185.220.101.47 before blocking — confirm it is not a shared CDN or cloud-provider exit node that would affect legitimate traffic. Shodan: enumerate 185.220.101.47's exposed services and TLS certificate history to assess whether it is dedicated actor infrastructure. URLScan.io: safely scan any lookalike domains associated with the probing activity without visiting them directly.

| Action | Trigger | Owner | Deadline | Risk of Not Acting |
|---|---|---|---|---|
| Block 185.220.101.47 at NDSA perimeter | Trigger 4 — confirmed probing | SOC (Gila Ben-Moshe) | 2 hours | Adversary continues API surface mapping unimpeded |
| Force password reset for all HavayaIT contractor accounts with NDSA access | Trigger 3 — 11-day credential exposure | CISO / IT | 24 hours | Stern VPN credentials still valid; any further HavayaIT M365 compromise can be replayed |
| Demand BiometricTech implement IP-binding on vendor tokens within 48h | Trigger 4 — token used from non-allowlisted IP | CISO → BiometricTech CISO (formal letter) | Immediately | Valid-format vendor token continues to be usable from adversary-controlled IP |
| Isolate Sprint 23 staging → production API leak: add firewall rule blocking staging IP range from querying production VRID | Trigger 3 — 11-day exposure overlaps Sprint 23 gap | IT / Network Ops | 48 hours | Production VRID data potentially accessible from staging credentials |
| Rotate all GovID 2.0 API keys referenced in Stern GitHub repository | Trigger 3 — NDSA_API_KEY exposed | IT (already rotated JWT; verify all keys) | Done (JWT rotated); verify completeness within 4 hours | Residual exposed credentials may provide additional access paths |
| Require Stern to provide written explanation of credential commit | Trigger 3 | CISO → HavayaIT account manager | 24 hours | Understanding of exposure scope requires Stern's account of what he committed and why |

### BiometricTech Formal Security Request Letter

```
NDSA — FORMAL SECURITY INFORMATION REQUEST
Date: 19 June 2025
From: Col. (Res.) Dror Nativ, CISO, NDSA
To:   [BiometricTech IL Ltd. CISO name]
Subject: Urgent — API Security Incident — Response Required Within 24 Hours

NDSA has identified the following security concern affecting the GovID 2.0
integration environment that requires immediate clarification.

FACTS:
- IP address 185.220.101.47 has made approximately 2,400 API calls per day
  to the GovID 2.0 /verify/bulk endpoint over the past 10 days.
- This IP address is not in the NDSA-approved IP allowlist for BiometricTech
  API access.
- The calls are using a valid-format BiometricTech vendor API token.
- This IP address appears in active threat intelligence as associated with
  Iranian-nexus operations against Israeli government digital infrastructure.

REQUIRED INFORMATION — respond within 24 hours:
1. Confirm whether vendor API token [token identifier] was legitimately issued
   by BiometricTech and is currently valid.
2. If yes: confirm the authorized IP(s) associated with that token.
3. Confirm whether any BiometricTech employee or system accounts have been
   compromised or exhibited anomalous access in the past 60 days.
4. Provide a complete audit log of all API calls made using vendor tokens
   against the NDSA GovID 2.0 integration environment for the past 30 days.
5. Confirm whether BiometricTech has an incident response investigation open
   that relates to this activity.

NDSA is treating this as an active security incident. Failure to respond
within 24 hours will result in suspension of all BiometricTech API access
to the GovID 2.0 environment pending security review.

Col. (Res.) Dror Nativ | CISO, NDSA | [secure contact]
```

---

## Task 5 — INCD-CID Annex C Draft Submission

> **Tools:** [OpenCTI](https://www.opencti.io/) *(open-source)* · [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)* · [DFIR-IRIS](https://dfir-iris.org/) *(open-source)*
>
> OpenCTI: export the structured threat scenario data (Scenarios 1–5 with ATT&CK tables) directly from the intelligence graph for inclusion in Annex C — no manual re-transcription. LibreOffice Writer: format the CONFIDENTIAL submission document locally; mandatory for content classified above UNCLASSIFIED that must not be uploaded to cloud services. DFIR-IRIS: if the BiometricTech probing incident has already been opened as a case, attach the Annex C draft to the case for evidentiary traceability.

**GovID 2.0 Threat Model — INCD-CID Annex C Submission**
*Classification: CONFIDENTIAL — NOT FOR DISTRIBUTION OUTSIDE INCD/NDSA*
*Date: [submission date] | Version: 1.0*

**A-1: Threat Scenarios (5 required)**
[References Scenarios 1–5 from Task 2 above — included verbatim in submission with ATT&CK tables]

**A-2: Detection Coverage**

| INCD Category | Detections Providing Coverage | Coverage Status |
|---|---|---|
| Credential stuffing | DET-G6-005 (contractor VPN ASN anomaly); DET-G6-003 (staging JWT source IP) | Partial — production login credential stuffing not covered |
| Bulk API data extraction | DET-G6-001 (API call volume); DET-G6-002 (vendor token IP binding) | **Partial — DET-G6-001 and -002 not yet deployed; compensating controls in place** |
| Unauthorized privileged access | DET-G6-003, -004 (staging-production); DET-G6-009 (config change) | Partial |
| Supply chain compromise indicators | DET-G6-005, -006, -007 | Partial — DET-G6-006 requires HavayaIT cooperation |

**A-3: Vendor Security Review**
*NOTE: BiometricTech IL Ltd. vendor security review is pending. NDSA has issued a formal security information request (19 June 2025). INCD is advised that BiometricTech may be implicated in the UAE peer incident (classified advisory — not cited in this unclassified submission). NDSA requests INCD guidance on whether certification can proceed with this item as a pending condition.*

**A-4: Incident Response Plan**
[Reference: NDSA-IRP-GOVID-2025-v1 — attached; includes authentication platform-specific runbooks for: token mass revocation, BiometricTech vendor isolation, VRID quarantine procedure]

---

## Task 6 — Launch Risk Assessment and Recommendation

> **Tools:** [OWASP Threat Dragon](https://owasp.org/www-project-threat-dragon/) *(open-source)* · [Obsidian](https://obsidian.md/) *(free, local)* · [LibreOffice Writer](https://www.libreoffice.org/) *(open-source)*
>
> OWASP Threat Dragon: update the GovID 2.0 threat model diagram with the current risk scores — use as the visual annex to the CISO recommendation memo; the launch/delay recommendation is directly grounded in the threat model. Obsidian: draft the CISO memo from linked notes connecting the risk matrix, the launch criteria, and the go/no-go recommendation — the decision document must be self-contained and traceable to the supporting evidence. LibreOffice Writer: format the final CISO memo as a signed PDF for DG distribution; this is a decision document that requires a signature trail.

### Launch Risk Matrix

| Risk | Likelihood (1–5) | Impact (1–5) | Score | Mitigations in Place | Residual Score |
|---|---|---|---|---|---|
| BiometricTech vendor compromise enables bulk extraction at launch | 4 | 5 | 20 | BiometricTech security request sent; 185.220.101.47 blocked | 12 (INCD read-in pending) |
| Stern credential exposure exploited during launch window | 3 | 4 | 12 | JWT rotated; passwords being reset | 4 (after full credential rotation) |
| Sprint 23 staging→production gap exploited | 3 | 3 | 9 | Firewall rule blocking staging→VRID production queries | 3 |
| Developer spearphishing during launch preparation | 3 | 3 | 9 | DET-G6-007 (lookalike domain); security awareness reminder | 6 |
| No bulk API extraction detection at launch | 5 | 5 | 25 | DET-G6-001 deployment in progress | 15 (if not deployed by launch) |

**Launch criteria — minimum conditions for go:**
1. DET-G6-001 (API call volume rule) deployed and tested
2. DET-G6-002 (vendor token IP binding) implemented by BiometricTech
3. BiometricTech security review completed OR INCD confirmed clear
4. All HavayaIT credentials reset and MFA enforced
5. Sprint 23 staging→production gap resolved

### CISO Recommendation Memo

```
TO:   Dr. Ayelet Shamir, Director-General
FROM: Col. (Res.) Dror Nativ, CISO
DATE: 25 June 2025
RE:   GovID 2.0 Launch Recommendation

RECOMMENDATION: Conditional launch — delay by 6 weeks if conditions below
are not met by 1 September 2025.

RATIONALE: NDSA faces an active adversary probing the GovID 2.0 API surface.
Four corroborating intelligence signals point to Iranian-nexus actors preparing
for a bulk biometric extraction attack timed to the platform launch.

IF WE LAUNCH AS SCHEDULED (1 October 2025) WITHOUT MEETING CONDITIONS:
- We will have no automated detection of bulk API extraction at launch
- BiometricTech's vendor security status remains unconfirmed
- The adversary is actively probing the same API surface they will use to attack
- A breach of 9.5M biometric records would be the largest government data incident
  in Israeli history, non-reversible (biometrics cannot be changed)

IF WE DELAY BY 6 WEEKS:
- All five launch conditions can be met
- Detection coverage is validated before going live
- BiometricTech security review is complete
- Political cost: announced delay; Minister's office briefing required
- Operational cost: 6-week delay to 140K merchant onboarding (BenefitsIL integration)

The political cost of a 6-week delay is bounded and manageable.
The security cost of a biometric breach at launch is existential and irreversible.

RECOMMENDED: delay launch to 15 November 2025 if conditions not met by
1 September. If conditions met by 1 September: proceed on original date.

Col. (Res.) Dror Nativ | CISO, NDSA
```
