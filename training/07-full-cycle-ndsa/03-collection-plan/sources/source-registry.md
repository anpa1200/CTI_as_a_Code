# Source Registry — PROJ-2025-007 (NDSA CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2025-10-01

---

## Internal Sources

| ID | Source | Description | PIRs | Admiralty S | Status |
|---|---|---|---|---|---|
| INT-001 | NDSA Elastic SIEM | VPN logs, PAM session records, Winlogbeat (VRID-SRV-01, JUMPHOST), NetFlow | PIR-002, PIR-004, PIR-005 | A | Active |
| INT-002 | CyberArk PAM | Full session recordings for all privileged contractor sessions | PIR-004, PIR-005 | A | Active |
| INT-003 | VRID 2.0 DB audit logs | All queries to citizen_records table; anomaly baseline established post-A05 | PIR-005, SIR-003 | A | Active |
| INT-004 | GovID 2.0 API logs (AWS GovCloud) | Authentication events, API call patterns, token usage | PIR-005, SIR-003 | A | **Not yet in SIEM — pipeline in progress** |

---

## Government Sources

| ID | Source | Description | PIRs | Admiralty S | Classification | Status |
|---|---|---|---|---|---|---|
| EXT-GOV-001 | INCD advisories via Lt. Col. Friedman | Classified threat advisories; GovID-specific warnings | PIR-002, PIR-004, PIR-005 | A | TLP:RED / Secret | Active (informal); formal process pending |
| EXT-GOV-002 | CERT-IL MISP (TLP:AMBER feed) | Israeli government sector threat indicators; TAXII 2.1 | PIR-001, PIR-002, SIR-001 | A | TLP:AMBER | **MOU not signed — P1 action** |
| EXT-GOV-003 | CERT-IL public advisories | Public-facing bulletins; subset of MISP content | PIR-001 | A | UNCLASSIFIED | Active |
| EXT-GOV-004 | INCD-CID publications | Regulatory circulars; compliance guidance | PIR-003 | A | UNCLASSIFIED | Active |

---

## Commercial Sources

| ID | Source | Description | PIRs | Admiralty S | Cost | Status |
|---|---|---|---|---|---|---|
| EXT-COM-001 | Commercial threat intel platform | Israeli government sector actor tracking; infrastructure monitoring | PIR-001, -002, -005 | B | ₪180K/year | **Not procured — Q2 2026** |
| EXT-COM-002 | Domain monitoring service | Lookalike domain detection for GovID / NDSA brands | SIR-004 | B | ₪40K/year | **Not procured — Q2 2026** |

---

## Open Source / OSINT

| ID | Source | Description | PIRs | Admiralty S | Status |
|---|---|---|---|---|---|
| OSINT-001 | ClearSky Cyber Security reports | Israeli threat actor research; Iranian-nexus activity tracking | PIR-001, PIR-002 | B | Active (manual monthly) |
| OSINT-002 | Check Point Research | Regional threat reports; Iranian APT tracking | PIR-001 | B | Active (manual monthly) |
| OSINT-003 | NVD / CERT-IL CVE feed | Vulnerability tracking for NDSA/BiometricTech technology stack | PIR-004 | A | Active |
| OSINT-004 | Shodan | BiometricTech and HavayaIT exposed infrastructure monitoring | PIR-004 | B | Active (quarterly manual check) |

---

## Peer / Sharing Partners

| ID | Source | Description | PIRs | Admiralty S | Status |
|---|---|---|---|---|---|
| PARTNER-001 | ITA (Israel Tax Authority) peer sharing | HavayaIT cross-agency activity correlation | PIR-004 | A | **MOU not signed — P2** |
| PARTNER-002 | MoI (Ministry of Interior) — outbound only | Sanitized weekly GovID threat summary | SIR-003 | N/A | Active (one-directional; outbound) |

---

## Source Health

| Source | Last Ingest | Gap | Action Needed |
|---|---|---|---|
| EXT-GOV-002 (CERT-IL MISP) | Never | **Entire program duration** | Sign MOU — P1; deadline Feb 2026 |
| INT-004 (GovID API logs) | Never | Entire program duration | Build Elastic log pipeline — deadline March 2026 |
| PARTNER-001 (ITA) | Never | Entire program duration | Sign ITA MOU — deadline March 2026 |
| INT-001 (Elastic SIEM) | Current | None | Active |
| EXT-GOV-001 (INCD via Friedman) | Current | Informal only | Formalize downgrade process — deadline Nov 2025 |
