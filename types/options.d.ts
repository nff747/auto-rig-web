/**
 * Detailed configuration options for Auto Rig Web
 */

export interface ExecutionOptions {
  /** Maximum allowable processing time before circuit break in milliseconds */
  timeoutMs?: number;
  /** Thread affinity or worker concurrency multiplier */
  concurrency?: number;
  /** Enforce strict buffer alignment verification on ingestion */
  validateBounds?: boolean;
  /** Memory pool pre-warming size in bytes */
  slabCapacityBytes?: number;
}
