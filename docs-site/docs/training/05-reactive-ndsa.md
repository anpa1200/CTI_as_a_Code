---
title: A05 — Reactive IR (Gov) — NDSA Breach
sidebar_position: 6
---

# A05 — Reactive IR (Gov): NDSA Biometric Breach

**Mode:** Reactive · **Org:** National Digital Services Authority (NDSA) · **PROJ-2025-005**

## Scenario

The National Digital Services Authority — operating Israel's national eID platform for 9.5 million citizens — discovers that 340,218 biometric records were exfiltrated through a contractor supply chain compromise. Detection came not from an alert but from a routine database audit review, 36 hours after the attack concluded. The INCD 8-hour notification clock is running.

**Your entry point:** A CyberArk PAM session recording, Winlogbeat logs with a 9.5-hour gap, VRID database audit logs, VPN logs, and a complicating factor: an [INCD](https://anpa1200.github.io/israel-government-threat-actors-cti/) red team exercise ran 10 days earlier and left artifacts in the same systems.

## Key Facts

| Field | Value |
|---|---|
| Dwell time | 36 hours 49 minutes (confirmed) |
| Detection | VRID database audit review — not an alert |
| Data stolen | 340,218 biometric records (name, national ID, biometric hash) |
| Entry vector | AiTM phishing → HavayaIT M365 session → TOTP seed extraction → NDSA contractor VPN |
| Contractor | HavayaIT Systems Ltd. — Amir Halevi (a.halevi) |
| Regulatory clock | INCD 8-hour notification; Israeli Biometric Database Law 8-hour BDA notification |
| Complicating factor | INCD red team artifacts in VRID-SRV-01; deconfliction required |
| Coverage | 0 / 12 techniques detected during incident |

## Kill Chain Summary

| Phase | Technique | Evidence |
|---|---|---|
| Initial Access | T1566.001 Spearphishing to personal Gmail | `gov-procurement-il-portal[.]net`; Halevi interview |
| Credential Access | T1557 AiTM M365 session capture | VPN logon 01:44 IST from 203.0.113.115 (Turkish residential VPN) |
| Initial Access | T1133 Contractor VPN (with stolen TOTP seed) | VPN auth success; 892.4 MB anomalous outbound |
| Discovery | T1087.002 Domain discovery | PAM recording: `net user /domain`, `net group "NDSA-VRID-Admins" /domain` |
| Lateral Movement | T1021.001 RDP to VRID-SRV-01 | EID 4624 Type 10; maintenance permissions 8 months unrevoked |
| Credential Access | T1003.001 LSASS comsvcs.dll | GrantedAccess 0x1410; dump partially failed |
| C2 | T1071.001 HTTPS beacon | `govservice-cdn-updates[.]net` → 203.0.113.201:443 |
| Persistence | T1543.003 Service from non-standard path | EID 7045; `SvcHostMonitor`; `C:\Windows\Temp\svchost.exe` |
| Collection | T1005 VRID full-table SELECT | 340,218 records; `SVC-HAVAYAIT-MAINT` account |
| Exfiltration | T1041 / T1197 HTTPS chunks | 413 MB; 8 sessions; 04:15–05:33 IST |
| Defense Evasion | T1070.001 wevtutil log clear | EID 1102; Winlogbeat gap 02:00–11:34 IST begins |

## Evidence Inventory

```
01-evidence/raw/
  vpn/       ndsa-vpn-gateway-2025-03-17.jsonl   ← full session; 892.4 MB anomalous
  pam/       PAM-20250317-0151-HALEVI-01.mp4     ← primary source for gap window
  sysmon/    winlogbeat-jumphost-contractor.jsonl
             winlogbeat-vrid-srv-01.jsonl         ← 9.5-hour gap 02:00–11:34 IST
  db/        vrid-audit-log-2025-03-17.jsonl      ← full-table SELECT at 02:47 IST
  netflow/   govnet-ops-2025-03-17.jsonl
```

## Complicating Factor: INCD Red Team Deconfliction

An INCD red team exercise ran 10 days before the incident under INCD-CID Section 9 authority. Artifacts from that exercise remain in VRID-SRV-01. The CISO and DG know; IR Lead Rotenberg does not. Every artifact found during forensics must be evaluated against two possibilities: adversary action or authorized INCD exercise. This is not hypothetical — it directly affects your attribution confidence and your regulatory notification scope.

## Assignment Deliverables

1. **Unified incident timeline** — 22 events; source, account, indicator, ATT&CK, confidence
2. **ATT&CK mapping** — 12 techniques; detection status column; DeTT&CT score
3. **Attribution assessment** — Admiralty-rated; competing hypotheses; what would change the assessment
4. **INCD red team deconfliction memo** — which artifacts are adversary vs. exercise; confidence basis
5. **4 [Sigma](https://sigmahq.io/) rules** — GOV-DET-001 (contractor VPN ASN anomaly), GOV-DET-002 (lateral movement DMZ), GOV-DET-003 (BITS to non-standard ASN), GOV-DET-004 (wevtutil log clear)
6. **Regulatory notification package** — INCD (8h), BDA (8h), PPA; scope statement; confidence level on breach extent
7. **Executive brief** — 1 page for Knesset committee; non-technical; gap statement

## Key Learning Objectives

- Reason about evidence gaps created by log clearing — use PAM session recordings as the primary source
- Deconflict authorized security testing artifacts from real attack artifacts under classification constraints
- Write a biometric data breach notification under Israeli law when breach scope is not fully confirmed
- Reconstruct a 36-hour dwell from heterogeneous government sources (VPN, PAM, Winlogbeat, VRID DB audit, NetFlow)
- Identify how 8-month-old unrevoked contractor permissions become the critical lateral movement enabler

## Cross-Links

- **Attribution methodology:** [Field Manual — Attribution Methodology](https://anpa1200.github.io/cti-analyst-field-manual/docs/attribution/attribution-methodology/)
- **Evidence labels:** [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/)
- **Same adversary cluster in private sector:** [A01 — LifeTech Pharma Reactive IR](./01-reactive-lifetech)
- **GovID 2.0 pre-launch threat model (next assignment):** [A06 — Proactive GovID 2.0](./06-proactive-govid2)
- **NDSA CTI program built from this incident:** [A07 — Full Cycle NDSA](./07-full-cycle-ndsa)
- **Iranian-nexus actor context:** [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)

---

## Continue in the ecosystem

- [Full ecosystem](/docs/ecosystem) — tools and integrations used in this lab
- [Step-by-step methodology](/docs/cti-as-a-code-methodology) — the analytical framework behind every case
- [LifeTech Pharma case study](/docs/lifetech-pharma-case-study) — parallel reactive investigation in the private sector (PROJ-2024-001)
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — all published projects and case work

## Solution Highlights

The VRID database audit log is the most reliable evidence source — it captures the full-table SELECT at 02:47 IST with query text, account, and row count. The PAM session recording covers the 9.5-hour Winlogbeat gap entirely. The 413 MB exfiltration volume in NetFlow (8 HTTPS chunks to 203.0.113.201) confirms all 340K records were transferred before log clearing at 05:33 IST.

The TOTP bypass is the key detection lesson: the TOTP seed was not compromised by attacking the TOTP mechanism — it was extracted from Halevi's own email forwarding chain. The detection gap is not "MFA was bypassed" but "contractor personal email is an unmonitored attack surface."
