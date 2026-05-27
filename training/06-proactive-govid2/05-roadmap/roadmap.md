# Capability Improvement Roadmap — PROJ-2025-006 (GovID 2.0)

**Base date:** 2025-06-19 | **Horizon:** 90 days

---

## Immediate (72 hours — no budget, no CAB required)

| Action | Owner | Success Criterion |
|---|---|---|
| Block 185.220.101.47 at NDSA perimeter | SOC (Ben-Moshe) | IP blocked; no further API calls from this IP reaching GovID endpoints |
| Force password reset — all HavayaIT contractor NDSA accounts | IT Security | All contractor passwords reset; confirmation from each contractor account holder |
| Send formal security request to BiometricTech CISO | CISO (Nativ) | Letter sent; BiometricTech 24h response deadline running |
| Add firewall rule blocking staging IP range → production VRID queries | Network Ops | Staging IP range cannot reach VRID 2.0 DB; confirmed by network test |
| Verify all GovID 2.0 API keys from Stern GitHub repo are rotated | IT | All keys audited; any key found in Stern repo confirmed rotated or confirmed as already expired |
| Deploy DET-G6-003 (staging JWT source IP monitoring) | SOC | Rule active in Elastic SIEM; test with staging JWT from internal IP |
| Deploy DET-G6-007 (lookalike domain DNS monitoring) | SOC | DNS rule active; CERT-IL CB-2025-041 domains in watchlist |

---

## 30-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| Deploy DET-G6-004 (staging→VRID DB query rule) | Detection | P1 | SOC | 2d | Rule active on VRID DB audit log |
| Deploy DET-G6-009 (GovID config change outside window) | Detection | P2 | SOC | 2d | Rule active; tested with out-of-window config change simulation |
| Deploy DET-G6-011 (BITS downloader on GovID 2.0 nodes) | Detection | P2 | SOC | 1d | Rule active on all GovID 2.0 Windows nodes |
| Build GovID API Gateway → Elastic log pipeline | Infrastructure | P1 | SOC Engineering | 4d + CAB | API logs searchable in SIEM; DET-G6-001 deployable |
| Enable AWS VPC Flow Logs + CloudTrail for GovID 2.0 VPC | Infrastructure | P1 | SOC Engineering | 3d | AWS flow logs flowing to Elastic; partial exfil detection available |
| BiometricTech source IP binding on vendor tokens | Vendor action | P1 | CISO → BiometricTech | 1 week | BiometricTech confirms all vendor tokens have source IP binding; NDSA allowlist implemented |
| Enforce MFA on all HavayaIT NDSA accounts | Control | P1 | IT Security | 10d | All HavayaIT VPN and staging accounts require MFA |
| Deploy DET-G6-001 (API call volume anomaly) | Detection | P1 | SOC | 3d (after pipeline) | Rule active in Elastic after log pipeline complete |
| Submit INCD-CID Annex C draft | Compliance | P1 | CISO + CTI | 5d | Annex C submitted to INCD for GovID 2.0 launch certification |

---

## 60-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| Deploy DET-G6-002 (vendor token IP binding rule) | Detection | P1 | SOC | 2d (after BiometricTech action) | Rule active; alert fires if vendor token used from non-allowlisted IP |
| Deploy DET-G6-008 (large outbound HTTPS — partial via VPC Flow Logs) | Detection | P1 | SOC | 3d (after AWS logging) | Alert on >10GB GovID VPC outbound in 24h |
| Add HavayaIT M365 log access contractual requirement | Contract | P1 | CISO + Legal | 4 weeks + HavayaIT sign-off | Contractual obligation signed; HavayaIT reporting anomalous sign-ins within 24h |
| Adversary emulation — SCN-001 and SCN-005 against deployed rules | Validation | P1 | CTI + SOC | 3d | PASS/PARTIAL/FAIL documented for DET-G6-001 through DET-G6-007 |

---

## 90-Day Plan

| Item | Type | Priority | Owner | Effort | Success Criterion |
|---|---|---|---|---|---|
| Deploy DET-G6-006 (developer M365 anomaly) | Detection | P1 | SOC (after contract) | 3d | Rule active against HavayaIT M365 anomalous sign-in feed |
| Deploy DET-G6-010 (mass session invalidation) | Detection | P2 | SOC Engineering | 2d | Rule active after session log ingestion complete |
| GovID 2.0 launch conditional authorization | Milestone | P1 | CISO → DG | 1d | All 5 launch conditions met; DG authorization signed |
| Post-launch detection performance review | Governance | P2 | CTI + SOC | 2d | Launch + 30d; FP rate assessed; rules tuned |

---

## Dependencies and Blockers

| Item | Blocks | Status |
|---|---|---|
| BiometricTech IP binding response (24h deadline) | DET-G6-002; SCN-001 highest-risk mitigation | Pending BiometricTech response |
| MATZBEN CAB — GovID API log pipeline | DET-G6-001 | CAB request to be submitted 2025-06-19 |
| Sprint 23 fix in GovID 2.0 codebase | SCN-002 fully mitigated | Firewall rule is compensating control; code fix needed for Sprint 24 |
| HavayaIT contractual M365 log access | DET-G6-006 | Requires contract amendment; 4-week minimum |

---

## Launch Conditions (DG Decision Criteria)

1. DET-G6-001 (API call volume rule) deployed and tested — **OPEN**
2. DET-G6-002 (vendor token IP binding) implemented by BiometricTech — **OPEN**
3. BiometricTech security review completed OR INCD confirmed clear — **OPEN**
4. All HavayaIT credentials reset and MFA enforced — **In progress**
5. Sprint 23 staging→production gap resolved (code fix, not just firewall) — **OPEN**

**Recommendation:** If all 5 conditions not met by 2025-09-01, recommend 6-week launch delay to 2025-11-15.

---

## Success Metrics

| Metric | Baseline | 30-Day Target | 90-Day Target |
|---|---|---|---|
| Detection coverage (active rules vs. scenario techniques) | 1/12 (DET-G6-005 only) | 7/12 | 11/12 |
| Blocked detections resolved | 5 | 3 (API pipeline, BT IP binding, AWS logging) | 5 |
| Sprint 23 staging→production gap | Open | Mitigated (firewall) | Closed (code fix) |
| BiometricTech vendor security | Unverified | Response received; IP binding deployed | Verified or INCD cleared |
| HavayaIT MFA enforcement | 0% | 100% | 100% |
