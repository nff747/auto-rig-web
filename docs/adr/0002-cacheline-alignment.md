# ADR 0002: L1 Cacheline Boundary Alignment
**Status:** Accepted  
**Deciders:** `nff747`  
**Date:** 2026-11-23  

## Context
Concurrent multi-threaded execution on asymmetric CPU/GPU memory architectures suffers severe cache invalidation penalties when distinct thread states share the same 64-byte cache line (false sharing).

## Decision
Every atomic counter, buffer ring descriptor, and thread-local state struct in `auto-rig-web` must be aligned and padded to 64-byte boundaries.

## Consequences
- Eliminates false sharing stalls across independent hardware execution pipelines.
