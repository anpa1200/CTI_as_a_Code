# CERT-IL Bulletin CB-2025-041

**TLP: AMBER**  
**Bulletin ID:** CB-2025-041  
**Date:** 2025-06-05  
**Sector:** Israeli Government Digital Services / E-Government Portals  
**Priority:** HIGH

---

## Subject

Active Adversary-in-the-Middle (AiTM) Campaign Against Israeli Government Authentication Portals

---

## Summary

CERT-IL has confirmed an active AiTM phishing campaign targeting employees and contractors
with access to Israeli government digital service portals. The campaign employs reverse-proxy
infrastructure to bypass MFA and steal authenticated session tokens.

**Confirmed victims (anonymized):** 3 government agencies; 12 contractor accounts compromised.  
**Date range:** Active since approximately 2025-05-20; ongoing at time of bulletin.

---

## Technical Description

### Infrastructure

Adversary operates EvilGinx2-compatible reverse proxy infrastructure:
- Phishing domain registered via Porkbun or Namecheap; privacy-protected
- TLS certificate via Let's Encrypt (issued within 48h of domain registration)
- Hosted on Vultr VPS infrastructure (IP range: 203.0.113.0/24 in this bulletin's documentation)
- Domain pattern: `[agency-name]-[portal-type]-[.com/.net]`

### Observed AiTM Domains (fictional, documentation ranges)

| Domain | Mimics | Registration Date | Status |
|---|---|---|---|
| `onegov-portal-login[.]com` | OneGov national portal | 2025-05-18 | Active |
| `ndsa-staff-access[.]net` | NDSA employee portal | 2025-05-22 | Active |
| `govid-authentication[.]com` | GovID authentication gateway | 2025-05-28 | **GovID-specific** |
| `ministry-sso-portal[.]net` | Ministry SSO | 2025-06-01 | Active |

**Note:** `govid-authentication[.]com` specifically mimics the GovID authentication UI.
This domain was registered on 2025-05-28 — 6 days after the GovID 2.0 staging environment
was publicly announced in a Ministry press release. Timing is assessed as non-coincidental.

### Attack Flow

1. Spearphishing email to contractor or government employee with link to AiTM portal
2. Victim authenticates via reverse proxy — credentials and OTP captured in real-time
3. Adversary uses captured session cookie to authenticate as victim (MFA bypassed)
4. Session used for access to government systems within 2–8 minutes of credential capture
5. In confirmed cases: lateral access to file shares, API endpoints, or adjacent systems

### Phishing Email Characteristics

- Sender: Spoofed government sender with plausible domain (see examples below)
- Subject patterns: "GovID 2.0 Contractor Access — Mandatory Re-enrollment", "NDSA Secure Access Portal — Action Required"
- Urgency framing: 24–72 hour action deadlines
- Language: Hebrew and English; professionally written

---

## Indicators

| Indicator | Type | Confidence |
|---|---|---|
| `govid-authentication[.]com` | Domain | High |
| `onegov-portal-login[.]com` | Domain | High |
| `ndsa-staff-access[.]net` | Domain | High |
| `ministry-sso-portal[.]net` | Domain | Medium |
| `203.0.113.110` | IPv4 | High |
| `203.0.113.111` | IPv4 | Medium |

---

## Recommended Actions

1. **Block all listed domains and IPs** at DNS resolver and perimeter
2. **Alert on any Entra ID / SAML authentication from anomalous source IP** (session cookie theft)
3. **Issue contractor awareness notice** — do not enter GovID or government credentials on any portal reached via email link
4. **Review Conditional Access policies** — consider enabling token binding or require re-authentication for anomalous IP changes
5. **Monitor for new lookalike domain registrations** — run daily monitoring against `govid*` pattern
