# Assignment 2: Proactive CTI-to-Detection — Business-Aligned Threat Modeling and Detection Backlog

> **Level:** Senior CTI Analyst / Detection Engineer / CTI Lead
> **Estimated time:** 30–45 hours
> **Deliverable language:** English

---

## 1. Title and Objective

**Full title:** Proactive CTI-to-Detection: Business-Aligned Threat Modeling and Detection Backlog

**Assignment objective:**

Without waiting for an incident, the analyst must independently conduct threat analysis for a specific organization — from understanding business context and identifying crown jewels through building a prioritized Detection Backlog and a 90-day roadmap. The result is a detection program grounded in the sector's real threat landscape, not in abstract best practices.

---

## 2. Scenario

### 2.1 Organization

**CelltronX** — a major telecommunications provider headquartered in Tel Aviv, Israel, with operational presence in Cyprus, Romania, and the UAE (post-Abraham Accords expansion). Listed on the Tel Aviv Stock Exchange (TA-35 index).

**Business model:**
- **B2C:** 8 million mobile subscribers, 2.5 million broadband subscribers; ARPU €24/month
- **B2B:** Enterprise connectivity, SD-WAN, MPLS for 12,000 corporate clients; 3-year avg contract term
- **B2B2G:** Government contracts — encrypted communications and dedicated connectivity for Israeli Government ministries, the Prime Minister's Office, and two IDF-affiliated organizations
- **Subsidiary — CelltronX Cloud Services Ltd.:** Cloud services (IaaS/PaaS) for SMBs, 2,000 tenants; hosted on AWS with full separation from core telecom infrastructure

**Regulatory pressure:**
- INCD Critical Infrastructure Directive (CID-2023) — CelltronX qualifies as Critical Infrastructure Operator under the Telecommunications sector; compliance review already flagged; **INCD compliance audit by the Ministry of Communications (MOC) is scheduled for Q2 2025 — 6 months away**
- Israeli Privacy Protection Law (PPL) — 10.5 million PII records under processing
- National telecommunications regulator — mandatory incident notification within 24 hours of detection
- Government contracts — security certification requirements under Israeli Government Security Standard (MATZBEN); **a compliance review of the IDF-adjacent contracts is scheduled for Q3 2025**

**Employees:** 14,000 (including 2,800 technical staff, ~400 remote); IT/Security: 180 staff across three countries.

**Recent business development:** In October 2024, CelltronX signed a **5-year contract extension** with the Israeli Prime Minister's Office for encrypted inter-ministry communications infrastructure. Contract value: $210M. The contract explicitly requires an annual third-party security audit and a commitment to INCD-CID-compliant security posture. The contract was publicly announced in a press release — which means CelltronX's profile as a carrier for government communications is now publicly known.

### 2.2 Technology Stack

**Infrastructure:**
- Core Network: Ericsson 5G SA + NSA deployed in Vienna, Prague, and Budapest; Nokia RAN across all four countries
- Transmission: SDH/DWDM backbone, MPLS core; legacy TDM circuits still in use for some government clients
- IT Infrastructure: VMware vSphere 8.0 (7,000+ VMs), Nutanix on edge nodes; mix of RHEL 8/9 and Windows Server 2019/2022
- BSS: Oracle E-Business Suite 12.2 on RHEL 8 (central billing system for 8M mobile subscribers — labeled internally as "BSS-Oracle"); database server runs Oracle DB 19c; **not connected to SIEM as of today**
- OSS: Proprietary NMS (Network Management System) built on RHEL 8 + Java; manages all 5G SA core elements; **only syslog to a local log server, not forwarded to SIEM**
- Legacy: SS7 signalling gateway (partial Diameter integration for 4G/5G); **no logging from SS7 gateway into any central system**
- SCADA-adjacent: Network element management uses Ericsson ENM (Element Manager) and Nokia NetAct; both are segregated but reachable from the operations VLAN

**Cloud:**
- AWS (Production workloads): 3 regions (eu-central-1, eu-west-1, eu-central-2); EC2/RDS/S3/EKS; **CloudTrail enabled but forwarded to S3 only — not integrated into SIEM**; GuardDuty enabled; AWS Security Hub enabled but no SIEM integration
- Azure (Corporate IT): Microsoft 365, Entra ID (Azure AD), Intune; Defender for Endpoint on Windows; **Entra ID sign-in logs forwarded to SIEM but conditional access policies not fully configured**
- GCP (Data Analytics): BigQuery and Dataflow for CDR (Call Detail Records) processing — approximately 2.1 billion CDR records per month; **GCP Audit Logs NOT forwarded to any SIEM; no visibility into GCP from security operations**

**Identity:**
- AD (on-premise): 18,000 accounts across three domains (AT, CZ, HU); ~350 service accounts; domain trusts between all three
- Entra ID (Hybrid): Synced via AAD Connect; SSO for M365 and cloud applications
- PAM: CyberArk (Privilege Cloud) — **covers ~60% of privileged accounts**; the remaining 40% (primarily Linux and telecom element admin accounts) use shared passwords stored in a password vault tool that predates CyberArk
- MFA: Duo Security — mandatory for all external-facing applications and VPN; **optional for internal applications** including OSS/NMS console

**Security Tools:**
- EDR: Microsoft Defender for Endpoint (MDE) — deployed on **all Windows endpoints** (approx. 6,400 workstations and servers); **Linux servers NOT covered** by MDE (approximately 1,800 Linux instances including all OSS/BSS/Core infrastructure)
- SIEM: Splunk Enterprise Security 7.3 (on-prem, 3 indexer cluster); ingestion at 120 GB/day
- Vulnerability Management: Tenable.io (corporate IT scope); **telecom network elements not scanned**
- Cloud Security Posture: Prisma Cloud (AWS + Azure); **GCP not connected to Prisma**
- WAF: Imperva SecureSphere (external web services and customer portal)
- Email Security: Microsoft Defender for Office 365 Plan 2 (ATP)
- Network: Cisco ASA + Palo Alto NGFW at DMZ; **no East-West inspection; microsegmentation absent between BSS, OSS, and IT VLANs**; IDS/IPS only at the perimeter

**Logging Maturity:**
| Layer | Status | SIEM Integration |
|---|---|---|
| Corporate Windows endpoints | Good (MDE + Sysmon) | Yes — Splunk |
| Corporate Linux servers | Weak (syslog only, no auditd) | Partial — high-noise, no structured parsing |
| Entra ID sign-in logs | Good | Yes — Splunk |
| AWS CloudTrail | Present (S3 only) | No — not in SIEM |
| AWS S3 Access Logs | Disabled on CDR/BSS buckets | No |
| EKS Audit Logs | Not enabled | No |
| GCP Audit Logs | Present in GCP | No — not forwarded |
| BSS-Oracle server | No agent, no forwarding | No |
| OSS/NMS | Syslog to local server | No |
| SS7 Gateway | No logging configured | No |
| Core 5G (Ericsson ENM) | Vendor log available locally | No |
| CyberArk PAM | Audit log in CyberArk | Not in SIEM |

### 2.3 Current Security Posture and Trigger Events

**Why this analysis is happening NOW — four concurrent triggers:**

**Trigger 1: Peer Company Ransomware Incident (5 weeks ago)**
An Israeli telecommunications company (referred to internally as "MobileTech IL Ltd." — not publicly identified) was hit by a ransomware attack that disrupted mobile services for approximately 400,000 subscribers for 31 hours. The incident was widely reported in Israeli media. The ransomware group claimed to have exfiltrated 120 GB of CDR data before encrypting. CelltronX's CISO received an informal call from MobileTech IL Ltd.'s CISO sharing that initial access was via credential stuffing against their customer service portal VPN. CelltronX uses a similar VPN architecture.

**Trigger 2: National CERT Warning (3 weeks ago)**
CERT-IL issued a TLP:AMBER advisory warning that a state-sponsored threat actor (assessed as Iranian-nexus, not named in the advisory) has been conducting active reconnaissance against Israeli telecommunications providers with government contracts. The advisory specifically mentioned SS7 intercept capability exploitation and OSS/NMS targeting as observed techniques. The advisory recommended reviewing access controls on network management systems and SS7 infrastructure. No specific IOCs were provided.

**Trigger 3: Internal Security Discovery — Contractor Access Anomaly (2 weeks ago)**
During a routine AWS IAM access review, the Cloud Security Team discovered that **NetSys Solutions Ltd.**, a third-party network equipment maintenance contractor, has an AWS IAM role with `AdministratorAccess` permissions on the CelltronX AWS production account. This role was provisioned 18 months ago for a specific maintenance window and was never removed. NetworkPro's employees have been accessing this role periodically — apparently for ongoing support tasks. The contractor has not signed an updated security addendum since 2021. This finding was escalated to the CISO but has not yet been remediated.

**Trigger 4: AiTM Phishing Campaign Against Employees (1 month ago)**
Microsoft Defender for Office 365 blocked three separate AiTM phishing attempts targeting CelltronX employees with M365 credentials over a 2-week period. All three targeted employees in the OSS Engineering and Network Operations departments. ATP sandbox analysis confirmed each email contained a link to an adversary-in-the-middle proxy targeting M365 authentication. All three emails were blocked and no credential compromise was confirmed — however, the security team has no visibility into whether the same campaign also reached personal email addresses used by these employees.

### 2.4 Organizational Constraints and Context

**New CISO and Mandate:**
CelltronX hired a new CISO (Dr. Rotem Katz, formerly head of security at a major Israeli bank) 90 days ago. His mandate from the Board: "Demonstrate measurable improvement in security posture within 6 months." He has secured a budget of **$3.5M for Year 1** of a security uplift program. The CTI/Detection function currently does not exist as a formal capability — threat intelligence is handled ad-hoc by two senior SOC analysts. Dr. Katz has tasked you with producing the first comprehensive Threat Model and Detection Roadmap as the foundation of the uplift program.

**INCD-CID Pre-Audit Assessment (2 weeks ago):**
An external firm conducted a INCD-CID readiness pre-audit. Key findings relevant to detection and CTI:
- **Finding NIS-01 (Critical):** No systematic threat intelligence capability — INCD-CID Article 21 requires threat-informed security measures
- **Finding NIS-02 (Critical):** No monitoring of SS7 gateway, BSS, or OSS systems — INCD-CID Article 21(2)(e) requires anomaly and event monitoring of critical systems
- **Finding NIS-03 (High):** Insufficient network segmentation between IT and OT/telecom infrastructure — lateral movement from corporate IT to core network is technically feasible
- **Finding NIS-04 (High):** No supply chain security program — INCD-CID Article 21(2)(d) requires supply chain security policies
- The pre-audit report estimates that **CelltronX is currently at INCD-CID compliance level 2 out of 5**. Level 3 minimum is required for the regulatory audit.

**Detection Engineering Team Reality:**
The detection engineering team consists of three analysts. They can realistically **implement 6–8 new detection rules per 30-day sprint**. They are currently backlogged with 14 pending rule requests (primarily from MDE policy changes). Any new Detection Backlog items added by the CTI analysis must be prioritized against this existing backlog.

**CyberArk Gap — Which 40% Is Uncovered?**
The 40% of privileged accounts not under CyberArk include:
- All Linux root and sudo accounts on OSS/BSS/Core infrastructure (~180 accounts, shared passwords)
- All Ericsson ENM admin accounts (~40 accounts, shared passwords)
- Nokia NetAct admin accounts (~25 accounts)
- Network equipment CLI admin accounts (Cisco, Palo Alto)
This means the most critical infrastructure — the SS7 gateway, 5G Core, and OSS/BSS systems — uses unmanaged, shared credentials. A single credential compromise gives an attacker access to all systems in that tier.

### 2.5 Known Business Risks

| Risk | Probability | Business Impact | Regulatory Consequence |
|---|---|---|---|
| CDR leak (2.1B records/month) | Medium | Catastrophic reputational, €20M Israeli PPL fine | Israeli PPL Article 17A, INCD-CID incident notification |
| BSS compromise (8M subscriber billing) | Medium-High | Direct financial losses, fraud potential | Israeli PPL, INCD-CID, national regulator |
| 5G Core disruption (8M mobile users) | Medium | Service outage, SLA penalties, national security impact | INCD-CID mandatory incident notification, government contract review |
| SS7 intercept exploitation | Low-Medium | Subscriber surveillance capability sold/used | National security, government contract loss |
| Government communication channel compromise | Low | National security incident, contract termination | Government contract review, potential legal action |
| AWS/cloud ransomware (CelltronX Cloud Services Ltd.) | Medium-High | 2,000 SMB tenants disrupted, reputational | INCD-CID, B2B SLA penalties |
| NetworkPro contractor abuse of AdministratorAccess | Medium | Full AWS production account compromise | All of the above for AWS workloads |
| Supply chain attack via Ericsson/Nokia update | Low | Core network integrity | INCD-CID, national security |

---

## 3. Learning Objectives

1. Translate business context and regulatory pressure into intelligence requirements — understand what threatens the business AND what creates compliance exposure
2. Conduct Crown Jewel Analysis in a structured and evidence-based manner, including recently changed threat profiles (government contract announcement)
3. Incorporate **trigger events** (peer incident, CERT warning, internal discovery) into the threat model
4. Identify the relevant sector threat landscape using public CTI reports, specifically for Israeli telecom
5. Build realistic attack paths to crown jewels that account for known architectural weaknesses (no East-West inspection, shared credentials, unmanaged PAM)
6. Prioritize ATT&CK techniques based on business risk AND current detection blind spots
7. Convert threat intelligence into specific detections with ownership, metrics, and INCD-CID compliance references
8. Conduct Telemetry Readiness Assessment against actual confirmed gaps
9. Create a Detection Coverage Matrix that can be presented to the Board and used in the INCD-CID audit response
10. Build a 90-day roadmap that is operationally realistic given team capacity (6–8 rules per sprint)

---

## 4. Input Materials

The student receives:
- Organization description and context (this section)
- The four trigger events (Section 2.3) as starting points for threat model calibration
- INCD-CID pre-audit findings (Section 2.4) as compliance requirements to address
- ATT&CK Enterprise + ATT&CK for Mobile + ATT&CK for Network Infrastructure (relevant sections)
- Public CTI on telecom sector threats (self-directed research: ENISA Threat Landscape 2024, CISA advisories, Europol IOCTA, vendor threat reports on telecom targeting)

---

## 5. Student Tasks

### A. Business Understanding

Create a **Business Context Document** (1–2 pages) answering:

1. What does CelltronX do, and where does its revenue come from? (Identify the top 3 revenue streams and their security criticality)
2. What changed in the past 90 days that increased CelltronX's threat profile? (Refer to trigger events and the government contract announcement)
3. What would happen to each business line if the BSS, 5G Core, SS7, or CDR systems were unavailable for 24 hours? 72 hours?
4. What data has value to different actor categories (financially motivated vs. state-sponsored vs. hacktivist)?
5. What are the regulatory consequences of different incident types? (Map each to Israeli PPL/INCD-CID/national regulator)
6. Given the INCD-CID audit in 6 months, what specific requirements (Articles 21(2)(a)–(h)) are currently unmet?

**Specific challenge:** The government contract announcement made CelltronX's profile as a government communications carrier **publicly known**. How does this change the threat actor relevance assessment compared to a telecom without government contracts?

### B. Crown Jewel Analysis

Create a table of 10–12 critical assets addressing the full business profile:

| Asset | Business Function | Data Sensitivity | Threat Attractiveness | Likely Actor Interest | Compromise Impact | Current Monitoring Level | INCD-CID Relevance | Priority |
|---|---|---|---|---|---|---|---|---|
| **BSS-Oracle (Oracle DB 19c)** | Billing for 8M subscribers | Critical | Very high | Ransomware, fraud, espionage | ... | None | Article 21(2)(e) | Critical |
| **CDR Repository (GCP BigQuery)** | Analytics, regulatory reporting | Critical (geoloc + comms metadata) | High | State actors, crime | ... | None | ... | Critical |
| ... | | | | | | | | |

Mandatory assets to include:
- BSS-Oracle billing database
- CDR BigQuery repository
- 5G Core (Ericsson EPC/5GC)
- SS7 Gateway
- Government communication channels
- Entra ID / AD (identity foundation)
- AWS Production (CelltronX Cloud Services Ltd.)
- CyberArk PAM (or lack of coverage)
- OSS/NMS (network management)
- EKS clusters (containerized B2B services)

### C. Threat Landscape Analysis

For each of the 5 threat categories (nation-state, ransomware, telecom fraud, hacktivism, supply chain), perform:

1. **Evidence-based relevance assessment:** Does public CTI support this threat for Israeli telecoms with government contracts? Cite specific public reports.
2. **Trigger event mapping:** Which of the 4 trigger events (Section 2.3) is relevant to this category?
3. **Specific CelltronX targeting factors:** Beyond generic sector relevance, what specific characteristics of CelltronX make it a more or less attractive target than a generic Israeli telecom?
4. **Confidence level:** Based on the above, what confidence level do you assign to this threat being relevant to CelltronX?

**Special case — Insider Threat:**
The NetworkPro contractor with unchecked AWS AdministratorAccess represents a supply chain / insider risk. Address this as a sixth threat category: **Trusted Third-Party Abuse**. What is the realistic attack surface if NetworkPro's credentials are compromised or if a rogue NetworkPro employee acts maliciously?

### D. Attack Path Modeling

Create a minimum of **4 attack paths** (extended from the original 3) to address the expanded threat context:

**Required paths:**
- **AP-001:** Ransomware via corporate VPN credential stuffing → Lateral Movement → BSS encryption (informed by EuroConnect peer incident)
- **AP-002:** Nation-state long-dwell implant via OSS/NMS spearphishing → SS7 gateway access for subscriber interception
- **AP-003:** Supply chain attack via NetworkPro AWS AdministratorAccess → CDR data exfiltration from GCP BigQuery (explain the lateral movement: AWS account → inter-cloud access possibilities)
- **AP-004:** AiTM phishing of OSS Engineer → M365 session takeover → lateral movement via Entra ID → OSS/NMS web console access (informed by the blocked AiTM campaign in Trigger 4)

For each path:
- Map every step to ATT&CK technique IDs
- Identify detection opportunities at each step
- Note where current logging blind spots prevent detection
- Identify the minimum telemetry required to detect the attack before the final stage

### E. Prioritized ATT&CK Technique List

Create a table of **15–20 techniques** prioritized for CelltronX. The list must:
- Be weighted by **business impact** (crown jewel proximity), **current detection coverage** (is there a rule today?), and **likelihood** (relevance to confirmed threat actors targeting Israeli telecom)
- Address techniques specific to cloud environments (AWS, GCP, Azure) in addition to traditional endpoint techniques
- Include at least 3 cloud-specific techniques (T1580, T1530, T1078.004)
- Include SS7/telecom-specific context for at least one technique

### F. CTI-to-Detection Mapping (Detection Backlog)

Create a Detection Backlog of **12–15 items** with:
- The 5 example items from this template (DB-001 through DB-005)
- **DB-006 through DB-015:** developed independently

**Constraints to address in the backlog:**
- The detection engineering team can implement only 6–8 rules per 30-day sprint
- Therefore the backlog must include a **realistic sprint assignment** (Sprint 1, 2, or 3) for each item
- Items with no current telemetry source must include **a pre-requisite: enable log source X** before the rule can be written
- At least 3 items must reference INCD-CID Article 21 compliance as a driver (not just threat-based priority)

**DB-001 through DB-005 (provided — see below). DB-006–015 are student-developed.**

---

**DB-001: VPN Credential Stuffing Detection**

| Field | Value |
|---|---|
| Threat Scenario | Ransomware initial access via credential stuffing on Cisco AnyConnect VPN (informed by EuroConnect peer incident) |
| ATT&CK Technique | T1078 / T1110.003 |
| Data Source | VPN authentication logs (Cisco ISE / AnyConnect) → Splunk |
| Detection Logic | >10 failed auth attempts in 5 min from one IP or >20 from different IPs targeting one user |
| Severity | High |
| Priority | P1 — Critical |
| Implementation Difficulty | Low (data already in Splunk) |
| Expected FP | Users with forgotten password, locked accounts |
| Tuning | Whitelist IT admin IPs; correlate with MFA push events; use Duo report for MFA bypass attempts |
| Validation Method | Purple team credential stuffing simulation against staging VPN |
| INCD-CID Reference | Article 21(2)(b) — incident handling; (2)(e) — monitoring |
| Sprint Assignment | Sprint 1 |
| Owner | SOC L2 / Detection Engineering |

---

**DB-002: DCSync Attack Detection**

| Field | Value |
|---|---|
| Threat Scenario | Pre-ransomware or espionage credential harvesting via DCSync against the 3-domain AD forest |
| ATT&CK Technique | T1003.006 |
| Data Source | Windows Security EID 4662 (Object access with DS-Replication-Get-Changes) on DCs |
| Detection Logic | EID 4662 where ObjectType = "DS-Replication-Get-Changes" AND SubjectUserName is NOT a DC computer account AND NOT an AAD Connect sync account |
| Severity | Critical |
| Priority | P1 — Critical |
| Implementation Difficulty | Medium (requires Advanced Audit Policy enabled on all 3 domain DCs in 3 countries) |
| Expected FP | AAD Connect sync account must be whitelisted; scheduled AD replication tool |
| Pre-requisite | Enable Advanced Audit Policy: DS Access → Audit Directory Service Access on DC in all 3 domains |
| Sprint Assignment | Sprint 1 (with audit policy pre-requisite in Week 1) |
| Owner | Detection Engineering + AD Team |

---

**DB-003: Suspicious PowerShell Encoded Command**

| Field | Value |
|---|---|
| Threat Scenario | Post-exploitation execution by all actor types after phishing or credential compromise |
| ATT&CK Technique | T1059.001, T1027 |
| Data Source | Sysmon EID 1 / Windows EID 4688 (Windows corporate endpoints only — Linux not covered) |
| Detection Logic | powershell.exe with -Enc OR -EncodedCommand OR (-W Hidden AND -NonI) |
| Severity | High |
| Priority | P1 |
| Implementation Difficulty | Low |
| Expected FP | Medium — needs baseline (SCCM, Intune, backup agents use encoded PS) |
| Tuning | 30-day baseline collection before going to alert; start as scheduled hunt weekly |
| Sprint Assignment | Sprint 1 |
| Owner | Detection Engineering |

---

**DB-004: AWS CloudTrail — IAM Anomalous Activity (NetworkPro Monitoring)**

| Field | Value |
|---|---|
| Threat Scenario | NetworkPro contractor AWS AdministratorAccess abuse OR supply chain compromise of NetworkPro credentials → AWS account takeover |
| ATT&CK Technique | T1078.004, T1098 |
| Data Source | AWS CloudTrail → Splunk (requires CloudTrail → Splunk integration — currently CloudTrail logs to S3 only) |
| Detection Logic | AssumeRole from unexpected source IP for NetworkPro IAM role; OR CreateUser + AttachUserPolicy + CreateAccessKey within 10 min from any principal |
| Severity | Critical |
| Priority | P1 |
| Implementation Difficulty | Medium (CloudTrail → Splunk integration needed first) |
| Pre-requisite | CloudTrail → Splunk integration (estimated: 3 days engineering effort) |
| Sprint Assignment | Sprint 1 (integration), Sprint 2 (rule) |
| Owner | Cloud Security Team |

---

**DB-005: GCP BigQuery CDR Data Access Anomaly**

| Field | Value |
|---|---|
| Threat Scenario | CDR data exfiltration via compromised GCP service account or misconfigured BigQuery permissions |
| ATT&CK Technique | T1530 |
| Data Source | GCP Audit Logs (Data Access logs for BigQuery) → Splunk (currently no GCP integration) |
| Detection Logic | BigQuery.datasets.getTable from unknown service account; OR BigQuery.jobs.create with bytes_processed > 10GB from non-analytics job runner account |
| Severity | Critical |
| Priority | P1 |
| Implementation Difficulty | High (GCP Audit Logs → Splunk integration required + BigQuery log schema parsing) |
| Pre-requisite | GCP Pub/Sub → Splunk integration (estimated: 2 weeks engineering) |
| Sprint Assignment | Sprint 2 (integration), Sprint 3 (rule) |
| Owner | Cloud Security Team / CTI |

---

**DB-006–DB-015:** Student must develop independently. Required coverage:
- Ransomware (T1486) — file encryption detection (Windows endpoint)
- Web Shell on OSS/NMS (T1505.003)
- Lateral movement via SMB/Admin Shares (T1021.002) — corporate to BSS segment
- Scheduled Task persistence (T1053.005)
- New Admin Account (T1098) in AD — especially for service accounts
- AiTM session cookie theft indicator (T1550.004 — Use Alternate Authentication Material)
- EKS anomalous Kubernetes API calls (T1609 — Container Administration Command)
- Linux auditd alert for privilege escalation on OSS/BSS servers (T1548.003 — Sudo and Sudo Caching)
- Network scan from internal to BSS VLAN (T1046)
- Anomalous CDN/HTTPS beacon from Linux OSS server (T1071.001)

### G. Telemetry Readiness Assessment

Complete the table with explicit **As-Is state**, **What changes are needed**, and **INCD-CID requirement** columns:

| Log Source | Current State | SIEM Integration | Covers Which Threats | Top Gap | Recommendation | INCD-CID Reference | Priority |
|---|---|---|---|---|---|---|---|
| Windows Endpoint (MDE+Sysmon) | Good | Yes — Splunk | Corp IT threats | No PowerShell ScriptBlock | Enable EID 4104 via GPO | Art. 21(2)(e) | High |
| Entra ID Sign-In | Good | Yes — Splunk | Identity threats | No conditional access alert integration | Enable Risky Sign-In → SIEM | ... | Medium |
| AWS CloudTrail | Present (S3 only) | No | Cloud threats | Not in SIEM | CloudTrail → Splunk integration | ... | Critical |
| GCP Audit Logs | Present (GCP only) | No | CDR/BigQuery threats | Not in SIEM | GCP Pub/Sub → Splunk | ... | Critical |
| BSS-Oracle server | None | No | Billing/fraud threats | No agent, no forwarding | Deploy auditd + forward to Splunk | ... | Critical |
| OSS/NMS | Syslog local | No | Network mgmt threats | Not in SIEM | Syslog → Splunk | ... | Critical |
| SS7 Gateway | None | No | Telecom-specific | No logging at all | Vendor log integration (custom) | ... | High |
| Linux servers (OSS/BSS) | Syslog only | Partial | Lateral movement | No process execution | Deploy auditd with NIST rules | ... | Critical |
| EKS Audit Logs | Not enabled | No | Container threats | Not enabled | Enable EKS audit logging | ... | High |
| CyberArk PAM | CyberArk console only | No | Privileged access abuse | Not in SIEM | CyberArk → Splunk integration | ... | High |
| SS7 Gateway | None | No | Subscriber intercept | Complete absence | Evaluate vendor logging capability | Art. 21(2)(e) | High |
| Pentest/Contractor Access | No monitoring | No | NetworkPro abuse | No access monitoring | AWS IAM Access Analyzer + CloudTrail | Art. 21(2)(d) | Critical |

### H. Detection Coverage Matrix

| Threat | ATT&CK Technique | Current Detection | Confidence | Gap | INCD-CID Compliance Impact | Priority |
|---|---|---|---|---|---|---|
| Ransomware | T1078 (Credential stuffing VPN) | No | None | No VPN alert rule | Non-compliant Art. 21(2)(e) | P1 |
| Ransomware | T1003.006 (DCSync) | Partial (no audit policy) | Low | Audit policy not enabled | Non-compliant | P1 |
| Ransomware | T1486 (Encryption) | Yes (MDE) | High | Windows only; Linux servers not covered | Partial | P2 |
| Nation-state | T1530 (CDR theft via GCP) | None | None | GCP not in SIEM | Non-compliant | P1 |
| Nation-state | T1071.001 (OSS C2 beaconing) | Partial | Low | Linux servers minimal visibility | Partial | P2 |
| Trusted Third Party | T1078.004 (NetworkPro AWS) | None | None | CloudTrail not in SIEM | Non-compliant | P1 |
| Telecom Fraud | T1078 (BSS account abuse) | None | None | BSS not in SIEM | Non-compliant | P1 |
| Supply Chain | T1195.002 | None | None | No integrity monitoring | Non-compliant | P2 |
| AiTM | T1550.004 (Session cookie re-use) | Partial (MDE) | Low | Entra ID risky sign-in not configured | Partial | P2 |

### I. Executive Prioritization (30/60/90-day Roadmap)

The roadmap must address: sprint capacity (6–8 rules per sprint), pre-requisite log source integrations, and INCD-CID audit readiness in 6 months.

**30 days — Critical gaps (INCD-CID compliance foundation):**

| # | Action | Rationale | INCD-CID Reference | Owner | Effort |
|---|---|---|---|---|---|
| 1 | Enable S3 access logging on CDR/BSS buckets AND deploy CloudTrail → Splunk integration | Crown jewel + INCD-CID Art. 21(2)(e) | Art. 21(2)(e) | Cloud Security | 3 days |
| 2 | Configure VPN credential stuffing alert (DB-001) | EuroConnect peer incident — direct risk | Art. 21(2)(b)(e) | Detection Eng. | 1 day |
| 3 | Enable AD Advanced Audit Policy (DCSync detection pre-requisite) on all 3 DCs | Pre-ransomware credential theft | Art. 21(2)(e) | AD Team | 1 day per domain |
| 4 | Remove or restrict NetworkPro AWS AdministratorAccess (IMMEDIATE remediation) | Supply chain risk — confirmed open exposure | Art. 21(2)(d) | Cloud Security | 2 days |
| 5 | Deploy auditd on all Linux OSS/BSS servers — at minimum: process execution, file access | Core visibility gap; INCD-CID compliance gap | Art. 21(2)(e) | Infrastructure | 5 days |
| 6 | Implement DB-001 (VPN), DB-002 (DCSync), DB-003 (PowerShell) in Sprint 1 (6–8 rules) | Core detection coverage | Art. 21(2)(e) | Detection Eng. | Sprint 1 |

**60 days — High gaps:**

| # | Action | Rationale |
|---|---|---|
| 7 | GCP Audit Logs → Splunk (Pub/Sub integration) — CDR crown jewel visibility | CDR is the highest-value target for state actors |
| 8 | auditd logs → Splunk parsing and alerting (Sprint 2 rules) | Lateral movement visibility on OSS/BSS |
| 9 | Entra ID Identity Protection integration (Risky Sign-In alerts) | AiTM credential re-use detection |
| 10 | Implement DB-004, DB-005 + 3 student-developed rules (Sprint 2) | Cloud detection coverage |
| 11 | MFA enforcement on internal OSS/NMS console access | Reduce blast radius of credential compromise |
| 12 | Network microsegmentation: ACL between corporate IT and BSS/OSS VLANs | AP-001 and AP-002 path containment |

**90 days — INCD-CID audit preparation:**

| # | Action | Rationale |
|---|---|---|
| 13 | CyberArk PAM → Splunk integration; privileged account coverage to >85% | Art. 21(2)(a)(e) — access management + monitoring |
| 14 | SS7 gateway logging feasibility assessment + proof of concept | INCD-CID Art. 21(2)(e) — monitoring of essential services |
| 15 | Detection Coverage Matrix finalized — presented as INCD-CID Article 21 compliance evidence | Pre-audit documentation |
| 16 | Purple Team exercise on AP-001 (Ransomware path) using full detection stack | Validate coverage before INCD-CID audit |
| 17 | CTI program blueprint presented to CISO with Year 2 roadmap | Dr. Hoffmann's 6-month mandate deliverable |

---

## 6. Required Deliverables

| # | Deliverable | Audience | Format |
|---|---|---|---|
| D1 | Business Threat Profile (1–2 pages) | CISO Dr. Hoffmann, Board | Narrative — addresses government contract threat profile change |
| D2 | Crown Jewel Analysis Table (10–12 assets) | CISO, Security Architect | Table — includes INCD-CID compliance column |
| D3 | Sector Threat Landscape (6 categories including Trusted Third Party) | CTI Team, CISO | Table + narrative — cites public CTI reports |
| D4 | Trigger Event Analysis — how each trigger updates the threat model | CTI Lead, CISO | 1-page table |
| D5 | Attack Path Models (4 required) | Detection Engineering, IR | Table — includes blind spot mapping |
| D6 | Prioritized ATT&CK Technique List (15–20 techniques) | Detection Engineering | Table — business impact + detection gap |
| D7 | CTI-to-Detection Backlog (12–15 items with sprint assignments) | Detection Engineering, SOC | Backlog document |
| D8 | Detection Coverage Matrix | SOC Manager, CISO | Matrix — includes INCD-CID compliance column |
| D9 | Telemetry Gap Analysis with INCD-CID reference | SOC Manager, IT, CISO | Table |
| D10 | 30/60/90-day Roadmap (capacity-constrained) | CISO, Management | Table |
| D11 | Executive Brief for Board (1 page) | Board, CISO | Narrative — addresses 4 trigger events |
| D12 | INCD-CID Compliance Gap Assessment (Article 21 mapping) | CISO, Legal | Table |

---

## 7. Evaluation Rubric (100 points)

| Category | Points | Criteria |
|---|---|---|
| Business understanding | 15 | Crown jewel analysis justified by business criticality; government contract threat profile change addressed; trigger events incorporated |
| Threat relevance | 15 | Threats specific to Israeli telecom with government contracts; public CTI cited; EuroConnect incident incorporated; CERT advisory addressed |
| CTI quality | 15 | Explicit confidence levels; no overclaiming; trusted third-party threat addressed; 6 threat categories |
| Attack path modeling | 15 | All 4 required paths; ATT&CK mapped; detection blind spots per path; minimum telemetry requirement per path |
| Detection backlog | 15 | Sprint-constrained; pre-requisites noted; INCD-CID references included; 12–15 items |
| Telemetry assessment | 10 | All major gaps identified; INCD-CID compliance column; realistic remediation estimates |
| Prioritization | 10 | Roadmap is capacity-realistic; NetworkPro remediation treated as immediate (not just 90-day) |
| Communication | 5 | Executive brief addresses all 4 triggers; INCD-CID audit preparation visible |

**Excellent (90–100):** All 12 deliverables complete; government contract impact on threat profile explicitly analyzed; EuroConnect peer incident used as calibration; NetworkPro treated as immediate remediation priority; INCD-CID compliance integrated throughout; roadmap capacity-constrained.

**Good (75–89):** Most deliverables complete; trigger events addressed but peer incident analysis shallow; INCD-CID references present but not fully integrated.

**Weak (55–74):** Threat landscape generic; trigger events not incorporated; INCD-CID treated as afterthought; roadmap has no sprint capacity constraints.

**Failing (<55):** No crown jewel analysis; no trigger event analysis; no detection backlog with INCD-CID references.

---

## 8. Professional Value

This assignment demonstrates the analyst's ability to work **before** an incident — and specifically to operate in the context of **real triggering events** rather than a vacuum. The peer incident, CERT warning, internal discovery, and ongoing phishing campaign are the kind of inputs that a real analyst receives continuously. The ability to synthesize these into a coherent threat model and prioritized detection program is the defining skill of a mature CTI function.

---

## 9. Common Mistakes

1. **Ignoring trigger events** — treating the assignment as generic threat modeling without incorporating the peer incident and CERT warning
2. **Not addressing NetworkPro as an immediate priority** — treating it as a backlog item rather than an active open exposure
3. **INCD-CID compliance as a checkbox** — listing Articles without mapping them to specific detection gaps
4. **Roadmap without sprint capacity** — proposing 20 rules in Sprint 1 when the team can do 6–8
5. **Crown jewels without government contract context** — the public announcement of the government contract changes the threat profile; this must be addressed
6. **No pre-requisite tracking** — several detections require log sources to be enabled first; proposing the detection without the pre-requisite is not actionable

---

## 10. Portfolio Value

This assignment demonstrates the ability to do **real proactive CTI** in a constrained, complex environment. The combination of:
- Trigger event incorporation
- INCD-CID regulatory integration
- Capacity-constrained roadmap
- Supply chain risk assessment (NetworkPro)
- Multi-cloud visibility gaps

...produces a portfolio deliverable that shows a hiring manager that you understand how security programs actually operate — with budget, team capacity, regulatory deadlines, and real-world complicating factors. Present D11 (Executive Brief for Board) + D7 (Detection Backlog with sprint assignments) + D12 (INCD-CID Compliance Gap Assessment) as a set.
