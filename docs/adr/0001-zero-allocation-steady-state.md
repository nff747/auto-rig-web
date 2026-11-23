# ADR 0001: Zero-Allocation Steady State Invariant
**Status:** Accepted  
**Deciders:** `nff747`  
**Date:** 2026-11-23  

## Context
In high-frequency graphics and systems runtimes, dynamic heap allocation triggers non-deterministic garbage collection or allocator lock contention.

## Decision
All hot-loop processing in `auto-rig-web` must operate strictly within pre-warmed memory slabs. Zero `malloc` / GC allocations are permitted in steady state.

## Consequences
- Guaranteed consistent frame pacing and latency bounds.
- Memory consumption is predictable and bounded at boot time.
