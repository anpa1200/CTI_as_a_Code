# CERT-IL Technical Advisory TA-2024-089

**TLP: AMBER — Share with security staff within your organization only**  
**Classification:** Unclassified / For Official Use  
**Advisory ID:** TA-2024-089  
**Issued:** 2024-10-01  
**Valid Until:** 2025-04-01  
**Sector:** Telecommunications, Government Communications  
**Geographic Scope:** Israel, UAE, Cyprus, Jordan

---

## Summary

CERT-IL has identified a sustained intrusion campaign targeting Israeli and regional
telecommunications operators. The campaign is assessed with **moderate confidence** to be
conducted by an Iranian-nexus threat cluster tracked internally as CEDAR-SIGNAL.
The cluster has demonstrated capability to access SS7 signalling infrastructure and has
conducted subscriber location tracking and call interception against high-value targets
including government officials and defense-adjacent personnel.

**Urgency:** Multiple Israeli telecommunications operators have been notified directly.
All operators holding government communications contracts are advised to treat this advisory
as Priority 1.

---

## Observed Tactics, Techniques, and Procedures

### Initial Access — T1566.001 (Spearphishing Attachment)

Spearphishing emails targeting NOC (Network Operations Center) and OSS engineering staff.
Subjects observed:
- "Ericsson ENM Software Update — Action Required"
- "Nokia NetAct License Renewal — Immediate Verification"
- "INCD Compliance Audit Request — Attached Form"

Attachments are ISO files containing LNK files that execute a PowerShell dropper.
The dropper downloads a second-stage implant from adversary-controlled infrastructure.

### Initial Access (alternative) — T1190 (Exploit Public-Facing Application)

Two operators have reported exploitation of internet-facing network management interfaces
(Ericsson ENM, Nokia NetAct) that were not properly isolated from the internet.
Vulnerabilities: CVE-2023-44481 (Ericsson ENM authentication bypass, patched Q1 2024) and
an unattributed zero-day in a Nokia NetAct API endpoint (vendor notified; patch pending).

### Persistence — T1053.005, T1078.002

Scheduled task creation and service account compromise. Adversary creates local accounts
on Linux-based OSS infrastructure with names resembling legitimate service accounts
(e.g., `svc-netact-mon`, `ericsson-diag`).

### Collection — T1040 (Network Sniffing), T1119 (Automated Collection)

On two confirmed victims, the adversary deployed network sniffing capability on OSS
infrastructure with access to SS7/Diameter traffic. Specific interest in location update
messages (MAP-UL), mobile-terminated call setup, and inter-operator roaming records.

### Exfiltration — T1048.003 (Exfiltration Over Alternative Protocol)

Exfiltration observed via DNS tunneling. Encoded data embedded in TXT record queries to
adversary-controlled domains. Pattern: high-frequency TXT queries to
`[random-label].[operator-name]-[suffix].com` domains.

---

## Indicators of Compromise

> **Note:** These indicators were valid at advisory publication date.  
> Verify current reputation before blocking — some IPs may rotate.

| Indicator | Type | Confidence | Notes |
|---|---|---|---|
| `netact-update-portal[.]com` | Domain | High | Spearphish sender domain (ISO dropper host) |
| `enm-license-portal[.]net` | Domain | High | Spearphish sender domain |
| `svc-netact-mon` | Username pattern | Medium | Adversary-created service account pattern |
| `ericsson-diag` | Username pattern | Medium | Adversary-created account pattern |
| `198.51.100.44` | IPv4 | Medium | C2 IP (shared hosting; may rotate) |
| `2001:db8::44` | IPv6 | Low | C2 IPv6 (alternate channel observed once) |
| DNS TXT pattern | Behavioral | High | High-frequency TXT queries >20/min to unknown domains |

---

## Recommended Actions

1. **Isolate ENM and NetAct** from internet-reachable networks; enforce access via jump host with MFA
2. **Audit service accounts** on all OSS/BSS Linux systems for recently created accounts
3. **Enable DNS query logging** and alert on TXT query frequency anomalies
4. **Patch CVE-2023-44481** if not yet applied
5. **Review government contract networks** — prioritize isolation of circuits used for
   classified government communications
6. **Contact CERT-IL** at cert@cert.gov.il to report any indicators of compromise matching
   this advisory within 8 hours of detection (INCD-CID obligation)

---

*This advisory was prepared by CERT-IL for distribution to Israeli Critical Infrastructure operators.*  
*Redistribute only within your organization to authorized security personnel.*  
*Do not post publicly or forward outside TLP:AMBER distribution.*
