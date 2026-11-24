# Security Architecture & Data Isolation // AUTO-RIG-WEB
**Security Policy:** Sovereign Strict Attribution & Zero Telemetry  
**Author:** `Lunar Paradox <hello@lunarparadox.com>`  

---

## 1. Threat Model & Boundaries
`auto-rig-web` treats all external network and peripheral inputs as untrusted boundaries:
- **Zero-Server Isolation:** All cryptographic, shader, and parsing primitives operate strictly in local memory with zero unauthenticated egress sockets.
- **Memory Zeroization:** Sensitive cryptographic keys and decrypted plaintext scratch buffers are scrubbed via volatile byte clearing (`explicit_bzero` / cryptographic memory zeroing) upon scope exit.
- **Timing Attack Mitigation:** Core mathematical evaluations utilize constant-time branches to prevent side-channel power and timing analysis.

## 2. Vulnerability Reporting
Direct technical disclosures to `Lunar Paradox <hello@lunarparadox.com>`. GPG-signed reports receive priority triage.
