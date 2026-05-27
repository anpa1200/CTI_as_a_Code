# 72-Hour Immediate Action Plan — PROJ-2025-006

**Triggered by:** TRG-003, TRG-004 (Stern credential exposure + active API probing)  
**Plan created:** 2025-06-19T09:00+03:00  
**Plan expires:** 2025-06-22T09:00+03:00  
**Approved by:** CISO Col. (Res.) Dror Nativ

**Threat level:** HIGH — active adversary probing GovID 2.0 API surface; developer credentials exposed; Sprint 23 staging→production gap unmitigated

---

## Hour 0–24

| # | Action | Owner | Success Criterion | Done? |
|---|---|---|---|---|
| 1 | Block 185.220.101.47 at NDSA perimeter firewall | SOC (Gila Ben-Moshe) | IP blocked; no further API calls from this IP reaching GovID endpoints; confirmed in SIEM | ☐ |
| 2 | Verify all GovID 2.0 API keys from Stern GitHub repo are rotated (JWT already rotated; check remaining keys) | IT Security | Full key inventory from Stern repo checked; all exposed keys confirmed rotated or expired | ☐ |
| 3 | Send formal security request letter to BiometricTech CISO | CISO (Nativ) | Letter transmitted; BiometricTech 24h response deadline acknowledged | ☐ |
| 4 | Force password reset for all HavayaIT contractor NDSA accounts (VPN + staging) | IT Security | All HavayaIT contractor accounts issued reset; new passwords required at next login | ☐ |
| 5 | Share 185.220.101.47 as TLP:AMBER IOC with CERT-IL via MISP | SOC | MISP event created; TRG-004 corroboration note added; CERT-IL acknowledged | ☐ |

## Hour 24–48

| # | Action | Owner | Success Criterion | Done? |
|---|---|---|---|---|
| 6 | Add firewall rule blocking staging IP range from querying production VRID 2.0 database | Network Ops | Staging IP range cannot reach VRID 2.0 DB; confirmed by network team test | ☐ |
| 7 | Deploy DET-G6-003 (staging JWT used from non-NDSA IP) in Elastic SIEM | SOC | Rule active; test case: staging JWT auth from external IP generates alert | ☐ |
| 8 | Deploy DET-G6-007 (lookalike domain DNS monitoring) | SOC | DNS watchlist rule active with CERT-IL CB-2025-041 domains plus GovID-pattern regex | ☐ |
| 9 | Receive BiometricTech response to formal security request; assess token status | CISO + CTI | Token status confirmed (legitimate or stolen); IP audit log received | ☐ |
| 10 | Audit staging environment access logs — review all sessions in 11-day Stern exposure window (2025-06-03 to 2025-06-14) | CTI + SOC | Any non-NDSA IP staging sessions identified and investigated | ☐ |

## Hour 48–72

| # | Action | Owner | Success Criterion | Done? |
|---|---|---|---|---|
| 11 | Submit MATZBEN CAB request for GovID API log pipeline (DET-G6-001 dependency) | SOC Engineering | CAB request submitted; 5-day review timeline confirmed | ☐ |
| 12 | Require BiometricTech to confirm source IP binding on vendor tokens within 48h (follow-up if not confirmed in their Hour 24 response) | CISO | BiometricTech confirms IP binding implemented or provides implementation commitment with date | ☐ |
| 13 | Brief Director-General on active threat; present launch risk matrix | CISO + CTI | DG briefed; launch risk accepted or 6-week delay decision made | ☐ |
| 14 | Submit INCD-CID Annex C skeleton with current threat scenarios (full version to follow) | CTI | Annex C draft version 0.1 submitted; INCD acknowledges receipt | ☐ |

---

## Escalation Criteria

Escalate immediately to CISO + DG if:

- [ ] BiometricTech confirms the probing token is legitimately issued — this means the adversary has valid vendor API access and the breach may already be in progress
- [ ] Staging access log review reveals non-NDSA IP sessions during Stern exposure window — VRID production data may have been accessed
- [ ] Any new IOC from the same ASN as 185.220.101.47 detected probing GovID 2.0 endpoints
- [ ] BiometricTech fails to respond within 24 hours — immediately suspend BiometricTech API access to GovID 2.0

**Escalation contacts:** CISO Nativ [secure phone], DG Shamir [secure phone], INCD Friedman [unit contact], SOC Lead Ben-Moshe [24h]

---

## Status Updates

| Time | Update |
|---|---|
| 2025-06-19T09:00 | Plan activated. 185.220.101.47 block initiated. |
| *(next update T+24h)* | — |
| *(next update T+48h)* | — |
| *(next update T+72h)* | Plan close-out; transition to 30-day sprint |
