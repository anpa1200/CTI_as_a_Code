# Trigger Intelligence Assessment — PROJ-2024-002

**Classification:** TLP:AMBER  
**Assessment date:** 2024-10-15

---

## Trigger Summary

| ID | Source | Type | Admiralty | Relevance | Urgency |
|---|---|---|---|---|---|
| TRG-001 | CERT-IL TA-2024-089 | Government advisory | A/2 | **High** | High |
| TRG-002 | Peer Israeli operator (anonymized) | Incident report | B/2 | **High** | High |
| TRG-003 | OSINT — DomainTools | Domain intelligence | C/2 | **High** | High |
| TRG-004 | NDSA sector threat-sharing | Threat actor profile | B/2 | **High** | Medium |

---

## Consolidated Threat Picture

An adversary assessed as CEDAR-SIGNAL (Iranian-nexus, high confidence) is actively conducting operations against Israeli telecommunications providers. The combination of four triggers — a government advisory, a confirmed peer incident, active domain registration targeting CelltronX brands, and a detailed threat actor profile showing 5 overlap criteria — creates a high-confidence threat picture that CelltronX is a current or near-term target.

**Critical convergence**: TRG-002 documents the exact attack path via a NOC contractor with ENM access. CelltronX uses the same contractor access model. TRG-003 confirms active pre-exploitation reconnaissance — 3 lookalike domains registered in the past 30 days targeting CelltronX NOC staff, ENM access, and IT helpdesk.

**Current adversary phase**: Pre-exploitation / initial access preparation. Domains are live; ENM vulnerability (CVE-2023-44481) is unpatched on CelltronX v21.4.8; NOC staff are receiving phishing lures per TRG-001.

---

## Threat Actor Assessment

**Primary actor**: CEDAR-SIGNAL  
**Confidence**: High — 4 corroborating triggers, named in CERT-IL advisory  
**Nexus**: Iranian state-directed  
**Objective**: SS7 subscriber intercept capability; subscriber location data; PM Office connectivity disruption capability

**Targeting rationale for CelltronX**:
1. Israeli Tier-1 operator — SS7 signaling access covers all 4.2M subscribers
2. PM Office connectivity contract — strategic political disruption value
3. ENM v21.4.8 unpatched on CVE-2023-44481 — confirmed exploitable entry point per TRG-001
4. Same NOC contractor access model as TRG-002 victim
5. TASE-listed — financial disruption secondary objective

---

## Key TTPs from All Triggers

| Technique ID | Name | Reported By | In Our Environment? | Detection Coverage |
|---|---|---|---|---|
| T1566.001 | Spearphishing Attachment (ISO lure) | TRG-001 | Yes — NOC staff receive external email | None |
| T1190 | Exploit Public-Facing Application (CVE-2023-44481) | TRG-001 | **Yes — ENM v21.4.8 unpatched** | None |
| T1557 | Adversary-in-the-Middle (AiTM) | TRG-001, TRG-002 | Yes — contractor VPN uses TOTP | None |
| T1078.002 | Valid Accounts — Domain Accounts | TRG-002 | Yes — contractor accounts | Partial (off-hours only) |
| T1021.001 | RDP lateral movement | TRG-002 | Yes | Partial (30-min delay) |
| T1040 | Network Sniffing (SS7 MAP) | TRG-002 | Yes — SS7 access via NMS | None |
| T1048.003 | Exfil via DNS TXT | TRG-002 | Yes — DNS TXT not monitored | None |

---

## Priority Actions

> **72 hours** (before full assessment complete):

1. Block 3 lookalike domains (TRG-003) at DNS and email gateway immediately
2. Brief NOC team on ISO dropper lure (TRG-001) — do not open ISO attachments from external sources
3. Initiate emergency ENM patching request with Ericsson for CVE-2023-44481 (acknowledge MATZBEN lead time)
4. Verify NOC contractor VPN access audit — are all active accounts still required?

> **Roadmap** (30+ days):

1. Deploy contractor VPN off-hours detection rule
2. Configure SS7 MAP query logging and alerting
3. Implement DNS TXT exfiltration monitoring
