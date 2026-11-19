import "server-only";

import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";
import type { RoofingSyncJob } from "./auditMapping";

export type ReplayRecord = { version: 1; iv: string; tag: string; data: string };

function encryptionKey(secret: string) {
  return Buffer.from(hkdfSync("sha256", secret, "botpager-roofing-audit", "replay-v1", 32));
}

export function encryptAuditReplay(job: RoofingSyncJob, secret: string): ReplayRecord {
  if (!secret) throw new Error("Replay encryption is not configured.");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(secret), iv);
  const data = Buffer.concat([cipher.update(gzipSync(JSON.stringify(job))), cipher.final()]);
  return { version: 1, iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: data.toString("base64") };
}

export function decryptAuditReplay(record: ReplayRecord, secret: string): RoofingSyncJob {
  if (record.version !== 1 || !secret) throw new Error("Invalid replay record or key.");
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(secret), Buffer.from(record.iv, "base64"));
  decipher.setAuthTag(Buffer.from(record.tag, "base64"));
  const bytes = Buffer.concat([decipher.update(Buffer.from(record.data, "base64")), decipher.final()]);
  return JSON.parse(gunzipSync(bytes, { maxOutputLength: 150_000 }).toString("utf8")) as RoofingSyncJob;
}

export function logAuditReplay(job: RoofingSyncJob, log: (record: object) => void) {
  const secret = process.env.GHL_AUDIT_REPLAY_SECRET || process.env.GHL_PRIVATE_TOKEN || process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
  if (!secret) {
    log({ event: "roofing_audit_replay_unavailable", requestId: job.evidence.requestId, code: "MISSING_ENCRYPTION_SECRET" });
    return;
  }
  const record = encryptAuditReplay(job, secret);
  // Keep each structured log comfortably below common per-line log limits.
  const total = Math.ceil(record.data.length / 2000);
  for (let part = 0; part < total; part++) log({
    event: "roofing_audit_replay", requestId: job.evidence.requestId,
    version: record.version, iv: record.iv, tag: record.tag, part, total,
    data: record.data.slice(part * 2000, (part + 1) * 2000),
  });
}
