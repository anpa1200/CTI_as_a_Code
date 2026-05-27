# TechPay CTI — Weekly SOC Flash | 2025-W04

**Classification:** UNCLASSIFIED | For SOC Distribution  
**Date:** 2025-01-27  
**Prepared by:** CTI Lead

---

## PRIORITY MONITORING ITEM

**AiTM PHISHING CAMPAIGN TARGETING ISRAELI FINTECH**

ClearSky documented an active phishing kit targeting Israeli fintech employees with MFA bypass. Watch for VPN logons from Turkish or Romanian exit nodes outside business hours from any TechPay or PayNext employee account.

Detection query (Elastic — `filebeat-paloalto-*`):
```
event.action: "globalprotect-auth" AND user.name: * 
AND NOT source.as.number: (12345 OR 67890)
AND @timestamp: [now-24h TO now]
```
*(Replace 12345/67890 with TechPay corporate ASN numbers)*

---

## INDICATORS — ADD TO WATCHLIST

| Type | Value | Confidence | Context |
|---|---|---|---|
| IPv4 | 185.220.100.77 | Medium | Exit node used in 2 confirmed Israeli fintech AiTM attacks |
| IPv4 | 91.108.4.44 | Low | Possible AiTM proxy; seen in ClearSky November 2024 report |
| Domain | `techpay-account-verify[.]com` | High | Lookalike registered 2025-01-18; consistent with phishing infrastructure |
| Domain | `techpay-il-secure[.]net` | Medium | Registered 2025-01-12; no confirmed malicious use yet |

---

## HUNTING HYPOTHESIS

**"TechPay VPN session established from non-corporate ASN in past 30 days"**

```
KQL (index: filebeat-paloalto-*):
  event.action: "globalprotect-auth"
  AND user.name: *
  AND NOT source.as.number: (12345 OR 67890)
  
Time range: last 30 days
```

**Expected FP rate:** Medium — work-from-home employees, travel; suppress by correlating with shift schedule  
**Kill condition:** <3 unique non-corporate ASN sessions per week with no credential anomaly  
**If hunting finds results:** Escalate to CTI; check if user reports phishing activity in past 30 days

---

## CONTEXT

ClearSky Nov 2024 report documented AiTM attacks against 4 Israeli fintech companies. PayNext was one of the sectors mentioned as a target type. We have a pre-acquisition credential exposure on DarkOwl for 14 PayNext-email addresses — priority is detecting if any of those credentials are being used actively against the TechPay or PayNext environment this week.

*PIR-001 / PIR-005 relevance. AiTM rule deployment (P1) is in Q1 sprint.*
