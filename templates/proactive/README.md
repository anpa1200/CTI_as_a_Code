# Proactive Intelligence Template

Use this template for: **threat anticipation, pre-incident threat modeling, detection improvement driven by external threat intelligence, crown jewel analysis.**

Corresponding assignments: A02 (CelltronX Telecom), A06 (NDSA GovID 2.0 Pre-Launch)

---

## Folder Structure

```
proactive/
├── project.yml                        # Project metadata, PIRs, triggers, status
├── 00-scope/
│   └── scope.md                       # Scope, organization profile, constraints
├── 01-trigger-intelligence/
│   ├── trigger-assessment.md          # Consolidated trigger evaluation and relevance
│   └── triggers/                      # Individual trigger files (TRG-001.md, etc.)
│       └── TRG-000-template.md        # Template for new triggers
├── 02-crown-jewels/
│   └── crown-jewels.md                # Critical asset register with threat alignment
├── 03-threat-model/
│   ├── scenarios/
│   │   └── threat-scenarios.md        # Threat scenario narratives
│   └── trust-boundaries/
│       └── trust-boundaries.md        # Network/system trust boundary analysis
├── 04-detection-backlog/
│   ├── detection-backlog.md           # Prioritized detection development backlog
│   ├── sigma/                         # New Sigma rule files
│   └── blocked-items/
│       └── blocked-detections.md      # Detections blocked by infrastructure gaps
├── 05-roadmap/
│   └── roadmap.md                     # 30/60/90-day capability improvement roadmap
├── 06-immediate-actions/
│   └── 72h-plan.md                    # 72-hour action plan for immediate risk reduction
├── 07-deliverables/
│   ├── technical-brief.md             # Technical brief for security team
│   └── executive-brief.md             # Executive summary for leadership
├── 08-ai-outputs/
│   └── README.md                      # AI-assisted drafts (review required)
└── 09-feedback/
    └── feedback.md                    # Post-delivery lessons learned
```

---

## Execution Order

1. **00-scope** — Profile the organization; understand what needs protecting and why.
2. **01-trigger-intelligence** — Assess each trigger; score relevance to this organization.
3. **02-crown-jewels** — Map critical assets and align them to threat targeting patterns.
4. **03-threat-model** — Build scenarios. Map trust boundaries. Identify likely attack paths.
5. **04-detection-backlog** — Identify detection gaps for each threat scenario. Prioritize by risk.
6. **05-roadmap** — Build capability improvement roadmap; be realistic about blockers.
7. **06-immediate-actions** — What can be done in 72 hours to reduce risk right now?
8. **07-deliverables** — Produce technical brief and executive brief.
9. **09-feedback** — Review after briefing: what drove the best decisions?

---

## Key Principle: Trigger-Driven Analysis

Proactive work must be grounded in specific trigger intelligence — not generic threats.  
Every threat scenario should trace back to at least one trigger.  
Every detection backlog item should trace back to a threat scenario.

**Trigger quality matters**: Use Admiralty Scale to assess source and information reliability.  
Reject or heavily caveat triggers rated below C/3 unless corroborated.
