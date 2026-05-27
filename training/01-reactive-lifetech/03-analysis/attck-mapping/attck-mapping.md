# ATT&CK Mapping — PROJ-2024-001

**ATT&CK Version:** v15  
**Classification:** TLP:AMBER

**Detection coverage: 0/12 techniques had a working rule that fired during the incident. 1 partial.**

---

## Confirmed TTPs

| Technique ID | Name | Tactic | Evidence | Confidence | Detection Status |
|---|---|---|---|---|---|
| T1566.001 | Spearphishing Attachment | Initial Access | EV-07: lookalike domain; Word macro | High | Partial — email gateway blocked EXE, not macro |
| T1059.001 | PowerShell | Execution | EV-01: `powershell.exe -enc` child of `winword.exe` | High | **NONE** — no Office→PS child rule |
| T1557 | Adversary-in-the-Middle (AiTM) | Credential Access | EV-06: VPN session token replay, Istanbul source | High | **NONE** — no impossible-travel/ASN rule |
| T1133 | External Remote Services | Initial Access | EV-06: VPN abuse with replayed session token | High | **NONE** |
| T1003.001 | OS Credential Dumping: LSASS Memory | Credential Access | EV-02: `rundll32.exe comsvcs.dll MiniDump`; 0x1410 | High | **NONE** — no LSASS access rule |
| T1003.006 | OS Credential Dumping: DCSync | Credential Access | EV-04: EID 4662, GUID 1131f6aa, non-DC host | High | **NONE** — DCSync rule not deployed |
| T1021.001 | Remote Desktop Protocol | Lateral Movement | EV-02: EID 4624 Type 10, JUMPHOST→WS-IT-LEVI | High | Partial — rule exists but 30-min NetFlow delay |
| T1087.002 | Account Discovery: Domain Account | Discovery | EV-02: `net group "Domain Admins"`, `nltest` | High | **NONE** |
| T1547.001 | Boot/Logon Autostart: Registry Run Keys | Persistence | EV-02: EID 7045 `WindowsUpdateAgent` service | High | **NONE** — no non-standard service path rule |
| T1197 | BITS Jobs | Defense Evasion / C2 | EV-02: BITS beacon communication (inferred) | Medium | **NONE** |
| T1039 | Data from Network Shared Drive | Collection | EV-03: `robocopy.exe` against R&D share | High | **NONE** — no bulk file access rule on SERVER-FIN-01 |
| T1041 | Exfiltration Over C2 Channel | Exfiltration | EV-08: 2.4 GB HTTPS to 198.51.100.44 over 3h | High | **NONE** — no large-outbound rule; no TLS inspection |
| T1070.001 | Indicator Removal: Clear Windows Event Logs | Defense Evasion | EV-02: EID 1102; wevtutil cl | High | **NONE** |
| T1071.001 | Application Layer Protocol: Web | Command & Control | EV-08: 47-min beacon interval; C2 domain DNS | High | **NONE** |

---

## Kill Chain Coverage

| Phase | Techniques Confirmed | Detection Coverage |
|---|---|---|
| Initial Access | T1566.001, T1133 | 0% (partial on T1566.001) |
| Execution | T1059.001 | 0% |
| Credential Access | T1557, T1003.001, T1003.006 | 0% |
| Discovery | T1087.002 | 0% |
| Lateral Movement | T1021.001 | Partial (30-min delay) |
| Persistence | T1547.001, T1197 | 0% |
| Collection | T1039 | 0% |
| Exfiltration | T1041 | 0% |
| Defense Evasion | T1070.001 | 0% |
| Command & Control | T1071.001 | 0% |

---

## Priority Detection Gaps

| Priority | Technique | Why Priority | Detection Approach |
|---|---|---|---|
| **P1** | T1557 (AiTM) | Pivotal technique — would have caught attack 12h before exfil | Impossible-travel + ASN anomaly on VPN auth |
| **P1** | T1003.006 (DCSync) | Domain-level compromise indicator; near-zero false positives | EID 4662 + replication GUIDs from non-DC |
| **P1** | T1059.001 (Office→PS) | Macro execution detection; stops attack at step 2 | ParentImage Office + child PowerShell/cmd |
| **P1** | T1003.001 (LSASS dump) | comsvcs.dll method is highly specific | rundll32 + comsvcs.dll + MiniDump keyword |
| **P2** | T1070.001 (log clear) | Defense evasion; indicates active attacker | wevtutil cl Security/System/Application |
| **P2** | T1041 (large exfil) | 2.4 GB outbound should have triggered size threshold | Outbound byte threshold > 500MB per session |
