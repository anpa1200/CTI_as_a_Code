# Sharing Architecture — PROJ-2024-003 (TechPay CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2024-10-15

---

## Sharing Principles

1. **TLP governs distribution** — all products are marked; TLP is enforced mechanically via MISP sharing groups, not just by convention
2. **No customer PII in shared products** — anonymize all transaction and merchant data before sharing externally
3. **Minimum necessary disclosure** — share indicators, not methods; do not disclose TechPay SIEM blind spots or collection gaps externally
4. **Reciprocity** — sharing is bidirectional; TechPay contributes to sector health as well as receiving

---

## Sharing Matrix

| Recipient | Relationship | What We Share | TLP Level | Mechanism | Cadence | Status |
|---|---|---|---|---|---|---|
| CERT-IL FinCERT | Sector ISAC (MOU) | Anonymized indicators; post-incident reports (30d after close); payment fraud patterns | TLP:AMBER | MISP sync (post-MOU renewal) | Continuous ingest; quarterly contribution | **MOU lapsed — renewal in progress** |
| Internal SOC | Internal | IOC watchlist updates; hunting hypotheses; detection engineering recommendations | TLP:GREEN | SIEM watchlist push + weekly SOC Flash | Weekly | Active (manual until MOU + automation) |
| CISO | Internal | Monthly operational report; quarterly strategic assessment | TLP:AMBER | Email + shared drive | Monthly + quarterly | Active |
| Legal / Board | Internal | Quarterly regulatory memo; Board-ready strategic summary | TLP:AMBER / UNCLASSIFIED | Email + presentation | Quarterly | Active |
| DG | Internal | Quarterly Board-ready assessment | TLP:AMBER | Briefing document | Quarterly | Active |

---

## Sanitization Process

Before sharing with CERT-IL FinCERT or any external partner:

1. **Remove** customer PII: merchant names, transaction values, account numbers
2. **Remove** TechPay-specific infrastructure details: internal IP ranges, VPN ASNs, SIEM search queries with internal field names
3. **Retain** technical indicators: C2 IPs, malicious domains, file hashes, MITRE ATT&CK technique IDs
4. **Mark** with TLP:AMBER and "For FinCERT member distribution only" where applicable
5. **Legal review** for any product containing information about named individuals or specific transactions

---

## TLP Reference

| Level | Distribution | Use Case |
|---|---|---|
| TLP:RED | CISO + CTI Lead only | Classified CERT-IL/INCD content; personnel-sensitive PIR-003 findings |
| TLP:AMBER | NDSA security team; FinCERT members | Operational threat intelligence; vendor communications |
| TLP:GREEN | All TechPay staff; sector community | Awareness communications; broad threat advisories |
| TLP:CLEAR (UNCLASSIFIED) | Public | Board summaries suitable for external audiences; regulatory disclosures |

---

## CERT-IL FinCERT MOU — Key Terms

*Pending renewal — terms to be negotiated Q4 2024:*

**TechPay contributes:**
- Anonymized indicators (IPs, domains, hashes) observed in TechPay infrastructure — TLP:AMBER via MISP
- Payment fraud pattern summaries (anonymized, aggregated) — TLP:AMBER quarterly
- Post-incident reports (anonymized, 30 days after closure) — TLP:AMBER

**TechPay receives:**
- Israeli financial sector threat bulletins — TLP:AMBER
- MISP feed access (payment sector tags) — TLP:AMBER automated
- Emergency out-of-hours notification for active campaigns against payment processors — TLP:RED via designated contact (CISO)

**Prohibited:** TLP:AMBER material not for public communication; not shareable outside FinCERT members without explicit CERT-IL approval.

---

## Performance Metrics

| Metric | Target | Current |
|---|---|---|
| CERT-IL MOU renewal | Q1 2025 | **Not started** |
| Indicators shared with CERT-IL monthly | ≥10 | 0 (MOU lapsed) |
| Indicators received from CERT-IL monthly | ≥20 | 0 (MOU lapsed) |
| SOC Flash timeliness | Every Monday by 09:00 | Not yet operational |
| CISO monthly report timeliness | By 5th of each month | Not yet operational |
