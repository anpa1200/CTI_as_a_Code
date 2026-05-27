# BiometricTech IL Ltd. — Vendor Security Audit Finding
**TLP: AMBER — NDSA Internal**  
**Source:** NDSA Vendor Security Assessment Program (VSAP-2025-007)  
**Assessment Date:** 2025-06-08  
**Vendor:** BiometricTech IL Ltd. (biometric matching engine vendor for GovID 2.0)  
**Assessor:** NDSA Information Security team (Dror Nativ's office)

---

## Executive Summary

A scheduled vendor security assessment of BiometricTech IL Ltd. identified a **High-severity
credential exposure finding** with direct implications for the GovID 2.0 project.

This finding has NOT been disclosed to BiometricTech management yet. CISO Nativ has
directed that the CTI Lead assess the intelligence implications before BiometricTech is notified.

---

## Finding: API Credential Exposure in BiometricTech Development Repository

**Severity:** High  
**Finding ID:** VSAP-2025-007-001

During the assessment, the NDSA security team accessed BiometricTech's publicly accessible
GitHub repository (the vendor's public repository for SDK documentation) and identified:

**A hardcoded API token** in a committed test script:

```python
# test_integration.py (commit: a1b2c3d)
BIOMETRIC_ENGINE_API_KEY = "btil_prod_9f4e2a8c1b7d3e5f6a9c2b4d7e1a3f5c8b2d4e6f"
BIOMETRIC_ENGINE_API_ENDPOINT = "https://api.biometrictech-il.com/v2/match"
NDSA_GOVID_CLIENT_ID = "ndsa-govid2-prod-integration"
```

**This token was committed on 2025-04-17 and is still present in the repository.**

The token was tested against the BiometricTech production API endpoint:
- **Test result: Token is valid and active** (returned 200 OK with a mock biometric match response)
- The token is authenticated as `ndsa-govid2-prod-integration` (production client, not test)
- The token has read and write access to the biometric match API

---

## Risk Assessment

**If an adversary has discovered this token (assessed: HIGH probability — the repo is public):**

1. The adversary has valid API credentials to the BiometricTech biometric matching engine
2. The adversary can send arbitrary biometric match queries (could enable identity spoofing)
3. The adversary has authenticated access that would generate legitimate-looking API logs
4. Any future API calls from a compromised token would be indistinguishable from NDSA's
   legitimate integration calls

**Is this the token already being probed?** Unknown. BiometricTech API logs have not been
reviewed. NDSA does not have visibility into BiometricTech's API access logs.

---

## Immediate Decision Required (for CTI Lead Assessment)

**Option A:** Immediately notify BiometricTech and demand token rotation  
- Pro: Closes the exposure  
- Con: BiometricTech will know about the finding before we assess whether it has been exploited

**Option B:** First investigate whether the token has been used anomalously, then notify  
- Pro: Preserves forensic opportunity  
- Con: Every day the token remains valid is another day of potential adversary access

**CISO Nativ's question to CTI Lead:** "Does the combination of TRG-001, TRG-002, and
this finding mean we have an active intrusion? Or is this a precautionary exposure?
I need your intelligence assessment before I call BiometricTech."
