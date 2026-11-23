# Roofing audit delivery — configuration pending

The form routing and optional complete-report field are implemented. **The GHL
workflow is not configured or published yet.** Browser control became unavailable
before its settings could be inspected. Do not interpret this document or the
optional field support as evidence of live email delivery.

## Website routing

On `/free-growth-audit`, selecting Roofing changes the primary action to
“Continue to roofing audit.” Pressing it opens `/free-growth-audit/roofing`, even
when location fields have not been completed yet. City, state, website and original
referrer are transferred in memory by the shared route layout; they are never
added to the URL. Campaign/click parameters are preserved. Other industries keep
the current five-question flow. The specialized form still requires its own
service choice and location before starting questions.

## Before enabling email

1. Inspect existing workflows, sender configuration and the account's users.
   Avoid overlapping delivery/notification actions. Use the already verified
   BotPager sender and confirm the user corresponding to Rolando.
2. Create or reuse a **contact multiline text** field for the complete roofing
   report. Suggested name: `Roofing audit full report`. Verify its actual field
   key in GHL; do not guess the merge token from its display name.
3. Set its ID in server-only `GHL_FIELD_ROOFING_FULL_REPORT` in Vercel Production
   and redeploy. The integration writes this field in the contact upsert before
   creating the opportunity. Existing 23 fields retain their current meanings.
4. Confirm a controlled test contact has the full report and that GHL email preview
   renders its paragraph breaks and special characters correctly. Do not publish
   a template showing only opportunity titles or an empty report.

## Proposed workflow

Name: `Roofing Audit — Report + New Lead Alerts`

- Trigger: opportunity created in `Marketing Pipeline - Auditoría Roofing`,
  stage `Auditoría completada (nuevo lead)`.
- Require the roofing audit tag and variant. Disable re-entry and multiple
  opportunity processing for the same contact so resubmission does not repeat
  new-lead alerts. Do not enroll past contacts in bulk.
- Notify Rolando inside GHL, linking the contact record.
- Send an internal email notification to the owner's confirmed address. The owner
  requested both email and in-app notifications; use a specific recipient rather
  than all account users.
- Before sending the client email, require email audit consent `Yes`, a present
  email address, a nonempty full-report field and email delivery not blocked by DND.
- If the full report is missing, skip the incomplete client email and flag the
  record for manual review. The new-lead notification should still arrive.
- Send the audit email using the configured sender. No SMS or promotional sequence
  is part of this workflow.

This trigger covers new roofing audit leads. Repeated submissions update the same
open opportunity without creating another. A separate report-resend workflow, if
needed later, should use a distinct submission event and preserve new-lead deduplication.

## Client email copy

Subject: `Your personalized roofing growth audit is ready`

Use the GHL field picker for the first-name and complete-report merge values:

> Hi [first name],
>
> Thanks for completing your BotPager Roofing Growth Audit. Below are your three
> personalized priorities and the practical next steps for your business.
>
> [Complete report — the multiline contact field, not the contact's internal notes]
>
> Have a question about your recommendations? Reply to this email and our team
> will help you decide where to start.
>
> BotPager
> Uno Zero Marketing LLC

Keep the account's configured email footer and unsubscribe handling. Do not invent
a sender address, postal address or booking URL.

## Owner notifications

Email subject: `Nuevo lead de roofing: [business name]`

Body: name, business, email, phone if present, city/state, priority roofing service,
the three opportunity titles, campaign attribution and a link to the GHL contact.

In-app title: `Nueva auditoría de roofing`

In-app body: `[business name] completó su auditoría. Revisa sus respuestas y las
tres recomendaciones.` Redirect to the contact record.

## Live verification required

Use an owner-controlled test email. Confirm one contact, one opportunity, full
report saved, workflow enrolled once, client email sent/delivered, owner email
sent/delivered, and in-app notification created. Repeat the submission to confirm
the new-lead workflow does not duplicate notifications. Inspect execution logs
and email rendering; a successful API response alone does not prove delivery.

References: [GHL Internal Notifications](https://help.gohighlevel.com/support/solutions/articles/155000003202),
[GHL custom fields](https://help.gohighlevel.com/support/solutions/articles/155000008030-creating-and-managing-custom-fields-for-better-data-organization).
