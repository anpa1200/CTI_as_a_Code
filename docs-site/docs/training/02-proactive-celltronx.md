---
title: A02 — Proactive CTI — CelltronX Telecom
sidebar_position: 3
---

# A02 — Proactive CTI: CelltronX Telecom

**Mode:** Proactive · **Org:** CelltronX Telecom · **PROJ-2024-002**

## Scenario

CelltronX — a major Israeli telecom listed on the TA-35 index — has a new CISO with a 6-month mandate, a $3.5M Year 1 budget, and four concurrent trigger events landing within weeks of each other. Before an incident happens, build a threat model, detection backlog, and 90-day roadmap from scratch.

**Your entry point:** No CTI function exists. The detection engineering team can implement 6–8 rules per sprint. An INCD-CID compliance audit is 6 months away. Four triggers have just landed simultaneously.

## Four Trigger Events

| # | Trigger | Source | INCD-CID Relevance |
|---|---|---|---|
| TRG-001 | Peer telecom ransomware — 400K subscribers disrupted; credential stuffing initial access via VPN similar to CelltronX | Informal CISO call | Article 21(2)(b)(e) |
| TRG-002 | CERT-IL TLP:AMBER — [Iranian-nexus](https://anpa1200.github.io/israel-government-threat-actors-cti/) actor actively targeting Israeli telecoms with government contracts; SS7 + OSS/NMS TTPs | CERT-IL advisory | Article 21(2)(e) |
| TRG-003 | NetSys Solutions Ltd. contractor has AWS AdministratorAccess from 18 months ago — never revoked | Internal AWS IAM review | Article 21(2)(d) |
| TRG-004 | AiTM phishing blocked — 3 attempts in 2 weeks targeting OSS Engineering and Network Operations employees | Microsoft Defender ATP | Article 21(2)(b) |

## Crown Jewels (Top 5 of 10)

| Asset | Threat Attractiveness | Current Monitoring | INCD-CID Gap |
|---|---|---|---|
| BSS-Oracle (billing, 8M subscribers) | Very High — ransomware + fraud | None — not in SIEM | Critical — Art. 21(2)(e) |
| CDR Repository (GCP BigQuery, 2.1B records/month) | High — state actor, CDR geolocation | None — GCP not in SIEM | Critical |
| SS7 Gateway | Medium — subscriber intercept | None — no logging | Art. 21(2)(e) |
| Government communication channels | Low-Medium — national security | Partial | Art. 21(2)(e) |
| NetSys AWS AdministratorAccess | High — open right now | None — CloudTrail not in SIEM | Critical — Art. 21(2)(d) |

## Key Attack Paths

| Path | Scenario | Detection Blind Spot |
|---|---|---|
| AP-001 | Ransomware via VPN credential stuffing → Lateral movement → BSS encryption | No VPN alert rule; BSS not in SIEM |
| AP-002 | Nation-state OSS/NMS spearphishing → SS7 gateway subscriber intercept | Linux servers minimal visibility; SS7 no logging |
| AP-003 | NetSys AWS AdminAccess abuse → CDR BigQuery exfiltration | CloudTrail not in SIEM; GCP not in SIEM |
| AP-004 | AiTM phishing OSS Engineer → M365 session takeover → OSS/NMS console | Entra ID risky sign-in not configured |

## Detection Backlog (Sprint 1 priorities)

| ID | Technique | Rule Logic | Pre-requisite | Sprint |
|---|---|---|---|---|
| DB-001 | T1078 / T1110.003 | VPN: >10 failed auth from one IP in 5 min | Data already in Splunk | S1 |
| DB-002 | T1003.006 | EID 4662 DS-Replication-Get-Changes (not DC/AAD-Connect) | Enable Advanced Audit Policy all 3 DCs | S1 |
| DB-003 | T1059.001 | powershell.exe with -Enc or -EncodedCommand | [Elastic SIEM](/docs/services/elastic-siem) EID 1 already in Splunk | S1 |
| DB-004 | T1078.004 | CloudTrail AssumeRole from unexpected IP for NetSys role | CloudTrail → Splunk integration (3 days) | S1→S2 |
| DB-005 | T1530 | BigQuery job bytes_processed >10 GB from non-analytics account | GCP Pub/Sub → Splunk (2 weeks) | S2→S3 |

## Assignment Deliverables

1. **Business Threat Profile** — government contract threat profile change; trigger event analysis
2. **Crown Jewel Analysis** — 10–12 assets; INCD-CID compliance column
3. **Sector Threat Landscape** — 6 categories including Trusted Third-Party Abuse (NetSys)
4. **Trigger Event Analysis** — how each trigger updates the threat model
5. **4 Attack Path Models** — ATT&CK mapped; blind spot per path; minimum telemetry required
6. **Prioritized ATT&CK Technique List** — 15–20 techniques; business impact + detection gap
7. **Detection Backlog** — 12–15 items; sprint capacity constrained; pre-requisites noted
8. **Detection Coverage Matrix** — INCD-CID compliance column
9. **Telemetry Gap Analysis** — 12 log sources assessed with INCD-CID reference
10. **30/60/90-day Roadmap** — capacity-constrained; immediate NetSys remediation prioritized
11. **Executive Brief for Board** — 1 page; all 4 triggers addressed
12. **INCD-CID Compliance Gap Assessment** — Article 21 mapping

## Key Learning Objectives

- Incorporate concurrent trigger events into a threat model rather than building in a vacuum
- Treat an open third-party access exposure (NetSys) as an immediate remediation, not a backlog item
- Build a detection roadmap with explicit sprint capacity constraints and log-source pre-requisites
- Map INCD-CID Article 21 requirements to specific detection gaps — not just checkbox compliance
- Explain why the government contract public announcement changes CelltronX's threat actor relevance profile

## Cross-Links

- **Detection methodology:** [Field Manual — CTI to Detection](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-to-detection/intelligence-to-detection/)
- **Evidence discipline:** [Field Manual — Evidence Labels](https://anpa1200.github.io/cti-analyst-field-manual/docs/cti-foundations/evidence-labels/)
- **Same VPN and AiTM TTPs in incident context:** [A01 — LifeTech Pharma Reactive IR](./01-reactive-lifetech)
- **TechPay CTI program (same ecosystem):** [A03 — Full Cycle CTI TechPay](./03-full-cycle-techpay)
- **Israeli telecom sector threat context:** [Israel Government Threat Actors CTI](https://anpa1200.github.io/israel-government-threat-actors-cti/)

---

## Continue in the ecosystem

- [Full ecosystem](/docs/ecosystem) — tools and integrations used in this lab
- [Step-by-step methodology](/docs/cti-as-a-code-methodology) — the analytical framework behind every case
- [CTI Portfolio](https://anpa1200.github.io/cti.html) — all published projects and case work
