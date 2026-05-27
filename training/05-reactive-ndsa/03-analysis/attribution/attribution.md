# Threat Actor Assessment — PROJ-2025-005

**Classification:** TLP:AMBER  
**Confidence:** Medium (Admiralty B/3) — unclassified assessment

---

## Assessed Threat Actor

**Designation**: CLUSTER-2025-NDSA (internal); assessed overlap with Iranian-nexus cluster  
**Nexus**: Iranian state-directed (medium confidence unclassified; INCD TLP:RED March 2025 advisory confirms Iranian tasking — not cited in unclassified products)  
**Objective**: Intelligence collection — acquisition of national biometric identity database for SIGINT/counterintelligence purposes  
**Confidence**: Medium (B/3) unclassified

---

## Attribution Assessment

The tradecraft observed in this operation — AiTM phishing against a government contractor's personal email, 5-day mailbox reconnaissance, extraction of VPN credentials and TOTP seed, off-hours VPN logon from Turkish residential proxy, targeted query of biometric identity database, and staged exfiltration via BITS to bulletproof hosting — demonstrates medium-confidence overlap with publicly documented Iranian-nexus state-affiliated operations against Israeli civilian government targets (ClearSky CloudGuard IL-2024).

**Highest-confidence connection**: The C2 infrastructure uses a Turkish residential VPN exit node (203.0.113.115) that appears in a 2-IP cluster documented in ClearSky reporting on Iranian-nexus contractor targeting of Israeli government and tech companies.

---

## Supporting Evidence

| Indicator | Weight | Source |
|---|---|---|
| AiTM phishing → contractor mailbox → VPN extraction: same TTP documented in ClearSky CloudGuard IL-2024 | High | EXT-001 |
| 5-day preparation window (mailbox recon before VPN logon): consistent with patient Iranian-nexus TTPs | Medium | EV-001, EV-006 |
| Targeting of biometric database: aligns with INCD assessment of Iranian intelligence collection tasking | High | EXT-002 (classified; not cited) |
| Turkish residential VPN exit node 203.0.113.115: ClearSky infrastructure cluster | Medium | EXT-001 |
| `gov-procurement-il-portal[.]net` domain: privacy-protected, registered 5 days before attack — consistent with Iranian-nexus infrastructure preparation pattern | Medium | EV-006 |

---

## Against Attribution

- C2 infrastructure (203.0.113.201) has no prior public attribution
- Tooling (comsvcs.dll, BITS, wevtutil) is widespread and not actor-distinctive
- Halevi involvement creates alternative hypothesis: insider or financially motivated actor using these techniques
- No Iranian-language artifacts or operator security failures that confirm origin

---

## Insider vs. External Actor Assessment

> PIR-004 (contractor acting alone vs. directed) is open. Two hypotheses:

**H1: Halevi was directed by an external actor**  
Evidence for: Turkish VPN exit node; INCD TLP:RED advisory confirms Iranian tasking against NDSA; scale of operation (5-day prep; C2 infrastructure) inconsistent with opportunistic insider  
Confidence: Medium

**H2: Halevi was acting alone (insider threat)**  
Evidence for: Halevi had legitimate access to the contractor VPN; personal motivation unknown; could have self-funded residential VPN  
Confidence: Low — 5-day reconnaissance phase and structured C2 infrastructure is inconsistent with a lone insider without state support

**Current assessment**: H1 is the more likely hypothesis. The HavayaIT M365 audit logs (when obtained) should be reviewed for evidence of initial AiTM compromise and any communications with external parties.

---

## Confidence Statement

> Medium confidence (B/3) unclassified assessment. Confidence would increase materially if: HavayaIT M365 logs confirm AiTM compromise and external actor access to mailbox; C2 infrastructure overlaps with classified Iranian-nexus campaigns; or INCD downgrade of TLP:RED advisory permits citing it in unclassified products.
