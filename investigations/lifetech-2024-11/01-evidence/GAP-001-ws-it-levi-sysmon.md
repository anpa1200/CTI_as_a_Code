# GAP-001 — WS-IT-LEVI Sysmon | 2024-10-22 – 2024-11-01

**Start:** 2024-10-22T09:31:00Z (immediately after phishing email opened)  
**End:** 2024-11-01T07:14:00Z (Sysmon service and forwarder restart)  
**Duration:** 9 days, 21 hours, 43 minutes  

---

## What is missing

| Event ID | Channel | What it records | Impact of absence |
|---|---|---|---|
| EID 1 | Sysmon | Process creation (image, cmdline, parent, hash) | Cannot see what ran on WS-IT-LEVI during gap |
| EID 3 | Sysmon | Network connection (src/dst/port/process) | Cannot confirm C2 beaconing during gap window |
| EID 11 | Sysmon | File creation (path, process) | Cannot see if UpdateHelper.dll was dropped here |
| EID 13 | Sysmon | Registry value set | Cannot confirm persistence mechanism on WS-IT-LEVI |
| EID 10 | Sysmon | Process access (LSASS) | Cannot confirm credential access on this host |

---

## Root cause

The Sysmon forwarder service (`Winlogbeat`) on WS-IT-LEVI stopped at approximately 09:31 IST on 2024-10-22 — within seconds of the AiTM phishing email being opened at 09:31.

Verification:
```powershell
# Via CrowdStrike RTR (hardware access blocked by legal hold)
Get-WinEvent -LogName "System" -FilterHashtable @{Id=7036} |
  Where-Object { $_.Message -like "*Winlogbeat*" } |
  Select-Object TimeCreated, Message
```
```
TimeCreated              Message
2024-10-22T09:31:02Z     The Winlogbeat service entered the stopped state.
2024-11-01T07:14:08Z     The Winlogbeat service entered the running state.
```

The process that stopped Winlogbeat is unknown — EID 1 would have captured it, but Sysmon itself was also stopped at the same timestamp.

---

## Impact on investigation

All claims covering WS-IT-LEVI activity from 2024-10-22T09:31:00Z to 2024-11-01T07:14:00Z are:
- **INFERRED** if supported by adjacent sources (VPN logs, DC authentication, firewall flows)
- **HYPOTHESIZED** if based on logical inference with no corroborating source

Specifically affected claims:
- **CL-001** — initial access via AiTM: CONFIRMED via M365 Message Trace + Azure AD (not dependent on Sysmon)
- **Dwell period Oct 22–Nov 1** — what happened on WS-IT-LEVI during this window is INFERRED from DC01 auth events and VPN logs
- **Persistence mechanism on WS-IT-LEVI** — HYPOTHESIZED (UpdateHelper.dll likely dropped here based on Oct 24 VPN session, but no direct evidence)

---

## Possible cause

Stopping Winlogbeat and Sysmon is a known defensive evasion technique: **T1562.001 — Impair Defenses: Disable or Modify Tools**.

The timing — within seconds of opening a malicious email — is not consistent with a service crash or configuration error. A service crash would generate EID 7034 (service terminated unexpectedly). The log shows EID 7036 (service entered stopped state), which indicates a clean service stop, not a crash.

**Assessment:** This gap was deliberately caused by the adversary. It is not an absence — it is a finding.
