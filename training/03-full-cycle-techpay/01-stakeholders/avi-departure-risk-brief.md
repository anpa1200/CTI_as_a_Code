# Personnel Risk Assessment — Avi Ben-David Planned Departure
**Classification:** TechPay Internal — HR Restricted  
**Date:** 2024-10-01  
**Prepared by:** CISO Yael Mizrahi  
**For:** CTI Lead (incoming — you)

---

## Context

Avi Ben-David (Junior CTI Analyst, currently operating as sole CTI function) has submitted
notice of resignation effective **31 October 2024** (4 weeks from this brief date).

Avi's departure creates the following knowledge and access risks that the incoming
CTI Lead must address immediately.

---

## Knowledge Risks

| Knowledge Domain | Documented? | Notes |
|---|---|---|
| MISP administration | No | Avi is the sole admin; 3 feeds configured; config undocumented |
| Recorded Future API usage | No | API key stored in Avi's browser; 2 colleagues also have access but don't know how to use it |
| Splunk threat intel queries | No | ~15 search macros created by Avi; no documentation |
| CERT-IL FinCERT context | Partial | Membership lapsed 9 months ago — Avi knows but hasn't told leadership |
| Active investigations | No | 3 open MISP events related to the near-miss incident; only Avi understands them |
| Vendor relationships | No | Avi has personal contacts at Recorded Future and CIRCL (MISP feed maintainer) |

**Immediate action required:** Schedule knowledge transfer sessions before 31 October.

---

## Access Risks

| System | Avi's Access Level | Impact of Unrevoked Access |
|---|---|---|
| MISP | Admin | Could delete feeds, events, or indicators |
| Recorded Future | User (shared API key) | API key will remain active; no individual accountability |
| Splunk | Power User | Can view all security data including incident logs |
| TheHive | Analyst | Has visibility into open incident cases |
| Confluence | Editor | Can modify the threat intel runbook |

**Off-boarding checklist must be completed by 31 October.** HR has been notified.
Avi's access must be revoked on last day, not after.

---

## Intelligence Continuity Risk

If Avi departs without knowledge transfer:
- The MISP instance will have no admin for an unknown period
- The 3 open near-miss investigations will be abandoned mid-analysis
- SOC will lose even the low-quality weekly digest (however poor, it creates a routine)
- The BoI-CD 362 pre-assessment noted the CTI function's maturity; departure of
  the sole analyst before a replacement is onboarded could be flagged at the November review

---

## Transition Tasks for Incoming CTI Lead

1. **First week:** Meet with Avi; document MISP configuration, Splunk macros, vendor contacts
2. **Before 31 Oct:** Complete open MISP events analysis; hand off or close
3. **Before 31 Oct:** Audit Recorded Future API usage and establish individual API key
4. **Before 1 Nov:** Ensure MISP admin rights transferred; test all feeds
5. **30 days post-departure:** Review all Avi-created Splunk content for accuracy and relevance

---

## Note on CERT-IL FinCERT Lapsed Membership

This is a significant operational and compliance gap:
- BoI-CD 362 Section 4(2)(c) requires participation in sector ISAC/CERT sharing
- The lapse was discovered during the BoI-CD 362 gap assessment — Bank of Israel is aware
- Avi administratively failed to renew; the renewal process requires CISO signature
- **CISO is prepared to sign renewal immediately. You need to initiate the paperwork.**
- Contact: fincert@cert.gov.il (reference: TechPay's prior membership code TP-FC-2019)
