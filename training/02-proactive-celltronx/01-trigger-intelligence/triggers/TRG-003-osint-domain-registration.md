# OSINT: Lookalike Domain Registrations — CelltronX

**TLP: WHITE**  
**Source:** Passive DNS monitoring + domain registration feeds (DomainTools Iris, WhoisXML)  
**Date Observed:** 2024-10-11  
**Analyst:** CelltronX SOC (routine OSINT sweep)

---

## Summary

OSINT monitoring detected **three domain registrations** imitating CelltronX branding
within a 10-day window (2024-10-01 to 2024-10-11). Two domains are hosting active content
at time of discovery. One appears to be parked.

---

## Identified Domains

### Domain 1: `celltronx-noc-portal[.]com`

| Field | Value |
|---|---|
| Registered | 2024-10-01 |
| Registrar | Namecheap (privacy-protected) |
| Registrant country | Unknown (privacy shield) |
| NS | ns1.celltronx-noc-portal.com / ns2.celltronx-noc-portal.com |
| A record | 203.0.113.101 |
| MX | mail.celltronx-noc-portal.com |
| TLS cert CN | celltronx-noc-portal.com |
| TLS cert issued | 2024-10-01 (Let's Encrypt) |
| Page screenshot | Login form imitating CelltronX NOC portal branding |
| Assessment | **AiTM credential harvesting page — NOC staff targeted** |

### Domain 2: `celltronx-it-helpdesk[.]net`

| Field | Value |
|---|---|
| Registered | 2024-10-04 |
| Registrar | Porkbun (privacy-protected) |
| NS | ns1.porkbun.com |
| A record | 203.0.113.102 |
| MX | mail.celltronx-it-helpdesk.net |
| TLS cert CN | celltronx-it-helpdesk.net |
| TLS cert issued | 2024-10-04 (Let's Encrypt) |
| Page screenshot | "IT Helpdesk Self-Service Portal" — login form, CelltronX logo |
| Assessment | **AiTM credential harvesting page — general IT staff targeted** |

### Domain 3: `celltronx-enm-update[.]com`

| Field | Value |
|---|---|
| Registered | 2024-10-09 |
| Registrar | Porkbun (privacy-protected) |
| NS | ns1.porkbun.com |
| A record | 203.0.113.103 |
| MX | None configured |
| Page content | Parked page (no active content at scan time) |
| Assessment | **Pre-positioned — likely staging for future spearphish** |

---

## Infrastructure Correlation

All three IPs (203.0.113.101, .102, .103) are in the same /24.
Reverse DNS for .101 and .102 resolves to hostnames on the same VPS provider.
TLS certificate organization field: blank on all three (consistent with threat actor
operational security — no organizational name exposed).

URLScan.io screenshots and full scan results: see `osint/lookalike-domain-urlscan.json`

---

## Recommended Actions

1. **Block all three domains and IPs** at DNS resolver and perimeter firewall
2. **Add to SIEM watchlist** — alert on any DNS query from internal hosts to these domains
3. **Issue internal awareness notice** to NOC and OSS engineers — do not enter credentials
   on any portal not accessed via the CelltronX internal portal bookmark
4. **Share with CERT-IL** under TLP:WHITE for broader Israeli operator awareness
5. **Monitor for new registrations** — run daily monitoring against `celltronx*` pattern
   in domain registration feeds
