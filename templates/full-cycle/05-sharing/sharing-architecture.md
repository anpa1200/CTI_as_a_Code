# Intelligence Sharing Architecture

**Program:** [project.yml → project.id]  
**Classification:** [project.yml → classification]

---

## Sharing Principles

1. **TLP governs distribution** — no sharing above TLP designation without explicit approval.
2. **Need-to-know** — share what the recipient needs to take action, not everything we know.
3. **Timeliness** — intelligence shared after the window of action has passed is noise.
4. **Attribution protection** — sanitize source details before sharing to protect methods.
5. **Reciprocity** — sharing relationships must be bidirectional to remain sustainable.

---

## Sharing Matrix

| Partner | Type | TLP Level | What We Share | What We Receive | Frequency | MOU Status |
|---|---|---|---|---|---|---|
| CERT-IL | Gov CERT | TLP:AMBER | IOCs, incident summaries | Advisories, classified briefs | On-demand + weekly | MOU required |
| [Sector ISAC] | Community | TLP:GREEN | Sanitized IOCs, TTPs | Sector threat digest | Weekly | Membership |
| [Peer Org 1] | Bilateral | TLP:AMBER | Incident IOCs, TTP analysis | Incident IOCs | On-demand | Bilateral MOU |

---

## Sanitization Process

Before sharing externally, remove:
- Internal system names, IP addresses, usernames
- Information that could identify the victim organization (if sharing anonymously)
- Source details that could reveal collection methods
- Any data classified above the TLP level of the sharing relationship

**Sanitization checklist**: See `05-sharing/mou-templates/` for partner-specific guidance.

---

## TLP Reference

| Level | Can be shared with |
|---|---|
| TLP:RED | Named recipients only — not for further distribution |
| TLP:AMBER | Organization + clients on need-to-know |
| TLP:AMBER+STRICT | Organization only — do not share outside |
| TLP:GREEN | Community (sector, ISAC, trusted partners) |
| TLP:WHITE | Unrestricted public sharing |

---

## Sharing Platform

| Platform | Partners | Protocol | Automation |
|---|---|---|---|
| MISP instance | CERT-IL, peers | MISP sync | Automatic for TLP:GREEN events |
| Email (encrypted) | CERT-IL, bilateral | PGP | Manual |
| Sector portal | ISAC | Portal upload | Manual |

---

## Sharing Performance Metrics

| Quarter | Products Shared | Products Received | Partners Active | Reciprocity Rate |
|---|---|---|---|---|
| | | | | |
