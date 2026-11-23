/**
 * Operational telemetry and hardware counters for Auto Rig Web
 */

export interface HardwareMetrics {
  readonly cyclesElapsed: bigint;
  readonly instructionsRetired: bigint;
  readonly l1DataMisses: number;
  readonly branchMispredictions: number;
}

export interface ThroughputSummary {
  readonly operationsPerSecond: number;
  readonly peakMemoryUsedBytes: number;
  readonly steadyStateDriftBytes: number;
}
