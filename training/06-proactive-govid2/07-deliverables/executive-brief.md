# Executive Brief — GovID 2.0 Launch Risk Assessment

**Classification:** CONFIDENTIAL  
**Prepared for:** Dr. Ayelet Shamir, Director-General / NDSA Board  
**Date:** 2025-06-25  
**Prepared by:** Col. (Res.) Dror Nativ, CISO

---

## Bottom Line

NDSA is currently being actively probed by an adversary preparing to attack GovID 2.0 before or at launch. Four independent intelligence signals, including a classified advisory about a confirmed breach of a peer government biometric platform, point to an Iranian-nexus actor targeting our national identity infrastructure. We have one confirmed developer credential exposure and active unauthorized access attempts against our API layer. The GovID 2.0 launch should be conditional on meeting five specific security criteria before it proceeds.

---

## Why This Matters Now

Three weeks ago, a classified advisory from INCD described an Iranian-nexus actor breaching a UAE government biometric platform using our exact vendor API integration type — BiometricTech's `/verify/bulk` endpoint. The adversary moved from initial access to bulk data extraction within 96 hours of obtaining vendor credentials.

Last week, an NDSA contractor developer (Yoav Stern, HavayaIT) accidentally published his work credentials to a public repository, including an NDSA API key and a GovID 2.0 staging access token. This was live for 11 days before being discovered.

Three days ago, BiometricTech notified us that an IP address associated with Iranian-nexus operations in Israeli threat intelligence is making 2,400 API calls per day to GovID 2.0's bulk biometric endpoint — using what appears to be a valid vendor token. This is not coincidence: it is the same technique used in the UAE breach.

---

## Our Exposure

| Risk | Exposure | Why |
|---|---|---|
| GovID 2.0 bulk biometric API | **Critical** | No rate limiting; no source IP restriction on vendor tokens; adversary actively probing with what may be a valid token |
| Contractor developer credentials | **High** | HavayaIT developer credentials exposed on public GitHub for 11 days; VPN access not yet fully reset |
| Staging→production data overlap | **High** | Sprint 23 engineering gap allows some staging API calls to return production VRID data |
| No detection for bulk API extraction | **Critical** | GovID API logs are not in our security monitoring system; we would not see a bulk extraction in progress |
| 9.5M biometric records (VRID 2.0) | **Existential** | If breached at launch, these are non-reversible; Israeli citizens cannot change their fingerprints |

---

## What We Have Done in the Past 72 Hours

| Action | Status |
|---|---|
| Blocked adversary probing IP at our perimeter | Done |
| Sent formal security demand to BiometricTech to investigate their vendor token | Done |
| Required all HavayaIT contractor accounts to reset credentials | In progress |
| Blocked staging environment from directly querying production database | Done |
| Deployed initial detection rules for staging credential anomalies | Done |
| Notified CERT-IL of the probing IP as a shared threat indicator | Done |

---

## What We Cannot Detect Today

Our GovID 2.0 API layer runs on AWS cloud infrastructure. We currently have no automated monitoring of API call patterns. If the adversary obtains a valid BiometricTech vendor token and begins extracting biometric data at scale, we would not know it is happening until we manually reviewed logs — which is not operationally feasible at the 2,400+ calls per day rate we are already seeing in the probing phase.

Building this detection capability requires 2 weeks of engineering work and a change management approval. It is the single highest-priority item before launch.

---

## Launch Recommendation

**Recommended decision: Conditional launch — proceed on the original date only if all five conditions below are met by 1 September 2025. If not met, delay launch by 6 weeks to 15 November 2025.**

| Launch Condition | Status |
|---|---|
| API bulk extraction detection rule (DET-G6-001) deployed and tested | Open |
| BiometricTech vendor token source IP binding implemented | Open — BiometricTech response pending |
| BiometricTech security review completed OR INCD confirmed clear | Open |
| All HavayaIT developer credentials reset and MFA enforced | In progress |
| Sprint 23 staging→production gap closed (code fix, not just firewall) | Open |

The political cost of a 6-week delay is bounded and manageable. The security cost of a biometric breach at launch — affecting 9.5M Israelis with data that cannot be changed — is existential and irreversible.

---

## What We Need from You

**Approval requested:**

1. **Authorization to proceed with emergency detection engineering work** outside the normal 5-day MATZBEN CAB cycle — the 2-week API log pipeline build must start immediately to have a chance of meeting the launch condition.

2. **Guidance on BiometricTech relationship** — if BiometricTech's token is confirmed as stolen, we will need to suspend all BiometricTech API access to GovID 2.0. This will delay launch regardless. Your authorization for this action in advance will remove the delay in executing it if needed.

3. **Launch decision authority** — formal delegation of the go/no-go launch decision to CISO if the 5 conditions are met by 1 September, or confirmation that you will make this decision personally.

**Confidence in this assessment:** High — based on 4 independent intelligence sources including a government advisory and a confirmed peer incident using identical techniques.
