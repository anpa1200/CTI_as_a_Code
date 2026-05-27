# 72-Hour Immediate Action Plan

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]  
**Triggered by:** [trigger IDs]  
**Plan created:** YYYY-MM-DDTHH:MMZ  
**Plan expires:** YYYY-MM-DDTHH:MMZ (+72h)  
**Approved by:** [CISO / Security Manager]

---

## Threat Level Assessment

**Current threat level**: High / Elevated / Normal  
**Basis**: [Trigger assessment summary]  
**Required response**: Immediate action to reduce exposure before full assessment complete

---

## Actions: Hour 0–24

| # | Action | Owner | Tools / Systems | Success Criterion | Done? |
|---|---|---|---|---|---|
| 1 | Block IOCs at perimeter firewall | SOC | Firewall / Proxy | IOC list deployed | ☐ |
| 2 | Add IOC alerts to SIEM | SOC | Elastic Security | Alerts active | ☐ |
| 3 | Brief SOC on new TTPs and indicators | CTI | Slack / Teams | SOC briefed, runbook updated | ☐ |
| 4 | Review VPN/remote access logs for anomalies | SOC | SIEM | Reviewed, findings documented | ☐ |

## Actions: Hour 24–48

| # | Action | Owner | Tools / Systems | Success Criterion | Done? |
|---|---|---|---|---|---|
| 5 | Enable additional logging on high-risk systems | SysAdmin | [Platform] | Logs flowing to SIEM | ☐ |
| 6 | Deploy highest-priority new detection rule | SOC | Elastic Security | Rule active and tested | ☐ |
| 7 | Review privileged account access | IAM | AD / IdP | Review complete, anomalies documented | ☐ |

## Actions: Hour 48–72

| # | Action | Owner | Tools / Systems | Success Criterion | Done? |
|---|---|---|---|---|---|
| 8 | Complete threat hunt for priority TTP | CTI | SIEM / EDR | Hunt complete, report drafted | ☐ |
| 9 | Brief leadership | CTI | | Brief delivered, roadmap approved | ☐ |
| 10 | Transition to roadmap | CTI + SOC | | Roadmap items assigned and tracked | ☐ |

---

## Escalation Criteria

Escalate immediately to CISO if any of the following are observed:

- [ ] Evidence of active intrusion (malicious process, C2 beacon, exfiltration in progress)
- [ ] Compromise of a crown jewel system
- [ ] Regulatory notification threshold triggered (quantified data access)
- [ ] Vendor / partner system compromise identified

**Escalation contact**: [Name, phone, Slack]

---

## Status Updates

| Time | Update | Status | Author |
|---|---|---|---|
| +0h | Plan activated | In Progress | |
| +24h | | | |
| +48h | | | |
| +72h | | | |
