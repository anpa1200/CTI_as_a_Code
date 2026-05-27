# Technical Brief — CEDAR-SIGNAL Threat Assessment

**Product ID:** TAC-2024-002  
**Classification:** TLP:AMBER  
**Prepared for:** CelltronX Security Team / SOC / NOC  
**Date:** 2024-10-15

---

## Threat Summary

**Actor**: CEDAR-SIGNAL (Iranian-nexus; high confidence)  
**Current activity**: Active targeting of Israeli telecom sector via contractor supply chain  
**Immediate risk to CelltronX**: High — ENM CVE-2023-44481 unpatched; 3 lookalike domains live; same contractor access model as confirmed victim

---

## Attack Scenarios

### SCN-001: Contractor Compromise → NMS/SS7 Access (HIGH risk)

**Attack path**:
1. AiTM phishing against NOC contractor employee via ISO dropper lure (TRG-001 confirms active)
2. Contractor VPN logon off-hours from non-corporate ASN using captured session token
3. RDP from contractor DMZ to ENM/NetAct management platform
4. SS7 MAP queries for targeted subscribers (SIGINT collection)
5. OR: Exploit CVE-2023-44481 on unpatched ENM v21.4.8 (no credential required)

**Key ATT&CK techniques**: T1566.001, T1557, T1190, T1078.002, T1021.001, T1040, T1048.003

### SCN-002: Billing API Credential Abuse (HIGH risk)

**Attack path**:
1. Stolen billing API credentials (from compromised developer or code repository)
2. Authenticated API calls to billing system — bulk subscriber record extraction
3. No rate limiting; no source IP restriction; attacks blend with legitimate maintenance

**Key ATT&CK techniques**: T1078.003, T1530, T1048

---

## Detection Status

| Rule | Technique | Status | Note |
|---|---|---|---|
| DET-001: Contractor VPN off-hours | T1133 + T1557 | Ready to deploy | Deploy Sprint 1 |
| DET-002: Contractor DMZ→NMS RDP | T1021.001 | Ready to deploy | Deploy Sprint 1 |
| DET-003: Billing API bulk query | T1078.003 | **BLOCKED** | Billing logs not in SIEM |
| DET-004: LSASS comsvcs | T1003.001 | Ready to deploy | Deploy Sprint 1 |
| DET-005: NMS config change | T1565.001 | **BLOCKED** | NMS logs not in SIEM |
| DET-008: ENM auth failure spike | T1190 | Ready to deploy | Deploy Sprint 1 |

**Overall coverage**: 0/7 active at assessment date (0%) → 4/7 after Sprint 1 (57%)  
**Highest-risk undetected**: T1040 SS7 MAP (architectural gap; no log source exists)

---

## Recommended Actions for Security Team

| Priority | Action | Effort | Owner |
|---|---|---|---|
| P1 — Immediate | Block 3 lookalike domains | 1h | SOC |
| P1 — Immediate | Deploy DET-001, DET-002, DET-004, DET-008 | 1 day | SOC |
| P1 — Emergency | Patch ENM CVE-2023-44481 | 2+ weeks | NOC Engineering |
| P1 — 30 days | Ingest billing API logs; deploy DET-003 | 2 weeks | SOC Engineering |
| P2 — 60 days | Ingest NMS audit logs; deploy DET-005 | 3 weeks | NOC + SOC Engineering |

---

## IOCs for Monitoring

| Type | Value | Confidence | Source | Action |
|---|---|---|---|---|
| Domain | `celltronx-noc-portal[.]com` | High | TRG-003 | Block DNS + email |
| Domain | `celltronx-it-helpdesk[.]net` | High | TRG-003 | Block DNS + email |
| Domain | `celltronx-enm-update[.]com` | High | TRG-003 | Block DNS + email |
| IP range | See TRG-001 for CEDAR-SIGNAL infrastructure | High | CERT-IL TRG-001 | Monitor only (do not block ranges) |
