# Analytical Claims Ledger — PROJ-2025-005

**Classification:** TLP:AMBER

---

### CLM-001: 340,218 biometric identity records were exfiltrated from VRID-SRV-01 to 203.0.113.201 via BITS over ~78 minutes on 17 March 2025.
- **Confidence**: High
- **Supporting evidence**: EV-003 (DB audit: full-table SELECT at 02:47, 340,218 rows), EV-004 (NetFlow: 8 HTTPS sessions, ~413 MB, 04:15–05:33 IST, to 203.0.113.201:443)
- **Reasoning**: DB audit confirms query and record count; NetFlow confirms exfil volume and destination independently of Winlogbeat logs (unaffected by log gap)
- **PIR addressed**: PIR-002

### CLM-002: The attacker gained access via AiTM compromise of contractor Halevi's personal Gmail, extracting VPN credentials and TOTP seed from HavayaIT M365 mailbox during a 5-day preparation window.
- **Confidence**: High (for mechanism); Medium (for 5-day prep — M365 logs not yet available)
- **Supporting evidence**: EV-001 (VPN session from Turkish residential VPN exit), EV-006 (Halevi interview: confirmed AiTM on personal Gmail; TOTP seed was in email)
- **Reasoning**: VPN source IP (203.0.113.115) from Turkish residential VPN is inconsistent with legitimate contractor usage; TOTP was active, meaning session token replay is the only mechanism consistent with bypass; Halevi confirmed phishing in interview
- **PIR addressed**: PIR-001

### CLM-003: The attacker used unrevoked 8-month-old maintenance permissions (SVC-HAVAYAIT-MAINT) to access VRID-SRV-01 — no new privilege escalation was required.
- **Confidence**: High
- **Supporting evidence**: EV-002 (RDP logon type 10 to VRID-SRV-01 using a.halevi credentials), EV-003 (DB query executed via SVC-HAVAYAIT-MAINT — a service account with residual VRID read permissions)
- **Reasoning**: Access to VRID-SRV-01 via a.halevi's RDP permissions and via SVC-HAVAYAIT-MAINT service account were both from a project completed 8 months earlier; access was never revoked per offboarding checklist
- **PIR addressed**: PIR-001

### CLM-004: All 3 detection rules covering this attack chain failed — 0/13 techniques detected — due to configuration bugs and deployment scope exclusions.
- **Confidence**: High
- **Supporting evidence**: All EV-001 through EV-004; absence of SIEM alerts in SOC ticket history; GOV-DET-001 had 12-hour quiet-period bug; GOV-DET-002 excluded VRID-SRV-01 from scope; GOV-DET-005 was on VRID-LAB-01 not VRID-SRV-01
- **PIR addressed**: PIR-003

### CLM-005: The INCD-CID 8-hour notification obligation (Article 7(3)(a)) was met by 7 minutes; the Biometric Database Law Section 18(b) notification was filed with dual authorization.
- **Confidence**: High
- **Supporting evidence**: EV-005 (INCD-CID notification filed 23:38 IST; deadline was 23:45 IST), EV-006 (BDA notification with DG + CISO dual authorization)
- **PIR addressed**: PIR-002
