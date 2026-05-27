# Tactical Intelligence Report

**Product ID:** TAC-YYYY-XXX  
**Classification:** TLP:AMBER  
**Prepared for:** SOC / Detection Engineering / IR  
**Analyst:** [name]  
**Date:** YYYY-MM-DD  
**PIRs addressed:** PIR-XXX

---

## Situation

> Two sentences: what is the tactical intelligence, and why does it require action now?

[FILL IN]

---

## Threat Actor

**Designation**: [Assessed cluster or "Unknown"]  
**Confidence**: High / Medium / Low

---

## TTPs Reported / Observed

| Technique ID | Name | Phase | Specifics | Detection |
|---|---|---|---|---|
| T1XXX.XXX | | Initial Access | | Rule: [name] / GAP |

---

## IOCs

| Type | Value | Confidence | First Seen | Source | Action |
|---|---|---|---|---|---|
| IP | | High | | SRC-XXX | Block |
| Domain | | High | | | Block |
| Hash (SHA-256) | | High | | | Hunt + block |

---

## Detection Recommendations

### Immediate (deploy within 24 hours)
- Rule: [Sigma rule name in `04-analysis/` or `04-detection-backlog/sigma/`]

### Backlog (requires development)
- [TTP without existing coverage — add to detection backlog]

---

## Hunt Recommendations

> If IOCs are too new for rules, provide hunt queries to check for existing compromise.

| Query | Data Source | Window |
|---|---|---|
| | Elastic SIEM | Last 30 days |

---

## References

- Trigger: TRG-XXX
- Source: SRC-XXX ([CERT-IL bulletin / Peer report / etc.])
