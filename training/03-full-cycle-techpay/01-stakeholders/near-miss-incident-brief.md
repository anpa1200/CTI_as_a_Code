# TechPay Internal Incident Brief — Near-Miss: API Gateway Credential Stuffing
**Classification:** TechPay Internal — Restricted  
**Date:** 2024-08-29  
**Incident Reference:** INC-2024-0831  
**Prepared by:** SOC Team (Tier 2)  
**Status:** Closed — no confirmed breach, monitoring ongoing

---

## What Happened

On **27 August 2024 at 02:14 UTC**, the API Gateway (Kong Enterprise) started receiving
an elevated volume of authentication requests against the `/api/v2/merchant/auth` endpoint.

**Volume:** 18,400 authentication attempts in 47 minutes from 312 distinct source IPs.  
**Pattern:** Credential stuffing — structured pairs of merchant IDs and API keys,
submitted in sequential order consistent with a credential list, not random probing.  
**Source:** Distributed across 312 IPs in 14 countries. TOR exit nodes confirmed: 47/312.
Remaining IPs traced to residential proxy networks (residential proxy provider: IPRoyal).

**Detection:** Imperva WAF rate-limiting triggered on the `/api/v2/merchant/auth` endpoint
after 3,200 requests (threshold: 100 req/min sustained for 2 min). Alert paged SOC Tier 1
at 02:16 UTC. Tier 1 escalated at 02:31 UTC. Tier 2 confirmed credential stuffing at 02:44 UTC.

---

## What Was at Risk

- **Kong Enterprise API Gateway** — serves all 350 corporate clients' payment API integrations
- **Merchant credentials** being tested: API key + Merchant ID pairs
- **If successful:** attacker could authenticate as a legitimate merchant and access
  transaction data, initiate refund requests, or exfiltrate card tokens from the tokenization vault

---

## Did Anything Get In?

**8 successful authentication events** were logged during the stuffing window.
All 8 were immediately followed by an API call to `/api/v2/transaction/list?days=30`.
All 8 were for the same merchant (Merchant ID: M-2044-PRO — a mid-size Israeli retailer).

**Merchant M-2044-PRO was immediately notified.**  
The merchant confirmed their API credentials had been stored in a Notion workspace that
was publicly accessible (misconfiguration). Credentials rotated within 2 hours.

**Transaction data potentially exposed:** 1,840 transaction records from M-2044-PRO
over 30 days. No card numbers (tokenized). PAN not stored in API response.  
**Estimated breach scope:** Merchant transaction metadata (amounts, timestamps, merchant ref IDs).  
No evidence that adversary progressed beyond transaction list retrieval.

---

## Why This is a "Near-Miss"

- The WAF rate-limiting prevented >99.9% of the attempts
- The 8 successful auths targeted a single merchant whose API key was already leaked externally
- No card data was exposed (tokenization worked as designed)
- No lateral movement from API gateway was detected

**However:**
- Detection took 30 minutes from first anomalous request to SOC alert
- The 8 successful auths represent a real breach of a client API context
- The 4-hour Bank of Israel notification clock started at 02:14 UTC
- TechPay notified BoI at 05:58 UTC — within the 4-hour window, but only by 28 minutes
- No CTI function was engaged — the SOC had no prior intelligence that a credential list
  for payment API gateways was circulating (such lists are common on dark web markets)

---

## Open Questions for CTI Program (why this is relevant to your assignment)

1. Where did the credential list come from? Was it a broader Israeli payment sector leak?
2. Is M-2044-PRO the only affected merchant, or were other API keys in that same Notion workspace?
3. Is this actor operating against other Israeli payment processors (peer incident sharing needed)?
4. CERT-IL FinCERT membership lapsed — we had no channel to ask.
5. No dark web monitoring coverage — we don't know if TechPay-specific credential lists are being sold.
