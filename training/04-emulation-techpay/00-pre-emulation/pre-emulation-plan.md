# Pre-Emulation Plan — PROJ-2024-004 (Operation Desert Cipher)

**Classification:** TLP:AMBER  
**Date:** 2024-11-01  
**Exercise type:** Threat-Informed Detection Validation  
**Source CTI:** Operation Desert Cipher campaign report (ClearSky; Iranian-nexus attribution)

---

## Exercise Objectives

1. Test whether TechPay / LifeTech Pharma detection rules fire correctly against confirmed adversary TTPs
2. Identify detection gaps before the adversary exploits them in production
3. Produce evidence of detection validation for BoI-CD 362 Section 6 compliance

---

## Scope and Constraints

**In scope:**
- 11 of 14 extracted TTPs (3 excluded — see TTP table)
- Lab environment only (JUMPHOST-LAB, TARGET-LAB, DB-LAB)
- CyberShield Ltd. lab C2 infrastructure for BITS/exfil testing

**Excluded TTPs (with justification):**
- T1566.001 (spearphishing) — requires email infrastructure; test at email gateway separately
- T1557 (AiTM) — cannot safely emulate without risk of production token capture
- T1133 (VPN external) — adapted as MOD-01 to simulate post-AiTM credential use

**Out of scope:**
- Production systems
- Any action that would affect real user sessions or authentication tokens
- Any action outside the documented test modules

---

## Lab Environment

| Component | Purpose | Host |
|---|---|---|
| JUMPHOST-LAB | Entry host; simulates contractor jump host | Windows Server 2019 (domain-joined) |
| TARGET-LAB | Target server; simulates VRID or equivalent | Windows Server 2019 (domain-joined) |
| DB-LAB | Database host | Windows Server 2019 + SQL Server |
| CyberShield Lab C2 | Simulated exfiltration destination | External VPS (non-corporate ASN) |
| TechPay-Lab VPN GW | VPN endpoint for MOD-01 | Lab VPN appliance |

---

## Authorization

| Item | Approved By | Date |
|---|---|---|
| Exercise scope | CyberShield CISO + TechPay CISO (Yael Mizrahi) | 2024-10-28 |
| Lab C2 use | IT Security | 2024-10-28 |
| VPN authentication test | TechPay SOC Lead (Ronen Katz) | 2024-10-28 |
| LSASS dump test (controlled) | TechPay CISO | 2024-10-28 |

**Test account:** `test_contractor_01` — non-privileged domain account with same permissions as a TechPay NOC contractor  
**SYSTEM tests:** Executed via scheduled task in lab; CISO authorization on file

---

## Pass/Fail Criteria

| Result | Definition |
|---|---|
| PASS | Alert fires within defined time window; expected fields populated; SOC runbook triggered |
| PARTIAL | Alert fires but is missing one or more critical fields (host, user, technique context) |
| FAIL (rule missing) | No rule deployed for this technique — gap confirmed |
| FAIL (rule exists, not fired) | Rule deployed but did not fire — logic or field mapping bug |

---

## Execution Order

MOD-01 → MOD-02 → MOD-03 → MOD-04 → MOD-10 → MOD-05 → MOD-06 → MOD-07 → MOD-08 → MOD-09 → MOD-11 (LAST)

**CRITICAL:** MOD-11 (wevtutil log clear) must run last — it will destroy evidence of all prior test modules in the lab environment.

---

## Pre-Exercise Checklist

- [ ] Lab environment snapshot taken (for recovery if needed)
- [ ] All detection rules confirmed active in Elastic SIEM before exercise starts
- [ ] CyberShield lab C2 reachable from TARGET-LAB
- [ ] VECTR project created; all 11 modules entered
- [ ] test_contractor_01 account verified active and accessible
- [ ] SOC alerted to exercise; alert suppression NOT applied (we want to test real response)
- [ ] Execution log path configured in Invoke-AtomicRedTeam
