# Evidence Inventory

**Project:** [project.yml → project.id]  
**Last updated:** YYYY-MM-DD

---

## Chain of Custody

All evidence must be inventoried here before analysis begins. Raw artifacts go into `raw/` unmodified.  
Normalized/enriched versions go into `processed/`. Never modify raw artifacts.

| ID | Filename | Type | Source | Date Acquired | Hash (SHA-256) | Analyst | Notes |
|---|---|---|---|---|---|---|---|
| EV-001 | | SIEM export | | | | | |
| EV-002 | | Network capture | | | | | |
| EV-003 | | Memory dump | | | | | |
| EV-004 | | Email artifact | | | | | |

---

## Evidence Types Reference

| Type | Typical Formats | Tool for Processing |
|---|---|---|
| Sysmon logs | JSONL (ECS), EVTX | Hayabusa, Elastic, Chainsaw |
| Windows Security events | JSONL (ECS), EVTX | Chainsaw, Hayabusa |
| Network captures | PCAP, NetFlow JSON | Wireshark, Zeek, NetworkMiner |
| DNS logs | JSONL, text | Elastic, grep |
| Email artifacts | .eml, .msg | mha, email-analyzer |
| Memory dumps | .dmp, .raw | Volatility3 |
| Disk images | .E01, .vmdk | Autopsy, FTK Imager |
| SIEM alerts | JSONL | Elastic SIEM |

---

## Evidence Gaps

Document known evidence that was NOT collected and why — this is critical for scoping analytical confidence.

| Expected Evidence | Why Not Available | Impact on Analysis |
|---|---|---|
| | | |
