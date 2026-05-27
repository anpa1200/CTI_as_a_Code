# Post-Delivery Feedback — PROJ-2025-006 (GovID 2.0 Pre-Launch Assessment)

**Review date:** 2025-11-15  
**Participants:** Shai Rotenberg (CTI Lead), Gila Ben-Moshe (SOC Lead), Col. Nativ (CISO), Dr. Yaron Levi (GovID 2.0 Project Director), BiometricTech Vendor Liaison

---

## What Worked Well

1. Four-trigger convergence analysis produced a credible case for delaying the launch — the BiometricTech API probing signal (TRG-004) combined with the NDSA breach pattern (TRG-001) was what convinced Col. Nativ to recommend conditional launch rather than full launch.
2. 72-hour action plan with specific, named owners and escalation criteria was used as-is by the SOC during the pre-launch risk period.
3. Sprint-aligned detection roadmap (Sprint 1/2/3) was accepted by the GovID 2.0 development team as a contractual annex — a first for a CTI deliverable at NDSA.
4. Executive brief's ₪8.5M vs. ₪14M cost comparison provided the budget justification for 5 additional detection engineering sprints without requiring CISO to argue in abstract risk terms.

---

## What to Improve

| Issue | Impact | Recommended Change |
|---|---|---|
| Detection backlog has no Sigma rules | SOC received 12 detection recommendations with no implementation artifacts | Draft Sigma rules must accompany every detection backlog entry; rule stubs are acceptable but empty sigma/ directory is not |
| TRG-004 (BiometricTech notification) not structured as MISP event on receipt | Intelligence sharing with CERT-IL delayed; Tor exit node 185.220.101.47 not shared as MISP event for 3 weeks | On receipt of vendor security notification, structure as MISP event within 24 hours |
| Vendor security requirements letter not issued until emulation exercise (A08) | BiometricTech IP binding remained optional rather than contractual for 3 months | Security requirements to vendors should be formalized as contract amendments at time of assessment, not after emulation validation |
| Assessment scope did not include GovID 2.0 source code review | Supply chain risk (HavayaIT code contribution) not assessed at code level | Future vendor-integrated systems should include a minimum developer credential and repository hygiene check in scope |

---

## Detection Coverage Assessment

| Rule | Sprint | Status at Delivery | Notes |
|---|---|---|---|
| DET-G6-001 | Sprint 1 | Recommended (no Sigma) | Needs Sigma rule written |
| DET-G6-002 | Sprint 1 | Recommended (no Sigma) | Needs Sigma rule written |
| DET-G6-003 | Sprint 1 | Recommended (no Sigma) | Needs Sigma rule written |
| DET-G6-004 | Sprint 1 | Active in production | Only deployed rule at delivery |
| DET-G6-005 | Sprint 2 | Deployable (blocked on pipeline) | GovID API logs not in SIEM |
| DET-G6-006 | Sprint 2 | Deployable (blocked on pipeline) | Same pipeline dependency |

**Gap:** Sigma rules directory (`04-detection-backlog/sigma/`) was empty at delivery. All 12 detection recommendations in the backlog need rule stubs.

---

## Intelligence Gaps Identified

1. No coverage of BiometricTech's internal security posture — vendor is trusted but unverified; security questionnaire not completed before integration
2. No source collection on Tor exit node clustering for `.gov.il`-targeting activity — 185.220.101.47 was not in NDSA's watchlist before TRG-004
3. GovID 2.0 staging environment access controls not reviewed — Sprint 23 staging→production gap (SCN-002) existed for 6 weeks before assessment identified it

---

## Stakeholder Feedback

**SOC Lead feedback (Ben-Moshe):** "The 72-hour action plan was excellent — we used it verbatim. What we couldn't use were the detection recommendations without rules. Please include Sigma stubs in all future detection backlogs."

**CISO feedback (Col. Nativ):** "The conditional launch recommendation was the right call and it was accepted. The ₪8.5M vs ₪14M framing worked with the Director General. Recommend using cost-of-breach comparison in all future executive briefs."

**GovID 2.0 Project Director (Dr. Levi):** "The sprint-aligned roadmap was useful but came late — 6 weeks before launch is not enough time to remediate P1 gaps. Future CTI assessments should be commissioned at the architecture review stage, not 90 days before launch."

**BiometricTech Vendor Liaison:** "We would have implemented IP binding earlier if the contractual requirement was clear. The recommendation was noted; the contract clause was not updated. Please issue contract amendments for security requirements, not advisory memos."

---

## Action Items

| Action | Owner | Due |
|---|---|---|
| Write Sigma rule stubs for all 12 detection backlog items | CTI Analyst | 2025-12-01 |
| Structure TRG-004 as MISP event; share with CERT-IL | Rotenberg | 2025-11-20 |
| Issue contract amendment to BiometricTech requiring IP binding | CISO + Legal | 2025-11-30 |
| Commission future system CTI assessment at architecture review stage (policy change) | CISO | 2025-12-31 |
| Add GovID 2.0 source code hygiene (HavayaIT) to A08 exercise scope | Rotenberg | 2025-12-01 |
