# NDSA CTI — Weekly SOC Flash | 2026-W04

**Classification:** UNCLASSIFIED | For SOC Distribution  
**Date:** 2026-01-27  
**Prepared by:** CTI Lead (Maya Dvir)

---

## PRIORITY MONITORING ITEM

**HAVAYAIT IS AN ACTIVE IRANIAN-NEXUS SPEARPHISHING TARGET**

CERT-IL confirmed (December 2025 TLP:AMBER advisory) that HavayaIT Systems Ltd. is an active Iranian-nexus spearphishing target. This is the same contractor access path used in the March 2025 NDSA breach. Watch ALL HavayaIT contractor VPN sessions this week for off-hours logons from non-HavayaIT ASNs. GOV-DET-A05-001 is your primary alert. Do not dismiss as FP without checking source ASN.

---

## INDICATORS — ADD TO WATCHLIST

| Type | Value | Confidence | Context |
|---|---|---|---|
| Domain | `havayait-secure-portal[.]net` | High | Registered 2026-01-14; HavayaIT lookalike; consistent with Iranian-nexus phishing infrastructure pattern |
| Domain | `ndsa-contractor-update[.]com` | High | Registered 2026-01-09; NDSA contractor lookalike; likely phishing lure |
| IP | 185.220.101.47 | High | Active since Assignment 6 pre-launch; re-check for new probing activity |
| IP | 5.188.86.172 | Medium | New; appears in December 2025 CERT-IL MISP event; unconfirmed actor attribution |

---

## HUNTING HYPOTHESIS

**"HavayaIT contractor VPN sessions from non-HavayaIT ASN in the past 14 days — possible pre-attack credential test"**

```
KQL (filebeat-paloalto-*):
  event.action: "globalprotect-auth"
  AND user.name: (a.halevi OR y.stern OR [full HavayaIT account list])
  AND NOT source.as.number: [HavayaIT_corporate_ASN]
  AND @timestamp: [now-14d TO now]
```

**Expected FP rate:** Low — HavayaIT staff rarely work from non-corporate IPs  
**If hunting finds results:** Escalate to CTI Lead immediately; check with HavayaIT account manager before disabling account  
**Kill condition:** Zero non-corporate ASN sessions in 14-day lookback for all HavayaIT accounts

---

## CONTEXT

CERT-IL confirmed HavayaIT is targeted. This is the same contractor access path used in the March 2025 NDSA breach. New lookalike domains registered this week suggest active phishing infrastructure preparation — typically built 1–2 weeks before a campaign launch. GOV-DET-A05-001 (contractor VPN off-hours from non-corporate ASN) is the primary detection for the initial access technique. Confirm the rule is active and firing correctly before end of week.

*PIR-004 (elevated to High risk). See Q1 2026 quarterly assessment for full context.*
