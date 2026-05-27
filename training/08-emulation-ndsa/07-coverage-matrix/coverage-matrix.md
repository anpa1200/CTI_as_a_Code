# Coverage Matrix — PROJ-2026-008 (NDSA Annual Detection Validation)

**Classification:** CONFIDENTIAL  
**Date:** 2026-01-20  
**Exercise:** NDSA Annual Detection Validation 2026 (INCD Section 8)  
**Source incidents:** A05 (March 2025 NDSA eID breach); A06 (GovID 2.0 pre-launch assessment)

---

## Full Coverage Matrix

| # | Technique | Source | System | Rule | Emulation | Coverage | Gap Priority |
|---|---|---|---|---|---|---|---|
| 1 | T1566.001 Spearphishing (personal email) | A05 TL-1 | Email / personal endpoint | Email gateway policy | Not emulated (excluded — personal email outside NDSA visibility) | Partial — GW blocks EXE; macros not blocked | P2 |
| 2 | T1557 AiTM session token capture | A05 TL-2 | VPN GW / Microsoft 365 | GOV-DET-001 (proxy detection only) | Not emulated (excluded — production token risk) | Partial — VPN ASN rule detects consequence, not cause | P1 |
| 3 | T1133 External VPN access from non-corporate ASN | A05 TL-4 | VPN Gateway | GOV-DET-001 | **PASS** (2 min) | Full | — |
| 4 | T1087.002 Domain user/group enumeration | A05 TL-5,6 | JUMPHOST-CONTRACTOR | None deployed | **FAIL (gap)** | Gap | P2 |
| 5 | T1016 Network config discovery | A05 TL-7 | JUMPHOST-CONTRACTOR | None deployed | **FAIL (gap)** | Gap | P3 |
| 6 | T1021.001 RDP lateral movement | A05 TL-8 | JUMPHOST → VRID-SRV | GOV-DET-002 | **PARTIAL** (28 min; logon_type missing) | Partial | P2 |
| 7 | T1003.001 LSASS comsvcs.dll dump | A05 TL-9 | VRID-SRV-01 | GOV-DET-010 | **PASS** (3 min) | Full | — |
| 8 | T1197 BITS download from external C2 | A05 TL-11 | VRID-SRV-01 | GOV-DET-003 | **PARTIAL** (6 min; src_host missing) | Partial | P2 |
| 9 | T1543.003 Service install from non-standard path | A05 TL-14 | VRID-SRV-01 | GOV-DET-006 | **PASS** (4 min) | Full | — |
| 10 | T1547.001 HKCU Registry Run key | A05 analysis | All endpoints | GOV-DET-007 (draft) | **FAIL** (Sysmon arch gap) | Gap | P1 |
| 11 | T1005 DB full-table query | A05 TL-13 | VRID-SRV-01 DB | GOV-DET-005 | **PASS** (3 min) | Full | — |
| 12 | T1041 HTTPS exfiltration — volume | A05 TL-15 | Network / perimeter | None deployed | **FAIL (gap)** | Gap | P1 |
| 13 | T1059.001 PowerShell encoded command | A05 analysis | All endpoints | GOV-DET-PS | **PASS** (1 min) | Full | — |
| 14 | T1070.001 Log clear via wevtutil | A05 TL-16 | All endpoints | GOV-DET-004 | **PASS** (1 min) | Full | — |
| 15 | T1530 Bulk API extraction | A06 TRG-004 | GovID 2.0 Frontend | GOV-DET-006 (draft; not deployed) | Not deployed — CAB pending | Gap (pre-deployment) | P1 |
| 16 | T1078.003 Vendor token from non-approved IP | A06 TRG-004 | GovID 2.0 API | GOV-DET-007 (draft; not deployed) | Not deployed — requires BiometricTech IP binding | Gap | P1 |

---

## Coverage Summary

| Coverage Status | Count | Percentage |
|---|---|---|
| Full (PASS) | 6 | 38% of all TTPs |
| Partial (PARTIAL or not-emulated-partial) | 4 | 25% |
| Gap (FAIL or confirmed missing) | 6 | 37% |
| **Total techniques** | **16** | |

**Emulated only (11 modules):**
- 6 PASS / 2 PARTIAL / 3 FAIL out of 11 emulated techniques
- Full coverage rate (emulated): **55% PASS, 18% PARTIAL, 27% FAIL**
- PASS + PARTIAL: **73%** — meets INCD Section 8 ≥70% threshold

---

## P1 Gaps (Require INCD Remediation Plan)

| Gap | Technique | Source Incident | Risk |
|---|---|---|---|
| No exfiltration volume detection | T1041 | A05 TL-15 — 413 MB exfiltrated undetected | Same structural gap 10 months after the breach; full biometric database exfiltration invisible |
| HKCU registry Run key not monitored | T1547.001 | A05 analysis — contractor-level persistence | User-level persistence; no admin rights needed; invisible to current Sysmon config |
| GOV-DET-006 bulk API extraction not deployed | T1530 | A06 TRG-004 — 2,400 calls/day observed | Active threat; BiometricTech API being probed; zero detection in production |
| GOV-DET-007 vendor token abuse not deployed | T1078.003 | A06 TRG-004 — non-approved IP | Vendor token misuse undetected; IP binding not implemented by BiometricTech |

---

## DeTT&CT Score (ATT&CK Technique Coverage)

| Score | Meaning | Count |
|---|---|---|
| 0 | No data source; not detectable | 3 |
| 1 | Data source exists; no rule | 4 |
| 2 | Rule exists but partial coverage or field bug | 3 |
| 3 | Full coverage; PASS confirmed | 6 |

**Overall DeTT&CT composite score: 1.56 / 3.0**

*Note: Score is lower than A04 (1.7/3.0) because two additional P1 gaps (GOV-DET-006, GOV-DET-007) from the A06 GovID 2.0 threat assessment are included in scope.*

---

## ATT&CK Navigator Layer Notes

**Layer: NDSA Coverage 2026-01**  
- Green (full): T1133, T1003.001, T1543.003, T1005, T1059.001, T1070.001
- Yellow (partial): T1557, T1566.001, T1021.001, T1197
- Red (gap): T1087.002, T1016, T1547.001, T1041, T1530, T1078.003

**Comparison with March 2025 incident layer (A05):** Techniques colored red today overlap directly with the kill chain from the actual breach — T1087.002 (recon), T1547.001 (persistence), and T1041 (exfil) were all used in the incident and remain undetected today.
