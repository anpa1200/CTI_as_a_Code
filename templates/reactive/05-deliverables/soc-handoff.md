# SOC Handoff Package

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]  
**Prepared by:** [analyst]  
**Date:** YYYY-MM-DD  
**Recipient:** [SOC Lead / SIEM Engineer]

---

## Summary for SOC

> Two sentences: what happened, what the SOC needs to do right now.

[FILL IN]

---

## Confirmed IOCs — Deploy Immediately

| Type | Value | Confidence | Context | Action |
|---|---|---|---|---|
| IP | | High | C2 server | Block at firewall, alert on any new connection |
| Domain | | High | | Block DNS, alert on lookups |
| Hash (SHA-256) | | High | Dropper | AV signature, hunt across endpoints |
| URL | | Medium | Phishing | Block at proxy |
| Email domain | | High | Phishing source | Block at mail gateway |

---

## Indicators to Monitor (Do Not Block — Alert Only)

| Type | Value | Reason for Monitor-Only | Alert Threshold |
|---|---|---|---|
| | | | |

---

## Detection Rules to Deploy

| Rule ID | File | Technique | Priority | Test Status |
|---|---|---|---|---|
| | `04-detections/sigma/` | | P1 | Tested / Untested |

---

## Accounts to Review / Disable

| Account | Host / System | Action | Reason |
|---|---|---|---|
| | | Disable / Reset / Investigate | |

---

## Systems Requiring Forensic Review

| System | Priority | Evidence of Compromise | Recommended Action |
|---|---|---|---|
| | P1 | | Isolate / Image / Re-image |

---

## Open Monitoring Requirements

| What to Watch | Where | Duration | Escalation Path |
|---|---|---|---|
| | | 30 days | Escalate to CTI analyst |

---

## Regulatory Notification Status

| Obligation | Regulator | Deadline | Status |
|---|---|---|---|
| | | | Filed / Pending / Not Required |

---

## Questions for SOC

> Things SOC should investigate and report back to CTI:

1. 
2. 
