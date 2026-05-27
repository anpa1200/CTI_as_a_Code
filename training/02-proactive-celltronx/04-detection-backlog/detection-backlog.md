# Detection Development Backlog — PROJ-2024-002

**Classification:** TLP:AMBER

---

## Backlog

| ID | Detection Name | Technique | Scenario | Priority | Effort | Status | Blocked? |
|---|---|---|---|---|---|---|---|
| DET-001 | Contractor VPN off-hours from non-corporate ASN | T1133 + T1557 | SCN-001 | P1 | 2d | Ready to deploy | No |
| DET-002 | RDP from Contractor DMZ to NMS Segment off-hours | T1021.001 | SCN-001 | P1 | 1d | Ready to deploy | No |
| DET-003 | Billing API bulk query from non-approved IP | T1078.003 | SCN-002 | P1 | 3d | **Blocked** | Yes — billing API logs not in SIEM |
| DET-004 | LSASS dump via comsvcs.dll on NMS hosts | T1003.001 | SCN-001 | P1 | 1d | Ready (reuse DET-002 from A01) | No |
| DET-005 | NMS configuration change outside change window | T1565.001 | SCN-003 | P1 | 2d | **Blocked** | Yes — NMS audit logs not in SIEM |
| DET-006 | BITS job to non-Microsoft/non-CelltronX destination | T1197 | SCN-001 | P2 | 1d | Ready to deploy | No |
| DET-007 | DNS TXT response > 100 bytes to external resolver | T1048.003 | SCN-001 | P2 | 2d | Ready to deploy | No |
| DET-008 | ENM API authentication failure spike (CVE-2023-44481 probing) | T1190 | SCN-001 | P1 | 2d | Ready to deploy | No |

---

## Sprint Plan

### Sprint 1 (This week — unblocked P1s)
- DET-001: Deploy contractor VPN ASN rule
- DET-002: Deploy contractor DMZ→NMS RDP rule  
- DET-004: Deploy LSASS comsvcs rule on NMS hosts
- DET-008: Deploy ENM auth failure spike rule

### Sprint 2 (Next 2 weeks — requires infrastructure work)
- DET-003: **Unblock** billing API log ingestion (estimated 3 days engineering + 5 days CAB)
- DET-005: **Unblock** NMS audit log ingestion (estimated same)
- DET-006, DET-007: Deploy alongside Sprint 2 infra work

---

## Delivered to Production

| ID | Rule File | Technique | Date Deployed | Emulation Result |
|---|---|---|---|---|
| (none yet) | | | | |
