---
title: A08 — Emulation (Gov) — NDSA INCD Section 8
sidebar_position: 9
---

# A08 — Adversary Emulation (Gov): NDSA INCD Section 8

**Mode:** Emulation · **Org:** NDSA · **PROJ-2026-008**

## Scenario

INCD-CID Section 8 requires annual detection validation for critical national infrastructure. NDSA's first annual exercise validates the GovID 2.0 and VRID detection stack against [Iranian-nexus](https://anpa1200.github.io/israel-government-threat-actors-cti/) tradecraft drawn from the [A05](/CTI_as_a_Code/training/reactive-ndsa/) breach, CERT-IL CB-2025-041, and Operation Desert Cipher. You have pre-notification filed with INCD (code INCD-2026-SEC8-0017), MATZBEN Security Officer approval per module, and a CAB-approved change window. Execute 11 modules, track PASS/PARTIAL/FAIL, and produce a BoI-CD 362 Section 8 compliance report.

**Lab environment:** JUMPHOST-CONTRACTOR-LAB · VRID-LAB-SRV · CyberShield Ltd. red team

## Exercise Results

| Module | Technique | Result |
|---|---|---|
| MOD-01 | T1133 Contractor VPN off-hours / Turkish residential ASN | **PASS** (2 min) |
| MOD-02 | T1087.002 Domain discovery (`net user /domain`) | **FAIL — gap confirmed** |
| MOD-03 | T1021.001 RDP lateral movement | **PARTIAL** (28 min; logon_type field absent) |
| MOD-04 | T1003.001 LSASS comsvcs.dll GrantedAccess 0x1410 | **PASS** (3 min; FP suppression correct) |
| MOD-05 | T1197 BITS job to non-Microsoft ASN | **PARTIAL** (9 min; src_host null) |
| MOD-06 | T1543.003 Service from non-standard path (`C:\Windows\Temp\`) | **PASS** (4 min) |
| MOD-07 | T1547.001 HKCU registry Run key | **FAIL — Sysmon architectural gap** |
| MOD-08 | T1005 VRID full-table SELECT by maintenance account | **PASS** (3 min) |
| MOD-09 | T1041 HTTPS exfiltration volume (100 MB / 8 chunks) | **FAIL — no rule deployed** |
| MOD-10 | T1059.001 PowerShell `-EncodedCommand` | **PASS** (1 min) |
| MOD-11 | T1070.001 Log clear via wevtutil | **PASS** (1 min) |

**Summary: 6 PASS / 2 PARTIAL / 3 FAIL · DeTT&CT score: 1.56 / 3.0 · Compliance: COMPLIANT WITH CONDITIONS**

## Key Gaps Found

| Gap | ATT&CK | Root Cause | INCD Risk | Priority |
|---|---|---|---|---|
| No exfiltration volume rule | T1041 | No NetFlow/Zeek source in [Elastic SIEM](/CTI_as_a_Code/services/elastic-siem); no threshold rule | Yes — 413 MB exfiltrated in A05 undetected | P1 |
| HKCU registry not monitored | T1547.001 | Sysmon EID 13 covers HKLM only | Yes — contractor-level persistence invisible | P1 |
| GOV-DET-006 biometric bulk API not deployed | T1530 | CAB CR not submitted before exercise | Yes — core GovID 2.0 threat unvalidated | P1 |
| GOV-DET-007 API rate limit bypass not deployed | T1110 | CAB CR not submitted before exercise | Yes | P1 |
| No domain discovery rule | T1087.002 | net.exe rule missing; data source exists | No | P2 |
| RDP logon_type field missing | T1021.001 | Elastic ingest pipeline field mapping bug | No | P2 |
| BITS src_host null | T1197 | agent.hostname vs host.name field mismatch | No | P2 |

## Government-Specific Constraints

| Constraint | Impact on Exercise |
|---|---|
| MATZBEN change control (5-day CAB) | GOV-DET-006/007/008/009 not live before exercise — tested as FAIL or theoretical |
| Security Officer pre-approval per module (Maj. Cohen) | Plain-language technique descriptions required; sensitive techniques (LSASS, log clear) require safety analysis |
| INCD pre-notification mandatory | 5 business days before exercise; INCD-2026-SEC8-0017 filed |
| No classified segment lab | GOVNET Classified Segment results marked "theoretical coverage only — not validated" |
| CyberShield clearance limitations | Lab environment only; no production PAM access |

## Assignment Deliverables

1. **Pre-emulation authorization package** — INCD notification; MATZBEN Security Officer approval forms; safety measures per module
2. **TTP extraction table** — 14 TTPs from composite Iranian-nexus profile; 3 excluded with justification
3. **11-module emulation plan** — per-module: ATT&CK, detection under test, commands, pass criteria, plain-language description
4. **Execution log** — timestamped results 2026-01-20; anomaly observations; post-exercise cleanup checklist
5. **Coverage matrix** — DeTT&CT 1.56/3.0; source column (A05 timeline event / A06 trigger); [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) layer
6. **Gap backlog** — 7 gaps; root cause; remediation; effort estimate; INCD risk classification
7. **INCD Section 8 compliance report** — status: COMPLIANT WITH CONDITIONS; HavayaIT vendor security requirements; 90-day remediation plan

## Key Learning Objectives

- Execute MOD-11 (wevtutil log clear) last — it destroys evidence of all prior modules; capture VECTR results first
- Distinguish three FAIL types: rule missing (data source exists), data source missing (architectural gap), rule not deployed (CAB not submitted in time)
- Write MATZBEN-compliant technique descriptions that a non-technical Security Officer will approve
- Calculate DeTT&CT composite score from a mixed PASS/PARTIAL/FAIL set
- Explain why PARTIAL (logon_type field absent) matters: an investigator cannot confirm RDP vs. network logon without manual lookup — a 5–10 minute response delay in a government incident
- Draft a compliance conclusion that is honest about P1 gaps while meeting INCD ≥70% PASS+PARTIAL threshold

## Cross-Links

- **Detection engineering methodology:** [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/cti-to-detection/intelligence-to-detection/)
- **ATT&CK usage:** [Field Manual — MITRE ATT&CK as Working Tool](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/frameworks/mitre-attack-as-working-tool/)
- **Same TTPs in private sector emulation:** [A04 — Operation Desert Cipher TechPay](./04-emulation-techpay.md)
- **Detections under test built in:** [A06 — Proactive GovID 2.0](./06-proactive-govid2.md)
- **Incident that sourced the TTPs:** [A05 — NDSA Reactive IR](./05-reactive-ndsa.md)
- **Iranian-nexus actor context:** [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)

---

## Continue in the ecosystem

- [Full ecosystem](/CTI_as_a_Code/ecosystem) — tools and integrations used in this lab
- [Step-by-step methodology](/CTI_as_a_Code/cti-as-a-code-methodology) — the analytical framework behind every case
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — all published projects and case work

## Critical Execution Note

**MOD-11 (wevtutil log clear) must run last.** It clears the Security, System, and Application Windows event logs on VRID-LAB-SRV. All prior module results must be captured in VECTR and the execution log before MOD-11 executes. After MOD-11, forensic recovery of earlier test results from the lab host is not possible.
