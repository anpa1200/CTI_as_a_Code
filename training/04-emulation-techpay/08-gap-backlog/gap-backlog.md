# Gap Backlog — PROJ-2024-004 (Operation Desert Cipher)

**Date:** 2024-11-20  
**Source:** Emulation exercise results

---

## P1 Gaps (Must Fix — 30 days)

### GAP-001 — No Exfiltration Volume Rule

| Field | Value |
|---|---|
| ATT&CK | T1041, T1197 |
| Root cause | Rule missing; no NetFlow or Zeek log source connected to Elastic SIEM |
| Risk | **Most critical gap.** 2.4 GB exfiltrated in Operation Desert Cipher over 3 hours. Zero detection in current state. Adversary can exfil entire R&D datasets with no alert. |
| Remediation | (1) Deploy Zeek or NetFlow log source to Elastic; (2) Deploy outbound HTTPS volume threshold rule: >500 MB in 6h window to non-CDN/non-Microsoft ASN |
| Effort | 5 engineering days |
| Priority | P1 — 30-day deadline |
| Compensating control | Manual daily NetFlow review for anomalous outbound volumes until rule deployed |

---

### GAP-002 — HKCU Registry Run Key Not Monitored

| Field | Value |
|---|---|
| ATT&CK | T1547.001 |
| Root cause | Sysmon EID 13 config covers HKLM by default; HKCU requires explicit Sysmon configuration change |
| Risk | User-level persistence via HKCU Run key requires no admin rights. Operation Desert Cipher report notes HKCU registry persistence as secondary persistence mechanism. Current state: invisible. |
| Remediation | (1) Update Sysmon configuration on all hosts to add HKCU registry path to EID 13 filter; (2) Deploy DET-REG-001 rule covering HKCU; (3) Baseline FP rate before P1 deployment (HKCU has higher FP rate than HKLM) |
| Effort | 3 engineering days (config + CAB + rollout) |
| Priority | P1 — 30-day deadline |
| Compensating control | None available until Sysmon config updated |

---

### GAP-007 — AiTM Session Token Capture Not Detectable at VPN Layer

| Field | Value |
|---|---|
| ATT&CK | T1557 |
| Root cause | VPN ASN anomaly rule (DET-001) is a proxy detection — detects the symptom (off-hours non-corporate ASN) not the cause (AiTM session capture). Actual session token capture at the Microsoft 365 / AiTM proxy layer is not monitored. |
| Risk | True AiTM attack: adversary captures valid session token; first NDSA/TechPay-visible artifact is the VPN logon — 5 days after token capture. Detection window misses the initial compromise. |
| Remediation | Evaluate continuous re-authentication or step-up MFA for VPN sessions from new ASNs; not a SIEM rule — this is a vendor/platform capability decision |
| Effort | 10 engineering days (vendor evaluation + implementation) |
| Priority | P1 — 30-day recommendation; 90-day implementation |

---

## P2 Gaps (Fix — 60 days)

### GAP-003 — No Domain Discovery Detection

| Field | Value |
|---|---|
| ATT&CK | T1087.002, T1016, T1018 |
| Root cause | Rule missing; no net.exe or domain enumeration detection deployed |
| Risk | Adversary can perform complete domain/group/host reconnaissance with zero detection. In Operation Desert Cipher, this phase lasted 8 minutes and provided all information needed for lateral movement. |
| Remediation | Deploy Sigma rule detecting `net.exe` with `/domain` flag, or `net group` with privileged group names |
| Effort | 1 engineering day |
| Priority | P2 — 60-day deadline |

---

### GAP-004 — RDP Alert Missing logon_type and src_host Fields

| Field | Value |
|---|---|
| ATT&CK | T1021.001 |
| Root cause | DET-LM-001 fires correctly but logon_type field not populated; Elastic ingest pipeline missing field mapping |
| Risk | Alert fires (correct) but investigator cannot confirm logon type (RDP vs. network) without manual investigation; adds 5–10 minutes to response |
| Remediation | Add field alias in Elastic ingest pipeline: map logon type from EID 4624 EventData |
| Effort | 0.25 day |
| Priority | P2 — 60-day deadline (quick fix; can do sooner) |

---

### GAP-005 — BITS Alert Missing src_host Field

| Field | Value |
|---|---|
| ATT&CK | T1197 |
| Root cause | Same pipeline mapping bug as GAP-004; `host.name` vs `agent.hostname` field name mismatch in Elastic ingest pipeline |
| Risk | Alert fires (correct) but host cannot be identified without manual correlation |
| Remediation | Same ingest pipeline fix as GAP-004 (combined change) |
| Effort | 0 additional days (same fix as GAP-004) |
| Priority | P2 — fix together with GAP-004 |

---

### GAP-006 — Office Macro Execution Not Blocked at Email Gateway

| Field | Value |
|---|---|
| ATT&CK | T1566.001 |
| Root cause | Email gateway blocks EXE attachments but does not block macro-enabled Office documents (DDEAUTO, macro-enabled .docm/.xlsm) |
| Risk | Initial access vector for Operation Desert Cipher is macro-enabled document lure. Current email gateway configuration allows this delivery. |
| Remediation | Add DDEAUTO and macro-enabled Office attachment policy to email gateway; alert or strip on delivery |
| Effort | 2 days |
| Priority | P2 — 60-day deadline |

---

## Backlog Status

| ID | Gap | Priority | Status | Target Date |
|---|---|---|---|---|
| GAP-001 | Exfiltration volume rule | P1 | Open | 30 days |
| GAP-002 | HKCU registry Run key | P1 | Open | 30 days |
| GAP-003 | Domain discovery detection | P2 | Open | 60 days |
| GAP-004 | RDP alert field mapping | P2 | Open | 60 days (quick fix) |
| GAP-005 | BITS alert field mapping | P2 | Open | 60 days (same as GAP-004) |
| GAP-006 | Macro email gateway policy | P2 | Open | 60 days |
| GAP-007 | AiTM session capture | P1 | Open | 90 days (vendor eval) |
