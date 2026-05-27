# Solution: Assignment 2 — Proactive CTI: CelltronX Threat Modeling

> **Model answer. All data is fictional.**

---

## Task 1 — Intelligence Synthesis

> **Tools:** [MISP](https://www.misp-project.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [TheHive + Cortex](https://thehive-project.org/) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)*
>
> MISP: ingest each of the 4 triggers as a MISP event; use the Admiralty Scale taxonomy for confidence tagging; automatic correlation across events flags the NetSys access path as a shared indicator. OpenCTI: link trigger reports, threat actor objects, and CelltronX assets into a structured intelligence graph — trace the NetSys supply chain risk visually. TheHive + Cortex: create a triage task per trigger with automated enrichment (IP/domain reputation, WHOIS) via Cortex analyzers. ATT&CK Navigator: overlay trigger-implicated techniques on a heatmap to identify which ATT&CK areas to prioritize for detection.

### Trigger Assessment

| # | Source | Date | TLP | Admiralty S | Admiralty I | Key Claim | Actionable? |
|---|---|---|---|---|---|---|---|
| 1 | Peer company incident (MobileTech IL Ltd.) | 3 weeks ago | AMBER | B | 2 | Iranian-nexus actor compromised Israeli telecom via NetSys-equivalent contractor | Yes — same contractor (NetSys Solutions Ltd.) |
| 2 | CERT-IL TLP:AMBER bulletin | 10 days ago | AMBER | B | 2 | Iranian-nexus actor targeting Israeli telecom billing and roaming data via vendor API abuse | Yes — CelltronX operates in same target set |
| 3 | TASE disclosure (Israeli media) | 8 days ago | WHITE | C | 3 | Telecom sector facing "coordinated reconnaissance" per unnamed industry source | Low confidence; corroborates but doesn't extend |
| 4 | NetSys Solutions Ltd. contract renewal review | Internal | — | A | 1 | NetSys has same access level on CelltronX as it did on MobileTech IL | Critical — confirmed access path |

**Synthesized threat picture:**

> An adversary assessed as Iranian-nexus is actively targeting Israeli telecommunications providers through contractor supply chain access. The MobileTech IL incident demonstrates the adversary's willingness and capability to compromise a contractor company and use that access to reach the primary target. CelltronX uses NetSys Solutions Ltd. — the same vendor type and access model as the MobileTech IL victim. The threat is not theoretical; the adversary is currently operating in the sector.

**Current phase:** Pre-exploitation with confirmed interest. The adversary has demonstrated initial access capability against a peer via the same contractor type. CelltronX must treat its own contractor access as potentially compromised until verified.

**Highest-confidence conclusion:** *"An Iranian-nexus adversary has already demonstrated the ability to compromise Israeli telecom infrastructure through contractor supply chain access. CelltronX's exposure via NetSys Solutions Ltd. represents the same attack vector used against MobileTech IL and must be treated as an active threat, not a hypothetical."*

---

## Task 2 — Crown Jewels Analysis

> **Tools:** [OWASP Threat Dragon](https://owasp.org/www-project-threat-dragon/) *(open-source)* · [draw.io / diagrams.net](https://www.diagrams.net/) *(free)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> OWASP Threat Dragon: draw the CelltronX system architecture with trust boundaries; annotate each component with its crown jewels classification. draw.io: free diagramming for the asset map showing how NetSys contractor access touches billing, NMS, and roaming data simultaneously. OpenCTI: register crown jewel assets as "system" objects with associated threat actor relationships — keeps the asset map in context of the threat intelligence that motivated this analysis.

| # | Asset | Why Critical | Breach Consequence | Replaceability |
|---|---|---|---|---|
| 1 | Subscriber billing records (4.2M customers) | Revenue engine; INCD-CID designated CII | Mass identity theft; regulatory fine; TASE impact | Non-replaceable |
| 2 | Network management systems (NMS) | Controls routing for 4.2M subscribers | Service disruption / national blackout capability | Partially replaceable (days of outage) |
| 3 | Israeli Prime Minister's Office connectivity contract ($210M) | Political and strategic obligation; CII classification | National security incident if disrupted | Non-replaceable |
| 4 | Roaming data (UAE, Cyprus, Romania) | Contains sensitive travel patterns of subscribers | SIGINT value for foreign intelligence services | Non-replaceable |
| 5 | NetSys contractor access credentials | Gateway to all above | All above compromised via single actor | Replaceable only by revoking and reissuing |

---

## Task 3 — Top Attack Scenarios

> **Tools:** [OWASP Threat Dragon](https://owasp.org/www-project-threat-dragon/) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [PyTM](https://github.com/OWASP/pytm) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)*
>
> OWASP Threat Dragon: model each scenario as a dataflow diagram with STRIDE threat annotations at each trust boundary — the contractor VPN boundary is the critical crossing. ATT&CK Navigator: create one layer per scenario showing its kill chain; overlay all 3 scenarios to find techniques that appear in multiple scenarios — those are the highest-priority detection opportunities. PyTM: define CelltronX system components in Python to auto-generate DFD diagrams and threat reports. OpenCTI: link each scenario to the MobileTech IL incident object as an intelligence basis — proves scenarios are not hypothetical.

---

**Scenario 1: NetSys Contractor Account Compromise → NMS Access**

*Narrative:* The adversary compromises a NetSys Solutions Ltd. employee's credentials via AiTM phishing (same technique as MobileTech IL incident). The NetSys employee's account has privileged access to CelltronX's Network Management System for maintenance operations. Using those credentials, the adversary connects to CelltronX's contractor VPN outside business hours from a residential VPN exit node and accesses NMS. Initial objective is reconnaissance; secondary objective is establishing persistent access for future disruption operations.

*Prerequisites:* NetSys corporate email compromise; CelltronX contractor VPN credentials (possibly obtained from same email account); MFA exemption or bypass (AiTM)

*Kill chain:*
| Phase | Technique | Evidence Basis |
|---|---|---|
| Initial Access | T1566.001 (Spearphishing) | MobileTech IL incident pattern |
| Credential Access | T1557 (AiTM) | CERT-IL bulletin |
| Lateral Movement | T1021.001 (RDP) | MobileTech IL incident pattern |
| Collection | T1039 (Network Share Data) | CERT-IL billing/roaming data targeting |

*Likelihood:* **High** — same vendor, same technique documented 3 weeks ago at a peer company
*Impact:* C=5, I=4, A=3
*Primary detection opportunity:* Contractor VPN off-hours logon from non-corporate ASN

---

**Scenario 2: Billing System API Credential Abuse**

*Narrative:* Using stolen NetSys or direct billing system API credentials (potentially obtained from a compromised developer laptop or code repository), the adversary makes authenticated API calls to CelltronX's billing system. Call patterns mimic legitimate NetSys maintenance queries but extract full subscriber records in bulk. The adversary remains below volume thresholds because the billing system has no rate limiting on API endpoints used by contractors.

*Prerequisites:* Valid billing API credentials; knowledge of API endpoint structure (obtainable from contractor documentation)

*Kill chain:*
| Phase | Technique | Evidence Basis |
|---|---|---|
| Initial Access | T1078.003 (Valid Accounts: Cloud Accounts) | CERT-IL API abuse pattern |
| Collection | T1530 (Data from Cloud Storage) adapted | CERT-IL bulletin on roaming/billing data |
| Exfiltration | T1048 (Exfiltration Over Alternative Protocol) | Inference |

*Likelihood:* **Medium** — CERT-IL documents this technique for Israeli telecom sector; CelltronX has no API rate limiting
*Impact:* C=5, I=2, A=1
*Primary detection opportunity:* Billing API call volume anomaly; off-hours API access from non-corporate IP

---

**Scenario 3: Prime Minister's Office Connectivity Disruption**

*Narrative:* Having established persistent access via Scenario 1, the adversary identifies network segments serving the PM Office contract. A targeted BGP route manipulation or firewall rule change causes selective connectivity disruption to PM Office government services. The attack is designed to be ambiguous — appearing like a hardware fault rather than an intrusion.

*Prerequisites:* Persistent access to NMS; understanding of network topology; credentials with write access to routing configuration

*Likelihood:* **Low (current phase)** — requires successful Scenario 1 first; current adversary appears in reconnaissance phase
*Impact:* C=3, I=5, A=5
*Primary detection opportunity:* Configuration change to routing/firewall rules outside change window; NMS access at unusual hours

---

## Task 4 — Detection Backlog

> **Tools:** [DeTT&CT](https://github.com/rabobank-cdc/DeTTECT) *(open-source)* · [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) *(open-source)* · [Sigma](https://sigmahq.io/) *(open-source)* · [VECTR](https://vectr.io/) *(open-source)* · [GitLab Issues](https://about.gitlab.com/) *(open-source option)*
>
> DeTT&CT: score current detection coverage per ATT&CK technique; highlights which scenario techniques have zero coverage — directly generates the P1 list. ATT&CK Navigator: overlay the 3 scenario technique layers against the current coverage layer; gaps are visually obvious. Sigma: write detection logic directly in backlog items as acceptance criteria — when the rule ships, it passes the criteria and the backlog item closes. VECTR: track backlog items through design → deployed → validated cycles. GitLab Issues: self-hostable backlog management with P1/P2/P3 labels and milestone-based sprint planning.

| ID | Title | Scenario | ATT&CK | Log Source | Detection Logic | Priority | Effort | Dependency | Blocked? |
|---|---|---|---|---|---|---|---|---|---|
| DET-001 | Contractor VPN off-hours from non-corporate ASN | 1 | T1133 + T1557 | VPN logs (GlobalProtect) | Auth success + source ASN not in corporate ASN allowlist + hour between 22:00–06:00 | P1 | 2d | ASN enrichment on VPN logs | No |
| DET-002 | RDP from Contractor DMZ to Operational Segment off-hours | 1 | T1021.001 | Winlogbeat (EID 4624 Type 10) | Logon type 10 from Contractor DMZ subnet to Operational Segment subnet; off-hours | P1 | 1d | None | No |
| DET-003 | Billing API bulk query from non-standard IP | 2 | T1078.003 | Billing API logs | API endpoint `/subscriber/export` or bulk SELECT query; source IP not in approved API gateway IP list | P1 | 3d | Billing API logs must be ingested into SIEM | Yes — API logs not in SIEM |
| DET-004 | LSASS dump via comsvcs.dll | 1 | T1003.001 | Winlogbeat (Sysmon EID 10) | `rundll32.exe` + `comsvcs.dll` + `MiniDump` in CommandLine | P1 | 1d | Sysmon deployed on contractor-accessible hosts | Check |
| DET-005 | NMS configuration change outside change window | 3 | T1565.001 | NMS audit logs | Any config write/modify action in NMS audit log during non-change-window hours | P1 | 2d | NMS audit logs must be ingested | Yes — NMS logs not in SIEM |
| DET-006 | BITS job to non-Microsoft/non-CDN destination | 1 | T1197 | Winlogbeat (Sysmon EID 3) | BITS transfer to external IP not in Microsoft/CDN ASN allowlist | P2 | 2d | Sysmon network event logging enabled | Check |
| DET-007 | New service installed from non-standard path | 1 | T1543.003 | Winlogbeat (EID 7045) | New service where ServiceFileName path not in `C:\Windows\System32\` or `C:\Program Files\` | P2 | 1d | None | No |
| DET-008 | wevtutil log clear | 1 | T1070.001 | Winlogbeat (EID 1102) | Any EID 1102 event | P1 | 0.5d | None | No |
| DET-009 | DNS query to newly registered domain | 1, 2 | T1071.001 | DNS resolver logs | DNS query where domain was registered < 30 days ago; requires domain age enrichment | P2 | 3d | Domain age enrichment in DNS log pipeline | Yes |
| DET-010 | NetSys account used outside business hours | 1 | T1078.002 | AD logs + VPN | Any authentication event for NetSys contractor accounts (list) between 22:00–06:00 IST | P1 | 1d | Contractor account list (HR → SIEM) | No |

### Blocked Items

| ID | Blocker | Unblock | Compensating Control |
|---|---|---|---|
| DET-003 | Billing API logs not ingested into SIEM | NetSys + CelltronX IT to configure log shipping; 2 weeks | Daily manual review of billing API access log by SOC (30-min task); alert on record count outliers via API monitoring tool |
| DET-005 | NMS audit logs not in SIEM | NMS vendor configuration; 3 weeks | Weekly NMS config diff review by network operations |
| DET-009 | No domain age enrichment pipeline | Build Elastic ingest processor with WHOIS lookup; 2 weeks | Block all domains registered < 7 days at DNS layer (aggressive; may affect some legitimate services) |

---

## Task 5 — Detection Roadmap

> **Tools:** [VECTR](https://vectr.io/) *(open-source)* · [GitLab / GitHub Projects](https://github.com/) *(free tier)* · [draw.io](https://www.diagrams.net/) *(free)*
>
> VECTR: track each roadmap item from "planned" through "deployed" and "validated" — provides a live dashboard of roadmap progress. GitLab / GitHub Projects: Kanban board with Phase 1/2/3 milestones; assign roadmap items to detection engineers with deadline tracking. draw.io: swimlane roadmap diagram showing phases vs. system components vs. detection owner — useful for stakeholder briefings.

### Phase 1 — Immediate (This Week)

| Item | Action | Owner | Success Criteria |
|---|---|---|---|
| DET-001 | Deploy contractor VPN off-hours / non-ASN rule | SOC Engineering | Rule live; tested with synthetic logon from non-corporate IP |
| DET-002 | Deploy Contractor DMZ RDP rule | SOC Engineering | Rule live |
| DET-004 | Deploy comsvcs.dll LSASS rule | SOC Engineering | Rule live; FP test against backup tool passed |
| DET-007 | Deploy new service from non-standard path | SOC Engineering | Rule live |
| DET-008 | Deploy wevtutil log clear rule | SOC Engineering | Rule live |
| DET-010 | Deploy NetSys account off-hours rule | SOC Engineering + HR (for account list) | Rule live with current NetSys account list |
| **NetSys access review** | Request from NetSys: audit log of all CelltronX access in past 90 days | CISO → NetSys contract manager | Received and reviewed |

### Phase 2 — Short-Term (30 days)

| Item | Action | Owner |
|---|---|---|
| DET-003 | Complete billing API log ingestion | IT + NetSys + SOC Engineering |
| DET-005 | Complete NMS audit log ingestion | Network Operations + SOC Engineering |
| DET-006 | Deploy BITS external rule | SOC Engineering |
| **Sysmon audit** | Verify Sysmon coverage on all contractor-accessible hosts | IT Operations |

### Phase 3 — Sustained (90 days)

- DET-009 (domain age enrichment pipeline)
- Full contractor access review process (quarterly)
- Threat hunting hypothesis: "NetSys credential usage pattern anomaly vs. established behavioral baseline"

---

## Task 6 — Immediate Action Plan (72-Hour)

> **Tools:** [TheHive](https://thehive-project.org/) *(open-source)* · [MISP](https://www.misp-project.org/) *(open-source)* · [VirusTotal](https://www.virustotal.com/) *(freemium)* · [URLScan.io](https://urlscan.io/) *(free)*
>
> TheHive: create an immediate-response case; assign 72-hour tasks to owners with SLA deadlines; track completion status in real time. MISP: immediately share the NetSys compromise indicators with CERT-IL and the MobileTech IL peer via TLP:AMBER event — they may have additional context. VirusTotal: verify any new infrastructure indicators before blocking — avoid accidentally blocking shared CDN infrastructure that would affect CelltronX services. URLScan.io: safely investigate any suspicious domains linked to the contractor access without visiting them directly.

| Action | Trigger | Owner | Deadline | Risk of Not Acting |
|---|---|---|---|---|
| Audit all active NetSys sessions in past 30 days against known working hours | MobileTech IL peer incident; same vendor | CISO / SOC | 24 hours | An ongoing compromise may already exist; delay extends dwell time |
| Force MFA re-enrollment for all NetSys accounts with NDSA access | AiTM phishing documented against similar contractor | CISO / IT | 48 hours | Existing sessions with captured tokens remain valid |
| Request NetSys incident status | MobileTech IL used same-vendor approach | CISO letter to NetSys CISO | 24 hours | If NetSys is compromised, CelltronX access may be actively at risk |
| Deploy DET-001, DET-002, DET-010 immediately (highest-signal rules) | Contractor VPN compromise is assessed as primary vector | SOC Engineering | 48 hours | No visibility into the most likely initial access path |
| Review billing API access logs manually for last 14 days | CERT-IL bulletin on billing data targeting | SOC Analyst | 48 hours | Compensating control while DET-003 log ingestion is pending |

---

## Task 7 — Stakeholder Communication

> **Tools:** [MISP](https://www.misp-project.org/) *(open-source)* · [OpenCTI](https://www.opencti.io/) *(open-source)* · [Obsidian](https://obsidian.md/) *(free, local)* · [LibreOffice Impress](https://www.libreoffice.org/) *(open-source)*
>
> MISP: push watchlist indicators directly to SOC via API with TLP:AMBER marking; auto-format the technical bulletin for CERT-IL sharing. OpenCTI: generate tiered products from the same data — technical report with ATT&CK IDs and indicators vs. executive summary in plain language. Obsidian: draft CISO memo and DG briefing from the same linked notes; enforce the one-page limit for the executive product. LibreOffice Impress: build the CISO decision briefing slide deck locally without cloud upload of the threat details.

### For CISO Dr. Rotem Katz

**Priority: High. This needs a decision within 48 hours.**

We have three corroborating intelligence signals that CelltronX faces an imminent threat from the same adversary that recently compromised MobileTech IL. The attack vector is contractor VPN access — specifically NetSys Solutions Ltd., which has the same level of access to CelltronX as it did to MobileTech IL.

**Decision required:** Do we suspend NetSys remote access pending a security review, or maintain access with enhanced monitoring and accept the residual risk?

- **Option A (Suspend NetSys access for 5 business days pending audit):** Eliminates the primary assessed attack vector immediately; operational impact: NetSys cannot perform scheduled maintenance; estimated impact: [N] maintenance tasks deferred
- **Option B (Maintain access with monitoring + force MFA re-enrollment):** Lower operational disruption; residual risk: if NetSys is already compromised, we have at most 48-hour warning before escalation; requires DET-001 and DET-010 live within 24 hours

**Recommendation:** Option B with DET-001 and DET-010 deployed within 24 hours and a formal NetSys security audit letter sent immediately. Escalate to Option A if NetSys cannot confirm clean audit within 5 business days.

### For DG/Board (Non-Technical)

The same hacker group that recently attacked another Israeli telecom company appears to be targeting CelltronX through one of our IT vendors. We have three intelligence signals pointing to this threat. We are taking immediate action to monitor for suspicious activity by that vendor and require them to pass a security audit within the week. We have also identified 10 specific security monitoring improvements that our team is deploying now. There is no evidence of a successful breach at this time.
