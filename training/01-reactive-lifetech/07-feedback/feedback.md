# Post-Delivery Feedback — PROJ-2024-001

**Review date:** 2024-11-27  
**Participants:** CTI Analyst, SOC Lead (Noa Ben-David), CISO (Dr. Yael Mizrahi)

---

## What Worked Well

1. Evidence inventory with explicit gap documentation enabled the CISO to make an informed risk statement about what is and is not known — gap transparency built trust.
2. Claims ledger traceability (every assertion mapped to evidence) meant the executive brief survived legal review without modification.

---

## What to Improve

| Issue | Impact | Recommended Change |
|---|---|---|
| WS-CFO-01 not enrolled in Velociraptor | Reconstruction of initial compromise chain relied on DNS logs only | All workstations with VP/C-suite access must be enrolled in EDR before next quarter |
| PowerShell EID 4104 disabled | Could not see decoded payload; investigation took 6 extra hours | Enable script block logging via GPO — immediate action |
| 30-min lateral movement detection delay | Rule fired 30 min late; useless for real-time detection | Reduce NetFlow polling to 5 min or use Sysmon EID 3 for near-real-time |
| No AiTM / impossible-travel rule on VPN | Most critical gap; attack pivoted technique would have been detected 12h before exfil | DET-004 deployed — monitor FP rate for 30 days then tune |

---

## Detection Performance

| Rule | Result | Latency | Notes |
|---|---|---|---|
| DET-001 (Office→PS) | PASS in lab validation | 15s | Deploy to production |
| DET-002 (LSASS comsvcs) | PASS in lab validation | 20s | Filter Veeam account |
| DET-003 (DCSync) | PASS in lab validation | 4s | Near-zero FP; high confidence |
| DET-004 (VPN ASN) | PARTIAL — requires MaxMind pipeline | N/A | Pipeline setup: 2 weeks |

---

## Intelligence Gaps Identified

1. No standing collection on Israeli pharma-sector threat campaigns — no early warning that AiTM campaigns were active in the sector before this incident
2. No awareness of `lifetechpharma-corp[.]eu` domain registration despite CERT-IL advisory on lookalike domains issued 3 months earlier

---

## Stakeholder Feedback

**SOC feedback**: "Claims ledger was invaluable — we could trace every IOC to its evidence. The SOC handoff format is what we want going forward."

**CISO feedback**: "Gap documentation in the executive brief was the right call — legal wanted to know what we don't know. Recommend adding a 'what would change this assessment' section to future briefs."

---

## Action Items for Next Investigation

| Action | Owner | Due |
|---|---|---|
| Enable EID 4104 script block logging via GPO | IT Security | 2024-12-01 |
| Enroll all C-suite workstations in Velociraptor | IT Security | 2024-12-15 |
| Setup MaxMind GeoIP enrichment in Elastic ingest pipeline | SOC Engineering | 2024-12-15 |
| Subscribe to CERT-IL FinCERT sector feed | CTI Lead | 2024-12-01 |
