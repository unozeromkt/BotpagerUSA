# Roofing audit → GHL

`/api/audit` returns the personalized roofing report before `after()` synchronizes
the contact, additive tags, opportunity and report note. Other industries keep
their existing integration. This integration does not send email or SMS and does
not configure GHL workflows.

## Configuration

Use server environment variables only (names are in `.env.example`):

- `GHL_PRIVATE_INTEGRATION_TOKEN`: existing production private integration token.
- `GHL_PRIVATE_TOKEN`: optional override, if a separate token is configured later.
- `GHL_LOCATION_ID`, `GHL_AUDIT_PIPELINE_ID`, `GHL_AUDIT_STAGE_ID`: required.
- `GHL_ASSIGNED_USER_ID`: optional; empty means no assigned user is sent.
- `GHL_AUDIT_REPLAY_SECRET`: dedicated encryption key, recommended over token fallback.

The token needs `contacts.readonly`, `contacts.write`, `opportunities.readonly`
and `opportunities.write`. Validate that the configured stage belongs to the
configured pipeline before writing a contact. Email-first duplicate detection
must remain enabled in GHL. The integration requests that upsert not create a
duplicate even when duplicate contacts are allowed.

The supplied specification combined camelCase opportunity search parameters
with `Version: 2021-07-28`; the live API returned 422. Search uses `Version: v3`
with camelCase, matching the [official search contract](https://marketplace.gohighlevel.com/docs/ghl/opportunities/search-opportunity/index.html).
All other requests retain `Version: 2021-07-28`.

## Data and idempotency

`lib/ghl/auditMapping.ts` maps all 23 fields by ID. Dropdown labels are tested
against the configured GHL options. Coordinate any future form label changes
with the corresponding GHL option. Consent text is shared with the form; evidence
includes UTC submission time, the first forwarded IP, user agent and form version.
SMS consent requires a checked box and a valid E.164 phone number. Unchecking a box
updates its Yes/No field but does not remove tags. GHL handles STOP/opt-outs.

Search an open opportunity for the contact and pipeline before creating one;
never move an existing opportunity. A worker-local lock serializes concurrent
submissions for the same contact. GHL's duplicate-opportunity protection is still
required across separate workers; the in-memory lock alone is not a distributed
lock. Reconcile search before retrying an ambiguous create. Report notes use the
request ID to avoid duplicates when replaying the same job.

Each HTTP request has a 10-second timeout. Network errors, 429 and 5xx get up to
three retries with 1/2/4-second backoff; honor longer Retry-After delays. Other 4xx
responses are not retried. A delay exceeding the background job budget is deferred
for operator replay. The route allows 300 seconds and sync uses a 240-second budget.

## Failed-job recovery

Structured logs contain only safe status metadata and contact IDs. An authenticated
AES-256-GCM encrypted copy of the job is written as `roofing_audit_replay` chunks
before synchronization. Success/failure events share its request ID. Never print
the decrypted job or put tokens, plaintext contact data or replay keys in Git.

**These logs are not a durable queue.** Production's current Vercel Hobby runtime
log retention is short (30 minutes). Export failed jobs promptly within retention,
or configure an approved log drain before relying on longer recovery windows.
Lost/expired logs cannot be replayed. Keep the encryption key used for a record
available until that record is resolved, including when rotating credentials.

Export JSON logs to a protected local file with `vercel logs --json`, selecting
the failed request and its `roofing_audit_replay` records. Run the operator CLI
in a trusted environment with the original replay key and current GHL configuration
in its environment. Sensitive Vercel variables cannot be downloaded via env pull;
an authorized operator must provision them through the secret manager. Do not
paste them into commands, chat, or a public replay endpoint.

```sh
node --conditions=react-server scripts/replay-roofing-audit.cjs /secure/logs.jsonl REQUEST_ID --dry-run
node --conditions=react-server scripts/replay-roofing-audit.cjs /secure/logs.jsonl REQUEST_ID --apply
```

Dry-run checks chunk completeness and authenticated decryption without contacting
GHL or printing personal data. Apply uses the same synchronization and deduplication
logic. Keep the original request ID. Confirm `roofing_audit_sync_completed`, then
remove the local export according to the team's retention policy.

## Verification

`npm run test:audit` covers mappings, normalization, consent, UTM capture, retries,
encrypted recovery, repeated/concurrent submissions and report delivery during
CRM failures. `npm run test:meta-pixel` protects existing conversion tracking.
Live tests use only the owner's test email; no SMS is sent. Positive SMS field/tag
behavior is tested with mocked GHL requests unless an owned test phone is supplied.
