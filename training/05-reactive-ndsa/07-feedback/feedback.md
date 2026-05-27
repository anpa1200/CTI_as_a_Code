# Post-Incident Feedback — PROJ-2025-005 (NDSA eID Breach)

**Date:** 2025-04-17  
**Completed by:** Yael Rotenberg, IR Lead; Col. (Res.) Dror Nativ, CISO  
**Review period:** 17 March 2025 – 17 April 2025

---

## What Worked

| Item | Detail |
|---|---|
| PAM session recording | CyberArk PAM-20250317-0151-HALEVI-01 was the primary evidence source for the 9.5-hour log gap window. Without PAM, the attack execution timeline would have been unrecoverable. This is the single most important control that worked. |
| VRID database audit logs | The DB query log at 02:47 IST was what triggered detection 36 hours later. While detection was slow, the log itself was complete, accurate, and unaffected by the wevtutil log clear. |
| Regulatory notification execution | All three regulatory deadlines were met, including the BDA notification with only a 14-minute margin. The INCD-CID notification form pre-preparation from the tabletop exercise in February 2025 was directly responsible for meeting the 8-hour deadline. |
| Multi-team coordination | IR, SOC, NOC, Legal, and CISO all operated without coordination failures during the 72-hour response window. |

---

## What to Improve

| ID | Finding | Root Cause | Action Item | Owner | Deadline |
|---|---|---|---|---|---|
| IMP-001 | GOV-DET-001 (contractor VPN off-hours) had a 12-hour quiet-period suppression that silenced it during the attack window | Developer added suppression to reduce FP volume without understanding it would also suppress TP events; no emulation test was required before deployment | Mandate emulation test (PASS/FAIL) for every detection rule before production deployment; add this to the MATZBEN CAB checklist | Detection Engineering | 2025-05-01 |
| IMP-002 | GOV-DET-002 (RDP lateral movement) was deployed only to lab scope, not production; excluded VRID-SRV-01 | MATZBEN CAB approval specified "lab environment" for initial deployment; production rollout was never scheduled | Every rule deployment must include a named list of production hosts; "lab only" is not an acceptable final state for P1 rules | SOC Lead | 2025-05-01 |
| IMP-003 | GOV-DET-004 (wevtutil log clear) had the same 12-hour quiet-period bug | Same root cause as IMP-001; the quiet-period pattern was copied across rules without review | Rule review audit: check all 47 deployed rules for quiet-period suppressors; remediate within 30 days | Detection Engineering | 2025-05-15 |
| IMP-004 | HavayaIT maintenance account (SVC-HAVAYAIT-MAINT) retained VRID-SRV-01 access 8 months after project completion | No automated access revocation process; contractor accounts are not reviewed at contract end | Implement 90-day contractor access review; all service accounts tied to a project must be deactivated when project closes | IT Security | 2025-06-01 |
| IMP-005 | 9.5-hour log gap on VRID-SRV-01 created investigation uncertainty | Winlogbeat agent stopped after wevtutil clear; no alerting on Winlogbeat silence; no log forwarding to immutable destination | Deploy immutable log forwarding (SIEM direct from kernel-level agent) on all Tier 1 systems; add Winlogbeat silence alert (>15 min) | SOC Engineering | 2025-06-15 |
| IMP-006 | HavayaIT M365 audit logs not obtainable without legal process | No contractual requirement for HavayaIT to share security logs with NDSA | Add mandatory log access clause to all contractor agreements at next renewal; require 30-day M365 log retention and NDSA access | CISO + Legal | 2025-07-01 |
| IMP-007 | BDA notification sent at 23:30 IST — 14-minute margin — due to late CISO decision | CISO Nativ was unavailable from 15:45 to 17:00 IST; single-person authorization bottleneck | Define a deputy CISO authorization authority for regulatory notifications; this must not require CISO personal availability | CISO | 2025-05-15 |

---

## Detection Performance

| Rule | Expected Result | Actual Result | Failure Mode |
|---|---|---|---|
| GOV-DET-001 (Contractor VPN off-hours) | Fire at 01:44 IST 17 March | Did not fire | 12-hour quiet-period suppression |
| GOV-DET-002 (Contractor DMZ → Operational RDP) | Fire at 02:03 IST 17 March | Did not fire | Deployment scope excluded VRID-SRV-01 |
| GOV-DET-004 (wevtutil log clear) | Fire at 05:33 IST 17 March | Did not fire | 12-hour quiet-period suppression |
| VRID DB audit monitoring (manual) | Alert on full-table SELECT | Detected 36h later (manual review) | No automated rule; detection was luck |

**Overall detection coverage at time of incident:** 0 / 13 ATT&CK techniques detected  
**Root cause pattern:** Configuration bugs (2 rules) + deployment scope errors (1 rule) + no rules for remaining 10 techniques

---

## Intelligence Gaps

| Gap | Impact on Investigation | Recommended Fix |
|---|---|---|
| HavayaIT M365 audit logs (5-day window) | Full scope of initial access phase unknown; may have included reconnaissance of other NDSA staff accounts | Contractual log access requirement |
| Classified segment forensics | Cannot confirm whether GOVNET Classified Segment was reached; breach scope remains open | INCD parallel classified investigation (in progress) |
| C2 infrastructure attribution | 203.0.113.201 has no prior public attribution; cannot formally link to known threat actor without classified sources | INCD classified attribution request submitted |
| Biometric data fate | 340,218 records exfiltrated; unknown whether data has been copied, sold, or used | Monitoring of dark web and OSINT for data appearance; ongoing |

---

## Stakeholder Feedback

| Stakeholder | Feedback |
|---|---|
| INCD liaison (Lt. Col. Friedman) | "NDSA's notification was within deadline but the 14-minute margin on BDA is unacceptable for a national CII operator. Process must be improved." |
| Knesset Interior Committee | Requested full report within 30 days; expressed concern about 8-month-old contractor access remaining active; specifically asked about contractor MFA |
| Director-General (Dr. Shamir) | "Detection zero out of 13 is not acceptable. I want to see the 30-day remediation plan within one week." |
| Privacy Protection Authority | Acknowledged notification; opened assessment of whether individual notification campaign is compliant with PPL proportionality requirements |

---

## Actions Summary

| # | Action | Owner | Deadline | Status |
|---|---|---|---|---|
| 1 | Emulation test mandate for all production detection rules (CAB update) | Detection Engineering | 2025-05-01 | Open |
| 2 | Full rule audit for quiet-period suppressors (all 47 rules) | Detection Engineering | 2025-05-15 | Open |
| 3 | Deputy CISO authorization authority for regulatory notifications | CISO | 2025-05-15 | Open |
| 4 | 90-day contractor access review cycle | IT Security | 2025-06-01 | Open |
| 5 | Immutable log forwarding + Winlogbeat silence alert on Tier 1 systems | SOC Engineering | 2025-06-15 | Open |
| 6 | M365 log access clause in contractor agreements | CISO + Legal | 2025-07-01 | Open |
