# Crown Jewels Register

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]

Crown jewels = assets whose compromise would cause the greatest harm to the organization.  
This register drives threat modeling — every scenario must reference at least one crown jewel.

---

## Crown Jewels Inventory

| ID | Asset | Description | Owner | Criticality | Why Critical |
|---|---|---|---|---|---|
| CJ-001 | | | | Critical | |
| CJ-002 | | | | Critical | |
| CJ-003 | | | | High | |

**Criticality levels:**  
- **Critical**: Compromise causes existential harm (regulatory, financial, safety, national security)  
- **High**: Significant operational disruption or reputational damage  
- **Medium**: Material business impact but recoverable

---

## Threat Alignment

For each crown jewel, which threat scenarios target it?

| Crown Jewel | Threat Scenario | TTP Most Likely Used | Current Detection | Gap? |
|---|---|---|---|---|
| CJ-001 | SCN-001 | | | Yes / No |

---

## Access Control Assessment

| Crown Jewel | Who Has Legitimate Access | External Access Path | MFA Required | Last Access Review |
|---|---|---|---|---|
| CJ-001 | | | Yes/No | YYYY-MM-DD |

---

## Crown Jewel Exposure Scoring

> Score each crown jewel: how exposed is it to the assessed threat actor's TTPs?

| Crown Jewel | Exposure Score (1-5) | Primary Exposure Vector | Recommended Control |
|---|---|---|---|
| CJ-001 | | | |

*Score: 5 = highly exposed (known TTPs directly applicable, weak controls); 1 = low exposure (indirect targeting, strong controls)*
