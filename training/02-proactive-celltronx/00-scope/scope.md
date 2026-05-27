# Scope — PROJ-2024-002: CelltronX Proactive Threat Assessment

**Classification:** TLP:AMBER  
**Date:** 2024-10-15  
**Approved by:** CelltronX CISO

---

## Organization Profile

**Organization**: CelltronX Telecommunications Ltd.  
**Sector**: Israeli Tier-1 telecommunications provider  
**Critical services**: Mobile and fixed broadband for 4.2M subscribers; SS7 signaling; PM Office connectivity contract ($210M)  
**Regulatory environment**: INCD Critical Infrastructure designation; TASE-listed; Israeli Communications Law

---

## Why This Assessment Now

TRG-001 (CERT-IL TA-2024-089) and TRG-002 (peer incident at Israeli operator using same contractor type) triggered this assessment. CEDAR-SIGNAL is confirmed active in the Israeli telecom sector. TRG-003 identified 3 CelltronX-branded lookalike domains registered within the last 30 days. CelltronX uses the same contractor type (network equipment vendor with privileged ENM access) as the confirmed victim in TRG-002.

---

## PIRs

| ID | Question | Priority |
|---|---|---|
| PIR-001 | Is CEDAR-SIGNAL actively targeting CelltronX right now? | High |
| PIR-002 | Do we have detection coverage for reported CEDAR-SIGNAL TTPs? | High |
| PIR-003 | Which CelltronX crown jewels are most exposed to CEDAR-SIGNAL's attack paths? | High |

---

## In Scope

| Domain | What's Covered |
|---|---|
| ENM (Ericsson Network Manager) platform | Primary target per TRG-001; CVE-2023-44481 unpatched |
| Contractor VPN and DMZ | Entry point per TRG-002 pattern |
| SS7 signaling network | Crown jewel; subscriber interception risk |
| Subscriber database | 4.2M records; CII designation |
| Nokia NetAct console | Exposed per TRG-003 Shodan data |

---

## Constraints

- **ENM patching**: Requires vendor maintenance window + NOC freeze; cannot patch unilaterally
- **MATZBEN change approval**: Security configuration changes require 5-day CAB approval cycle
- **Evidence availability**: Cannot access historical NetSys/contractor access logs without contractor cooperation
