# Investigation Intake — [Project Name] — [Date]

Completed by: [analyst name]
Intake call with: [name, role]
Call time: [date] [time] [timezone]

---

## 1. What was reported?

**1.1 What did you see or receive that caused you to raise this?**
(Exact words from the reporter — do not paraphrase yet)


**1.2 Where did this first come to your attention?**
- [ ] Alert from SIEM / EDR / AV
- [ ] User complaint or helpdesk ticket
- [ ] External notification (CERT-IL, partner, vendor)
- [ ] Periodic log review
- [ ] Other: _______________


**1.3 When did you first notice it?**
Date: __________ Time: __________ Timezone: __________


**1.4 Do you believe the activity is still ongoing?**
- [ ] Yes — still active
- [ ] No — appears to have stopped (when? ___________)
- [ ] Unknown


---

## 2. What is already known?

**2.1 What systems, accounts, or services appear to be involved?**
(List hostnames, IPs, usernames exactly as the reporter knows them — we will verify later)


**2.2 What was the observed behavior?**
(Exact description — "database was slow", "account locked", "file appeared on server", etc.)


**2.3 Has anyone else already investigated or looked into this?**
- [ ] Yes — who: ______________ what did they do: ______________
- [ ] No
- [ ] Unknown

If yes: **what did they touch or change?** This is critical for evidence integrity.


**2.4 What do you think happened?**
(Their hypothesis — we are not confirming it yet, just capturing it)


---

## 3. Timeline of discovery

**3.1 When do you believe the activity started?**
- [ ] Known: __________
- [ ] Estimated: approximately __________
- [ ] Unknown — this needs to be determined

**3.2 How long do you estimate the activity has been occurring?**
(Hours / Days / Weeks / Unknown)

**3.3 Is there a specific event that triggered the alert or complaint?**
(e.g., "user reported they couldn't log in", "SOC saw an alert at 03:14", "customer called about unauthorized charges")


---

## 4. What has already been done?

> This section determines whether evidence has been preserved or potentially tainted.

**4.1 Has any system been rebooted, shut down, or reimaged since the activity was discovered?**
- [ ] Yes — which systems: ______________ when: ______________
- [ ] No
- [ ] Unknown

**4.2 Have any credentials, tokens, or API keys been rotated or revoked?**
- [ ] Yes — which: ______________ when: ______________
- [ ] No
- [ ] Unknown

**4.3 Has any network access been blocked or firewall rules been changed?**
- [ ] Yes — what: ______________
- [ ] No
- [ ] Unknown

**4.4 Has any malware been deleted or quarantined?**
- [ ] Yes — by whom: ______________ was a copy preserved: [ ] Yes [ ] No
- [ ] No
- [ ] Unknown

**4.5 Has anyone notified external parties (regulators, law enforcement, CERT, customers)?**
- [ ] Yes — who was notified: ______________ when: ______________
- [ ] No — are there notification obligations that may apply? (see section 7)
- [ ] Unknown


---

## 5. Systems and access

**5.1 What logging is expected to exist for the affected systems?**
(Ask what they know — we will verify against what we actually find)
- Endpoint logs (Sysmon, Winlogbeat, EDR): [ ] Yes [ ] No [ ] Unknown
- VPN / authentication logs: [ ] Yes [ ] No [ ] Unknown
- Database audit logs: [ ] Yes [ ] No [ ] Unknown
- Network flow / firewall logs: [ ] Yes [ ] No [ ] Unknown
- Email gateway logs: [ ] Yes [ ] No [ ] Unknown
- Cloud provider logs (Azure AD, AWS CloudTrail, GCP): [ ] Yes [ ] No [ ] Unknown

**5.2 What tools and access does the analyst have?**
- [ ] Admin access to affected hosts (remote or physical)
- [ ] Read access to SIEM
- [ ] Access to EDR console
- [ ] Access to network equipment / firewall logs
- [ ] Access to cloud console
- [ ] Access to email gateway
- [ ] VPN / jump host credentials
- [ ] TheHive / OpenCTI lab access

**5.3 Are there any systems the analyst should NOT touch?**
(Legal hold, systems under active monitoring by law enforcement, production critical systems)


---

## 6. Business impact

**6.1 What business processes are affected or at risk?**


**6.2 Is customer data, employee data, or regulated data potentially involved?**
- [ ] Yes — what type: ______________
- [ ] No
- [ ] Unknown

**6.3 What is the financial exposure if this is confirmed?**
(Rough estimate — for prioritization only)

**6.4 Is there a hard deadline driving this investigation?**
(Regulatory notification window, board meeting, press disclosure, customer SLA)
- [ ] Yes — deadline: ______________
- [ ] No


---

## 7. Regulatory and legal constraints

**7.1 Are there applicable notification requirements?**
| Regulation | Applicable? | Deadline | Notified? |
|---|---|---|---|
| INCD (Israeli critical infrastructure) | [ ] Yes [ ] No [ ] TBD | 72h from discovery | [ ] Yes [ ] No |
| Biometric Database Authority | [ ] Yes [ ] No [ ] TBD | Per Biometric Database Law | [ ] Yes [ ] No |
| BoI-CD 362 (Israeli financial) | [ ] Yes [ ] No [ ] TBD | 24h initial, 72h full | [ ] Yes [ ] No |
| GDPR | [ ] Yes [ ] No [ ] TBD | 72h from awareness | [ ] Yes [ ] No |
| PCI-DSS | [ ] Yes [ ] No [ ] TBD | Immediate | [ ] Yes [ ] No |
| Other: ______________ | | | |

**7.2 Is there an active legal hold on any systems or data?**
- [ ] Yes — what systems: ______________
- [ ] No
- [ ] Unknown — escalate to legal before collecting

**7.3 Has legal counsel been notified?**
- [ ] Yes
- [ ] No — should they be? ______________

---

## 8. Analyst notes

(Free-form notes taken during the intake call — raw, unprocessed)


---

## 9. Next actions

| # | Action | Owner | Due |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

*Intake completed. File this as `00-scope/intake-[date].md` and open a case in TheHive.*
