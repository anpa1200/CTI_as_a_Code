# Threat Scenarios

**Project:** [project.yml → project.id]  
**Classification:** [project.yml → classification]

Each scenario describes a realistic attack path from the assessed threat actor to a crown jewel.  
Scenarios must be grounded in trigger intelligence — not hypothetical.

---

## Scenario Format

```
### SCN-XXX: [Attack scenario name]
**Trigger basis**: TRG-XXX
**Crown jewel targeted**: CJ-XXX
**Likelihood**: High / Medium / Low
**Impact**: Critical / High / Medium
**Risk (Likelihood × Impact)**: High / Medium / Low

**Attack narrative**:
[3-5 sentence description of how the attack would unfold — initial access → execution → objective]

**ATT&CK techniques**:
| Phase | Technique ID | Name |
|---|---|---|
| Initial Access | | |
| Execution | | |

**Current detection coverage**:
| Technique | Rule | Status |
|---|---|---|
| | | PASS / PARTIAL / FAIL / NONE |

**Control gaps identified**:
1. 
2. 
```

---

## Scenarios

### SCN-001: [Name]
**Trigger basis**: TRG-001  
**Crown jewel targeted**: CJ-001  
**Likelihood**: High  
**Impact**: Critical  
**Risk**: High

**Attack narrative**:
[FILL IN]

**ATT&CK techniques**:
| Phase | Technique ID | Name |
|---|---|---|
| | | |

**Current detection coverage**:
| Technique | Rule | Status |
|---|---|---|
| | | |

**Control gaps identified**:
1. 
2. 

---

### SCN-002: [Name]
**Trigger basis**: TRG-002  
**Crown jewel targeted**: CJ-002  
**Likelihood**: Medium  
**Impact**: Critical  
**Risk**: High

**Attack narrative**:
[FILL IN]

**ATT&CK techniques**:
| Phase | Technique ID | Name |
|---|---|---|
| | | |

**Current detection coverage**:
| Technique | Rule | Status |
|---|---|---|
| | | |

**Control gaps identified**:
1. 
2. 

---

## Risk Summary Matrix

| Scenario | Crown Jewel | Likelihood | Impact | Risk | Priority |
|---|---|---|---|---|---|
| SCN-001 | | High | Critical | **High** | P1 |
| SCN-002 | | Medium | Critical | **High** | P1 |
