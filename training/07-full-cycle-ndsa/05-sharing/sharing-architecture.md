# Sharing Architecture — PROJ-2025-007 (NDSA CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2025-10-01

---

## Sharing Principles

1. **TLP governs all distribution** — all products marked before distribution; MISP sharing groups enforce TLP mechanically
2. **Classified downgrade process is mandatory** — INCD TLP:RED material cannot reach SOC directly; a formal downgrade step is required and must be documented
3. **No citizen PII in shared products** — authentication metadata may be shared; citizen identity data (names, teudat zehut, biometric hashes) are not shared under any circumstances
4. **Reciprocity** — NDSA's unique GovID authentication telemetry is the primary contribution to INCD and CERT-IL; sharing is bidirectional

---

## Sharing Matrix

| Recipient | Relationship | What NDSA Shares | TLP Level | Mechanism | Status |
|---|---|---|---|---|---|
| CERT-IL | Sector sharing MOU | GovID 2.0 authentication abuse patterns (anonymized); lookalike domain IOCs; post-incident assessments (30d after close) | TLP:AMBER | MISP TAXII 2.1 sync | **MOU not signed — P1** |
| INCD | CII mandatory reporting + intelligence partnership | Quarterly intelligence submission; GovID API anomaly feed; PIR-005 product | TLP:AMBER + formal submission | Quarterly submission via Friedman; MISP event for indicators | Active (informal) |
| ITA | Peer government agency (shared HavayaIT contractor risk) | HavayaIT access anomaly indicators (anonymized); general government infrastructure TTPs | TLP:AMBER | MISP (after MOU) | **MOU not signed — P2** |
| Internal SOC | Internal | IOC watchlist updates; hunting hypotheses; detection engineering recommendations | TLP:GREEN | SIEM watchlist push + weekly SOC Flash | Active (manual) |
| CISO | Internal | Monthly operational report; quarterly strategic assessment | TLP:AMBER | Email + secure document share | Active |
| DG | Internal | Quarterly Board-ready briefing | TLP:AMBER | Quarterly document | Active (starting Q1 2026) |
| MoI | Downstream | Sanitized weekly GovID threat summary (behavioral descriptions only; no IOCs) | UNCLASSIFIED | Weekly email summary | Active (one-directional) |

---

## CERT-IL MOU Key Terms (draft)

**NDSA contributes to CERT-IL:**
- GovID 2.0 authentication volume anomalies (source IP, token type, call pattern — no citizen PII)
- Lookalike domain indicators targeting GovID / NDSA brands — TLP:AMBER; immediately on discovery
- Post-incident reports 30 days after incident closure — anonymized; TLP:AMBER
- New contractor supply chain indicators (e.g., HavayaIT-related IOCs) — TLP:AMBER

**CERT-IL contributes to NDSA:**
- MISP TLP:AMBER feed: Israeli government, biometric, identity tags — daily automated
- Emergency notifications for active campaigns against Israeli government platforms
- Quarterly government sector threat bulletin

**Emergency protocol:** Friedman (INCD) serves as 24/7 TLP:RED escalation for material requiring immediate classification review before SOC action.

---

## ITA MOU Framework

**Scope rationale:** ITA and NDSA share HavayaIT Systems Ltd. as a contractor. Cross-agency HavayaIT activity correlation can only happen if both agencies share under a formal agreement.

**What NDSA shares with ITA:**
- HavayaIT VPN access anomaly indicators (without NDSA system detail) — TLP:AMBER
- General government infrastructure TTPs — TLP:AMBER

**What ITA shares with NDSA:**
- HavayaIT access anomaly indicators from ITA infrastructure — TLP:AMBER

**INCD coordination:** Any HavayaIT intelligence originating from INCD sources requires INCD approval before ITA sharing. Friedman is the coordination point.

---

## Classification Downgrade Process

For INCD TLP:RED advisories that contain actionable SOC content:

1. CTI Lead receives advisory from Friedman; stores in classified repository (CISO + CTI Lead only)
2. CTI Lead drafts sanitized version: removes source-identifying language, classified indicators, collection method references
3. Sanitized version labeled: `UNCLASSIFIED // TLP:AMBER // NDSA-DERIVED`
4. Legal review for PPL / classification compliance
5. CISO approval
6. Distribution to SOC and MoI

**Process design deadline:** November 2025 (per INCD RD-2025-NDSA-004 process requirement)

---

## NDSA-to-INCD Intelligence Feed

**What NDSA can uniquely provide to INCD:**
- GovID 2.0 authentication abuse patterns: 3.1M auth events/day provides cross-ministry visibility
- VRID query anomalies: bulk biometric query patterns that may signal pre-attack reconnaissance
- Contractor cross-agency access: HavayaIT NDSA access data; INCD can correlate with ITA data

**Privacy / PPL compliance:** Authentication metadata (source IP, timestamp, result) does not constitute personal data under PPL when not cross-referenced to citizen identity. BDA approval required before sharing biometric hash data. INCD-CID Section 11 authority covers national security data sharing.

---

## Sharing Performance Metrics

| Metric | Target | Baseline |
|---|---|---|
| CERT-IL MOU signed | Yes | **No** — P1 action |
| ITA MOU signed | Yes | **No** — P2 action |
| Indicators shared with CERT-IL / month | ≥10 | 0 (no MOU) |
| Indicators received from CERT-IL / month | ≥20 | 0 (no MOU) |
| INCD quarterly submission timeliness | 100% | 0% (program not yet operational) |
| MoI weekly summary timeliness | ≥90% | Not yet operational |
