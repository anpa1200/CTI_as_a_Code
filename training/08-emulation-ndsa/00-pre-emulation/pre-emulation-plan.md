# Pre-Emulation Plan — PROJ-2026-008 (NDSA Annual Detection Validation)

**Classification:** CONFIDENTIAL  
**Date:** 2026-01-05  
**Exercise type:** INCD-CID Section 8 Annual Detection Validation  
**Source CTI:** March 2025 NDSA eID breach (A05); GovID 2.0 pre-launch assessment (A06)  
**INCD notification:** Pre-notification submitted 5 business days before exercise

---

## Exercise Objectives

1. Validate whether detection rules deployed since the March 2025 breach actually work
2. Identify remaining gaps in NDSA's detection coverage before INCD audit
3. Satisfy INCD-CID Section 8 annual detection validation requirement
4. Produce evidence for INCD compliance report and HavayaIT contractor security letter

---

## INCD Section 8 Pre-Notification Package

```
NDSA — INCD-CID SECTION 8 ADVERSARY EMULATION PRE-NOTIFICATION
Classification: CONFIDENTIAL — INCD CHANNEL
Date: [5 business days before exercise]
Submitted by: Col. (Res.) Dror Nativ, CISO, NDSA
INCD Liaison: Lt. Col. (Res.) Oren Friedman

1. EXERCISE IDENTIFICATION
   Title: NDSA Annual Detection Validation Exercise 2026
   Authority: INCD-CID Section 8 annual requirement
   INCD notification code: [to be assigned by INCD]

2. SCOPE
   Systems: Lab replicas only.
     - JUMPHOST-CONTRACTOR-LAB (replica of JUMPHOST-CONTRACTOR-01)
     - VRID-LAB-SRV (replica of VRID-SRV-01)
     - NDSA-CONTRACTOR-VPN-TEST (isolated test VPN gateway)
     - GovID 2.0 Frontend Lab Cluster (isolated; no production data)
   Production systems: NOT in scope. Zero production interaction.
   GOVNET Classified Segment: NOT in scope; no lab equivalent.

3. TECHNIQUES TO BE TESTED (plain language)
   T1: VPN logon simulation from non-corporate network location
   T2: Internal network discovery commands after VPN access
   T3: Remote desktop connection between network segments
   T4: Memory access attempt on security process (credential dumping)
   T5: Background file transfer to external test server
   T6: System service creation in unusual folder
   T7: Windows registry startup entry modification (user-level)
   T8: Database query tool misuse — full record export
   T9: Large-volume data transfer to external test server
   T10: PowerShell with encoded command
   T11: Security log clearing (run last)

4. EXECUTION TEAM
   Internal: NDSA SOC Lead (Gila Ben-Moshe) + CTI Lead (Shai Rotenberg)
   External: CyberShield Ltd. red team (2 engineers; NDSA contractor clearance)
   Note: CyberShield does not hold MATZBEN clearance; lab only

5. CONTAINMENT MEASURES
   All lab systems: isolated VLAN; no production routing
   External C2 server: CyberShield-controlled; IP pre-shared with INCD; pre-blocked on production perimeter
   All commands: logged to evidence store
   Exercise director (Rotenberg): authority to halt any module

6. EXERCISE WINDOW
   Date: [date]; 08:00-17:00 IST
   Emergency halt contact: Col. Nativ [secure line]
   INCD acknowledgment requested by: [date - 2 business days]
```

---

## Security Officer Approval Package (Maj. Cohen — Plain Language)

| Module | Plain Title | System Risk | Safety Measures |
|---|---|---|---|
| MOD-01 | Simulated contractor login from wrong location | None — test VPN only; no production access | Test VPN is isolated; cannot route to production |
| MOD-02 | Looking around network after login | None — read-only commands; test environment | Test domain only; read-only commands |
| MOD-03 | Moving between network areas via remote desktop | None — test computers only | Lab isolation; rollback: reboot |
| MOD-04 | Accessing security process memory | Low — test computer; no real credentials; dump deleted immediately | Dump to isolated temp; deleted after test |
| MOD-05 | Background file download from test server | Low — harmless test file; no code execution | Test file pre-verified benign; lab machine only |
| MOD-06 | Installing a test service in unusual folder | Low — service runs benign echo; removed after test | Automated removal at module end |
| MOD-07 | Adding startup entry in registry | Low — test machine; entry deleted after test | Automated cleanup at module end |
| MOD-08 | Running test database query | None — test database with synthetic data only | Verified synthetic data; no real citizen records |
| MOD-09 | Sending large test file to our server | None — test data; sent to our own server | Our own server; no external party |
| MOD-10 | PowerShell with encoded command | None — script only prints "test" | Pre-verified; no system changes |
| MOD-11 | Clearing security log (RUN LAST) | Low — lab log only; production isolated | Lab logs backed up before; production on separate systems |

---

## Pre-Exercise Checklist

- [ ] INCD pre-notification submitted and acknowledged
- [ ] MATZBEN CAB change request submitted for exercise window
- [ ] Lab environment snapshot taken (for recovery)
- [ ] All detection rules confirmed active in Elastic SIEM
- [ ] CyberShield lab C2 server reachable from VRID-LAB-SRV
- [ ] VECTR project created; all 11 modules entered with pass criteria
- [ ] test_contractor_01 account active on lab domain
- [ ] SOC alerted to exercise; alert suppression NOT applied
- [ ] Execution log path set in Invoke-AtomicRedTeam
- [ ] INCD MATZBEN deconfliction code on hand (for any incidental classified system contact)

---

## MATZBEN Change Request (CR-2026-CTI-001)

**For draft detection rules GOV-DET-006 through GOV-DET-009 — to be deployed if passing lab validation:**

| Rule | Title | Log source | CAB status |
|---|---|---|---|
| GOV-DET-006 | GovID 2.0 Bulk API Extraction | GovID frontend logs | Pending — requires API log pipeline |
| GOV-DET-007 | Vendor Token from Non-Approved IP | GovID API logs + token registry | Pending — requires BiometricTech IP binding |
| GOV-DET-008 | Net.exe Domain Enumeration | Winlogbeat process creation | Ready — no new log source needed |
| GOV-DET-009 | HKCU Registry Run Key | Sysmon EID 13 (after config update) | Pending — requires Sysmon config change CAB |
