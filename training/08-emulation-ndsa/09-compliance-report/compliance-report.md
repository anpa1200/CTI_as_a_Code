# Compliance Report — NDSA Annual Detection Validation 2026

**Report ID:** COMP-2026-008  
**Classification:** CONFIDENTIAL — INCD CHANNEL  
**Organization:** National Digital Services Authority (NDSA)  
**Regulatory framework:** INCD-CID Section 8 (Annual Detection Validation for CII operators)  
**Exercise date:** 2026-01-20  
**Report date:** 2026-02-03  
**INCD notification code:** INCD-2026-SEC8-0017  
**Status: COMPLIANT WITH CONDITIONS**

---

## Exercise Summary

| Metric | Value |
|---|---|
| Source threat intelligence | A05: March 2025 NDSA eID breach; A06: GovID 2.0 pre-launch assessment (A06) |
| Techniques identified | 15 |
| Techniques emulated | 11 (4 excluded with justification) |
| PASS | 6 (55%) |
| PARTIAL | 2 (18%) |
| FAIL (gaps confirmed) | 3 (27%) |
| Pass + Partial rate | 73% (8/11) — meets INCD ≥70% threshold |
| P1 gaps identified | 4 (requiring remediation plans) |
| P1 gaps with documented remediation plan | 4 (100%) |
| P1 gap remediation deadline | 60 days from report date (2026-04-03) |

---

## Compliance Assessment

### INCD-CID Section 8 Requirements

| Requirement | Assessment | Evidence |
|---|---|---|
| Annual detection validation exercise conducted | **Met** | Exercise conducted 2026-01-20; 11 modules executed per INCD-2026-SEC8-0017 |
| Exercise based on current threat intelligence (≤12 months) | **Met** | March 2025 breach (A05, 10 months prior); A06 GovID 2.0 assessment (3 months prior) |
| Pre-notification submitted ≥5 business days prior | **Met** | Submitted 2026-01-13 by Col. Nativ; acknowledged by Lt. Col. Friedman |
| Results documented with pass/fail per technique | **Met** | VECTR exercise record PROJ-2026-008; coverage matrix and execution log |
| Classified segment scope acknowledged and documented | **Met** | GOVNET Classified excluded; theoretical analysis submitted; INCD guidance requested |
| Gaps identified and remediation plan documented | **Met** | 4 P1 gaps; all have documented remediation with deadlines |
| P1 remediation deadline ≤60 days | **Condition** | Remediation plan accepted; deadline 2026-04-03 |
| CISO signature | **Pending** — awaiting Col. Nativ signature |
| INCD Liaison countersignature | **Pending** — awaiting Lt. Col. Friedman acknowledgment |

**Status: COMPLIANT WITH CONDITIONS**  
Full compliance requires: (1) CISO and INCD Liaison signatures; (2) P1 gap remediation completed within 60 days; (3) P1 gap re-test confirming remediation effectiveness submitted to INCD.

---

## Key Findings

### Finding 1 (CRITICAL): Zero Detection Coverage for Data Exfiltration

The most critical gap is the absence of large-volume outbound HTTPS exfiltration detection — **the same gap that allowed 340,218 biometric records to leave NDSA in the March 2025 incident**. In that attack, 413 MB was exfiltrated in 8 chunks over 78 minutes with zero detection. This exercise confirms the gap persists 10 months later.

**Root cause:** No NetFlow or Zeek log source connected to Elastic SIEM; no volume threshold rule deployed. Both are required.

**Remediation:** Enable NetFlow export from VRID-SRV-01 and GovID 2.0 frontend nodes → ingest into Elastic → deploy threshold aggregation rule: sum(network.bytes_toserver) > 200 MB per source IP per 6 hours to non-approved ASN. Estimated: 5 engineering days.

**Compensating control until fixed:** Manual weekly review of top-N outbound connections by byte volume from VRID-SRV-01 by SOC analyst.

---

### Finding 2 (HIGH): HKCU Registry Persistence Invisible — Same Sysmon Architectural Gap as 04-emulation-techpay

User-level registry persistence via HKCU Run keys generates zero alert. This is an architectural gap in Sysmon configuration, not a rule logic error. The rule (GOV-DET-007) correctly queries EID 13 for HKCU paths, but Sysmon never generates those events. An adversary with user-level access (no admin rights) can achieve persistence that is completely invisible to NDSA's detection stack.

**Relevance to March 2025 incident:** The actor entered via contractor credentials (a.halevi — not an admin account). The HKCU vector is directly applicable to the contractor threat model confirmed in A05.

**Remediation:** Update Sysmon configuration XML to add HKCU paths to EID 13 filter; submit MATZBEN CAB change request CR-2026-CTI-001; test on lab host; roll out to all monitored endpoints. Estimated: 3 engineering days + CAB window.

---

### Finding 3 (HIGH): Two Draft Detection Rules Not Yet Deployed (GOV-DET-006, GOV-DET-007)

GOV-DET-006 (GovID 2.0 bulk API extraction — T1530) and GOV-DET-007 (vendor token abuse from non-approved IP — T1078.003) remain undeployed pending CAB approval and log pipeline work. These rules address the A06 threat scenarios directly. BiometricTech API probing at 2,400 calls/day (TRG-004) identified in A06 remains undetected in production.

**Remediation:** Approve CAB CR-2026-CTI-001 items for GOV-DET-006 and GOV-DET-007. Pipeline work: connect GovID API logs to Elastic (3 engineering days); deploy rules. Total: 5 engineering days.

---

### Finding 4 (MEDIUM): Two Deployed Rules Have Field Mapping Bugs

GOV-DET-002 (RDP lateral movement) and GOV-DET-003 (BITS job) both fire correctly but are missing critical context fields — `logon_type` for RDP and `src_host` for BITS. Both are caused by the same Elastic ingest pipeline field name mismatch (Winlogbeat `agent.hostname` vs. `host.name`). SOC analysts cannot immediately identify affected hosts or confirm logon type without manual investigation.

**Remediation:** One Elastic ingest pipeline processor alias fix covers both rules simultaneously. Estimated: 2 engineering hours. No CAB required (SIEM config only).

---

## Highest-Risk Undetected Attack Chain

A complete kill chain using only undetected or partially-detected techniques is possible today:

1. T1557 AiTM session capture (not detectable at current layer) → **Gap / not emulated**
2. T1133 off-hours VPN from non-corporate ASN → **PASS** (detected at 2 min)
3. T1087.002 domain discovery commands → **Gap (no rule)**
4. T1021.001 RDP lateral movement → **PARTIAL** (fires but slow + missing logon_type)
5. T1547.001 HKCU Run key persistence → **Gap (Sysmon arch)**
6. T1041 HTTPS exfiltration volume → **Gap (no rule)**

An adversary completing steps 3, 5, and 6 generates **zero alerts**. Steps 4 produces a partial alert that is delayed 28 minutes and missing context fields. Only steps 1–2 (if entry vector is detected) provide early warning. This is structurally identical to the March 2025 kill chain.

---

## Remediation Plan

| ID | Gap | ATT&CK | Priority | Owner | Deadline | Compensating Control | Status |
|---|---|---|---|---|---|---|---|
| GAP-001 | Exfil volume rule (NetFlow + threshold) | T1041 | P1 | SOC Engineering | 2026-04-03 | Manual weekly NetFlow review | Open |
| GAP-002 | HKCU registry Sysmon config + rule | T1547.001 | P1 | IT Operations | 2026-04-03 | HKLM monitoring + service install alerts as proxy | Open |
| GAP-003 | GOV-DET-006 bulk API rule + pipeline | T1530 | P1 | SOC Engineering | 2026-03-06 (+30 days) | BiometricTech daily manual API report | Open |
| GAP-004 | GOV-DET-007 vendor token + BiometricTech IP binding | T1078.003 | P1 | SOC Eng + BiometricTech | 2026-03-06 (+30 days) | 185.220.101.47 blocked at perimeter | Open |
| GAP-005 | Net.exe domain discovery rule | T1087.002 | P2 | SOC Engineering | 2026-04-03 | None | Open |
| GAP-006 | RDP + BITS ingest pipeline field mapping | T1021.001, T1197 | P2 | SOC Engineering | 2026-03-06 | Manual log lookup | Open |

---

## Classified Segment Note

GOVNET Classified Segment detection techniques were not validated due to the absence of a certified lab equivalent. This gap is acknowledged and documented. A theoretical coverage analysis was completed (see coverage matrix). NDSA formally requests INCD guidance on whether classified-segment detection validation can be conducted under INCD exercise authority in the 2027 annual cycle.

---

## Vendor Security Requirements Letter

A contractor security requirements notice has been issued to HavayaIT Systems Ltd. requiring the following within 90 days (deadline: 2026-04-20):

1. Mandatory MFA on all NDSA-access accounts — no exemptions; attestation required
2. DLP policy preventing credential self-forwarding to personal accounts
3. Phishing awareness training for all personnel with NDSA contractor access
4. Pre-commit secret scanning on all repositories used for NDSA work

Non-compliance will result in suspension of contractor VPN access per Clause 14.3 of the HavayaIT Service Agreement.

---

## Signatures

**CTI Lead / Exercise Lead:** Shai Rotenberg, NDSA — _______________ Date: ___________

**CISO:** Col. (Res.) Dror Nativ, NDSA — _______________ Date: ___________

**INCD Liaison:** Lt. Col. (Res.) Oren Friedman, INCD — _______________ Date: ___________

**CyberShield Ltd. Exercise Lead:** _______________ Date: ___________
