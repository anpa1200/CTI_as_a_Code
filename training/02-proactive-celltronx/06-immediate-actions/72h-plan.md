# 72-Hour Immediate Action Plan — PROJ-2024-002

**Triggered by:** TRG-001, TRG-002, TRG-003 (CEDAR-SIGNAL active; lookalike domains live)  
**Plan created:** 2024-10-15T10:00+03:00  
**Plan expires:** 2024-10-18T10:00+03:00  
**Approved by:** CelltronX CISO

**Threat level:** HIGH — active adversary with confirmed sector targeting; CelltronX infrastructure currently exposed (ENM CVE-2023-44481 unpatched; 3 lookalike domains live)

---

## Hour 0–24

| # | Action | Owner | Success Criterion | Done? |
|---|---|---|---|---|
| 1 | Block all 3 lookalike domains at DNS and email gateway | SOC | Domains blocked; NOC staff cannot resolve; mail gateway rejects | ☐ |
| 2 | Deploy contractor VPN off-hours ASN detection rule (DET-001) | SOC | Rule active in Elastic SIEM; SOC runbook updated | ☐ |
| 3 | Open emergency ticket with Ericsson for ENM CVE-2023-44481 patch | NOC Engineering | Ticket opened; patch availability and timeline confirmed from Ericsson | ☐ |
| 4 | Brief NOC team on CEDAR-SIGNAL ISO dropper lure | CTI | NOC briefed; ISO attachments from external sources blocked at mail gateway | ☐ |
| 5 | Add IOCs from TRG-001/TRG-002/TRG-003 to SIEM watchlist | SOC | IOC alerts active in Elastic SIEM | ☐ |

## Hour 24–48

| # | Action | Owner | Success Criterion | Done? |
|---|---|---|---|---|
| 6 | Audit all active contractor VPN accounts — revoke any not required in last 30 days | IT Security | Unused accounts disabled; access list reviewed and signed off by NOC Lead | ☐ |
| 7 | Deploy DET-004 (LSASS comsvcs) on NMS-accessible Windows hosts | SOC | Rule active on all NMS hosts | ☐ |
| 8 | Begin MATZBEN CAB request for billing API log ingestion | SOC Engineering | CAB request submitted | ☐ |
| 9 | Verify Nokia NetAct console is not publicly exposed (Shodan finding in TRG-003 osint) | NOC Engineering | NetAct access restricted to corporate IP range; public exposure closed | ☐ |

## Hour 48–72

| # | Action | Owner | Success Criterion | Done? |
|---|---|---|---|---|
| 10 | Present threat assessment to CISO and initiate ENM emergency patching authorization | CTI + CISO | Emergency patch authorization signed; Ericsson PS engagement initiated | ☐ |
| 11 | Transition detection backlog to 30-day sprint | CTI + SOC | Sprint 1 items assigned; Sprint 2 infrastructure items tracked in JIRA | ☐ |
| 12 | Submit notification to INCD re: SS7 MAP monitoring gap | CISO | INCD notification filed per CII obligation | ☐ |

---

## Escalation Criteria

Escalate immediately to CISO + INCD if:

- [ ] Any IOC from TRG-001/TRG-002 detected in CelltronX environment
- [ ] Any contractor VPN logon from non-IL ASN outside business hours
- [ ] Any ENM authentication failure spike
- [ ] Any SS7 MAP query volumes above baseline (if monitoring becomes available)

**Escalation contacts**: CISO [phone], NOC Director [phone], INCD 24h [phone]
