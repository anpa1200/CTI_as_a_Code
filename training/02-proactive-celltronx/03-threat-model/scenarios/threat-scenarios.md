# Threat Scenarios — PROJ-2024-002

**Classification:** TLP:AMBER

---

## Risk Summary Matrix

| Scenario | Crown Jewel | Likelihood | Impact | Risk | Priority |
|---|---|---|---|---|---|
| SCN-001: Contractor compromise → NMS | CJ-002, CJ-004 | **High** | Critical | **HIGH** | P1 |
| SCN-002: Billing API credential abuse | CJ-001 | Medium | Critical | **HIGH** | P1 |
| SCN-003: PM Office connectivity disruption | CJ-003 | Low | Critical | Medium | P2 |

---

### SCN-001: NOC Contractor Account Compromise → NMS/ENM Access

**Trigger basis**: TRG-001, TRG-002  
**Crown jewel targeted**: CJ-002 (NMS), CJ-004 (SS7), CJ-006 (Contractor creds)  
**Likelihood**: High — same vendor access model as confirmed TRG-002 victim  
**Impact**: Critical  
**Risk**: HIGH

**Attack narrative**:  
CEDAR-SIGNAL compromises a NOC contractor employee's account via AiTM phishing (ISO dropper lure per TRG-001). The contractor's account has privileged ENM access for maintenance operations. Using those credentials, the attacker connects to CelltronX's contractor VPN from a residential VPN exit node outside business hours and accesses the Ericsson ENM platform — either via stolen credentials or by exploiting CVE-2023-44481 on the unpatched v21.4.8 instance. Initial objective is SS7 MAP query collection on targeted subscribers; secondary objective is persistent access for future disruption of PM Office connectivity.

**ATT&CK techniques**:
| Phase | Technique ID | Name |
|---|---|---|
| Initial Access | T1566.001 | Spearphishing Attachment (ISO lure) |
| Credential Access | T1557 | Adversary-in-the-Middle (AiTM) |
| Initial Access | T1190 | Exploit Public-Facing Application (CVE-2023-44481) |
| Persistence | T1078.002 | Valid Accounts — Domain Accounts |
| Lateral Movement | T1021.001 | RDP (contractor DMZ → NMS segment) |
| Collection | T1040 | Network Sniffing (SS7 MAP queries) |
| Exfiltration | T1048.003 | Exfiltration over DNS TXT |

**Current detection coverage**:
| Technique | Rule | Status |
|---|---|---|
| T1557 AiTM | None | **FAIL — no rule** |
| T1190 CVE-2023-44481 | None | **FAIL — no WAF rule; patch not applied** |
| T1078.002 off-hours VPN | DET-001 (to deploy) | **GAP — not yet deployed** |
| T1021.001 RDP | Partial rule | PARTIAL — 30-min delay |
| T1040 SS7 MAP | None | **FAIL — SS7 MAP not logged** |
| T1048.003 DNS TXT | None | **FAIL — DNS TXT not monitored** |

**Control gaps**:
1. ENM CVE-2023-44481 unpatched — direct exploitation possible without credential compromise
2. SS7 MAP queries are not logged or monitored; adversary can collect data invisibly once NMS access obtained
3. DNS TXT exfiltration completely unmonitored

---

### SCN-002: Billing API Credential Abuse → Subscriber Record Extraction

**Trigger basis**: TRG-001 (CERT-IL billing data targeting), TRG-004 (CEDAR-SIGNAL financial/billing interest)  
**Crown jewel targeted**: CJ-001 (Subscriber billing records)  
**Likelihood**: Medium  
**Impact**: Critical (4.2M records; TASE-listed company)  
**Risk**: HIGH

**Attack narrative**:  
Using stolen billing system API credentials (obtained from a compromised developer laptop or code repository — consistent with CERT-IL patterns), the adversary makes authenticated API calls to CelltronX's billing system. Queries are structured to extract subscriber records in bulk while remaining below any volume thresholds. The billing system has no rate limiting on API endpoints used by contractors. Attack proceeds silently over multiple days as the API calls are indistinguishable from legitimate maintenance queries.

**ATT&CK techniques**:
| Phase | Technique ID | Name |
|---|---|---|
| Initial Access | T1078.003 | Valid Accounts — Cloud Accounts (API creds) |
| Collection | T1530 | Data from Cloud Storage (billing system) |
| Exfiltration | T1048 | Exfiltration Over Alternative Protocol |

**Current detection coverage**:
| Technique | Rule | Status |
|---|---|---|
| T1078.003 API credential abuse | None | **FAIL — billing API logs not in SIEM** |
| T1530 bulk data access | None | **FAIL — no volume anomaly rule** |

**Control gaps**:
1. Billing API logs not ingested into SIEM — primary blocker
2. No rate limiting on API endpoints
3. No IP allowlisting on billing API access

---

### SCN-003: NMS Configuration Change → PM Office Connectivity Disruption

**Trigger basis**: TRG-004 (CEDAR-SIGNAL disruption capability)  
**Crown jewel targeted**: CJ-003 (PM Office contract)  
**Likelihood**: Low — requires successful SCN-001 as prerequisite  
**Impact**: Critical (national security; non-replaceable contract)  
**Risk**: Medium

**Attack narrative**:  
Having established persistent access via SCN-001, the adversary identifies network segments serving the PM Office connectivity contract. A targeted BGP route manipulation or firewall ACL modification causes selective connectivity disruption to PM Office government services. The change is designed to appear as a hardware fault. Timing is opportunistic — coincides with a politically sensitive event to maximize impact.

**ATT&CK techniques**:
| Phase | Technique ID | Name |
|---|---|---|
| Impact | T1565.001 | Data Manipulation: Stored Data (NMS configuration) |
| Impact | T1498 | Network Denial of Service |

**Control gaps**:
1. NMS configuration audit logs not in SIEM
2. No change-window enforcement on NMS write operations
3. No integrity monitoring on routing configuration
