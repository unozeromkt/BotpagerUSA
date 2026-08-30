# BotPager Audit — GoHighLevel setup

The website does not store leads in a local database. It sends each completed audit directly to one GoHighLevel sub-account and uses a tag to start the report email workflow.

## Phase 1: Private Integration

In the target GoHighLevel sub-account, create a Private Integration with the minimum contact permissions needed to:

- create and update contacts;
- add contact tags;
- create contact notes.

Keep the token in the deployment secret `GHL_PRIVATE_INTEGRATION_TOKEN`. Do not expose it in browser code or commit it to Git.

Also copy the sub-account ID into `GHL_LOCATION_ID`. Copy the ID of the user who should appear as the audit-note author into `GHL_USER_ID`.

## Phase 2: Contact custom fields

Create these six contact custom fields. Long-text fields are recommended for the report content.

| GoHighLevel field | Suggested type | Environment variable |
| --- | --- | --- |
| Audit summary | Long text | `GHL_FIELD_AUDIT_SUMMARY` |
| Audit opportunity 1 | Long text | `GHL_FIELD_OPPORTUNITY_1` |
| Audit opportunity 2 | Long text | `GHL_FIELD_OPPORTUNITY_2` |
| Audit opportunity 3 | Long text | `GHL_FIELD_OPPORTUNITY_3` |
| Recommended system | Long text | `GHL_FIELD_RECOMMENDED_SYSTEM` |
| Audit completed at | Text or date/time | `GHL_FIELD_AUDIT_COMPLETED_AT` |

Copy each field ID—not its display name—into the corresponding deployment secret. All six are required before the application adds the email trigger tag.

## Phase 3: Email workflow

Create a GoHighLevel workflow with this configuration:

1. Trigger: contact tag added.
2. Filter: tag equals `botpager-audit-ready`.
3. Send the audit email using the six contact custom fields as merge values.
4. Optionally notify the BotPager sales team and create an opportunity in the desired pipeline.
5. Remove `botpager-audit-ready` after sending so a future audit can trigger the workflow again.

Suggested email structure:

- subject: `Your BotPager Local Growth Audit is ready`;
- personal greeting using the contact's first name;
- short audit summary;
- three numbered opportunities;
- recommended BotPager system;
- one call to action to book a strategy call;
- BotPager contact details and privacy/unsubscribe footer.

The app adds `botpager-audit-generation-failed` if a lead was saved but report generation could not finish. That tag can trigger an internal follow-up workflow.

## Phase 4: Report generation

For the fastest launch, the app already includes a deterministic rules engine. It produces a useful report without an external AI service.

To enable personalized AI wording, add `OPENAI_API_KEY` and `OPENAI_MODEL` to the deployment environment. The app sends business context and audit answers, but not the lead's name, email, or phone. If the AI request fails, it automatically returns the deterministic report.

## Phase 5: Launch checklist

- Put all values from `.env.example` into `.env.local` for local testing and into the hosting provider's encrypted environment settings for production.
- Confirm the sending domain and sender identity in GoHighLevel.
- Add the final privacy-policy URL and approved consent copy to the audit form.
- Run one test with an internal email and verify the contact, custom fields, note, tag, email, and optional pipeline opportunity.
- Confirm the production domain and analytics events before promoting the audit CTA.

Official references: [Private Integration tokens](https://marketplace.gohighlevel.com/docs/Authorization/PrivateIntegrationsToken/index.html), [upsert contact](https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact/), [add tags](https://marketplace.gohighlevel.com/docs/ghl/contacts/add-tags/), and [create note](https://marketplace.gohighlevel.com/docs/ghl/contacts/create-note/).
