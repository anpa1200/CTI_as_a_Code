# Stakeholder Map — PROJ-2025-007 (NDSA CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2025-10-01

---

## Primary Intelligence Consumers

| Stakeholder | Role | Key Need | PIRs | Preferred Format | Cadence |
|---|---|---|---|---|---|
| Dr. Ayelet Shamir | Director-General, NDSA | Defensible threat picture for Knesset; evidence that program works after March 2025 breach | PIR-001, PIR-005 (strategic) | Quarterly 3–4 page briefing (plain language; Board-ready) | Quarterly |
| Col. (Res.) Dror Nativ | CISO | Early warning for repeat of March 2025; TTP-to-detection translation; classified-to-SOC downgrade pathway | PIR-002, PIR-004, PIR-005 (operational) | Monthly operational report + quarterly strategic assessment | Monthly + triggered |
| Gila Ben-Moshe | SOC Lead | Weekly actionable indicators; hunting hypotheses; not essays | SIR-001, SIR-002, SIR-003 | Weekly SOC Flash (1 page, UNCLASSIFIED); SIEM watchlist auto-push | Weekly |
| Lt. Col. (Res.) Oren Friedman | INCD liaison | NDSA feeds GovID authentication telemetry back to INCD; NDSA receives classified advisories | PIR-005 (bidirectional) | Formal quarterly INCD submission; ad hoc on PIR-004 triggers | Quarterly + ad hoc |
| Rachel Goldstein | Legal / Compliance | Regulatory changes before they create reporting exposure | PIR-003 | Quarterly regulatory horizon memo | Quarterly |
| Ministry of Interior | Downstream consumer | GovID-related threat signals they can act on without NDSA-specific classified context | SIR-003 (sanitized only) | Weekly unclassified summary | Weekly |

---

## External Partners

| Partner | Relationship | What NDSA Shares | What NDSA Receives | Status |
|---|---|---|---|---|
| CERT-IL | Sector intelligence sharing (MOU required) | GovID 2.0 authentication abuse patterns; lookalike domains; post-incident assessments | MISP TLP:AMBER feed (government sector, biometric, identity tags); emergency notifications | **MOU not signed — P1 legal action** |
| INCD | Mandatory CII reporting; classified advisory channel | GovID 2.0 anomaly telemetry; PIR-005 feed | Classified advisories via Friedman; emergency notifications | Active (informal); formalization in progress |
| ITA (Israel Tax Authority) | Peer government sharing (same contractor risk) | HavayaIT access anomaly indicators | Same from ITA; HavayaIT cross-agency activity | **MOU not signed — P2** |
| HavayaIT Systems Ltd. | Vendor / contractor | Formal security requests; incident notifications | Security event logs for NDSA-project developers (contractual requirement pending) | **Contractual log requirement not in place** |
| BiometricTech IL Ltd. | Vendor (biometric API) | Security information requests | Vendor security reports; API access logs | **Contractual requirement not in place** |

---

## Stakeholder Requirements → PIR Derivation

| Stakeholder | Key Quote | PIR Derived |
|---|---|---|
| DG Shamir | "I need to be able to tell the Knesset committee that we know what is being planned against us and that we have a program to stop it" | PIR-001 (landscape); PIR-005 (NDSA-specific) |
| CISO Nativ | "The March 2025 advisory arrived 8 days before the breach and we had no way to act on it. That cannot happen again." | PIR-002 (capability evolution); PIR-004 (contractor threat) |
| SOC Ben-Moshe | "The INCD advisory says 'Iranian actors targeting government.' I need: which IP to block, which query to run, which account to watch." | SIR-001, SIR-002, SIR-003 |
| Legal Goldstein | "I need 3 months to design a compliance process before a regulation changes. I need to know what's coming." | PIR-003 |
| INCD Friedman | "NDSA's GovID authentication logs are unique visibility. 3.1M auth events/day across all government services — if you feed that to INCD, we can detect attacks against the whole government, not just NDSA." | PIR-005 (bidirectional) |

---

## Satisfaction Tracking

*(Baseline — program not yet operational. Target: quarterly survey from Q1 2026.)*

| Stakeholder | Target (1–5) | Baseline | Priority Complaint |
|---|---|---|---|
| CISO | ≥4 | Not measured | Intelligence arrives after breach, not before |
| SOC Lead | ≥4 | Not measured | Products too strategic; need tactical indicators |
| DG | ≥4 | Not measured | No regular intelligence briefings |
| INCD | ≥4 | Not measured | No structured NDSA-to-INCD intelligence feed |
| MoI | ≥3 | Not measured | No GovID threat signals reaching MoI at all |
