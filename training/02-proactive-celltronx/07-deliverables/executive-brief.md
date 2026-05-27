# Executive Brief — CEDAR-SIGNAL Threat to CelltronX

**Classification:** TLP:AMBER  
**Prepared for:** CelltronX CISO / Board  
**Date:** 2024-10-15

---

## Bottom Line

An Iranian-linked threat group is currently running operations against Israeli telecommunications companies using the same contractor access path that CelltronX uses for network management. Three domains impersonating CelltronX have been registered in the past 30 days, and a known vulnerability in our network management platform remains unpatched. Immediate action is required.

---

## Why This Matters Now

Three weeks ago, a confirmed Iranian threat group accessed a peer Israeli telecom operator's network through a vendor contractor — the same type of access arrangement we have with our NOC contractor. That group extracted subscriber data and query access to SS7 signaling (which handles calls and SMS for mobile subscribers). The CERT-IL government cybersecurity authority issued a formal advisory 10 days ago identifying this threat group as actively targeting Israeli telecommunications.

A domain intelligence check this week found three new website addresses registered specifically to impersonate CelltronX — targeting our NOC staff with fake login portals and fake software update notices. This is pre-attack infrastructure: the attacker builds these sites before launching phishing campaigns.

---

## Our Exposure

| What's at Risk | Exposure Level | Why |
|---|---|---|
| Network management platform (ENM) | **Critical** | Security patch for a known vulnerability has not been applied — an attacker can enter without a password |
| Contractor VPN access | **High** | Same access path used against peer victim; phishing campaigns targeting this access now active |
| 4.2M subscriber records | **High** | Once inside network management, subscriber data is accessible |
| PM Office connectivity contract | High | Network configuration access enables disruption of government connectivity |

---

## What We Are Doing in the Next 72 Hours

| Action | Why | Owner |
|---|---|---|
| Block 3 impersonation domains | Stop phishing campaigns reaching NOC staff | SOC |
| Alert NOC team to the threat | Stop staff from being deceived by current lures | CTI + NOC Lead |
| Request emergency security patch from Ericsson | Close the most critical vulnerability | NOC Engineering |
| Audit contractor access accounts | Ensure only currently active contractors retain access | IT Security |

---

## What We Need to Do Over 30–90 Days

| Investment | Benefit | Effort |
|---|---|---|
| Emergency ENM patch (vendor engagement) | Closes direct exploitation path | 2–3 weeks + Ericsson coordination |
| Upgrade contractor VPN to hardware MFA tokens | Prevents credential bypass | 10 days + ₪50K hardware |
| Ingest billing system logs into security monitoring | Enables detection of subscriber data theft attempts | 2 weeks + CAB approval |

---

## What We Cannot Detect Today

Our SS7 signaling network — which carries all subscriber calls, SMS, and location data — has no security monitoring. If an attacker gained access to our network management system, we would not know if they were silently reading subscriber communications. This is an architectural gap requiring a significant investment to fix (₪500K+, 6-month project). We recommend notifying INCD of this gap as we are designated Critical Infrastructure.

---

## Recommended Decision

We need executive authorization to: (1) proceed with emergency ENM patching outside the normal change management cycle, and (2) budget approval for hardware MFA tokens for contractor VPN access. Both require deviating from standard process given the urgency.

**Confidence in this assessment**: High — based on 4 independent intelligence triggers including a government advisory and a confirmed peer incident.
