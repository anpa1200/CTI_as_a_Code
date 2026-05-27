# Scope Definition — PROJ-2024-001

**Classification:** TLP:AMBER  
**Scoped:** 2024-11-15  
**Approved by:** Dr. Yael Mizrahi, CISO

---

## Incident Summary

A targeted intrusion occurred at LifeTech Pharma between 13–15 November 2024. An attacker bypassed MFA via AiTM phishing against the CFO, pivoted through the VPN to an IT admin workstation, executed DCSync against the domain controller, and exfiltrated approximately 2.4 GB of R&D partnership data. Dwell time was 52 hours 46 minutes before detection.

---

## In Scope

| Asset / System | Owner | Justification |
|---|---|---|
| WS-CFO-01 (m.cohen workstation) | Finance | Initial phishing recipient; first C2 beacon observed here |
| WS-IT-LEVI (p.levi workstation) | IT | Pivoted to via AiTM VPN; LSASS dump performed here |
| SERVER-FIN-01 (financial file server) | Finance | Robocopy staging performed; R&D data exfiltrated from here |
| DC-01 (domain controller) | IT | DCSync performed; all domain credentials must be treated as compromised |
| VPN Gateway | IT / Security | Entry point via AiTM session token replay |

---

## Out of Scope

| Asset / System | Reason for Exclusion |
|---|---|
| Production pharmaceutical manufacturing systems | No evidence of access; segregated network |
| Customer-facing web services | No evidence of access |
| External partner systems (USPartner2024 recipient) | Out of NDSA jurisdiction; notify via separate disclosure |

---

## Priority Intelligence Requirements

| ID | Question | Priority | Due |
|---|---|---|---|
| PIR-001 | What was the initial access vector and how did the attacker bypass MFA? | High | 2024-11-17 |
| PIR-002 | What data was accessed or exfiltrated, and what is the business impact? | High | 2024-11-17 |
| PIR-003 | Who is the threat actor and what is their likely motivation? | Medium | 2024-11-20 |
| PIR-004 | What detection gaps enabled this attack to persist for 52 hours undetected? | High | 2024-11-20 |

---

## Constraints and Assumptions

- **Legal**: Attorney-client privilege invoked for investigation communications; external counsel engaged
- **Regulatory**: Israeli Privacy Protection Law notification assessment required for exfiltrated data (R&D data may contain partner PII)
- **Evidence**: WS-IT-LEVI Sysmon 4-hour gap (03:02–07:14 IST 15 Nov) — confirmed via EID 7036; impacts reconstruction of log-clear window
- **Evidence**: PowerShell script block logging (EID 4104) disabled — only base64 payloads visible; decoded payload is forensic reconstruction
- **Assumptions**: All timestamps in IST (UTC+2) unless otherwise noted

---

## Stakeholders

| Name | Role | Involvement |
|---|---|---|
| Dr. Yael Mizrahi | CISO | Approves scope; receives executive brief |
| Noa Ben-David | IR Lead | Coordinates containment; SOC handoff recipient |
| Legal (external) | Attorney | Advises on disclosure and regulatory obligations |
| Compliance | Data Protection Officer | Assesses Privacy Protection Law obligations |

---

## Definition of Done

- [x] All PIRs answered
- [x] Timeline covers full 52h dwell period (gap documented with impact statement)
- [x] ATT&CK mapping reviewed — 12/12 techniques identified, 0/12 had working detections
- [x] 4 detection rules written (DET-001–004) — ready for SOC deployment
- [x] SOC handoff delivered to Noa Ben-David
- [x] Executive brief approved by Dr. Mizrahi
- [ ] Privacy Protection Law notification assessment (pending legal review)
