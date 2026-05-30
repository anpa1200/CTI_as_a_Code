---
title: A06 — Proactive CTI (Gov) — GovID 2.0
sidebar_position: 7
---

# A06 — Proactive CTI (Gov): GovID 2.0 Pre-Launch

**Mode:** Proactive · **Org:** NDSA GovID 2.0 · **PROJ-2025-006**

## Scenario

GovID 2.0 — Israel's next-generation biometric authentication gateway for 9.5 million citizens — launches in 4 months. INCD certification is required before go-live. The biometric engine is supplied by a third-party vendor (BiometricTech IL Ltd.) whose source code NDSA cannot inspect. Four intelligence triggers land within a 3-week window. Your job: threat model the launch, build a detection backlog, and produce a security go/no-go recommendation.

**Your entry point:** 5 existing detection rules (all post-[A05](/docs/training/05-reactive-ndsa) reactive), zero GovID 2.0–specific detections, ₪7.8M remaining security budget, and 5 business days of change control for every detection rule deployment.

## Four Trigger Events

| # | Trigger | Source | Classification | Confidence |
|---|---|---|---|---|
| TRG-001 | UAE government identity platform breached — biometric engine vendor credentials used to bulk-extract 1.7M templates; assessed [Iranian-nexus](https://anpa1200.github.io/israel-government-threat-actors-cti/) | [INCD](https://anpa1200.github.io/israel-government-threat-actors-cti/) TLP:AMBER (via Friedman) | TLP:AMBER — NDSA leadership only | Medium-High |
| TRG-002 | CERT-IL Bulletin CB-2025-041 — ongoing Iranian-nexus targeting of biometric infrastructure in Middle East and European government platforms | CERT-IL TLP:AMBER | TLP:AMBER | Medium-High |
| TRG-003 | BiometricTech IL Ltd. possibly named in classified tier of UAE advisory as affected vendor | INCD (classified; read-in pending 3 weeks) | TLP:RED via Friedman only | Low-Medium until read-in |
| TRG-004 | 2,400 calls/day to `/verify/bulk` endpoint from IP 185.220.101.47 (Tor exit node) on staging environment | NDSA internal monitoring | Internal | High |

## Architecture Under Threat

```
Citizen Browser / Mobile App
    ↓ HTTPS (TLS 1.3)
[GovID 2.0 Frontend Cluster] — 8 nodes, AWS GovCloud IL
    ↓ mTLS
[Biometric Matching Engine] — On-premise, Jerusalem (BiometricTech IL Ltd.)
    ↓ Encrypted API
[VRID 2.0 Database] — GOVNET Classified Segment
    ↓ Read-only feed
[Ministry Integration Bus v2] — 22 ministry systems
```

**Critical risk:** BiometricTech IL Ltd. vendor API credentials with access to the biometric matching layer. If the vendor is compromised (TRG-001/TRG-003 scenario), attacker credentials enable bulk biometric extraction without triggering NDSA's own detection rules.

## Attack Scenarios Modeled

| Scenario | ATT&CK | Source Trigger | Sprint |
|---|---|---|---|
| SCN-001 | T1530 Biometric API bulk extraction via vendor credentials | TRG-001, TRG-003 | S1 |
| SCN-002 | T1078.002 Staging API credential re-use in production | TRG-004 | S1 |
| SCN-003 | T1133 Off-hours contractor VPN from non-Israeli ASN | A05 lesson learned | S1 |
| SCN-004 | T1197 BITS downloader on GovID frontend nodes | A05 TTPs | S1 |
| SCN-005 | T1003.001 LSASS access on authentication nodes | A05 TTPs | S2 |
| SCN-006 | T1110 API rate-limit bypass / brute force on GovID endpoints | TRG-004 pattern | S1 |

## Detection Backlog (Sample)

| ID | Rule | ATT&CK | Status | Blocker |
|---|---|---|---|---|
| GOV-DET-006 | Biometric API bulk extraction (>50 `/verify/bulk` calls per 10 min from non-NDSA IP) | T1530 | **DRAFT — not deployed** | CAB approval needed; 5-day change control |
| GOV-DET-007 | GovID API rate limit bypass / brute force | T1110 | **DRAFT — not deployed** | CAB approval needed |
| GOV-DET-008 | Staging JWT from production IP (or production JWT from non-NDSA IP) | T1078.002 | **DRAFT — blocked** | Sprint 23 infrastructure fix required first |
| GOV-DET-009 | AiTM lookalike domain DNS resolution on contractor endpoints | T1566.001 | **DRAFT** | DNS monitoring on contractor endpoints not enabled |
| GOV-DET-010 | LSASS comsvcs.dll on GovID/VRID nodes | T1003.001 | ACTIVE (legacy) | High FP rate on backup tools |

## Assignment Deliverables

1. **Trigger synthesis document** — how all 4 triggers converge on the same attack surface
2. **GovID 2.0 threat model** — 6 attack scenarios mapped to ATT&CK; kill chain analysis
3. **BiometricTech vendor risk assessment** — supply chain threat; what NDSA can and cannot validate without source code access
4. **Detection backlog** — 15 items with CAB change control timeline; sprint assignments
5. **72-hour pre-launch security plan** — what must be verified before go-live
6. **Security go/no-go recommendation** — explicit recommendation with supporting evidence
7. **INCD certification evidence package** — required for Annex C pre-launch certification

## Key Learning Objectives

- Model threats against a specific, constrained architecture — not generic cloud or enterprise TTPs
- Work with a vendor component whose source code is unavailable — scope the risk honestly
- Account for government change control (5-day CAB) in your detection deployment timeline
- Distinguish between "TRG-003 is possible" and "TRG-003 is confirmed" — design threat models that remain useful under uncertainty
- Produce a go/no-go recommendation that is defensible to INCD certification authority
- Understand why staging → production API contamination is a distinct attack scenario requiring its own detection

## Cross-Links

- **Proactive CTI methodology:** [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/)
- **Source reliability:** [Field Manual — Source Reliability](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/source-reliability/)
- **Same breach that precedes this assignment:** [A05 — NDSA Reactive IR](./05-reactive-ndsa)
- **CTI program built post-launch:** [A07 — Full Cycle NDSA](./07-full-cycle-ndsa)
- **Detections from this assignment validated in:** [A08 — INCD Section 8 Emulation](./08-emulation-ndsa)
- **Israeli government threat context:** [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)

---

## Continue in the ecosystem

- [Full ecosystem](/docs/ecosystem) — tools and integrations used in this lab
- [Step-by-step methodology](/docs/cti-as-a-code-methodology) — the analytical framework behind every case
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — all published projects and case work

## Critical Pre-Launch Constraint

**GOV-DET-006 through GOV-DET-009 are draft rules and cannot be deployed without CAB approval.** If the assignment is executed without submitting Change Requests in advance, the emulation in A08 will test rules that were never deployed. Submit the CRs as part of the 72-hour pre-launch plan — not as an afterthought.
