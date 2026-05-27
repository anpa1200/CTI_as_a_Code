# CERT-IL Sector Intelligence Report — Israeli Government Digital Services
## Q1 2026 (January–March 2026)

**TLP: AMBER**  
**Report ID:** CERT-IL-SECTOR-GOV-2026-Q1  
**Date:** 2026-04-01  
**Distribution:** Government digital services agencies (CERT-IL membership)  
**Sector:** Israeli Government / E-Government / Digital Identity

---

## Executive Summary

Q1 2026 saw sustained Iranian-nexus threat activity against Israeli government digital
infrastructure, with three confirmed incidents across the sector. Supply chain compromise
remains the primary initial access vector. The March 2025 NDSA incident (publicly known)
is consistent with the broader campaign pattern described in this report.

Government agencies operating digital identity and authentication services remain
the highest-priority targets. Adversaries show specific interest in biometric enrollment
data and government employee authentication credentials.

---

## Threat Actor Activity

### Cluster 1: CEDAR-SIGNAL (Israeli Government Targeting Focus)

**Assessed motivation:** Espionage — biometric and identity data collection  
**Q1 2026 activity level:** HIGH  
**New developments:**
- Expanded targeting to include Israel Tax Authority (ITA) IT contractors (February 2026)
- New C2 infrastructure provisioned in February 2026: /24 subnet in same Vultr ASN as prior campaigns
- Modified AiTM infrastructure to evade updated CERT-IL IOC blocklists (new domains registered with different registrars in Q1 2026)

**Observed TTP changes:**
- Adopted "living off the land" approach on Linux infrastructure — reduced custom malware, increased use of curl, wget, cron jobs
- SSH key theft now primary credential access method (versus password theft in 2024)
- Exfiltration shifted from HTTPS to SFTP over port 22 (blends with legitimate SSH traffic)

### Cluster 2: FIN-CLUSTER-17 (Financial Motivation, Government-Adjacent)

**Assessed motivation:** Financial — access to government payment systems  
**Q1 2026 activity level:** MEDIUM  
**Activity:** Targeting NDSA BenefitsIL payment processing system and ITA tax payment infrastructure. Believed distinct from CEDAR-SIGNAL based on TTP differences and targeting pattern.

---

## Incident Summary (Anonymized — Q1 2026)

| # | Date | Organization Type | Method | Outcome | Data Affected |
|---|---|---|---|---|---|
| 1 | 2026-01-14 | Government benefits agency | SSH key theft via contractor | Brief access to payment processing system | No confirmed exfiltration |
| 2 | 2026-02-07 | IT infrastructure vendor (government clients) | Spearphishing → AiTM | Credential theft — 3 employee accounts | Government agency APIs accessible |
| 3 | 2026-03-02 | Tax authority IT contractor | Supply chain (same contractor as incident 1) | Unauthorized access to internal API | Tax record metadata (not PII confirmed) |

**Pattern:** Incidents 1 and 3 involve the same contractor (anonymized). CERT-IL has notified INCD.
Agencies sharing contractors with HavayaIT profile should treat contractor access as elevated risk.

---

## Indicators of Compromise (Q1 2026)

| Indicator | Type | Cluster | Confidence | Notes |
|---|---|---|---|---|
| `gov-portal-auth-il[.]com` | Domain | CEDAR-SIGNAL | High | New AiTM domain (Jan 2026) |
| `ndsa-sso-secure[.]net` | Domain | CEDAR-SIGNAL | High | Specifically mimics NDSA SSO |
| `203.0.113.150` | IPv4 | CEDAR-SIGNAL | High | New C2 (Feb 2026); same ASN as prior |
| `203.0.113.151` | IPv4 | CEDAR-SIGNAL | Medium | Same /24 as .150 |
| `svc-backup-cron` | Username pattern | Both clusters | Medium | Adversary service account naming |
| SFTP to non-government IP from Linux hosts | Behavioral | CEDAR-SIGNAL | High | New exfiltration method |

---

## Recommendations for Government Digital Service Operators

1. **Immediate:** Audit all contractor SSH authorized_keys; rotate any key not recently reconfirmed by contractor
2. **Immediate:** Alert on SFTP connections from internal Linux servers to non-government external IPs
3. **Short-term:** Deploy auditd on all Linux hosts handling government identity data; forward to SIEM
4. **Short-term:** Enroll in CERT-IL automatic IOC distribution feed (automatic blocklist push)
5. **Strategic:** Establish contractor security requirements that include MDM enrollment for devices accessing government systems

---

## PIR Implications for NDSA CTI Program

For agencies building new CTI programs in Q1 2026, this report should inform:
- **PIR-1:** Focus on Iranian-nexus contractor targeting — the attack surface has not reduced
- **PIR-2:** ITA as a sharing partner is particularly high value — shared contractor risk
- **Collection Priority:** SFTP monitoring from Linux infrastructure should be added to detection backlog
- **Sharing Obligation:** NDSA incidents should be contributed to CERT-IL quarterly sector report
  (per INCD Remediation Directive RD-2025-NDSA-004, RD-2)
