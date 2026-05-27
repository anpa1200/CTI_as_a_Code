# NDSA March 2025 Incident — Key Findings Summary
**Classification:** CONFIDENTIAL — for CTI Program use  
**Source:** NDSA Post-Incident Report (IR-2025-0314), closed October 2025  
**Prepared for:** CTI Lead Shai Rotenberg (program background briefing)

---

## Incident Overview

**Date:** 2025-03-14 (detection) / 2025-03-10 (first anomalous activity, retroactively)  
**Nature:** Supply chain compromise — contractor account (HavayaIT, Yoav Stern) used to access VRID biometric database  
**Data affected:** 9.5M citizen biometric enrollment records (citizen ID, biometric template reference, date of birth)  
**Exfiltration confirmed:** Yes — approximately 48.8 MB to external IP (203.0.113.77)  
**Classified segment:** NOT accessed — data diode boundary held  
**Dwell time:** 4 days from first anomalous session to detection  

---

## Root Cause

1. **HavayaIT contractor laptop compromised** — Yoav Stern's laptop was infected via spearphishing email (Iranian-nexus AiTM campaign) between February 14–28, 2025. NDSA was not notified and had no MDM visibility into contractor laptops.

2. **SSH key theft** — the adversary extracted Stern's SSH private key from the laptop. This key was authorized on JUMPHOST-CONTRACTOR-01 and (via compromised svc-govid-deploy account) on GOVID-MGMT-01.

3. **GOV-DET-001 alert suppressed** — the detection rule for off-hours contractor VPN had a known high FP rate. The SOC team had enabled alert suppression on 2025-02-01 to reduce noise. The March 10 and March 12 anomalous sessions therefore generated no alerts.

4. **No intelligence integration** — CERT-IL CB-2025-041 (published 2025-06-05 in this scenario) predates the March incident in the fictional timeline; a preceding advisory warning of contractor targeting was not processed by NDSA.

---

## Key Intelligence Findings (for CTI Program Development)

**Actor assessment:** Assessed with **moderate-high confidence** as Iranian-nexus threat cluster, consistent with CEDAR-SIGNAL tradecraft documented in peer incidents. Attribution not definitive.

**TTP summary:**

| Phase | Technique | Observed Evidence |
|---|---|---|
| Initial Access | T1566.001 — AiTM phishing | Contractor laptop compromise via phishing |
| Credential Access | T1552.004 — Private Keys | SSH key extracted from compromised laptop |
| Initial Access (org) | T1078.003 — Valid Accounts | Stolen SSH key used against NDSA jump host |
| Lateral Movement | T1021.022 — SSH | Jump host → GOVID-MGMT-01 via svc-govid-deploy |
| Collection | T1005 — Data from Local System | VRID database full-table SELECT |
| Exfiltration | T1048 — Exfiltration Over Alternative Protocol | HTTPS exfiltration to external IP |
| Defense Evasion | T1070 — Indicator Removal | Log clearing not observed but SSH key use leaves minimal traces |

**Adversary goal:** Assessed as collection of biometric data for attribution/surveillance purposes, consistent with Iranian state intelligence collection priorities.

**What the adversary did NOT do:**
- Did not attempt to corrupt or delete data
- Did not attempt to reach classified segment (blocked at data diode)
- Did not deploy persistent implant on NDSA infrastructure
- Evicted cleanly after 35 minutes of active collection

---

## Detection Gaps Identified

1. **GOV-DET-001 FP problem** — high FP rate on off-hours shifts led to suppression; detection failed
2. **No contractor endpoint visibility** — contractor laptops not under NDSA MDM; compromise went undetected for weeks
3. **SSH key theft detection absent** — no detection for key extraction from contractor systems
4. **API call anomaly** — VRID full-table SELECT was detected (GOV-DET-005) but response was too slow (35 min to containment)
5. **No external indicator processing** — CERT-IL advisory content was not operationalized

---

## Intelligence Questions Remaining Open

1. How many other contractors with HavayaIT-similar access profiles have been targeted?
2. Has any classified segment data been accessed through a method not yet discovered?
3. Is the adversary still monitoring NDSA infrastructure via persistent access not yet evicted?
4. What biometric data was taken, and is it being actively used?
