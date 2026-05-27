# Executive Brief — NDSA eID Breach

**Classification:** UNCLASSIFIED (Knesset Interior Committee version)  
**Prepared for:** Director-General; Knesset Interior Committee  
**Date:** 2025-03-25  
**Incident Reference:** PROJ-2025-005

---

## What Happened

On the night of 17 March 2025, an unauthorized party accessed NDSA's national digital identity system through the stolen credentials of an employee of HavayaIT Systems Ltd., one of our authorized IT contractors. The intruder copied records containing the names, national ID numbers, and biometric identifiers of 340,218 Israeli citizens.

The intrusion was active for approximately 4 hours (01:44 to 05:51 IST). It was detected the following afternoon when a database analyst noticed an anomalous query in the audit log. All required notifications were made — INCD, the Biometric Database Authority, and the Privacy Protection Authority — within their required timeframes.

---

## How It Happened

| Step | What Occurred |
|---|---|
| 12 March | The contractor's employee received a deceptive phishing email that looked like an official government procurement notice. His work email account was compromised when he clicked the link. |
| 12–16 March | The attacker spent 5 days reading that email account, finding the contractor's VPN credentials and authentication token for NDSA's systems. |
| 17 March, 01:44 | The attacker logged into NDSA's contractor VPN using the stolen credentials, connecting from a server in Turkey. |
| 17 March, 02:47 | The attacker queried the full citizen biometric database from the VRID identity server, extracting 340,218 records. |
| 17 March, 04:15–05:33 | 413 MB of citizen data was transmitted to an external server. The attacker then deleted system logs before disconnecting. |
| 18 March, 14:15 | An NDSA database analyst noticed the unusual database query during a routine review. |

---

## Impact

| Category | Assessment |
|---|---|
| Data affected | 340,218 citizen records: full name, national ID number (teudat zehut), biometric hash, last verification date |
| Systems affected | VRID-SRV-01 (biometric identity server); GovID authentication platform not directly accessed |
| Government services | No disruption to government services occurred during the incident |
| National security | Classified segment scope is under assessment by INCD; we do not yet know if classified network areas were affected |

---

## Who Did It

Based on the attack method, the infrastructure used, and comparison with known threat actor behavior, this attack is consistent with state-sponsored actors who have targeted Israeli government and civilian systems previously. The techniques — particularly using a stolen contractor account to access sensitive government databases — match documented patterns of Iranian-nexus operations.

We are working with INCD and law enforcement to confirm attribution. We are not in a position to make a public identification at this time.

---

## What We Knew in Advance

On 10 March 2025, NDSA received a classified advisory from INCD warning that actors were targeting Israeli government contractor companies as a path into government systems. This advisory was shared with the Director-General and the CISO. It did not name NDSA, HavayaIT, or specific contractors as targets.

Our lessons-learned review includes an assessment of whether this advisory should have prompted immediate action on contractor access security.

---

## What We Did

| Action | Status |
|---|---|
| Disabled contractor account and revoked access | Done — 15:45 IST 18 March |
| Suspended all HavayaIT VPN access pending review | Done — 17:30 IST 18 March |
| Notified INCD (within 8-hour requirement) | Done — 17:00 IST 18 March |
| Notified Biometric Database Authority (within 8-hour requirement) | Done — 23:30 IST 18 March |
| Notified Privacy Protection Authority (within 72-hour requirement) | Done — 15:00 IST 21 March |
| Isolated and forensically preserved affected server | Done |
| Blocked attacker infrastructure | Done |

---

## What We Are Doing to Prevent Recurrence

Our technical team has identified 13 detection gaps — monitoring capabilities that, if working correctly, would have detected this attack earlier. We are addressing all of them.

The most important fixes:

1. **Contractor VPN anomaly detection** — the attack came from Turkey at 01:44 in the morning. A properly configured rule would have flagged this immediately. Our existing rule had a technical fault that silenced it.
2. **Database query monitoring** — a query that retrieves 340,000 records from a sensitive database should trigger an immediate alert. It did not.
3. **Mandatory multi-factor authentication** for all contractor VPN accounts — the attacker bypassed our current MFA by stealing the authentication token. Hardware tokens prevent this.
4. **Contractor access revocation** — the contractor who was compromised had access permissions from a project that ended 8 months ago. Active unused access was not revoked.

---

## Residual Risk

One unresolved question: we do not yet know whether the attacker also accessed NDSA's classified network segment. This requires a classified forensic investigation by INCD. Until that investigation is complete, we cannot fully characterize the scope of this breach.

The 340,218 affected citizens will be individually notified. Because the data includes biometric identifiers that cannot be changed, we are assessing what protective measures can be offered and coordinating with the Ministry of Interior on the notification approach.

---

## Recommended Action

The Knesset Interior Committee is asked to note:
- All regulatory obligations have been met
- Immediate containment actions are complete
- A 30-day full forensic report is in preparation (due 17 April 2025)
- Budget authorization is required for: hardware MFA tokens for all government contractors (estimated ₪200K), and a contractor access lifecycle management program
