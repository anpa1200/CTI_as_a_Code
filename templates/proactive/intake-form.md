# Proactive Assessment Intake — [Project Name] — [Date]

Completed by: [analyst name]
Commissioned by: [name, role]
Call time: [date] [time] [timezone]

---

## 1. Assessment trigger

**1.1 What triggered this assessment?**
- [ ] CERT advisory / threat report — ref: _______________
- [ ] Peer organization incident
- [ ] Commercial threat intel alert
- [ ] Compliance / audit requirement
- [ ] Management / board direction
- [ ] Periodic scheduled review
- [ ] Other: _______________

**1.2 What is the specific intelligence or event driving urgency?**
(Exact report name, advisory number, incident description — do not paraphrase)


**1.3 When was the trigger received?**
Date: __________ Source: __________ Reliability (Admiralty A–F): __________

**1.4 Is the threat actor or campaign believed to be currently active?**
- [ ] Yes — assessed active against this sector/region
- [ ] No — historical or dormant
- [ ] Unknown

---

## 2. Organization profile

**2.1 Sector and sub-sector?**


**2.2 What are the crown jewels — the 3–5 most critical assets?**
(What would trigger regulatory notification or cause irreversible harm if compromised?)


**2.3 Why is this organization an attractive target?**
(IP, customer data, market position, government contracts, critical infrastructure designation)


**2.4 Geographic and geopolitical exposure?**
(Nation-state actors with documented interest in this sector/geography)


---

## 3. Current detection posture

**3.1 Detection and prevention tools deployed?**
- SIEM: _______________
- EDR: _______________
- Email security: _______________
- Network monitoring: _______________
- Cloud security: _______________

**3.2 Log sources currently ingested into SIEM?**
- [ ] Windows Event Logs / Sysmon
- [ ] VPN / remote access
- [ ] DNS
- [ ] Proxy / web gateway
- [ ] Email gateway
- [ ] Cloud (Azure AD / AWS CloudTrail / GCP)
- [ ] Network flow / NetFlow
- [ ] EDR telemetry
- [ ] Database audit logs
- [ ] OT / ICS telemetry

**3.3 Date of last threat assessment or red team exercise?**
Date: __________ Findings available: [ ] Yes [ ] No

**3.4 Known detection gaps?**
(Log sources not ingested, detection rules not deployed, known blind spots)


---

## 4. Scope and mandate

**4.1 Who commissioned this assessment?**
Name: ______________ Role: ______________ Authority: ______________

**4.2 Expected deliverable?**
- [ ] Technical brief (security team)
- [ ] Executive brief (CISO / board)
- [ ] Detection backlog with prioritization
- [ ] 72h immediate action plan
- [ ] Full threat assessment report
- [ ] Other: _______________

**4.3 Hard deadline?**
- [ ] Yes — deadline: ______________ Reason: ______________
- [ ] No

**4.4 Engineering capacity for detection backlog?**
(Engineer-days or sprint slots available to act on findings)


---

## 5. Threat context

**5.1 Threat actors of concern?**
(Nation-state clusters, criminal groups, insider threat, hacktivists — name or describe)


**5.2 Prior incidents or near-misses in this organization?**
- [ ] Yes — summary: ______________
- [ ] No
- [ ] Unknown

**5.3 Threat intel sources available?**
- [ ] CERT-IL / national CERT feed
- [ ] Commercial intel subscription: _______________
- [ ] Sector ISAC membership: _______________
- [ ] Peer-sharing group: _______________
- [ ] Internal incident history
- [ ] None currently

**5.4 Relevant advisories or peer incident reports available?**
(List advisory numbers, incident names, or report titles)


---

## 6. Regulatory and compliance context

**6.1 Applicable regulations?**
| Regulation | Applicable? | Upcoming deadline |
|---|---|---|
| INCD (Israeli critical infrastructure) | [ ] Yes [ ] No | |
| BoI-CD 362 (Israeli financial) | [ ] Yes [ ] No | |
| GDPR | [ ] Yes [ ] No | |
| PCI-DSS | [ ] Yes [ ] No | |
| Other: ______________ | | |

**6.2 Upcoming compliance audit or regulatory review?**
- [ ] Yes — date: ______________ Body: ______________
- [ ] No

---

## 7. Analyst assessment after intake

**7.1 Initial threat relevance to this organization?**
- [ ] High — direct targeting assessed, specific TTPs confirmed relevant
- [ ] Medium — indirect exposure, plausible targeting, partial TTP overlap
- [ ] Low — generic threat, limited relevance to this org's profile

**7.2 Top 3 risks to investigate first?**
1.
2.
3.

**7.3 Recommended immediate actions (72h)?**
(Quick wins: block known IoCs, enable log source, patch specific CVE, add detection rule)


---

## 8. Analyst notes

(Free-form notes from the intake call — raw, unprocessed)


---

## 9. Next actions

| # | Action | Owner | Due |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

*Intake completed. File as `00-scope/intake-[date].md`, open project in TheHive, begin trigger assessment.*
