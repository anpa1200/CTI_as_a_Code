# Coverage Matrix — PROJ-2024-004 (Operation Desert Cipher)

**Date:** 2024-11-20  
**Exercise:** Operation Desert Cipher Detection Validation

---

## Full Coverage Matrix

| # | Technique | System | Rule | Emulation | Coverage | Gap Priority |
|---|---|---|---|---|---|---|
| 1 | T1566.001 Spearphishing | Email GW | Email GW policy | Not emulated | Partial (GW blocks EXE; macros not blocked) | P2 |
| 2 | T1059.001 PowerShell encoded | All | DET-PS-001 | **PASS** | Full | — |
| 3 | T1557 AiTM session capture | VPN GW | DET-001 (proxy only) | Not emulated | Partial (VPN ASN rule; not true AiTM detection) | P1 |
| 4 | T1133 VPN off-hours from external | VPN GW | DET-001 | **PASS** | Full | — |
| 5 | T1087.002 Domain user enumeration | Domain-joined hosts | NONE | **FAIL (gap)** | Gap | P2 |
| 6 | T1016 Network config discovery | Entry host | NONE | **FAIL (gap)** | Gap | P3 |
| 7 | T1018 Remote system discovery | Entry host | NONE | **FAIL (gap)** | Gap | P3 |
| 8 | T1021.001 RDP lateral movement | DMZ → Ops | DET-LM-001 | **PARTIAL** | Partial (missing logon type field; 33-min delay) | P2 |
| 9 | T1003.001 LSASS comsvcs.dll | Target host | DET-LSASS-001 | **PASS** | Full | — |
| 10 | T1197 BITS job persistence | Target host | DET-BITS-001 | **PARTIAL** (src_host missing) | Partial | P2 |
| 11 | T1543.003 Service from non-std path | Target host | DET-SVC-001 | **PASS** | Full | — |
| 12 | T1547.001 Registry Run key HKCU | Target host | DET-REG-001 | **FAIL** (HKCU architectural gap) | Gap | P1 |
| 13 | T1005 Data from local system (DB) | DB host | DET-DB-001 | **PASS** | Full | — |
| 14 | T1041 + T1197 HTTPS Exfiltration | Network | NONE | **FAIL (gap)** | Gap | P1 |
| 15 | T1070.001 Log clear via wevtutil | All | DET-004 | **PASS** | Full | — |

---

## Coverage Summary

| Coverage Status | Count | Percentage |
|---|---|---|
| Full (PASS) | 6 | 40% of all TTPs |
| Partial (PARTIAL or not-emulated-partial) | 5 | 33% |
| Gap (FAIL or confirmed missing) | 4 | 27% |
| **Total techniques** | **15** | |

**Emulated only:**
- 6 PASS / 2 PARTIAL / 3 FAIL out of 11 emulated techniques
- Full coverage rate (emulated): **55% PASS, 18% PARTIAL, 27% FAIL**

---

## P1 Gaps (Must Fix)

| Gap | Technique | Risk |
|---|---|---|
| No exfiltration volume detection | T1041, T1197 | Adversary can exfil unlimited data over HTTPS undetected |
| HKCU registry Run key not monitored | T1547.001 | User-level persistence invisible; no admin rights needed |
| AiTM detection is proxy only (VPN ASN) | T1557 | True AiTM session capture not detectable at current layer |

---

## DeTT&CT Score (ATT&CK Technique Coverage)

| Score | Meaning | Count |
|---|---|---|
| 0 | No data source; not detectable | 2 |
| 1 | Data source exists; no rule | 3 |
| 2 | Rule exists but partial coverage or field bug | 4 |
| 3 | Full coverage; PASS confirmed | 6 |

**Overall DeTT&CT composite score: 1.7 / 3.0**
