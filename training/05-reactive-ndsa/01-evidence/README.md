# Evidence Inventory — PROJ-2025-005

**Classification:** TLP:AMBER  
**Last updated:** 2025-03-19

---

## Chain of Custody

| ID | Filename | Type | Source | Gap | Confidence |
|---|---|---|---|---|---|
| EV-001 | `raw/logs/elastic-contractor-vpn-sessions.jsonl` | VPN session logs | NDSA Elastic SIEM | None | High — 7 sessions captured |
| EV-002 | `raw/logs/elastic-jumphost-audit.jsonl` | Jump host audit log | NDSA Elastic SIEM | None | High — PAM recording backs this up |
| EV-003 | `raw/logs/elastic-vrid-query-log.jsonl` | VRID DB audit log | NDSA Elastic SIEM | None | High — DB audit independent of Winlogbeat |
| EV-004 | `raw/network/contractor-dmz-netflow.txt` | NetFlow | NDSA network monitoring | None | High — confirms 892.4 MB outbound |
| EV-005 | `raw/regulatory/incd-cid-notification-form.md` | INCD notification | NDSA Legal/CISO | N/A | Filed; Article 7(3)(a) met by 7 minutes |
| EV-006 | `raw/regulatory/bda-notification-form.md` | BDA notification | NDSA Legal/CISO | N/A | Filed; dual authorization obtained |
| EV-007 | PAM-20250317-0151-HALEVI-01 | PAM session recording | CyberArk PAM | None (4h 7min intact) | High — covers entire Winlogbeat gap window |
| EV-008 | HavayaIT M365 audit logs | M365 audit | HavayaIT (pending) | **NOT AVAILABLE** | None — legal request pending |

---

## Critical Evidence Gaps

| Gap | Cause | Impact |
|---|---|---|
| VRID-SRV-01 Winlogbeat 02:00–11:34 IST | Attacker log clear (wevtutil cl) at ~05:33 IST; agent auto-restarted 11:34 | Reduces confidence in full attack scope during gap window; PAM recording covers this window as substitute |
| HavayaIT M365 audit 12–17 March | Outside NDSA jurisdiction; legal request pending | Cannot reconstruct initial AiTM compromise phase; what actor read in mailbox (5-day window) is unknown |

**Gap impact statement**: *"The 9.5-hour VRID-SRV-01 Winlogbeat gap covers the log-clear and post-exfiltration window. The CyberArk PAM session recording (EV-007) is intact for the entire attacker dwell period and is the primary evidence source for events in this window. Without HavayaIT M365 logs, breach scope assessment for the 5-day reconnaissance phase remains incomplete — the attacker may have read contractor SOPs for ITA and MoI access during this window."*
