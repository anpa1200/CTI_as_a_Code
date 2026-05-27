# Executive Brief — LifeTech Pharma Security Incident

**Classification:** Internal Confidential  
**Prepared for:** Dr. Yael Mizrahi, CISO  
**Date:** 20 November 2024

---

## Bottom Line Up Front

Between 13 and 15 November 2024, an unauthorized party accessed LifeTech Pharma's internal network and copied approximately 2.4 gigabytes of confidential files related to our US licensing partnership. The attacker was inside our network for over 52 hours before detection. All network passwords have been treated as compromised and are being reset. New detection rules have been deployed to catch this technique if attempted again.

---

## What Happened

On 13 November, our CFO received a realistic-looking email that appeared to come from a trusted partner but was actually from an attacker who had registered a nearly identical domain name. When the CFO interacted with the email, the attacker was able to capture the CFO's login credentials, including bypassing the multi-factor authentication code. This technique — known as "adversary in the middle" — is increasingly used against senior executives because it works even when MFA is enabled.

Using those captured credentials, the attacker connected to our company VPN from Turkey late at night on 14 November. Over the following hours, the attacker moved deeper into our systems, reached our financial file server, and copied 47 documents from the US licensing partnership folder (USPartner2024) to an external server the attacker controlled. Before leaving, the attacker also obtained copies of all domain account passwords and deleted system logs to slow investigation.

The attack was discovered on 15 November at 10:47 by a SOC analyst who noticed an unusual gap in system logs — not by an automated alert, because we had no detection rules covering the techniques the attacker used.

---

## Impact Assessment

| Category | Status | Details |
|---|---|---|
| Data confidentiality | **Compromised** | ~2.4 GB of USPartner2024 R&D licensing documentation exfiltrated (47 files) |
| Domain credentials | **Compromised** | All Active Directory account passwords treated as compromised; rotation in progress |
| System integrity | **Under review** | Malicious software installed on WS-IT-LEVI; systems being reimaged |
| Service availability | Not disrupted | Operations continued throughout; attacker did not disrupt services |
| Regulatory obligations | Pending legal review | Privacy Protection Law notification assessment underway |

---

## Threat Actor

**Assessment**: State-affiliated actor with medium confidence of Iranian-nexus alignment  
**Motivation**: Intelligence collection — specifically targeting R&D documentation related to the $52M US licensing partnership  
**Sophistication**: High — MFA bypass, credential harvesting, domain-wide compromise, staged exfiltration

This assessment is based on the attack method, choice of target (US licensing deal documentation), and overlap with publicly documented Iranian-nexus operations against Israeli pharmaceutical companies. We do not have sufficient evidence to name a specific group. A security firm could provide additional forensic analysis if required.

---

## What We Are Doing

| Action | Owner | Status | ETA |
|---|---|---|---|
| Disable attacker accounts and rotate all passwords | IT | In progress | 24 hours |
| Double-rotate krbtgt (domain master key) | IT | Scheduled | 48 hours |
| Reimage compromised workstations | IT | In progress | 48 hours |
| Deploy 4 new detection rules | SOC | Completed | Done |
| Notify USPartner2024 per contract terms | Legal | Pending CISO approval | 72 hours |
| Assess Privacy Protection Law obligations | Legal | In progress | 72 hours |

---

## Residual Risk

After the above actions, the risk of re-entry via the same technique remains until the new detection rules are validated and MFA configuration is reviewed. We recommend immediately reviewing the MFA enrollment process — the AiTM technique bypassed our current TOTP implementation and requires a hardware token or phishing-resistant MFA upgrade to prevent recurrence.

---

## Recommendations

1. **Immediate (48 hours)**: Complete krbtgt rotation and account password resets
2. **Short-term (30 days)**: Implement phishing-resistant MFA (FIDO2/hardware tokens) for VPN access by all users with admin rights
3. **Strategic (90 days)**: Enable TLS inspection on outbound HTTPS; deploy PowerShell script block logging (EID 4104) — both were confirmed gaps in this incident
