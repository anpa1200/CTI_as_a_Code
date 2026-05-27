# Post-Delivery Feedback — PROJ-2024-002 (CelltronX Proactive Assessment)

**Review date:** 2024-10-15  
**Participants:** CTI Analyst, CelltronX CISO (Tal Shapiro), NetSys Vendor Manager, SOC Lead

---

## What Worked Well

1. Four-trigger convergence analysis produced a synthesized threat picture that could not be dismissed as a single-source risk — the CISO approved emergency NetSys access review on the strength of the multi-signal analysis.
2. Crown jewels analysis explicitly linked each asset to the adversary's known collection objectives (billing records, roaming data), making the risk statement concrete rather than generic.
3. Scenario 1 (NetSys contractor compromise) provided a named, actionable threat path that security leadership could present to the board without technical translation.

---

## What to Improve

| Issue | Impact | Recommended Change |
|---|---|---|
| Detection backlog has no Sigma rules | SOC cannot act on detection recommendations without writing rules from scratch | Draft Sigma rules alongside each detection backlog item; never leave a detection recommendation without at least a draft rule |
| MobileTech IL incident not converted to MISP event | Intelligence sharing with CERT-IL was delayed 5 days because the intelligence was in prose, not STIX | On receipt of peer-company incident intelligence, immediately structure it as a MISP event before starting analysis |
| NetSys IP binding recommendation was advisory only | 30-day reminder lapsed without enforcement mechanism | Vendor security requirements should include contractual deadlines with access suspension consequences — not recommendations |
| No HKCU or scheduled task detection recommendations | Detection backlog focused on AiTM and exfil; user-level persistence mechanisms not included | Use ATT&CK layer from crown jewels analysis to ensure detection backlog covers full kill chain, not just initial access and exfil |

---

## Detection Performance

No emulation exercise was run for this proactive assessment. The following draft rules were recommended:

| Rule | Status | Notes |
|---|---|---|
| Contractor VPN off-hours / non-corporate ASN | Recommended (draft) | Mirrors DET-004 from A01; reuse same rule |
| Billing API bulk call volume | Recommended (draft) | No Sigma rule drafted — gap identified in this review |
| NetSys `net.exe` domain enumeration | Recommended (draft) | Standard discovery detection; no rule written |

**Gap:** All three recommendations from the detection backlog lack Sigma rules in the `04-detection-backlog/sigma/` directory. Sigma rules must be drafted before the assessment is considered complete.

---

## Intelligence Gaps Identified

1. No standing source for Israeli telecom sector peer incident sharing — MobileTech IL intelligence came via informal contact, not a structured channel
2. NetSys Solutions Ltd. has no security questionnaire on file at CelltronX — baseline for vendor security assessment missing
3. No coverage of Iranian-nexus post-compromise tooling changes in Q4 2024 — tooling may have evolved since MobileTech IL incident

---

## Stakeholder Feedback

**CISO feedback (Tal Shapiro):** "The synthesized threat picture was exactly what I needed for the board. The contractor risk scenario was particularly useful. What was missing was the 'what to detect' section — recommendations without rules are not actionable for the SOC."

**SOC Lead feedback:** "We need draft Sigma rules attached to every detection recommendation. Prose descriptions of what to detect are not enough — we can't convert 'monitor for VPN anomalies' into a rule without a specification."

**NetSys Vendor Manager feedback:** "The IP binding requirement was flagged 30 days ago and we treated it as a recommendation. We would have moved faster if the contractual consequence was stated explicitly."

---

## Action Items

| Action | Owner | Due |
|---|---|---|
| Draft Sigma rules for all 3 detection backlog recommendations | CTI Analyst | 2024-10-30 |
| Register MobileTech IL intelligence as MISP event; share with CERT-IL | CTI Lead | 2024-10-20 |
| Issue formal contractual security requirement to NetSys (IP binding + MFA attestation) | CISO + Legal | 2024-10-20 |
| Add HKCU registry persistence detection to detection backlog | CTI Analyst | 2024-10-30 |
| Subscribe to ISP-ISAC (Israeli Information Sharing and Analysis Center) | CTI Lead | 2024-11-01 |
