# Scope — PROJ-2025-006 (GovID 2.0 Pre-Launch Threat Assessment)

**Classification:** TLP:AMBER  
**Analyst:** NDSA CTI / Yael Rotenberg  
**Date opened:** 2025-06-19  
**Date closed:** Open

---

## Trigger Summary

| Trigger | Date | Source | Key Claim |
|---|---|---|---|
| TRG-001 | 2025-06-02 | INCD classified advisory (via Friedman) | UAE biometric platform breached via BiometricTech-type vendor API; Iranian-nexus |
| TRG-002 | 2025-06-08 | CERT-IL Bulletin CB-2025-041 | Iranian-nexus targeting Israeli government biometric systems; developer credential harvesting |
| TRG-003 | 2025-06-14 | GitHub credential leak (HavayaIT dev y.stern) | NDSA API key, GovID 2.0 staging JWT, VPN credential exposed publicly for 11 days |
| TRG-004 | 2025-06-17 | BiometricTech IL Ltd. API probing notification | 185.220.101.47 probing `/verify/bulk` 2,400×/day with valid-format vendor token |

---

## Project Objective

Assess whether an active adversary is preparing to attack GovID 2.0 before or during its planned launch, and produce:
1. A threat model with 5 attack scenarios
2. A detection backlog with priority and blocking status
3. A 72-hour immediate action plan
4. An INCD-CID Annex C submission (pre-launch certification requirement)
5. A go/no-go launch recommendation for the Director-General

---

## In Scope

- GovID 2.0 platform: API layer, authentication engine, session management
- BiometricTech IL Ltd. vendor integration (biometric matching API)
- HavayaIT Systems Ltd. contractor access (VPN, staging environment, source code)
- VRID 2.0 (the underlying biometric record database)
- Contractor developer accounts with NDSA access
- Detected IOCs from all 4 triggers

---

## Out of Scope

- GovID 1.x (legacy platform — not being analyzed)
- Ministry-facing API integrations (scoped out pending architecture documentation)
- GOVNET Classified Segment (requires MATZBEN clearance; separate track)
- Internal NDSA staff workstations (not a focus of this threat model)

---

## Priority Intelligence Requirements

| # | PIR | Why |
|---|---|---|
| PIR-1 | Is 185.220.101.47 actor-controlled, and what access has it gained to the GovID 2.0 API surface? | Ongoing active probing — is it reconnaissance or exploitation? |
| PIR-2 | Was the BiometricTech vendor token used in probing legitimately issued, and is BiometricTech itself compromised? | If the token is legitimate, the adversary has vendor-level API access |
| PIR-3 | Did the Stern credential exposure result in unauthorized access to staging or production VRID data? | 11-day window; Sprint 23 staging→production gap confirmed |
| PIR-4 | Is the GovID 2.0 launch date achievable without unacceptable biometric data breach risk? | Director-General decision required |

---

## Constraints

- INCD TLP:RED advisory (TRG-001) can be acknowledged but not cited in unclassified products; distribute only to CISO Nativ and IR Lead Rotenberg
- BiometricTech vendor investigation is ongoing; do not share NDSA threat findings with BiometricTech beyond what is necessary for the formal security request
- Sprint 23 staging→production gap is classified as a MATZBEN CAB item; do not reference exact technical details in TLP:AMBER documents
- GDPR/PPL: any analysis involving citizen data from Stern's exposure must not retain copies of the exposed records

---

## Definition of Done

- [ ] Trigger assessment and synthesized threat picture complete
- [ ] Crown jewels inventory with 5 assets and threat alignment
- [ ] 5 STRIDE-based attack scenarios with ATT&CK mapping
- [ ] Trust boundary analysis covering BiometricTech and HavayaIT integration points
- [ ] Detection backlog (P1/P2) with blocked items identified
- [ ] 72-hour action plan executed (block, reset, letter sent)
- [ ] INCD-CID Annex C draft submitted
- [ ] Launch risk matrix and CISO recommendation memo delivered to DG

---

## Stakeholders

| Name | Role | Involvement |
|---|---|---|
| Dr. Ayelet Shamir | Director-General, NDSA | Receives launch recommendation |
| Col. (Res.) Dror Nativ | CISO, NDSA | Approves deliverables; signs CISO memo; signs BiometricTech letter |
| Yael Rotenberg | IR Lead / CTI | Leads analysis |
| Lt. Col. (Res.) Oren Friedman | INCD liaison | Delivers TRG-001; coordinates Annex C submission |
| Gila Ben-Moshe | SOC Lead | Executes 72h blocking actions; deploys detection rules |
| BiometricTech IL Ltd. CISO | Vendor | Receives formal security request; must respond within 24h |
