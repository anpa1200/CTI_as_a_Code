# Analytical Claims Ledger — PROJ-2024-001

**Classification:** TLP:AMBER

---

### CLM-001: The attacker gained initial access via AiTM phishing against CFO m.cohen, capturing a valid M365/VPN session token and bypassing TOTP MFA.
- **Confidence**: High
- **Supporting evidence**: EV-06 (phishing email from `lifetechpharma-corp[.]eu`), EV-06 (VPN session from Istanbul residential VPN IP 185.220.100.77), INT-002 (VPN logs showing session token replay pattern — source country anomaly)
- **Reasoning**: Off-hours VPN logon from Turkish residential VPN exit node using p.levi credentials immediately after phishing campaign targeting CFO; TOTP was active on the account, ruling out password-only compromise; session token replay is the only mechanism consistent with the evidence
- **Alternative explanations considered**: Password spray — inconsistent with single user target and off-hours logon pattern; insider — inconsistent with Istanbul source IP
- **PIR addressed**: PIR-001

### CLM-002: Approximately 2.4 GB of R&D data (47 files from USPartner2024 licensing folder) was exfiltrated to 198.51.100.44 via HTTPS over 8 staged sessions.
- **Confidence**: High
- **Supporting evidence**: EV-03 (robocopy execution on SERVER-FIN-01), EV-08 (NetFlow: 8 HTTPS sessions, ~2.4 GB total, to 198.51.100.44:443, 23:18–02:47 IST)
- **Reasoning**: Robocopy staging immediately precedes exfiltration sessions; session count and total volume are consistent with staged multi-chunk exfiltration; destination IP matches C2 domain `uslifepartner-group[.]com`
- **Alternative explanations considered**: Scheduled backup — backup systems confirmed on different schedule and destination; no backup job logged for this window
- **PIR addressed**: PIR-002

### CLM-003: DCSync was performed against DC-01 using p.levi account, compromising all domain credentials including krbtgt.
- **Confidence**: High
- **Supporting evidence**: EV-04 (EID 4662 with GUIDs `1131f6aa` and `1131f6ab` from non-DC host, subject p.levi)
- **Reasoning**: EID 4662 with Replication-Get-Changes-All GUIDs is a near-zero false-positive indicator of DCSync; source was WS-IT-LEVI (not a domain controller); krbtgt targeted first based on unicodePwd attribute in subsequent 4662 events
- **Alternative explanations considered**: Azure AD Connect sync — no MSOL_ account involved; this was p.levi interactive session
- **PIR addressed**: PIR-002

### CLM-004: The attacker is assessed with medium confidence as an Iranian-nexus state-affiliated actor motivated by IP theft and disruption of a $52M US pharmaceutical licensing deal.
- **Confidence**: Medium (Admiralty B/3)
- **Supporting evidence**: EXT-003 (ClearSky 2023-2024: Iranian-nexus AiTM against Israeli pharma), EV-07/EV-08 (targeting pattern: licensing deal documentation, USPartner2024 folder specifically)
- **Reasoning**: AiTM phishing targeting Israeli pharma with active US licensing partnerships is consistent with documented Iranian-nexus commercial espionage; targeted exfiltration of partnership documents vs. mass data extraction suggests strategic intelligence objective
- **Alternative explanations considered**: Financially motivated actor — no ransom demand, no extortion; pure exfiltration suggests espionage. Other nation-state — Chinese/Russian APTs also target pharma but Israeli-US pharma partnerships are a specifically documented Iranian-nexus priority.
- **PIR addressed**: PIR-003

### CLM-005: Zero of 12 confirmed TTPs had a working detection rule that fired during the incident; 52 hours elapsed between first attacker action and detection.
- **Confidence**: High
- **Supporting evidence**: All EV-001 through EV-008; SOC ticket created 2024-11-15 10:47 via log gap observation — not via alert
- **Reasoning**: No SIEM alerts generated during the incident; detection occurred via SOC analyst manually noticing a log gap — not a rule-based detection. ATT&CK mapping confirms 0/12 coverage.
- **Alternative explanations considered**: None — absence of alerts is directly confirmed by SOC ticket history
- **PIR addressed**: PIR-004
