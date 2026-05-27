# Crown Jewels Register — PROJ-2024-002

**Classification:** TLP:AMBER

---

## Crown Jewels Inventory

| ID | Asset | Description | Owner | Criticality | Why Critical |
|---|---|---|---|---|---|
| CJ-001 | Subscriber billing records | 4.2M customer records; revenue engine | Billing / IT | **Critical** | Mass identity theft; INCD-CID CII designation; TASE impact |
| CJ-002 | Network Management System (NMS) / ENM | Controls routing for all 4.2M subscribers | NOC Engineering | **Critical** | Service disruption / national blackout capability; PM Office contract dependency |
| CJ-003 | PM Office connectivity contract | $210M contract; CII classification | NOC Operations | **Critical** | National security incident if disrupted; non-replaceable contract |
| CJ-004 | SS7 signaling network | Subscriber call/SMS/location interception capability | NOC | **Critical** | SIGINT value for foreign intelligence; subscriber location tracking |
| CJ-005 | Roaming data (UAE, Cyprus, Romania) | International subscriber travel patterns | Roaming / IT | High | Intelligence collection value; foreign subscriber exposure |
| CJ-006 | NOC contractor access credentials | Gateway to CJ-001 through CJ-005 | IT Security | **Critical** | Single-actor compromise enables all above |

---

## Threat Alignment

| Crown Jewel | Threat Scenario | Most Likely TTP | Current Detection | Gap? |
|---|---|---|---|---|
| CJ-002 (NMS/ENM) | SCN-001: Contractor compromise → NMS | T1078.002 + T1021.001 | Partial (off-hours, 30-min delay) | Yes — no ENM audit log in SIEM |
| CJ-001 (Billing records) | SCN-002: Billing API credential abuse | T1078.003 | None | **Yes — billing API logs not in SIEM** |
| CJ-003 (PM Office) | SCN-003: NMS config change after persistence | T1565.001 | None | **Yes — NMS config audit not in SIEM** |
| CJ-004 (SS7) | SCN-001 → SS7 MAP queries via NMS | T1040 | None | **Yes — SS7 MAP not monitored** |

---

## Crown Jewel Exposure Scoring

| Crown Jewel | Exposure Score (1-5) | Primary Exposure Vector | Recommended Control |
|---|---|---|---|
| CJ-002 (NMS/ENM) | **5** | CVE-2023-44481 unpatched; contractor access | Emergency patch ENM; revoke unnecessary contractor accounts |
| CJ-006 (Contractor creds) | **5** | AiTM phishing (TRG-001 confirmed active) | Phishing-resistant MFA for contractor VPN; ISO attachment block |
| CJ-001 (Billing records) | 4 | Billing API no rate limit; credentials obtainable | Implement API rate limiting; restrict source IPs |
| CJ-004 (SS7) | 4 | Accessible via NMS once NMS is compromised | SS7 MAP query logging; anomaly detection |
| CJ-003 (PM Office) | 3 | Requires prior NMS compromise | NMS change-window enforcement; write-access MFA |
| CJ-005 (Roaming data) | 3 | API access from NMS | Separate access control for roaming data API |
