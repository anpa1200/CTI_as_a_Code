# Peer Incident Report — Anonymized Telecom Operator

**TLP: AMBER**  
**Shared via:** INCD Information Sharing Portal (ISP-2024-1847)  
**Date Shared:** 2024-10-07  
**Sector:** Telecommunications  
**Organization:** [Anonymized — Israeli Mobile Operator, >5M subscribers]

---

## Incident Summary

Between **August 2024 and September 2024**, the reporting organization detected an
unauthorized intrusion that began with a compromised OSS engineer workstation and
progressed to unauthorized access to SS7 signalling infrastructure.

The incident was detected 34 days after initial compromise, triggered by an anomalous
service account logon at 02:30 local time on a network management server.

---

## Intrusion Timeline

| Date | Event |
|---|---|
| 2024-08-04 | Spearphishing email to OSS engineer; ISO attachment opened |
| 2024-08-04 | PowerShell dropper executed; implant beaconing to external IP |
| 2024-08-06 | Adversary pivots from engineer workstation to OSS management server via RDP |
| 2024-08-09 | Service account `svc-netact-backup` created on Nokia NetAct server |
| 2024-08-09 – 2024-09-07 | Low-and-slow data collection from NetAct management database |
| 2024-09-07 | Adversary accesses SS7 Signalling gateway via compromised NetAct admin account |
| 2024-09-07 – 2024-09-10 | Approximately 1,800 MAP-UpdateLocation queries issued; subscriber location data accessed |
| 2024-09-10 | DNS TXT exfiltration detected by NOC engineer (anomalous query volume) |
| 2024-09-10 | Incident response initiated; adversary evicted within 72h |

---

## Technical Observations

**Implant behavior:**
- C2 over HTTPS (port 443) using domain fronting via Cloudflare CDN
- Beacon interval: 4–6 hours (low-and-slow to avoid detection thresholds)
- Second-stage capabilities: keylogging, credential harvesting, lateral movement via RDP

**Service account creation pattern:**
- Account name: `svc-netact-backup` (resembles legitimate NetAct service accounts)
- Created via CLI on RHEL 8 host: `useradd -r -s /bin/bash svc-netact-backup`
- No corresponding entry in IT service management system (ITSM)
- SSH key placed in `/home/svc-netact-backup/.ssh/authorized_keys`

**SS7 access method:**
- Adversary used compromised NetAct admin credentials to access SS7 gateway management interface
- Issued raw SS7 MAP queries (SendRoutingInfo + ProvideSubscriberInfo) via management API
- Targeted ~1,800 subscribers identified from CDR data collected in earlier phase
- Selection criterion inferred: subscribers associated with government/defense employers
  (inferred from subscriber demographic data visible in billing system)

**Exfiltration:**
- DNS TXT queries to `cel-[base64-encoded-data].cdn-analytics-net[.]com`
- ~23 TXT queries per minute sustained over ~18 hours
- Estimated data volume: 2.4 MB (structured JSON of subscriber location data)

---

## What Was NOT Observed (relevant gaps)

- No EDR on Linux OSS servers — initial implant only detected from network anomaly
- No centralized logging from SS7 gateway — SS7 access only confirmed post-incident via native gateway logs (not forwarded to SIEM)
- Adversary avoided Windows systems entirely — stayed exclusively on Linux infrastructure

---

## Recommendations Shared with Peers

1. Deploy auditd on ALL Linux OSS/BSS systems; forward to SIEM
2. Log and alert on new local user account creation on critical infrastructure servers
3. Implement DNS query rate monitoring (alert threshold: >10 TXT queries/min to external domains from a single host)
4. Segregate SS7 gateway management interface — require dual-approval for any programmatic MAP query batch
5. Cross-reference service account inventory against ITSM every 24 hours
