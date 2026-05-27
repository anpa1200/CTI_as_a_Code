# CTI Report Reference — PROJ-2026-008

**Purpose:** This directory holds the source CTI reports that drove TTP extraction for the 2026 NDSA Detection Validation exercise. Two reports are referenced; both are maintained in their source case directories.

---

## Source Report 1 — March 2025 NDSA eID Breach Analysis (A05)

**Location:** `../05-reactive-ndsa/` (case 05)  
**Report type:** Post-incident CTI analysis  
**Classification:** CONFIDENTIAL  
**Date:** 2025-03-28  
**Analyst:** Shai Rotenberg, NDSA CTI Lead

### Summary for Emulation Planning

The March 2025 breach of the NDSA eID system produced a detailed 16-event timeline spanning credential theft through data exfiltration. The breach affected 340,218 citizen biometric records via the VRID (Voter Registration and Identity Database) system.

**Key adversary behaviors extracted for emulation (A05 timeline):**

| Timeline Event | TTP | Emulated As |
|---|---|---|
| TL-4: VPN auth from 203.0.113.115 (Turkish residential ASN) at 01:44 IST | T1133 | MOD-01 |
| TL-5/6: `net user /domain`; `net group "NDSA-VRID-Admins" /domain` | T1087.002 | MOD-02 |
| TL-7: `ipconfig /all`; `nslookup vrid-srv-01` | T1016, T1018 | MOD-02 (combined) |
| TL-8: RDP JUMPHOST-CONTRACTOR-01 → VRID-SRV-01 (EID 4624 Type 10) | T1021.001 | MOD-03 |
| TL-9: `comsvcs.dll MiniDump` LSASS; GrantedAccess 0x1410 | T1003.001 | MOD-04 |
| TL-11: BITS download of `svchosts.exe` from `govservice-cdn-updates[.]net` | T1197 | MOD-05 |
| TL-14: Service `SvcHostMonitor` from `C:\Windows\Temp\svchost.exe` | T1543.003 | MOD-06 |
| TL-13: `vrid_query.exe` full-table SELECT on `citizen_records` | T1005 | MOD-08 |
| TL-15: 413 MB HTTPS exfiltration to 203.0.113.201:443 in 8 chunks | T1041 | MOD-09 |
| TL-16: `wevtutil cl Security/System/Application` | T1070.001 | MOD-11 |
| Analysis: HKCU registry Run key (AMSI log evidence) | T1547.001 | MOD-07 |

**TTPs excluded from emulation:**
- T1566.001 (spearphishing via personal Gmail) — AiTM phishing outside NDSA infrastructure; personal email not in NDSA visibility
- T1557 (AiTM session token capture) — cannot safely emulate without risking production token exposure

---

## Source Report 2 — GovID 2.0 Pre-Launch Threat Assessment (A06)

**Location:** `../06-proactive-govid2/` (case 06)  
**Report type:** Proactive threat intelligence assessment  
**Classification:** CONFIDENTIAL  
**Date:** 2025-10-01  
**Analyst:** Shai Rotenberg, NDSA CTI Lead

### Summary for Emulation Planning

The A06 pre-launch assessment identified two additional TTPs relevant to the GovID 2.0 platform that extend the A05 actor model to the new biometric verification system.

**Key adversary behaviors extracted for emulation (A06):**

| Trigger | TTP | Emulated As |
|---|---|---|
| TRG-004: BiometricTech API probing — 2,400 `/verify/bulk` calls/day from 185.220.101.47 | T1530 | Planned (lab API availability required) |
| TRG-004: Vendor API token used from non-allowlisted IP | T1078.003 | Planned (adapted — requires BiometricTech IP binding) |

**Why A06 TTPs are included in A08 scope:**

The March 2025 breach used a compromised contractor account to access the VRID system. GovID 2.0 introduces a new attack surface via the BiometricTech vendor API integration. The A06 assessment identified that this surface is actively being probed (TRG-004). Including A06 TTPs in the A08 emulation scope allows NDSA to validate that new detection rules for GovID 2.0 work before the system reaches full production load.

---

## Emulation Design Decisions

| Decision | Rationale |
|---|---|
| 11 modules executed in kill-chain sequence | Mirror the actual March 2025 attack sequence; test detection across the full kill chain, not just isolated techniques |
| MOD-11 (log clear) executed last | Preserves all prior lab evidence; if executed earlier, evidence from modules 1–10 is destroyed |
| 100 MB exfiltration volume (vs. 413 MB in incident) | Lab C2 bandwidth limitation; 8-chunk structure preserved to match incident pattern |
| HKCU registry gap pre-declared | Sysmon config gap was known from A05 analysis; MOD-07 serves as formal validation and INCD documentation |
| T1087.002 gap pre-declared | No net.exe rule deployed; MOD-02 serves as formal gap confirmation for INCD remediation plan |
