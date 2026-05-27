# Detection Development Backlog

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]

---

## Backlog

Priority: P1 = critical gap aligned to active threat; P2 = important gap; P3 = nice to have.  
Status: Backlog | In Development | Testing | Production | Blocked

| ID | Detection Name | Technique | Scenario | Priority | Effort | Status | Owner | Notes |
|---|---|---|---|---|---|---|---|---|
| DET-001 | | T1XXX | SCN-001 | P1 | Low/Med/High | Backlog | | |
| DET-002 | | | | P1 | | Blocked | | See `blocked-items/` |
| DET-003 | | | | P2 | | Backlog | | |

---

## Backlog Scoring Criteria

**Priority P1** — All of:
- Technique is used by assessed threat actor (trigger-confirmed)
- Technique targets a crown jewel
- No existing detection coverage

**Priority P2** — Any of:
- Technique is used by assessed threat actor but does not directly target crown jewel
- Partial coverage exists but rule has known gaps
- High-confidence false positive rate degrading SOC response

**Priority P3** — Detection improvement, hygiene, or nice-to-have coverage

---

## Sprint Planning

### Current Sprint
**Goal**: Deliver P1 detections for [scenario]  
**Capacity**: X rule-writing days  
**Committed**:
- DET-001
- DET-002

### Next Sprint (Planned)
- DET-003
- DET-004

---

## Delivered to Production

| ID | Rule File | Technique | Date Deployed | Emulation Result |
|---|---|---|---|---|
| | `04-detection-backlog/sigma/` | | | PASS / PARTIAL / FAIL |
