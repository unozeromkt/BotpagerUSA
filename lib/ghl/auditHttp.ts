import "server-only";

export type AuditGhlConfig = { token: string; locationId: string; pipelineId: string; stageId: string; assignedUserId?: string };
export type GhlRuntime = { fetch: typeof fetch; sleep: (ms: number) => Promise<void>; now: () => number };
export const defaultGhlRuntime: GhlRuntime = {
  fetch: (...args) => fetch(...args), sleep: ms => new Promise(resolve => setTimeout(resolve, ms)), now: Date.now,
};

export function getAuditGhlConfig(): AuditGhlConfig {
  const token = (process.env.GHL_PRIVATE_TOKEN || process.env.GHL_PRIVATE_INTEGRATION_TOKEN)?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  const pipelineId = process.env.GHL_AUDIT_PIPELINE_ID?.trim();
  const stageId = process.env.GHL_AUDIT_STAGE_ID?.trim();
  if (!token || !locationId || !pipelineId || !stageId) throw new AuditGhlError("configuration", 0, undefined, "MISSING_CONFIG");
  return { token, locationId, pipelineId, stageId, assignedUserId: process.env.GHL_ASSIGNED_USER_ID?.trim() || undefined };
}

export class AuditGhlError extends Error {
  constructor(public operation: string, public status: number, public traceId?: string, public code?: string, public retryAfterMs = 0) {
    super("Roofing CRM sync could not complete.");
  }
}

function safeIdentifier(value: unknown) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(value) ? value : undefined;
}

export function retryAfterMs(header: string | null, now: number) {
  if (!header) return 0;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const date = Date.parse(header);
  return Number.isFinite(date) ? Math.max(0, date - now) : 0;
}

export function isRetryable(error: unknown): error is AuditGhlError {
  return error instanceof AuditGhlError && (error.status === 429 || error.status >= 500 || error.code === "NETWORK_ERROR");
}

export async function retryDelay(error: AuditGhlError, attempt: number, deadline: number, runtime: GhlRuntime) {
  const delay = Math.max(1000 * 2 ** attempt, error.retryAfterMs);
  // A long Retry-After is deferred for replay rather than retried early or killed by Vercel.
  if (runtime.now() + delay + 10_000 >= deadline) throw new AuditGhlError(error.operation, error.status, error.traceId, "RETRY_DEFERRED");
  await runtime.sleep(delay);
}

export async function auditGhlRequest<T>(config: AuditGhlConfig, path: string, init: RequestInit, operation: string,
  runtime = defaultGhlRuntime, deadline = runtime.now() + 240_000, retries = 3, version: "2021-07-28" | "v3" = "2021-07-28"): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    if (runtime.now() >= deadline) throw new AuditGhlError(operation, 0, undefined, "SYNC_DEADLINE");
    let failure: AuditGhlError;
    try {
      const response = await runtime.fetch(`https://services.leadconnectorhq.com${path}`, {
        ...init, headers: {
          Authorization: `Bearer ${config.token}`, Version: version,
          "Content-Type": "application/json", Accept: "application/json",
        }, cache: "no-store", signal: AbortSignal.timeout(Math.max(1, Math.min(10_000, deadline - runtime.now()))),
      });
      const payload = await response.json().catch(() => null);
      if (response.ok) return payload as T;
      failure = new AuditGhlError(operation, response.status, safeIdentifier(payload?.traceId), safeIdentifier(payload?.code),
        response.status === 429 ? retryAfterMs(response.headers.get("retry-after"), runtime.now()) : 0);
    } catch {
      failure = new AuditGhlError(operation, 0, undefined, "NETWORK_ERROR");
    }
    if (!isRetryable(failure) || attempt >= retries) throw failure;
    await retryDelay(failure, attempt, deadline, runtime);
  }
}
