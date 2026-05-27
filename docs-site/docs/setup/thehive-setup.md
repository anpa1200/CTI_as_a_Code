---
id: thehive-setup
title: TheHive Setup
sidebar_position: 3
---

# TheHive First-Run Setup

## Create organisation and admin

1. Open http://localhost:9100
2. TheHive will prompt for initial setup
3. Create an **Organisation** (e.g., `CTI-Lab`)
4. Create an **admin user** with a strong password
5. Log in

## Configure users and roles

Default roles in TheHive 5:

| Role | Capabilities |
|---|---|
| `admin` | Full access — manage org, users, config |
| `analyst` | Create/manage cases, tasks, observables |
| `readonly` | View only |

Create an analyst user for daily work — avoid using the admin account for case work.

## Create alert sources

Alerts feed into TheHive from external sources (SIEM, SOAR, manual import). Configure sources under:

**Organisation → Alert management → Webhooks**

For Elastic SIEM integration, you can use the Elastic SIEM alerting webhook to push alerts directly to TheHive.

## Custom fields (optional)

Add lab-specific fields to cases:

**Organisation → Custom Fields → Add field**

Useful fields for CTI work:
- `threat_actor` (string) — attributed group name
- `mitre_tactic` (string) — primary ATT&CK tactic
- `confidence_level` (integer, 0–100) — analyst confidence score
- `tlp_level` (list: WHITE/GREEN/AMBER/RED)

## Import TheHive templates

TheHive supports case templates (predefined structure for common incident types). Import them via:

**Organisation → Case Templates → Import**

Community templates are available at: https://github.com/TheHive-Project/TheHiveDocs

## API access

Generate an API key for scripted access:

**User menu (top right) → API Key → Create**

Test it:

```bash
curl -H "Authorization: Bearer <api-key>" \
  http://localhost:9100/api/v1/status
```
