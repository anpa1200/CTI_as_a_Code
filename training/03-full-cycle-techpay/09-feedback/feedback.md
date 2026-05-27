# Program Review — PROJ-2024-003 (TechPay Full-Cycle CTI Program)

**Review type:** Q1 2025 Quarterly Program Review  
**Review date:** 2025-01-15  
**Participants:** CTI Lead (Avi Ben-David, departing), Incoming CTI Lead, CISO (Yael Mizrahi), SOC Lead, BoI Compliance Officer

---

## Program Performance Summary

| Metric | Target | Q1 Baseline | Notes |
|---|---|---|---|
| PIR coverage rate | 90% | 40% | 3 of 5 PIRs have at least one product; PIR-003 and PIR-004 have zero products |
| Intelligence product delivery | Monthly + triggered | 2 strategic / 1 SOC flash | Tactical product layer absent |
| CERT-IL MOU status | Active | Lapsed 9 months | Highest-priority program gap |
| Collection source health | All green | 2 critical gaps | No commercial platform; no CERT-IL MISP |
| BoI-CD 362 compliance | Full | Gap on all 3 sections | Annual validation not yet conducted |

---

## What Worked Well

1. PIR framework and claims ledger methodology established correctly — every strategic product traces assertions to evidence sources with Admiralty Scale ratings. This survived a BoI examiner review in November 2024.
2. Near-miss incident (October 2024) was absorbed into the program as PIR-002 (PayNext acquisition) and PIR-003 (Ben-David departure risk) — demonstrates the program's ability to retask in response to internal events.
3. SOC-Flash format (2-page, KQL-ready) was adopted by SOC Lead as the preferred tactical alert format after the W04 flash on AiTM phishing activity.

---

## What to Improve

| Issue | Impact | Recommended Change |
|---|---|---|
| No tactical intelligence product layer | PIR-001 and PIR-002 have strategic products only; SOC receives strategic insights but no operator-level technical advisories | Establish monthly tactical product cycle; assign dedicated analyst time |
| CERT-IL MOU lapsed 9 months | MISP feed not accessible; CERT-IL sector bulletins arrive by email without structured IOC data | Assign re-activation to incoming CTI lead as 30-day priority; involve CISO for institutional sign-off |
| Ben-David departure knowledge transfer incomplete | PIR-003 risk is real; collection contacts, source registry, and claims rationale are in Ben-David's head | Require PIR rationale and source notes to be written into the claims ledger — not just conclusions |
| No commercial threat intelligence platform | PIR-002 PayNext coverage depends on open source only | Budget request for one commercial platform (₪180K/year) was approved in Q4; procurement in Q1 |
| BoI-CD 362 annual detection validation not scheduled | Regulatory non-compliance risk; BoI examination expected Q2 2025 | Schedule exercise for Q1 2025; use Operation Desert Cipher TTPs as source (see A04) |

---

## Intelligence Gap Analysis

| Gap | PIR Affected | Risk if Unaddressed |
|---|---|---|
| No CERT-IL MISP access | PIR-001, PIR-002 | Blind to sector-specific threat actor campaigns targeting Israeli financial institutions |
| No PayNext technical security posture assessment | PIR-002 | M&A integration risk unquantified; exposed attack surface unknown |
| No coverage of AiTM tooling evolution (EvilGinx2 variants) | PIR-001 | Detection rules designed for current tooling will miss evolved variants |
| Ben-David personal contact network not transferred | PIR-003 | Loss of informal intelligence sharing relationships with sector peers |

---

## Stakeholder Feedback

**CISO feedback (Yael Mizrahi):** "The strategic landscape assessment is good. What we're missing is the tactical layer — the SOC needs something more operational than a quarterly strategic assessment. The SOC flash format worked well. We need more of those."

**SOC Lead feedback:** "The KQL hunting hypothesis in SOC-Flash-2025-W04 was actionable immediately. That's the format we need for everything. Strategic products are good for context but I can't hunt with them."

**BoI Compliance Officer feedback:** "BoI-CD 362 Section 6 annual detection validation has not been conducted. This is a compliance gap. Please schedule before Q2 BoI examination."

---

## Action Items for Q2 2025

| Action | Owner | Due |
|---|---|---|
| Re-activate CERT-IL MOU — incoming CTI lead to initiate | Incoming CTI Lead + CISO | 2025-02-14 |
| Schedule BoI-CD 362 annual detection validation exercise | CISO + SOC Lead | 2025-02-28 |
| Produce first tactical intelligence product (AiTM tooling update) | Incoming CTI Lead | 2025-02-28 |
| Complete PayNext security posture assessment and add to PIR-002 | CTI Lead + IT Security | 2025-03-31 |
| Formalize Ben-David knowledge transfer to claims ledger | Ben-David (departing) | 2025-01-31 |
