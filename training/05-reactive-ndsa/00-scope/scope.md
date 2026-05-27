# Scope — PROJ-2025-005: NDSA Contractor Breach

**Classification:** TLP:AMBER  
**Scoped:** 2025-03-18  
**Approved by:** CISO Col. Nativ

---

## Incident Summary

A contractor employee (Amir Halevi, HavayaIT Systems Ltd.) conducted a targeted intrusion against NDSA's VRID biometric database server between 12–17 March 2025. The actor bypassed TOTP MFA via AiTM phishing, used unrevoked maintenance permissions to access VRID-SRV-01, and exfiltrated 340,218 biometric identity records (~413 MB). INCD-CID 8-hour notification window applies. Biometric Database Law Section 18(b) notification required.

---

## PIRs

| ID | Question | Priority | Status |
|---|---|---|---|
| PIR-001 | How did the contractor account access GOVNET OPS and VRID systems? | High | Answered |
| PIR-002 | What data was accessed/exfiltrated? Does it trigger INCD-CID or BDA notification? | High | Answered |
| PIR-003 | What detection gaps allowed access to continue? | High | Answered |
| PIR-004 | External actor involvement — contractor acting alone or directed? | Medium | Open |

---

## In Scope

| System | Justification |
|---|---|
| JUMPHOST-CONTRACTOR-01 | Primary lateral entry point |
| VRID-SRV-01 | Data breach host; biometric database |
| NDSA VPN Gateway | Entry point; source IP analysis |
| VRID database (biometric records) | Scope of exfiltration |

## Out of Scope

| System | Reason |
|---|---|
| GOVNET Classified Segment | Requires MATZBEN clearance; no evidence of access |
| HavayaIT internal M365 environment | Outside NDSA jurisdiction; separate legal request |

---

## Regulatory Constraints

- **INCD-CID Article 7(3)(a)**: 8-hour notification from breach determination (15:45 IST 18 March → deadline 23:45 IST 18 March)
- **Biometric Database Law Section 18(b)**: Notification to Biometric Database Authority required; dual authorization (CISO + DG)
- **Handling**: All investigation documents to be treated as TLP:AMBER; INCD liaison Friedman has access

---

## Constraints

- 9.5-hour Winlogbeat gap on VRID-SRV-01 (02:00–11:34 IST) — caused by attacker log clear; PAM recording covers this window
- HavayaIT M365 audit logs not available — pending legal request; 5-day window (12–17 March) cannot be fully reconstructed without them
