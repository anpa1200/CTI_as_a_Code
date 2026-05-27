# Source Registry — PROJ-2024-003 (TechPay CTI Program)

**Classification:** TLP:AMBER  
**Date:** 2024-10-15

---

## Internal Sources

| ID | Source | Description | PIRs | Admiralty S | Reliability | Status |
|---|---|---|---|---|---|---|
| INT-001 | TechPay Elastic SIEM | Firewall, VPN, Windows event logs, EDR telemetry | PIR-001, -002, -005 | A | 2 | Active — PayNext logs not yet integrated |
| INT-002 | DarkOwl dark web monitoring | Automated alerts for TechPay/PayNext brand terms, credential dumps | PIR-002, PIR-003, SIR-002 | B | 2 | Active (existing contract) |
| INT-003 | CyberShield Ltd. pentest reports | Quarterly pentest findings; PayNext infrastructure included | PIR-002 | B | 1 | Active (quarterly cadence only) |
| INT-004 | HR access records (Ben-David transition) | Access inventory for PIR-003; restricted distribution | PIR-003 | A | 1 | Active — restricted to CISO + Legal |

---

## External — Government Sources

| ID | Source | Description | PIRs | Admiralty S | Reliability | Status |
|---|---|---|---|---|---|---|
| EXT-001 | CERT-IL FinCERT MISP | Israeli financial sector threat sharing; sector-specific bulletins; TLP:AMBER TAXII feed | PIR-001, -005, SIR-001 | A | 1 | **Blocked** — MOU lapsed 9 months; renewal initiated |
| EXT-002 | CERT-IL public advisories | Public-facing bulletins; subset of FinCERT content | PIR-001, SIR-003 | A | 2 | Active |
| EXT-003 | Bank of Israel publications | Circular directives; BoI-CD 362 updates; supervisory expectations | PIR-004 | A | 1 | Active (free; public) |

---

## External — Commercial Sources

| ID | Source | Description | PIRs | Admiralty S | Cost | Status |
|---|---|---|---|---|---|---|
| EXT-004 | ClearSky Cyber Security reports | Israeli threat actor research; freely published reports | PIR-001, -005 | B | Free | Active (manual review; no API) |
| EXT-005 | Check Point Research | Israeli and regional threat reports | PIR-001 | B | Free | Active (manual review) |
| EXT-006 | Commercial platform (Recorded Future / equivalent) | Israeli financial sector actor tracking; domain/IP monitoring; API integration | PIR-001, -003, -005, SIR-004 | B | ₪180K/year | **Not procured — Q1 2025 target** |
| EXT-007 | Brand protection service | Automated lookalike domain alerts for TechPay/PayNext brands | SIR-004 | B | ₪60K/year | **Not procured — Q2 2025 target** |

---

## External — OSINT / Open Sources

| ID | Source | Description | PIRs | Admiralty S | Status |
|---|---|---|---|---|---|
| OSINT-001 | NVD (National Vulnerability Database) | CVE tracking for TechPay/PayNext technology stack | SIR-003 | A | Active |
| OSINT-002 | VirusTotal | IOC enrichment; passive DNS; file hash lookup | SIR-001, SIR-002 | B | Active (free tier) |
| OSINT-003 | Shodan | Internet-exposed infrastructure monitoring for TechPay/PayNext | PIR-002 | B | Active (free tier; limited) |

---

## Source Health

| Last Successful Ingest | Source | Gap Duration |
|---|---|---|
| Never | EXT-001 (CERT-IL FinCERT MISP) | **9 months** — MOU lapsed |
| 2024-10-15 | INT-001 (Elastic SIEM) | None — active |
| 2024-10-15 | INT-002 (DarkOwl) | None — active |
| 2024-09-30 | INT-003 (CyberShield) | 15 days — next pentest Q4 2024 |
| Never | INT-004 (PayNext SIEM) | 8-week integration window — not yet connected |
