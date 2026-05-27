# Tactical Intelligence Product — AiTM Phishing Infrastructure Targeting Israeli Financial Sector

**Product ID:** TAC-2025-001  
**TLP:** AMBER  
**Date:** 2025-02-28  
**Analyst:** TechPay CTI Program (incoming CTI lead)  
**PIR:** PIR-001 (Israeli payment sector threat landscape)  
**Distribution:** TechPay SOC, CISO, PayNext Integration Team

---

## Summary (for SOC use)

An AiTM (Adversary-in-the-Middle) phishing infrastructure cluster is actively targeting Israeli financial sector employees. The infrastructure uses a consistent pattern: EvilGinx2-based reverse proxy deployed on VPS providers in Eastern Europe, lure domains mimicking Israeli banking and payment portals, and session token harvest that bypasses TOTP-based MFA. Four Israeli financial entities have been targeted in Q4 2024 / Q1 2025 based on CERT-IL bulletins and peer sharing.

**Action required:** Deploy DET-004 (VPN ASN anomaly) immediately if not already active. Run KQL hunting hypothesis below against the past 90 days of VPN authentication logs.

---

## Infrastructure Pattern

| Component | Observed Value | Notes |
|---|---|---|
| Proxy technology | EvilGinx2 (fingerprinted via TLS certificate patterns) | Updated to bypass common AiTM fingerprints in Q1 2025 |
| Hosting | Frantech Solutions, Psychz Networks, M247 Ltd. ASNs | Residential VPN exit nodes used for final-mile access |
| Lure domain pattern | `[target-company]-portal[.]net`, `[target-company]-secure[.]io` | Registered via NameCheap or GoDaddy; aged 1–14 days at time of use |
| Redirect chain | Phishing email → lure domain → EvilGinx2 reverse proxy → Microsoft 365 login | Session token harvested at proxy layer; MFA code forwarded transparently |
| Post-compromise access | Contractor or employee VPN access from Turkish or Romanian residential IP | Off-hours (22:00–04:00 IST) |

---

## Indicators of Compromise (Current Campaign)

| Type | Value | Confidence | Source | Expiry |
|---|---|---|---|---|
| IP (C2/proxy) | 198.51.100.77 | Medium | CERT-IL TLP:AMBER bulletin | 2025-03-31 |
| IP (VPN exit) | 185.220.100.0/24 | High | Peer sharing + CERT-IL | 2025-06-30 |
| Domain pattern | `techpay-portal[.]net` (predicted) | Low | Pattern analysis | — |
| Domain (active) | `israelipay-secure[.]io` | Medium | CERT-IL TLP:AMBER | 2025-03-15 |
| User-agent pattern | `python-requests/2.31.0` (EvilGinx2 proxy fingerprint) | Medium | CERT-IL TLP:AMBER | 2025-04-30 |

*All IPs are RFC 5737/3849 documentation ranges in this training scenario.*

---

## Hunting Hypothesis

**Hypothesis:** TechPay VPN or M365 sessions have been compromised via AiTM in the past 90 days; one or more accounts may have authenticated from residential VPN ASNs.

**KQL — VPN logon from known residential proxy ASNs:**
```
event.dataset: "vpn.auth" AND event.outcome: "success"
AND source.geo.asn_org: ("Frantech Solutions" OR "Psychz Networks" OR "M247 Ltd" OR "AS9009" OR "AS395839")
AND @timestamp > now-90d
```

**KQL — Microsoft 365 impossible travel (if M365 logs in SIEM):**
```
event.provider: "AzureActiveDirectory" AND event.action: "UserLoggedIn"
AND geo.country_iso_code: ("TR" OR "RO" OR "IL")
AND @timestamp > now-90d
| eval travel_gap = abs(diff_time(prev_timestamp, @timestamp))
| where travel_gap < 3600 AND prev_country != geo.country_iso_code
```

**Manual check:** Pull past 90 days of contractor VPN authentication logs; filter for source ASNs not in the approved corporate network ASN list; flag any off-hours logons (22:00–06:00 IST) from non-corporate ASNs

---

## Comparison to Operation Desert Cipher TTP Pattern

This infrastructure cluster shares significant overlap with the Operation Desert Cipher campaign that targeted TechPay in October 2024:

| TTP | Desert Cipher | Current Cluster | Match? |
|---|---|---|---|
| AiTM session token bypass | T1557 | T1557 | Yes |
| VPN access from Turkish residential ASN | T1133 | T1133 | Yes |
| Off-hours VPN logon | Yes | Yes | Yes |
| Lure domain lookalike | T1566.001 | T1566.001 | Yes |
| M365 credential targeting | Yes | Yes | Yes |

**Assessment:** The current cluster is consistent with the same adversary cluster (Iranian-nexus assessed) responsible for Desert Cipher. Techniques are largely unchanged. The lure domain naming convention has evolved slightly — now using `-secure[.]io` suffix in addition to previous `-portal[.]net` pattern.

---

## Recommended Detection Actions

| Priority | Action | Owner | Deadline |
|---|---|---|---|
| P1 — Immediate | Deploy DET-004 (VPN ASN anomaly) if not yet live | SOC Engineering | Immediate |
| P1 — 48h | Block 185.220.100.0/24 at perimeter | IT Security | 2025-03-01 |
| P2 — 7 days | Add `python-requests/2.31.0` user-agent rule for VPN logon | SOC Engineering | 2025-03-07 |
| P2 — 7 days | Run 90-day retrospective hunting query; escalate any hits | SOC Analyst | 2025-03-07 |
| P3 — 30 days | Evaluate Microsoft Entra Conditional Access — block logons from Tor/proxy ASNs | IT + CISO | 2025-03-31 |

---

## Source Assessment

| Source | Admiralty Scale | Basis |
|---|---|---|
| CERT-IL TLP:AMBER bulletin (Feb 2025) | B/2 — Reliable source, probably true | CERT-IL track record; consistent with A01 incident data |
| Peer financial sector ISAC sharing | B/3 — Reliable source, possibly true | Single peer source; consistent with CERT-IL but not independently verified |
| Operation Desert Cipher pattern matching | A/1 — Completely reliable, confirmed | Internal evidence from A04 emulation and A01 incident timeline |

**Confidence in main assessment (AiTM cluster active in sector):** HIGH  
**Confidence in TechPay targeting (specific):** MEDIUM — no direct evidence TechPay is currently targeted; pattern analysis suggests sector-wide campaign
