---
title: A04 — Adversary Emulation — TechPay
sidebar_position: 5
---

# A04 — Adversary Emulation: TechPay (Operation Desert Cipher)

**Mode:** Emulation · **Org:** TechPay FinTech · **PROJ-2024-004**

## Scenario

TechPay's detection engineering team has deployed 8 rules based on the Operation Desert Cipher threat intelligence report (ClearSky; [Iranian-nexus](https://anpa1200.github.io/israel-government-threat-actors-cti/) attribution). Your job: prove they actually work. Extract TTPs from the campaign report, write a safe 11-module emulation plan, execute in the [lab platform](/CTI_as_a_Code/architecture), and produce a BoI-CD 362 Section 6 compliance report.

**Your entry point:** The CTI report is in `01-cti-report/operation-desert-cipher.md`. You have a lab environment with JUMPHOST-LAB, TARGET-LAB, and a CyberShield-controlled C2 server.

## Exercise Results

| Module | Technique | Result |
|---|---|---|
| MOD-01 | T1133 VPN off-hours / non-corporate ASN | **PASS** (3 min) |
| MOD-02 | T1087.002 Domain discovery | **FAIL — gap confirmed** |
| MOD-03 | T1021.001 RDP lateral movement | **PARTIAL** (33 min; logon_type field absent) |
| MOD-04 | T1003.001 LSASS comsvcs.dll | **PASS** (2 min; FP suppression correct) |
| MOD-05 | T1197 BITS job to external | **PARTIAL** (7 min; src_host null) |
| MOD-06 | T1543.003 Service from non-standard path | **PASS** (4 min) |
| MOD-07 | T1547.001 HKCU registry Run key | **FAIL — Sysmon architectural gap** |
| MOD-08 | T1005 DB full-table query | **PASS** (3 min) |
| MOD-09 | T1041 HTTPS exfiltration volume | **FAIL — no rule deployed** |
| MOD-10 | T1059.001 PowerShell encoded | **PASS** (1 min) |
| MOD-11 | T1070.001 Log clear via wevtutil | **PASS** (1 min) |

**Summary: 6 PASS / 2 PARTIAL / 3 FAIL · Compliance: COMPLIANT WITH CONDITIONS**

## Key Gaps Found

| Gap | ATT&CK | Root Cause | Priority |
|---|---|---|---|
| No exfiltration volume rule | T1041 | No NetFlow/Zeek source in [Elastic SIEM](/CTI_as_a_Code/services/elastic-siem); no threshold rule | P1 |
| HKCU registry not monitored | T1547.001 | Sysmon EID 13 config covers HKLM only | P1 |
| No domain discovery rule | T1087.002 | net.exe rule missing; data source exists | P2 |
| RDP logon_type field missing | T1021.001 | Elastic ingest pipeline field mapping bug | P2 |

## Assignment Deliverables

1. **Pre-emulation plan** — INCD-style authorization package with safety measures per module
2. **TTP extraction table** — 14 TTPs from report; excluded 3 with justification
3. **11-module emulation plan** — per-module: ATT&CK, detection under test, commands, pass criteria
4. **Execution log** — timestamped results; anomaly observations; post-exercise cleanup
5. **Coverage matrix** — DeTT&CT score per technique; P1/P2 gap priority; [ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/) layer
6. **Gap backlog** — 7 gaps with root cause, remediation, effort estimate, compensating controls
7. **BoI-CD 362 Section 6 compliance report** — status: COMPLIANT WITH CONDITIONS

## Key Learning Objectives

- Distinguish three FAIL types: rule missing, data source missing, architectural gap
- Write MOD-11 (log clear) last — it destroys evidence of all prior modules
- Explain LSASS GrantedAccess 0x1410 and why the FP suppression filter matters
- Calculate DeTT&CT composite score from a mixed PASS/PARTIAL/FAIL result set
- Draft a compliance report conclusion that is honest about gaps while meeting regulatory requirements

## Cross-Links

- **Detection engineering methodology:** [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/cti-to-detection/intelligence-to-detection/)
- **ATT&CK usage:** [Field Manual — MITRE ATT&CK as Working Tool](https://anpa1200.github.io/cti-analyst-field-manual/CTI_as_a_Code/frameworks/mitre-attack-as-working-tool/)
- **Same adversary pattern in government context:** [A08 — NDSA INCD Section 8 Emulation](./08-emulation-ndsa.md)
- **Iranian-nexus actor context:** [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)

---

## Continue in the ecosystem

- [Full ecosystem](/CTI_as_a_Code/ecosystem) — tools and integrations used in this lab
- [Step-by-step methodology](/CTI_as_a_Code/cti-as-a-code-methodology) — the analytical framework behind every case
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — all published projects and case work

## Critical Execution Note

**MOD-11 (wevtutil log clear) must run last.** It clears the Security, System, and Application Windows event logs on the lab host. All prior module results must be captured in VECTR before MOD-11 executes.
