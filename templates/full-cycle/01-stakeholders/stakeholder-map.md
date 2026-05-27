# Stakeholder Map

**Program:** [project.yml → project.id]  
**Last updated:** YYYY-MM-DD

---

## Primary Consumers

| Name | Role | Primary Intelligence Need | Preferred Format | Delivery Cadence | Feedback Channel |
|---|---|---|---|---|---|
| | CISO | Strategic threat picture | Executive brief | Quarterly | 1:1 meeting |
| | SOC Lead | TTP-level detection intel | Technical brief + Sigma | Weekly / On-demand | Slack / JIRA |
| | IR Lead | Incident-specific support | SOC flash / handoff | On-demand | Incident ticket |
| | Compliance Officer | Regulatory obligations intel | Compliance brief | Quarterly | Email |

---

## Secondary Consumers / Collaborators

| Name | Role | Engagement Type |
|---|---|---|
| | Network / Infra team | Detection rule deployment |
| | Development | Secure coding guidance |
| | Vendor / Procurement | Third-party risk |

---

## External Partners

| Organization | Type | Sharing Level | MOU Status | Contact |
|---|---|---|---|---|
| CERT-IL | Government CERT | TLP:AMBER mutual | Signed / Pending | |
| [Sector ISAC] | Sector community | TLP:GREEN sector | Signed / Pending | |
| [Peer organization] | Industry peer | TLP:AMBER bilateral | Signed / Pending | |

---

## Intelligence Requirements by Stakeholder

### CISO
- What is the current threat level to our sector?
- Are there active campaigns targeting our technology stack?
- What is our detection coverage against the most likely threats?

### SOC Lead
- What new TTPs should we write rules for?
- What are the current IOCs to block / monitor?
- Which detection rules need tuning?

### IR Lead
- What actor is likely behind [incident]?
- What is the full attack chain we should hunt for?
- What evidence should we preserve?

### Compliance Officer
- Have we received any mandatory INCD notifications?
- Are we meeting MOU intelligence-sharing commitments?
- What incidents require regulatory notification?

---

## Stakeholder Satisfaction Tracking

| Consumer | Last Briefing | Satisfaction | Issues Raised |
|---|---|---|---|
| CISO | YYYY-MM-DD | 1-5 | |
| SOC Lead | YYYY-MM-DD | 1-5 | |

*Scale: 5 = intelligence directly actionable; 1 = not useful*
