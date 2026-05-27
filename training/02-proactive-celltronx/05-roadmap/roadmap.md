# Capability Improvement Roadmap — PROJ-2024-002

**Base date:** 2024-10-15 | **Horizon:** 90 days

---

## Immediate (72 hours — no budget, no CAB required)

| Action | Owner | Success Criterion |
|---|---|---|
| Block 3 lookalike domains at DNS and email gateway | SOC | Domains blocked; NOC staff cannot resolve them |
| Brief NOC team on ISO dropper lure TTPs | CTI | NOC briefed; ISO attachments from external email blocked |
| Initiate emergency ENM patching with Ericsson | NOC Engineering | Ericsson ticket opened; patch timeline confirmed |
| Audit NOC contractor VPN accounts — revoke unused | IT Security | All contractor accounts verified as current/required |
| Deploy DET-001 (contractor VPN off-hours ASN rule) | SOC | Rule active in SIEM; SOC runbook updated |

---

## 30-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| ENM patch CVE-2023-44481 | Vulnerability remediation | P1 | NOC Engineering | 5 days + Ericsson PS | ENM upgraded to patched version |
| Deploy DET-002 (contractor DMZ→NMS RDP rule) | Detection rule | P1 | SOC | 1 day | Rule active; test with authorized RDP session |
| Deploy DET-004 (LSASS comsvcs on NMS hosts) | Detection rule | P1 | SOC | 1 day | Rule active on all NMS Windows hosts |
| Deploy DET-008 (ENM auth failure spike) | Detection rule | P1 | SOC | 2 days | Rule active; tested against failed login scenario |
| Begin billing API log ingestion project | Log source | P1 | SOC Engineering | 3 days | CAB request submitted |
| Implement phishing-resistant MFA on contractor VPN | Control | P1 | IT Security | 10 days | FIDO2/hardware tokens for all NOC contractor accounts |

---

## 60-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| Billing API log ingestion to SIEM | Infrastructure | P1 | SOC Engineering | 5 days (after CAB) | Billing API events searchable in SIEM |
| Deploy DET-003 (billing API bulk query) | Detection rule | P1 | SOC | 2 days | Rule active after log source available |
| NMS audit log ingestion project | Infrastructure | P1 | NOC + SOC Engineering | 5 days | NMS config events in SIEM |
| Deploy DET-007 (DNS TXT exfil monitoring) | Detection rule | P2 | SOC | 2 days | Rule active on DNS resolver |

---

## 90-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| Deploy DET-005 (NMS config change outside window) | Detection rule | P1 | SOC | 2 days | Rule active after log source available |
| SS7 MAP monitoring scoping study | Architecture | P1 | CISO + NOC | 10 days | Vendor options evaluated; INCD briefed |
| Adversary emulation exercise — CEDAR-SIGNAL TTPs | Validation | P2 | CTI + SOC | 5 days | PASS/PARTIAL/FAIL documented for all 8 rules |

---

## Success Metrics

| Metric | Baseline | 30-Day Target | 90-Day Target |
|---|---|---|---|
| ATT&CK technique coverage (PASS) | 0% | 30% (4/8 unblocked rules) | 60% (after billing+NMS logs) |
| Blocked detections resolved | 3 | 1 (billing) | 3 (billing+NMS+SS7 scoped) |
| ENM CVE-2023-44481 patched | No | Yes | Yes |
| Contractor VPN phishing-resistant MFA | No | In progress | Yes |
