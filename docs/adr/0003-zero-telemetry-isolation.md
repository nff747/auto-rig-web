# ADR 0003: Sovereign Zero-Telemetry Isolation
**Status:** Accepted  
**Deciders:** `nff747`  
**Date:** 2026-11-23  

## Context
Enterprise open-source consumers and air-gapped environments reject libraries that emit unsolicited network telemetry or require phone-home handshakes.

## Decision
`auto-rig-web` enforces a strict sovereign data isolation invariant. Zero telemetry, tracking, or network calls are initiated by default.
