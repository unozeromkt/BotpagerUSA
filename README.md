# BotPager USA

Next.js application for the BotPager landing page and Local Growth Audit.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with local credentials. The file is ignored by Git. Never commit API tokens or copy them into client-side variables.

The audit is available at `http://localhost:3000/audit`. Without GoHighLevel credentials it runs in preview mode and still generates the report locally.

## Verification

```bash
npx tsc --noEmit
npm run build
```

## Vercel staging

Use a `staging` branch as the shared test environment. Vercel creates a Preview Deployment for branch pushes without replacing the production site.

1. Import the Git repository into Vercel as a Next.js project.
2. Add all values from `.env.example` to the **Preview** environment.
3. Redeploy after adding or changing environment variables.
4. Open the Preview URL at `/audit` and submit with an internal email.
5. Confirm that the API response has `delivery: "queued"` and check Vercel Runtime Logs for entries prefixed with `[BotPager Audit]`.
6. Verify the contact, six report fields, note, `botpager-audit-ready` tag and email inside GoHighLevel.

GoHighLevel workflow configuration is documented in [GOHIGHLEVEL_SETUP.md](./GOHIGHLEVEL_SETUP.md).
