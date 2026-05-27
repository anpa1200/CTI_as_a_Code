# Blocked Detection Items — PROJ-2024-002

---

### BLOCKED-001: Billing API Bulk Query Anomaly (DET-003)
**Technique**: T1078.003 + T1530  
**Priority if unblocked**: P1  
**Blocking reason**: Billing system API gateway does not forward structured logs to Elastic SIEM. All API access is logged locally on the billing platform only, inaccessible to security monitoring.  
**Unblock path**: Deploy syslog forwarder on billing API gateway → Elastic Logstash pipeline → SIEM index  
**Estimated effort**: 3 days engineering + 5 days MATZBEN CAB approval  
**Approval needed**: CAB + Billing team sign-off  
**Target date for unblock**: 2024-11-15  
**Owner**: SOC Engineering + Billing IT

**Compensating control**: Manual monthly review of billing API access logs by Billing IT team; alert threshold flag if any single source makes >500 queries/day

---

### BLOCKED-002: NMS Configuration Change Outside Change Window (DET-005)
**Technique**: T1565.001  
**Priority if unblocked**: P1  
**Blocking reason**: Ericsson ENM and Nokia NetAct audit logs are not forwarded to Elastic SIEM. NMS systems log locally; no centralized security visibility.  
**Unblock path**: Configure NMS syslog output → Elastic Logstash → SIEM index. Requires Ericsson professional services engagement for ENM log export configuration.  
**Estimated effort**: 5 days engineering + Ericsson PS engagement (~2 weeks lead time) + 5 days CAB  
**Approval needed**: CAB + Ericsson vendor coordination  
**Target date for unblock**: 2024-12-01  
**Owner**: NOC Engineering + SOC Engineering

**Compensating control**: Weekly manual review of ENM change audit log by NOC Lead; out-of-hours change notification via PagerDuty (manual process)

---

### BLOCKED-003: SS7 MAP Query Anomaly
**Technique**: T1040  
**Priority if unblocked**: P1  
**Blocking reason**: SS7 MAP queries are not logged at the signaling layer. No telemetry source exists for SS7 collection activity.  
**Unblock path**: Requires deployment of SS7 monitoring solution (e.g., GSMK CryptoPhone Monitor or equivalent) + integration with SIEM. Multi-vendor coordination required.  
**Estimated effort**: Major infrastructure project — 3–6 months + ₪500K+ budget  
**Approval needed**: CISO + Board (budget); INCD coordination  
**Target date for unblock**: 2025 Q2 (roadmap item)  
**Owner**: CISO + NOC Engineering

**Compensating control**: None — this is an architectural blind spot. INCD should be notified of this gap per CII designation obligations.
