# PROJ-2024-001 — LifeTech Pharma Targeted Intrusion

**Classification:** TLP:AMBER  
**Status:** Closed  
**Analyst:** Yael Mizrahi  
**Period:** 2024-10-22 – 2024-11-15  

---

## Evidence Index

| File | Source | Period | Key Events |
|---|---|---|---|
| `01-evidence/m365/message-trace-p.levi.csv` | M365 Security & Compliance | Oct 15–24 | AiTM phishing email Oct 22 11:23 IST |
| `01-evidence/m365/message-trace-m.cohen.csv` | M365 Security & Compliance | Nov 13–15 | CFO phishing email Nov 15 17:58 IST |
| `01-evidence/azure-ad/signin-p.levi.json` | Azure AD Sign-in Logs | Oct 22–24 | Session token replay from Istanbul |
| `01-evidence/vpn/anyconnect-2024-10-24.log` | Cisco ASA AnyConnect | Oct 24 | VPN session from 185.220.101.47, 1h12m |
| `01-evidence/sysmon/WS-CFO-01-sysmon.jsonl` | Sysmon / Winlogbeat | Nov 15 | PowerShell, LSASS, persistence, WMI |
| `01-evidence/crowdstrike/WS-CFO-01-alert-20241115.json` | CrowdStrike Falcon | Nov 15 | Triggering IOA, C2, file drop |
| `01-evidence/windows-security/DC01-security.jsonl` | Windows Security (Splunk) | Oct 24–Nov 15 | svc_backup logons, DCSync EID 4662 |
| `01-evidence/windows-security/SERVER-RD-02-security.jsonl` | Windows Security (Splunk) | Nov 1–Nov 6 | EID 4663 ×47, EID 5156 exfil |
| `01-evidence/palo-alto/ngfw-flows.csv` | Palo Alto NGFW Traffic | Nov 1–15 | 381 MB exfil to 198.51.100.44 |
| `01-evidence/palo-alto/dns-queries.csv` | Palo Alto DNS | Oct 22–Nov 15 | C2 beaconing, domain pivots |
| `01-evidence/sql-audit/SERVER-RD-02-sql-audit.jsonl` | SQL Server Audit (Splunk copy) | Nov 6 | xp_cmdshell, compression, upload, cleanup |

## Investigation Commands Used

### Initial triage — Splunk

```spl
# First query after intake — scope the C2 IP
index=* 203.0.113.87 earliest=-30d
| stats count by host, sourcetype
| sort -count

# Find all connections to the C2
index=firewall OR index=endpoint dest_ip=203.0.113.87 earliest=-30d
| table _time, host, src_ip, dest_ip, dest_port, bytes_out
| sort _time

# Find anomalous VPN auth for p.levi
index=vpn user=p.levi earliest=-45d
| table _time, user, src_ip, bytes_in, bytes_out, session_duration
| sort _time

# Confirm DCSync — EID 4662 from non-DC
index=wineventlog EventCode=4662
  ObjectType="{19195a5b-6da0-11d0-afd3-00c04fd930c9}"
earliest=-30d
| where NOT match(src_ip, "^10\.10\.1\.1")
| table _time, host, SubjectUserName, IpAddress, ObjectName, Properties

# Hunt for svc_backup off-hours activity
index=wineventlog EventCode=4624 LogonType=3
  TargetUserName=svc_backup earliest=-45d
| eval hour=strftime(_time, "%H")
| where hour < 6 OR hour > 22
| table _time, host, TargetUserName, IpAddress, LogonType
| sort _time
```

### CrowdStrike RTR — WS-CFO-01 live forensics

```bash
# Memory dump (taken before isolating — C2 still active)
runscript -CloudFile=get_memdump.ps1 -CommandLine="C:\Windows\Temp\memdump.bin"

# Check running processes
runscript -Raw="""
Get-Process | Select-Object Name, Id, Path, Company |
Where-Object {$_.Path -like "*AppData*" -or $_.Company -notlike "*Microsoft*"}
"""
# Result: svchost32.exe (PID 4128) C:\Users\m.cohen\AppData\Roaming\Microsoft\Windows\svchost32.exe

# Pull file hashes
runscript -Raw="""
Get-FileHash "C:\Users\m.cohen\AppData\Roaming\Microsoft\Windows\svchost32.exe" -Algorithm SHA256
Get-FileHash "C:\Users\m.cohen\AppData\Local\Temp\UpdateHelper.tmp" -Algorithm SHA256 2>$null
"""
# svchost32.exe  SHA256: 3b4c14a87e5f9d8c2a1f4e6b9c0d2e7a1b3c5d8f2a4e6c8b0d3e5a7c1f4b8d2e
# UpdateHelper.tmp: file not found (already executed and renamed to .dll)

# Check persistence
runscript -Raw="""
Get-ItemProperty "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"
Get-ScheduledTask | Where-Object TaskPath -like "*WindowsUpdate*" | Select-Object TaskName, TaskPath
"""
# WindowsHostSvc: C:\Users\m.cohen\AppData\Roaming\Microsoft\Windows\svchost32.exe -k netsvcs
# ScheduledUpdateCheck: C:\Users\m.cohen\AppData\Roaming\Microsoft\Windows\svchost32.exe

# Collect the binary for analysis
get -Path "C:\Users\m.cohen\AppData\Roaming\Microsoft\Windows\svchost32.exe"
```

### Binary analysis — PE timestamp extraction

```bash
# Extract PE compile timestamp from svchost32.exe
python3 -c "
import pefile
pe = pefile.PE('svchost32.exe')
import datetime
ts = pe.FILE_HEADER.TimeDateStamp
print(datetime.datetime.utcfromtimestamp(ts))
"
# Output: 2018-04-09 08:00:00
# ⚠ TIMESTOMPED — binary uses Windows 10 API calls not available in 2018

# strings analysis for C2 indicators
strings svchost32.exe | grep -E "(http|\.biz|\.net|cdn|update|sys-)"
# telemetry-cdn-services.biz
# sys-update-cdn.net
# https://203.0.113.87/update
# https://198.51.100.44/recv
# Mozilla/5.0 (compatible; MSIE 11.0; Windows NT 6.1)
```

### Infrastructure pivot from C2 IPs

```bash
# VirusTotal lookup — 203.0.113.87
curl -s "https://www.virustotal.com/api/v3/ip_addresses/203.0.113.87" \
  -H "x-apikey: $VT_API_KEY" | jq '.data.attributes | {country, asn, as_owner, last_analysis_stats}'
# {country: "US", asn: 398704, as_owner: "Hostwinds LLC", last_analysis_stats: {malicious: 12, suspicious: 3}}

# Shodan — co-hosted infrastructure
curl -s "https://api.shodan.io/shodan/host/198.51.100.44?key=$SHODAN_KEY" | \
  jq '{hostnames, ports, org, country_name}'
# {hostnames: ["sys-update-cdn.net","198.51.100.44.host.secureserver.net"],
#  ports: [443, 8443, 22], org: "GoDaddy.com, LLC", country_name: "United States"}

# Certificate transparency — find related domains
curl -s "https://crt.sh/?q=203.0.113.87&output=json" | \
  jq '[.[] | .name_value] | unique'
# ["telemetry-cdn-services.biz","cdn-telemetry-update.biz","windows-cdn-service.net"]

# Passive DNS — previous resolutions
curl -s "https://api.passivedns.com/v2/search?q=203.0.113.87" \
  -H "Authorization: Token $PDNS_KEY" | jq '.results[] | {rrname, rdata, time_last}'
# Multiple domains resolving to this IP since 2024-08 consistent with Iranian-nexus actor infra
```

### Hayabusa — validate Sigma rules against evidence

```bash
# Run Hayabusa against collected EVTX/JSON logs
hayabusa csv-timeline \
  -d investigations/lifetech-2024-11/01-evidence/ \
  -r detections/sigma/ \
  -o investigations/lifetech-2024-11/04-detections/hayabusa-validation.csv \
  --no-wizard

# Check results for our rules
grep -E "DET-00[1-4]" 04-detections/hayabusa-validation.csv

# Expected output:
# 2024-10-24T00:17:14Z,High,DET-001,Anomalous VPN Auth,WS-IT-LEVI,p.levi,185.220.101.47
# 2024-11-06T00:48:33Z,Critical,DET-002,DCSync Non-DC,DC01,svc_backup,10.10.3.22
# 2024-11-01T07:18:44Z,Medium,DET-003,Svc Account Off-Hours,SERVER-RD-02,svc_backup,10.10.3.22
# 2024-11-15T18:52:04Z,High,DET-004,WmiPrvSE PowerShell,SERVER-FIN-01,svc_finreport,10.10.2.20
```
