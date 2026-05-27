---
title: A01 — Reactive IR — LifeTech Pharma
sidebar_position: 2
---

# A01 — Reactive IR: LifeTech Pharma

**Mode:** Reactive · **Org:** LifeTech Pharma · **PROJ-2024-001**

## Scenario

An Israeli pharmaceutical company discovers that 2.4 GB of R&D data was exfiltrated over 3 hours on the night of 14–15 November 2024. The SOC opened a P3 ticket after noticing a log gap — not an alert. Zero detection rules fired during the 52-hour incident.

**Your entry point:** You receive a case in TheHive with 6 evidence sources, a 4-hour Sysmon gap, and a P1 escalation. Determine who, how, and why — and ensure it doesn't happen again.

## Key Facts

| Field | Value |
|---|---|
| Dwell time | 52 hours 46 minutes (confirmed) |
| Detection | None during incident — gap noticed manually |
| Data stolen | 2.4 GB R&D data (R&D share, `USPartner2024` folder) |
| Entry vector | AiTM phishing → session token capture → contractor VPN |
| Assessment | Iranian-nexus activity cluster (medium confidence) |
| Coverage gap | 0 / 12 techniques detected during incident |

## Kill Chain Summary

| Phase | Technique | Evidence |
|---|---|---|
| Initial Access | T1566.001 Spearphishing | Lookalike domain `lifetechpharma-corp[.]eu` |
| Credential Access | T1557 AiTM session capture | VPN logon from Istanbul at 04:05 IST; TOTP bypassed |
| Lateral Movement | T1021.001 RDP | EID 4624 Type 10 JUMPHOST-01 → WS-IT-LEVI |
| Credential Access | T1003.001 LSASS comsvcs.dll | GrantedAccess 0x1410; comsvcs.dll MiniDump |
| Credential Access | T1003.006 DCSync | EID 4662 Replication-Get-Changes-All on DC-01 |
| Persistence | T1547.001 Registry Run key (via service) | EID 7045 `WindowsUpdateAgent` from non-standard path |
| Exfiltration | T1041 HTTPS multi-chunk | 2.4 GB to 198.51.100.44 over 3 hours in 8 sessions |
| Defense Evasion | T1070.001 Log clear | EID 1102 — wevtutil cl after Sysmon crash window |

## Assignment Deliverables

1. **Unified incident timeline** — all 22 events with source, account, indicator, ATT&CK technique, confidence
2. **ATT&CK mapping** — 12 techniques; detection status column; DeTT&CT score per technique
3. **Attribution assessment** — Admiralty-rated claim; competing hypotheses; what would change the assessment
4. **4 Sigma rules** — DET-001 (Office→PS child), DET-002 (LSASS comsvcs), DET-003 (DCSync EID 4662), DET-004 (VPN ASN anomaly)
5. **SOC handoff** — IOC table, detection deployment status, immediate containment actions
6. **Executive brief** — 1-page non-technical; gap statement; 3 recommended actions

## Key Learning Objectives

- Reconstruct a timeline from heterogeneous sources (Winlogbeat, VPN logs, PAM recordings, DNS, firewall) including a 4-hour evidence gap
- Distinguish "rule missing" from "log source missing" when documenting detection failures
- Write a DCSync detection rule against EID 4662 with `Replication-Get-Changes-All` GUID filter
- Communicate a 0/12 detection coverage failure to a CISO without technical jargon

## Cross-Links

- **Analytic tradecraft:** [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/), [Source Reliability](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/source-reliability/), [Attribution Methodology](https://anpa1200.github.io/cti-analyst-field-manual/docs/attribution/attribution-methodology/)
- **Detection conversion:** [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/)
- **Iranian-nexus context:** [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)
- **Same adversary cluster in emulation:** [A04 — Operation Desert Cipher Emulation](./04-emulation-techpay)

## Evidence Files

```
01-evidence/raw/
  email/  phish-m-cohen-2024-11-15.eml
          phish-p-levi-2024-10-22.eml
  logs/   sysmon-ws-it-levi.jsonl      ← 4-hour gap 03:02–07:14 IST
          sysmon-server-fin-01.jsonl
          winsec-dc01.jsonl
  network/ dns-connections.jsonl
```

## Solution Highlights

The 4-hour Sysmon gap (WS-IT-LEVI) is a critical constraint: the initial staging activity during that window cannot be confirmed from SIEM. Log clearing (EID 1102) occurred at 03:14 IST — inside the gap. The PAM session recording on JUMPHOST-01 is the primary source for the 22:11–02:47 IST window.

DET-003 (DCSync) requires filtering EID 4662 by both ObjectType (computer account or domain) AND the two DS-Replication-Get-Changes GUIDs — without the GUID filter, noise from legitimate replication events makes the rule unusable.
