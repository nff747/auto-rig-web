/**
 * Error enumerations and diagnostic definitions for Auto Rig Web
 */

export enum EngineErrorCode {
  OK = 0,
  ERR_INITIALIZATION_FAILED = 100,
  ERR_BUFFER_OVERFLOW = 101,
  ERR_INVALID_ALIGNMENT = 102,
  ERR_DEVICE_TIMEOUT = 103,
  ERR_INVARIANT_BREACH = 104
}

export interface DiagnosticSnapshot {
  readonly code: EngineErrorCode;
  readonly state: string;
  readonly uptimeSec: number;
}
