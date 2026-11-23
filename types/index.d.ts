/**
 * Type declarations for Auto Rig Web
 * Author: nff747 <nff747@users.noreply.github.com>
 * License: Apache-2.0
 */

export interface EngineConfig {
  readonly arenaSize?: number;
  readonly zeroCopy?: boolean;
  readonly strictMode?: boolean;
  readonly deviceId?: string;
}

export interface ExecutionResult<T = unknown> {
  readonly ok: boolean;
  readonly payload: T;
  readonly latencyMs: number;
  readonly allocations: number;
}

export declare class EngineContext {
  constructor(config?: EngineConfig);
  initialize(): Promise<void>;
  process(buffer: Uint8Array): ExecutionResult<Uint8Array>;
  dispose(): void;
}
