# Crown Jewels Analysis — PROJ-2025-006 (GovID 2.0)

**Classification:** TLP:AMBER  
**Date:** 2025-06-19  
**Analyst:** Yael Rotenberg

---

## Crown Jewels Inventory

| ID | Asset | Why Critical | Breach Consequence | Replaceability | Criticality |
|---|---|---|---|---|---|
| CJ-001 | Biometric template database (VRID 2.0 — 9.5M records) | Authentication truth for all GovID services; contains biometric hash for every enrolled Israeli citizen | Non-replaceable identity compromise for entire Israeli population; biometrics cannot be reset | **Non-replaceable** | 5/5 |
| CJ-002 | BiometricTech matching algorithm and ML model | Enables adversarial template spoofing if extracted; knowledge of the model allows crafting synthetic biometric inputs that pass verification | GovID authentication defeats possible via synthetic biometric; entire identity verification system undermined | Non-replaceable (vendor IP) | 5/5 |
| CJ-003 | GovID session tokens (transient pool) | Authenticated access to 47 government services; each token represents an active citizen session | Identity impersonation for any citizen with an active session; bulk token compromise enables mass impersonation | Replaceable via rotation; systemic risk if bulk compromise | 4/5 |
| CJ-004 | Ministry Integration Bus API keys (22 ministries) | Cross-ministry data access; enables reading and modifying data across the full government digital estate | Lateral movement across full government digital estate; potential read access to tax, benefits, health, immigration data | Replaceable but high-impact rotation affecting 22 ministries simultaneously | 4/5 |
| CJ-005 | GovID 2.0 source code and API specifications | Vulnerability map for the entire platform; allows precise exploitation without discovery phase | Enables targeted zero-day exploitation before launch; bypasses the entire detection framework | Replaceable but high recovery cost; enables targeted attacks during window before patching | 3/5 |

---

## Threat Alignment by Asset

| Asset | Primary Threat Scenario | Trigger Evidence | Current Exposure | Exposure Score |
|---|---|---|---|---|
| CJ-001 (VRID 2.0 biometric DB) | SCN-001: Vendor API token bulk extraction | TRG-004 probing `/verify/bulk`; TRG-001 UAE pattern | Sprint 23 staging→production gap may expose partial records via Stern credentials | **5/5 — critical; active probing** |
| CJ-002 (BiometricTech model) | SCN-001: Vendor API abuse enables model queries | TRG-004 probing | If adversary achieves bulk access, model reverse-engineering is secondary risk | 3/5 — secondary |
| CJ-003 (GovID session tokens) | SCN-004: Mass token invalidation (availability) | No current trigger; requires earlier scenario success | No current exploit path identified; requires persistence first | 2/5 — future risk |
| CJ-004 (Ministry API keys) | SCN-003: Developer compromise → source code access | TRG-002 developer targeting; TRG-003 Stern exposure | Stern GitHub exposure may have included API key references | 4/5 — Stern exposure active |
| CJ-005 (GovID 2.0 source) | SCN-003: Developer spearphishing → code exfil | TRG-002 developer targeting | HavayaIT developer credential hygiene poor (Stern confirms) | 3/5 — elevated post-TRG-003 |

---

## Access Control Assessment

| Asset | Who Has Access | How Accessed | Known Weaknesses |
|---|---|---|---|
| CJ-001 (VRID 2.0) | NDSA operations team; SVC-HAVAYAIT-MAINT (post-A05: revoked); BiometricTech via `/verify/bulk` API | Direct DB query; API calls | No rate limiting on `/verify/bulk`; no source IP binding on vendor token |
| CJ-002 (BT model) | BiometricTech internal only | Proprietary API | If BiometricTech itself compromised (TRG-001 pattern), NDSA has no visibility |
| CJ-003 (Session tokens) | GovID 2.0 auth service | Session store (Redis/equivalent) | No mass-revocation alerting; write access control not reviewed |
| CJ-004 (Ministry API keys) | Each ministry DevOps team; HavayaIT integration developers | Source code + env vars | Stern GitHub commit may have included API key references; keys being audited |
| CJ-005 (Source code) | HavayaIT developers; NDSA DevOps | Git repositories; staging environment | HavayaIT developer credential hygiene gap confirmed (TRG-003) |

---

## Priority Actions by Asset

| Asset | Action | Owner | Priority |
|---|---|---|---|
| CJ-001 | Block staging→production VRID query path (Sprint 23 gap); deploy DET-G6-004 | IT / Network + SOC | P1 |
| CJ-001 | Require BiometricTech vendor token source IP binding; block 185.220.101.47 | CISO + SOC | P1 |
| CJ-004 | Audit all API keys referenced in Stern GitHub repo; rotate any exposed | IT Security | P1 |
| CJ-005 | Force password reset for all HavayaIT developer accounts; enforce MFA | IT Security | P1 |
| CJ-003 | Implement mass-session-invalidation alerting (DET-G6-010) | SOC Engineering | P2 |
