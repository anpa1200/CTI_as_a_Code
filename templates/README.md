# CTI as Code — Project Templates

Three blank project scaffolds — one per methodology type.  
Copy the matching template folder to start a new investigation or program.

```
cp -r templates/reactive/  my-investigation-name/
cp -r templates/proactive/  my-threat-assessment-name/
cp -r templates/full-cycle/ my-cti-program-name/
```

---

## Template Overview

| Template | Use For | Assignments | Key Folders |
|---|---|---|---|
| [reactive/](reactive/) | Incident response support, breach analysis, IOC triage | A01, A05 | 00-scope → 01-evidence → 03-analysis → 04-detections → 05-deliverables |
| [proactive/](proactive/) | Threat anticipation, detection improvement, crown jewel analysis | A02, A06 | 01-trigger-intelligence → 02-crown-jewels → 03-threat-model → 04-detection-backlog |
| [full-cycle/](full-cycle/) | CTI program design, PIR frameworks, sharing architecture, governance | A03, A07 | 02-pirs → 03-collection-plan → 04-analysis → 05-sharing → 06-governance |

> Adversary emulation (A04, A08) uses the adversary-emulation template in `training/templates/`.

---

## Quick Start

### Step 1: Copy the right template

Match your assignment type:

| Assignment | Template |
|---|---|
| A01 — LifeTech Pharma breach | reactive/ |
| A02 — CelltronX threat assessment | proactive/ |
| A03 — TechPay CTI program | full-cycle/ |
| A04 — TechPay adversary emulation | `training/templates/template-adversary-emulation.md` |
| A05 — NDSA contractor breach | reactive/ |
| A06 — NDSA GovID 2.0 pre-launch | proactive/ |
| A07 — NDSA formal CTI program | full-cycle/ |
| A08 — NDSA adversary emulation | `training/templates/template-adversary-emulation.md` |

### Step 2: Fill in project.yml

Update the metadata: project ID, analyst name, PIRs, scope, classification.  
This file drives your README header and delivery checklist.

### Step 3: Follow the execution order

Each template's README.md defines the correct execution order.  
Do not skip to deliverables — the analysis must precede the product.

### Step 4: Commit as you go

CTI as Code principle: every analytical decision is traceable in version history.  
Commit after each folder is completed (e.g., `git commit -m "PROJ-001: timeline complete"`).

---

## Files Included in Each Template

| File | Purpose |
|---|---|
| `project.yml` | Project metadata, PIRs, status tracking |
| `README.md` | Folder structure, execution order, principles |
| `00-scope/scope.md` | Scope definition and PIR alignment |
| `*-analysis/claims-ledger.md` | Evidence-backed analytical claims |
| `*-analysis/attck-mapping.md` | ATT&CK technique coverage |
| `*-deliverables/executive-brief.md` | Non-technical leadership summary |
| `*-ai-outputs/README.md` | AI-assisted draft policy |
| `*-feedback/feedback.md` | Post-delivery lessons learned |
