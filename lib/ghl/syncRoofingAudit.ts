import "server-only";

import { auditGhlRequest, AuditGhlError, defaultGhlRuntime, getAuditGhlConfig, isRetryable, retryDelay, type AuditGhlConfig, type GhlRuntime } from "./auditHttp";
import { buildRoofingContact, buildRoofingReportNote, roofingAuditTags, type RoofingSyncJob } from "./auditMapping";
import { logAuditReplay } from "./auditReplay";

type Opportunity = { id: string; contactId?: string; contact?: { id: string }; pipelineId: string; pipelineStageId?: string; status: string };
type SyncOptions = { runtime?: GhlRuntime; log?: (record: object) => void };

// Serialize simultaneous submissions for the same contact in this worker. GHL's
// per-contact/pipeline duplicate protection also covers separate server instances.
const activeContacts = new Map<string, Promise<unknown>>();
async function withContactLock<T>(key: string, run: () => Promise<T>): Promise<T> {
  const previous = activeContacts.get(key) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(run);
  activeContacts.set(key, current);
  try { return await current; } finally { if (activeContacts.get(key) === current) activeContacts.delete(key); }
}

async function ensureOpportunity(config: AuditGhlConfig, contactId: string, job: RoofingSyncJob, runtime: GhlRuntime, deadline: number) {
  const find = async () => {
    const query = new URLSearchParams({ locationId: config.locationId, pipelineId: config.pipelineId, contactId, status: "open", limit: "100" });
    // The camelCase search contract requires v3. The dated version returned 422
    // in the live integration test; all other endpoints retain 2021-07-28.
    const result = await auditGhlRequest<{ opportunities: Opportunity[] }>(config, `/opportunities/search?${query}`, { method: "GET" }, "find_opportunity", runtime, deadline, 3, "v3");
    if (!Array.isArray(result?.opportunities)) throw new AuditGhlError("find_opportunity", 0, undefined, "INVALID_RESPONSE");
    return result.opportunities.find(item => item.id && item.pipelineId === config.pipelineId &&
      (item.contactId ?? item.contact?.id) === contactId && item.status === "open");
  };
  for (let attempt = 0; ; attempt++) {
    // Reconcile again before retrying a create whose response may have been lost.
    const existing = await find();
    if (existing) return { id: existing.id, created: false };
    try {
      const result = await auditGhlRequest<{ opportunity: Opportunity }>(config, "/opportunities/", {
        method: "POST", body: JSON.stringify({
          locationId: config.locationId, pipelineId: config.pipelineId, pipelineStageId: config.stageId,
          name: `${job.submission.contact.businessName} - Auditoría Roofing`, status: "open", contactId,
          monetaryValue: 0, assignedTo: config.assignedUserId,
        }),
      }, "create_opportunity", runtime, deadline, 0);
      if (!result?.opportunity?.id) throw new AuditGhlError("create_opportunity", 0, undefined, "INVALID_RESPONSE");
      return { id: result.opportunity.id, created: true };
    } catch (error) {
      if (error instanceof AuditGhlError && (error.status === 400 || error.status === 409)) {
        const raced = await find();
        if (raced) return { id: raced.id, created: false };
      }
      if (!isRetryable(error) || attempt >= 3) throw error;
      await retryDelay(error, attempt, deadline, runtime);
    }
  }
}

async function saveReportNote(config: AuditGhlConfig, contactId: string, job: RoofingSyncJob, runtime: GhlRuntime, deadline: number) {
  const path = `/contacts/${encodeURIComponent(contactId)}/notes`;
  const marker = `Roofing audit ${job.evidence.requestId}`;
  for (let attempt = 0; ; attempt++) {
    const result = await auditGhlRequest<{ notes: Array<{ body?: string }> }>(config, path, { method: "GET" }, "find_report_note", runtime, deadline);
    if (!Array.isArray(result?.notes)) throw new AuditGhlError("find_report_note", 0, undefined, "INVALID_RESPONSE");
    if (result.notes.some(note => note.body?.startsWith(marker))) return;
    try {
      await auditGhlRequest(config, path, { method: "POST", body: JSON.stringify({ body: buildRoofingReportNote(job) }) }, "save_report_note", runtime, deadline, 0);
      return;
    } catch (error) {
      if (!isRetryable(error) || attempt >= 3) throw error;
      await retryDelay(error, attempt, deadline, runtime);
    }
  }
}

export async function syncRoofingAudit(job: RoofingSyncJob, options: SyncOptions = {}) {
  const runtime = options.runtime ?? defaultGhlRuntime;
  const log = options.log ?? (record => console.info(JSON.stringify(record)));
  const deadline = runtime.now() + 240_000;
  let contactId: string | undefined;
  try {
    if (job.submission.contact.websiteTrap || !job.submission.contact.consent) return { ok: false as const, skipped: true };
    const config = getAuditGhlConfig();
    // Recovery data is encrypted; logs never contain the token, email, phone, IP or answers.
    logAuditReplay(job, log);
    const pipelines = await auditGhlRequest<{ pipelines: Array<{ id: string; stages: Array<{ id: string }> }> }>(config,
      `/opportunities/pipelines?${new URLSearchParams({ locationId: config.locationId })}`, { method: "GET" }, "validate_pipeline", runtime, deadline);
    if (!pipelines?.pipelines?.some(pipeline => pipeline.id === config.pipelineId && pipeline.stages?.some(stage => stage.id === config.stageId))) {
      throw new AuditGhlError("validate_pipeline", 0, undefined, "PIPELINE_STAGE_NOT_FOUND");
    }
    const contactResult = await auditGhlRequest<{ contact: { id: string } }>(config, "/contacts/upsert", {
      method: "POST", body: JSON.stringify(buildRoofingContact(job, config.locationId)),
    }, "upsert_contact", runtime, deadline);
    contactId = contactResult?.contact?.id;
    if (!contactId) throw new AuditGhlError("upsert_contact", 0, undefined, "INVALID_RESPONSE");
    const savedContactId = contactId;
    return await withContactLock(`${config.locationId}:${config.pipelineId}:${contactId}`, async () => {
      await auditGhlRequest(config, `/contacts/${encodeURIComponent(savedContactId)}/tags`, {
        method: "POST", body: JSON.stringify({ tags: roofingAuditTags(job.submission) }),
      }, "add_tags", runtime, deadline);
      const opportunity = await ensureOpportunity(config, savedContactId, job, runtime, deadline);
      await saveReportNote(config, savedContactId, job, runtime, deadline);
      log({ event: "roofing_audit_sync_completed", requestId: job.evidence.requestId, contactId: savedContactId });
      return { ok: true as const, contactId: savedContactId, opportunityId: opportunity.id, opportunityCreated: opportunity.created };
    });
  } catch (error) {
    const failure = error instanceof AuditGhlError ? error : new AuditGhlError("sync", 0, undefined, "UNEXPECTED_ERROR");
    // Missing pipeline settings still leave an encrypted replay if a token/key is available.
    if (failure.operation === "configuration") logAuditReplay(job, log);
    log({ event: "roofing_audit_sync_failed", requestId: job.evidence.requestId, contactId,
      operation: failure.operation, status: failure.status, traceId: failure.traceId, code: failure.code });
    return { ok: false as const, contactId };
  }
}
