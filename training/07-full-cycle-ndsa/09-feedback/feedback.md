# Program Review — PROJ-2026-007 (NDSA Full-Cycle CTI Program)

**Review type:** Q1 2026 Quarterly Program Review (INCD Compliance Milestone Review)  
**Review date:** 2026-02-15  
**Participants:** Shai Rotenberg (CTI Lead), Gila Ben-Moshe (SOC Lead), Col. Nativ (CISO), Lt. Col. Friedman (INCD Liaison), Adv. Goldstein (Legal)

---

## Program Performance Summary

| Metric | Target | Q1 Baseline | Notes |
|---|---|---|---|
| INCD compliance items completed | 8 by 2026-07-01 | 2/8 complete | M3 (SIEM deployed) + M4 (EDR deployed) done |
| PIR coverage rate | 90% | 65% | PIR-001 through PIR-003 covered; PIR-004 and PIR-005 partially |
| Intelligence product delivery | Monthly + triggered | On track | 1 strategic + 1 tactical + 2 SOC flash products in Q1 |
| CERT-IL MOU status | Signed | Pending | Draft terms submitted; awaiting CERT-IL legal review |
| Detection rule deployment | 8/8 INCD-required rules | 3/8 deployed | GOV-DET-006/007/009 blocked on pipeline + CAB |
| Emulation exercise (Section 8) | Complete Q1 2026 | Complete (2026-01-20) | 6 PASS / 2 PARTIAL / 3 FAIL; remediation plan submitted |

---

## What Worked Well

1. INCD compliance framework with 8 measurable milestones (M1–M8) gave the program a clear, externally-auditable success criterion — INCD accepted the milestone structure as the compliance roadmap.
2. HavayaIT elevation to High threat tier (December 2025) was supported by PIR-004 convergent intelligence and was accepted by the DG as the basis for the vendor security requirements notice issued after A08.
3. CERT-IL MOU draft terms were completed — first time NDSA has had formal CERT-IL MOU terms in legal review. Program delivered what prior programs failed to do.
4. SOC Flash products (W04 format) with KQL hunting hypotheses are being used by SOC analysts in real time — highest utilization rate of any intelligence product format tested.
5. NDSA-to-INCD unique intelligence feed rationale was accepted — INCD now formally recognizes NDSA GovID authentication log analysis as a valued intelligence contribution, creating a reciprocal intelligence-sharing rationale.

---

## What to Improve

| Issue | Impact | Recommended Change |
|---|---|---|
| CERT-IL MOU not yet signed despite 9-month priority | Entire program duration without MISP access; CERT-IL sector intelligence shared informally only | Escalate to DG Shamir level — MOU requires Director General signature; cannot be delegated to CISO alone |
| ITA MOU progress not tracked with deadline | ITA MOU treated as secondary; no deadline assigned | Assign formal deadline (2026-09-01) in INCD compliance roadmap; add as M9 |
| Review cadence insufficient for current threat level | Weekly operational reviews miss fast-moving threat updates | Increase to twice-weekly during active threat periods (CEDAR-SIGNAL active = elevated); return to weekly when threat level normalizes |
| Tactical intelligence layer under-resourced | CERT-IL Q1 sector report was adopted from external source; no NDSA-native tactical product for PIR-005 | Dedicate 20% analyst time to tactical product cycle; PIR-005 (GovID threat) requires internal tactical assessment |
| Backlog remediation tracking not linked to INCD milestones | GAP-001 through GAP-004 from A08 have deadlines; not reflected in INCD M6 milestone tracker | Link each gap remediation to the relevant INCD milestone; SOC engineering deadlines = milestone sub-tasks |

---

## INCD Compliance Progress

| Milestone | Description | Status | Deadline |
|---|---|---|---|
| M1 | CTI program established with defined PIRs and governance | Complete | 2026-01-01 |
| M2 | Incident response plan updated post-breach | Complete | 2026-01-15 |
| M3 | SIEM deployed (Elastic) | Complete | 2026-02-01 |
| M4 | EDR deployed on all monitored endpoints | Complete | 2026-03-01 |
| M5 | Detection rules deployed for all A05 incident techniques | **At Risk** — 5/10 rules deployed | 2026-04-01 |
| M6 | Annual detection validation exercise complete with INCD report | Complete (A08) | 2026-02-15 |
| M7 | P1 gap remediation confirmed by re-test | Not started | 2026-04-03 |
| M8 | CERT-IL MOU signed | Not started — in legal review | 2026-07-01 |

---

## Stakeholder Feedback

**INCD Liaison feedback (Lt. Col. Friedman):** "The Section 8 exercise report was well-structured and the remediation plan is accepted. The classified segment gap is noted; INCD will provide guidance on classified-segment validation options for 2027 cycle. M7 re-test date of 2026-04-03 is now a hard deadline — no extension."

**CISO feedback (Col. Nativ):** "The program has come a long way in 12 months. The main gap is the CERT-IL MOU — I need the Director General to sign this. Schedule a DG meeting. Also, the HavayaIT vendor notice was the right call and was overdue."

**SOC Lead feedback (Ben-Moshe):** "SOC flash products are working well. I want one every week, not every two weeks. If the threat level is elevated, we should increase cadence, not decrease it."

**Legal feedback (Adv. Goldstein):** "BDA Section 18(b) reporting obligations need to be mapped to the PIR framework explicitly. Currently PIR-005 (GovID 2.0 threat) references BDA implicitly; it should have explicit 8-hour reporting trigger criteria."

---

## Action Items for Q2 2026

| Action | Owner | Due |
|---|---|---|
| Escalate CERT-IL MOU to DG Shamir for signature | Col. Nativ (CISO) | 2026-03-01 |
| Add ITA MOU deadline (M9) to INCD compliance roadmap | Rotenberg | 2026-03-15 |
| Increase SOC flash cadence to weekly during CEDAR-SIGNAL elevated period | Rotenberg | 2026-03-01 |
| Assign 20% analyst time to PIR-005 tactical product cycle | Rotenberg | 2026-03-01 |
| Link GAP-001 through GAP-004 remediation to INCD M7 milestone | Rotenberg + Ben-Moshe | 2026-02-28 |
| Add BDA Section 18(b) trigger criteria to PIR-005 | Adv. Goldstein + Rotenberg | 2026-03-31 |
