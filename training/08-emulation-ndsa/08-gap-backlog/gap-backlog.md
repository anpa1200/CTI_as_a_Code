# Gap Backlog — PROJ-2026-008 (NDSA Annual Detection Validation)

**Date:** 2026-01-20  
**Source:** INCD Section 8 emulation exercise results  
**INCD risk flag:** All P1 gaps submitted to INCD with remediation plan per Section 8 requirements

---

## P1 Gaps (INCD Remediation Plan Required — 60 days)

### GAP-001 — No Exfiltration Volume Rule

| Field | Value |
|---|---|
| ATT&CK | T1041 |
| Source incident | A05 timeline event 15 — 413 MB HTTPS exfiltration in 8 chunks over 78 min; zero detection |
| Root cause | Rule missing; no NetFlow or packet metadata log source connected to Elastic SIEM; volume threshold rule not deployed |
| Risk | **Critical — most consequential gap.** In March 2025, the complete exfiltration of 340,218 biometric records (413 MB) was invisible. This exercise confirms the same gap persists. An adversary completing lateral movement and collection can exfiltrate an entire biometric database with no alert firing. This is the final and highest-consequence phase of the attack. |
| INCD risk flag | **Yes** — directly related to the breach that triggered the INCD Remediation Directive RD-2025-NDSA-004 |
| Remediation | (1) Enable NetFlow export from VRID-SRV-01, JUMPHOST-CONTRACTOR-01, and GovID 2.0 frontend nodes; (2) Ingest NetFlow into Elastic via Logstash/Filebeat; (3) Deploy Elastic threshold rule: sum(network.bytes_toserver) > 200 MB per source IP per 6-hour window to non-CDN/non-approved ASN |
| Effort | 5 engineering days (pipeline + rule + FP baseline) |
| Priority | P1 — 60-day INCD deadline |
| Compensating control | SOC analyst manual review of top-N outbound connections by byte volume from VRID-SRV-01 — weekly minimum; daily recommended until rule deployed |

---

### GAP-002 — HKCU Registry Persistence Invisible (Sysmon Architectural Gap)

| Field | Value |
|---|---|
| ATT&CK | T1547.001 |
| Source incident | A05 analysis — HKCU Run key in AMSI logs; Sysmon coverage gap identified |
| Root cause | Sysmon EID 13 (RegistryEvent SetValue) default configuration monitors `HKLM\Software\Microsoft\Windows\CurrentVersion\Run` but not `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`. GOV-DET-007 rule logic is correct; the data source simply does not generate events for HKCU paths. |
| Risk | User-level persistence requires no admin rights. The March 2025 actor entered via a.halevi (a contractor, not an admin). HKCU is directly applicable to the contractor threat model. Any actor with user-level access — including a phished contractor — can establish persistence that is permanently invisible until the Sysmon config is fixed. |
| INCD risk flag | **Yes** — relevant to contractor access threat vector in INCD Remediation Directive |
| Remediation | (1) Update Sysmon configuration XML on all monitored endpoints to add HKCU registry path to EID 13 filter; (2) Submit MATZBEN CAB change request CR-2026-CTI-001 (already drafted); (3) Test on VRID-LAB-SRV first to baseline FP rate; (4) Roll out to all NDSA monitored endpoints |
| Effort | 3 engineering days (config change + CAB + rollout) |
| Priority | P1 — 60-day INCD deadline |
| Compensating control | Monitor HKLM Run key + service installs as proxy persistence indicators; alert on SvcHostMonitor-pattern service names |

---

### GAP-003 — GovID 2.0 Bulk API Extraction Rule Not Deployed

| Field | Value |
|---|---|
| ATT&CK | T1530 |
| Source incident | A06 TRG-004 — BiometricTech notification; 185.220.101.47 making 2,400 calls/day to `/verify/bulk` |
| Root cause | GOV-DET-006 (bulk API extraction detection) drafted and lab-validated, but not deployed to production — GovID API log pipeline not yet connected to Elastic SIEM; MATZBEN CAB approval pending |
| Risk | BiometricTech API probing is ongoing (active threat from A06 trigger assessment). Zero detection in production for bulk biometric verification calls from unauthorized sources. If the /verify/bulk endpoint is successfully abused, up to 9.5 million biometric records are accessible without a single alert. |
| INCD risk flag | **Yes** — GovID 2.0 biometric data; Biometric Database Law Section 18(b) breach notification obligation |
| Remediation | (1) CAB approval CR-2026-CTI-001 item for GOV-DET-006; (2) Connect GovID 2.0 nginx access logs to Elastic via Filebeat; (3) Deploy GOV-DET-006 as Elastic threshold rule (>50 calls to /verify/bulk per source IP per 10 min, excluding internal batch IPs) |
| Effort | 3 engineering days (pipeline) + 0.5 days (rule deployment) |
| Priority | P1 — 30-day deadline (active threat; shorter deadline than exfil rule) |
| Compensating control | BiometricTech daily manual report of /verify/bulk call volumes by source IP; NDSA SOC reviews report |

---

### GAP-004 — Vendor Token Abuse on GovID API Not Detectable

| Field | Value |
|---|---|
| ATT&CK | T1078.003 |
| Source incident | A06 TRG-004 — vendor API token used from non-allowlisted IP |
| Root cause | GOV-DET-007 (vendor token from non-approved IP) not deployed; depends on token IP-binding implementation by BiometricTech (contractual requirement not yet fulfilled); GovID API logs not in SIEM (same pipeline gap as GAP-003) |
| Risk | A valid BiometricTech API token used from any IP address generates no alert. The A06 assessment identified that the existing vendor token authentication model creates a supply chain risk: if BiometricTech credentials are compromised, the attacker can query the GovID API from any global IP with no detection. |
| INCD risk flag | **Yes** — vendor supply chain threat vector; connects to HavayaIT pattern from March 2025 breach |
| Remediation | (1) Contractual requirement to BiometricTech: implement IP-binding for all API tokens issued for NDSA use; deadline 30 days; (2) CAB approval for GOV-DET-007 after pipeline deployed (same pipeline as GAP-003); (3) Deploy GOV-DET-007 once token IP registry is established |
| Effort | 3 engineering days (vendor coordination + rule) |
| Priority | P1 — 30-day deadline for BiometricTech contractual requirement; rule deployment follows |
| Compensating control | Perimeter block on 185.220.101.47 and known Tor exit nodes; BiometricTech token audit monthly |

---

## P2 Gaps (Fix within 60 days)

### GAP-005 — Net.exe Domain Discovery Not Detected

| Field | Value |
|---|---|
| ATT&CK | T1087.002, T1016 |
| Source incident | A05 timeline events 5–7 — 8-minute reconnaissance phase before lateral movement; zero detection |
| Root cause | No Sigma rule or KQL query deployed for net.exe with `/domain` flag or privileged group enumeration. Data source exists (Winlogbeat EID 4688 process creation); rule is simply missing. |
| Risk | An adversary inside the contractor network can perform complete domain/group/host reconnaissance with zero detection. In March 2025, this phase provided the actor with the full VRID access group membership needed for targeting. |
| Remediation | Deploy GOV-DET-NEW (net.exe domain enumeration rule) — see corrected rules section; 1 engineering day |
| Effort | 1 engineering day |
| Priority | P2 — 60-day deadline |

---

### GAP-006 — RDP Alert Missing logon_type Field

| Field | Value |
|---|---|
| ATT&CK | T1021.001 |
| Source incident | A05 timeline event 8 — EID 4624 Type 10 RDP lateral movement |
| Root cause | GOV-DET-002 fires correctly, but `LogonType` from EID 4624 EventData is not mapped to the normalized ECS field in the Elastic Winlogbeat ingest pipeline. Analyst cannot confirm Type 10 (RDP) vs. Type 3 (network) without manual lookup. |
| Risk | Alert fires (correct); investigator adds 5–10 minutes to confirm logon type manually. Acceptable for current dwell times; degraded for fast-moving attacks. |
| Remediation | Add Elastic ingest pipeline processor: map `winlog.event_data.LogonType` → `event.outcome_detail`; same fix resolves GAP-007 simultaneously |
| Effort | 2 engineering hours |
| Priority | P2 — 60-day deadline (quick fix; can be done sooner) |

---

### GAP-007 — BITS Alert Missing src_host Field

| Field | Value |
|---|---|
| ATT&CK | T1197 |
| Source incident | A05 timeline event 11 — BITS download of svchosts.exe |
| Root cause | Same Elastic ingest pipeline field name mismatch as GAP-006: Winlogbeat on VRID-SRV-01 ships hostname as `agent.hostname`; GOV-DET-003 queries `host.name`; alert fires correctly but source host field is null |
| Risk | Alert fires (correct); host cannot be identified without manual correlation against BITS job timing. Adds investigation step. |
| Remediation | Same ingest pipeline fix as GAP-006 (one combined change covers both rules) |
| Effort | 0 additional days (same fix) |
| Priority | P2 — fix together with GAP-006 |

---

## Backlog Status

| ID | Gap | ATT&CK | Priority | Status | Target Date | INCD Risk |
|---|---|---|---|---|---|---|
| GAP-001 | Exfil volume rule | T1041 | P1 | Open | 2026-04-03 | Yes |
| GAP-002 | HKCU registry Sysmon config | T1547.001 | P1 | Open | 2026-04-03 | Yes |
| GAP-003 | GOV-DET-006 bulk API deployment | T1530 | P1 | Open | 2026-03-06 | Yes |
| GAP-004 | GOV-DET-007 vendor token | T1078.003 | P1 | Open | 2026-03-06 | Yes |
| GAP-005 | Net.exe discovery rule | T1087.002 | P2 | Open | 2026-04-03 | No |
| GAP-006 | RDP alert logon_type field | T1021.001 | P2 | Open | 2026-04-03 | No |
| GAP-007 | BITS alert src_host field | T1197 | P2 | Open | 2026-04-03 (with GAP-006) | No |
