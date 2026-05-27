# Blocked Detections — PROJ-2025-006 (GovID 2.0)

**Classification:** TLP:AMBER  
**Date:** 2025-06-19

---

## Blocked Items

### DET-G6-001 — GovID API Bulk Call Volume Anomaly

| Field | Value |
|---|---|
| Technique | T1530 (Data from Cloud Storage / API) |
| Scenario | SCN-001 (vendor API token abuse → bulk biometric extraction) |
| Priority | P1 |
| Blocker | GovID 2.0 API access logs are not ingested into Elastic SIEM. The API runs on AWS GovCloud IL; no log pipeline exists from API Gateway to Elastic. |
| Unblock path | Build API Gateway → S3 → Elastic log pipeline; estimate 2 weeks including AWS GovCloud IL configuration and CAB approval |
| Effort | 4 days engineering + 2 weeks CAB |
| Approval needed | MATZBEN CAB for AWS GovCloud IL log access |
| Date identified | 2025-06-19 |
| Owner | SOC Engineering |
| **Compensating control** | BiometricTech to manually report anomalous API call volumes daily until pipeline is live |

---

### DET-G6-002 — BiometricTech Vendor Token from Non-Allowlisted IP

| Field | Value |
|---|---|
| Technique | T1078.003 (Valid API Credentials) |
| Scenario | SCN-001 |
| Priority | P1 |
| Blocker | No source IP binding is implemented on BiometricTech vendor API tokens. The GovID 2.0 API gateway accepts the token from any source IP — there is no technical enforcement of which IPs are authorized to use vendor tokens. |
| Unblock path | BiometricTech must implement IP binding on all vendor tokens (technical config change on their side); NDSA must maintain an allowlist of BiometricTech operational IPs. Formal security request sent 2025-06-19. Deadline: 48 hours. |
| Effort | 1 week (BiometricTech config change + NDSA allowlist build) |
| Approval needed | BiometricTech CISO acceptance |
| Date identified | 2025-06-19 |
| Owner | CISO → BiometricTech |
| **Compensating control** | Block 185.220.101.47 at NDSA perimeter (immediate); block any additional non-BiometricTech-registered ASN from reaching API endpoint |

---

### DET-G6-006 — Developer M365 Sign-In from Non-Corporate ASN

| Field | Value |
|---|---|
| Technique | T1078.002 (Valid Developer Accounts) |
| Scenario | SCN-003 (developer spearphishing → source code) |
| Priority | P1 |
| Blocker | HavayaIT Microsoft 365 is not under NDSA control. NDSA cannot access HavayaIT's M365 audit logs or configure sign-in monitoring for HavayaIT developer accounts. |
| Unblock path | Add contractual requirement in HavayaIT MSA: (1) HavayaIT must report M365 anomalous sign-in events for NDSA-project developers within 24h; (2) 30-day M365 audit log retention with NDSA access right on request. Target next contract renewal or emergency amendment. |
| Effort | 4 weeks (legal + HavayaIT negotiation + implementation) |
| Approval needed | CISO + Legal; HavayaIT agreement |
| Date identified | 2025-06-19 |
| Owner | CISO + Legal |
| **Compensating control** | Require HavayaIT to notify NDSA within 24h of any anomalous sign-in event for NDSA-project developers (manual, contractual obligation until automated) |

---

### DET-G6-008 — Large Outbound HTTPS from GovID 2.0 Frontend

| Field | Value |
|---|---|
| Technique | T1041 (Exfiltration over Command and Control Channel) |
| Scenario | SCN-001 (post-bulk-extraction exfiltration) |
| Priority | P1 |
| Blocker | GovID 2.0 frontend runs on AWS GovCloud IL. There is no NetFlow or packet capture capability on the AWS-hosted tier. Standard on-premises NetFlow collection does not cover cloud workloads. |
| Unblock path | Enable AWS VPC Flow Logs and CloudTrail for the GovID 2.0 VPC; ingest into Elastic via the same pipeline as DET-G6-001. Partial coverage only (VPC Flow Logs don't capture payload). |
| Effort | 3 weeks (AWS config + Elastic pipeline + CAB) |
| Approval needed | MATZBEN CAB for AWS logging change |
| Date identified | 2025-06-19 |
| Owner | SOC Engineering |
| **Compensating control** | AWS CloudTrail and VPC Flow Logs enabled immediately as partial detection; alert on >10GB outbound from GovID VPC in 24h window |

---

### DET-G6-010 — Mass Session Invalidation Event

| Field | Value |
|---|---|
| Technique | T1531 (Account Access Removal) |
| Scenario | SCN-004 (availability attack via session invalidation) |
| Priority | P2 |
| Blocker | GovID 2.0 session management logs are not ingested into SIEM. Session store (Redis equivalent) does not emit structured log events that Elastic can consume. |
| Unblock path | Add structured logging to GovID 2.0 session management service; forward to Elastic. Requires GovID 2.0 application change. Target Sprint 3 (30 days). |
| Effort | 2 weeks (application change + pipeline) |
| Approval needed | HavayaIT engineering for application change; MATZBEN CAB |
| Date identified | 2025-06-19 |
| Owner | SOC Engineering + HavayaIT |
| **Compensating control** | Manual monitoring of GovID admin console session statistics daily; alert if active sessions drop >50% in <5 minutes |
