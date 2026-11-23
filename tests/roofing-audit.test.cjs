const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

// Load the real validation, ranking, API and CRM code; every external request is mocked.
require.extensions['.ts'] = (testModule, file) => testModule._compile(ts.transpileModule(readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, file);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function(request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args);
};
const originalLoad = Module._load;
const afterTasks = [];
Module._load = function(request, ...args) {
  if (request === 'next/server') return { after: callback => afterTasks.push(callback) };
  return request === 'server-only' ? {} : originalLoad.call(this, request, ...args);
};

const { parseAuditSubmission } = require('../lib/audit/validation.ts');
const { auditQuestions, getAnswerLabel } = require('../lib/audit/questions.ts');
const { roofingAuditQuestions, roofingServices } = require('../lib/audit/roofing-questions.ts');
const { getPreliminaryOpportunities, buildFallbackReport } = require('../lib/audit/recommendations.ts');
const { getRoofingOpportunities } = require('../lib/audit/roofing-recommendations.ts');
const { generateAuditReport } = require('../lib/ai/generate-audit.ts');
const { POST } = require('../app/api/audit/route.ts');
const { roofingAuditHref } = require('../lib/audit/navigation.ts');

test('roofing navigation preserves campaign attribution without copying business data into the URL', () => {
  const href=roofingAuditHref('?utm_source=google&utm_medium=cpc&utm_campaign=roof%20repairs&utm_content=ad-a&utm_term=roofing&gclid=click-id&fbclid=meta-id&city=Orlando&website=private.example&email=owner%40example.com&next=https%3A%2F%2Fevil.example');
  const url=new URL(href,'https://www.botpager.com');
  assert.equal(url.pathname,'/free-growth-audit/roofing');
  assert.equal(url.origin,'https://www.botpager.com');
  assert.deepEqual(Object.fromEntries(url.searchParams),{utm_source:'google',utm_medium:'cpc',utm_campaign:'roof repairs',utm_term:'roofing',utm_content:'ad-a',gclid:'click-id',fbclid:'meta-id'});
});

test('direct roofing navigation uses a fixed destination and drops unknown or empty parameters', () => {
  assert.equal(roofingAuditHref(''),'/free-growth-audit/roofing');
  assert.equal(roofingAuditHref('?utm_source=&redirect=javascript:alert(1)'),'/free-growth-audit/roofing');
});

const contact = { firstName: 'Demo', businessName: 'Demo Roofing', email: 'DEMO@example.com', consent: true };
const business = { industry: 'Roofing', roofingService: 'replacements', city: 'Orlando', state: 'FL', website: '' };
const answers = { lead_source: 'google', monthly_inquiries: '51-100', missed_inquiry_handling: 'voicemail', inspection_booking: 'messages', estimate_follow_up: 'none' };
const roofing = { variant: 'roofing', business, answers, contact };
const general = {
  business: { industry: 'Plumbing', city: 'Austin', state: 'TX', website: '' }, contact,
  answers: { lead_source: 'google', monthly_inquiries: '51-100', missed_inquiry_handling: 'voicemail', crm_follow_up: 'none', average_customer_value: '1000-5000' },
};
const originalFetch = global.fetch;
const environment = { ...process.env };
const fieldKeys = ['GHL_FIELD_AUDIT_SUMMARY', 'GHL_FIELD_OPPORTUNITY_1', 'GHL_FIELD_OPPORTUNITY_2', 'GHL_FIELD_OPPORTUNITY_3', 'GHL_FIELD_RECOMMENDED_SYSTEM', 'GHL_FIELD_AUDIT_COMPLETED_AT'];
test.beforeEach(() => {
  afterTasks.length = 0;
  for (const key of Object.keys(process.env)) if (/^(GHL_|OPENAI_)/.test(key)) delete process.env[key];
  global.fetch = async () => { throw new Error('Unexpected external request'); };
});
test.afterEach(() => {
  global.fetch = originalFetch;
  for (const key of Object.keys(process.env)) if (/^(GHL_|OPENAI_)/.test(key)) delete process.env[key];
  for (const [key, value] of Object.entries(environment)) if (/^(GHL_|OPENAI_)/.test(key)) process.env[key] = value;
});

function submit(input) {
  return POST(new Request('http://localhost/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }));
}
function configureCrm() {
  Object.assign(process.env, { GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token', GHL_LOCATION_ID: 'test-location', GHL_USER_ID: 'test-user' });
  fieldKeys.forEach((key, index) => { process.env[key] = `field-${index}`; });
  const calls = [];
  global.fetch = async (url, init) => {
    assert.ok(url.startsWith('https://services.leadconnectorhq.com/'));
    const body = JSON.parse(init.body);
    calls.push({ url, method: init.method, body });
    return Response.json(url.endsWith('/contacts/upsert') ? { contact: { id: 'test-contact' } } : {});
  };
  return calls;
}

test('each audit keeps five questions and its own response/booking/follow-up choices', () => {
  assert.equal(auditQuestions.length, 5);
  assert.equal(roofingAuditQuestions.length, 5);
  assert.deepEqual(auditQuestions.map(q => q.key), ['lead_source', 'monthly_inquiries', 'missed_inquiry_handling', 'crm_follow_up', 'average_customer_value']);
  assert.deepEqual(roofingAuditQuestions.map(q => q.key), ['lead_source', 'monthly_inquiries', 'missed_inquiry_handling', 'inspection_booking', 'estimate_follow_up']);
  assert.equal(getAnswerLabel('missed_inquiry_handling', 'automatic-response'), 'They get an automatic response');
  assert.equal(getAnswerLabel('missed_inquiry_handling', 'automatic-response', 'roofing'), 'They get instant answers');
});

test('existing general payloads remain accepted without a variant or roofing service', () => {
  const parsed = parseAuditSubmission(general);
  assert.equal(parsed.variant, 'general');
  assert.deepEqual(parsed.answers, general.answers);
  assert.deepEqual(parsed.business, general.business);
  assert.equal(parsed.contact.email, 'demo@example.com');
  assert.equal(parsed.contact.phone, '');
});

test('roofing validates its service, fixes its industry and ignores unrelated answers', () => {
  for (const service of roofingServices) {
    const parsed = parseAuditSubmission({ ...roofing, business: { ...business, industry: 'HVAC', roofingService: service.value }, answers: { ...answers, crm_follow_up: 'none' } });
    assert.equal(parsed.business.industry, 'Roofing');
    assert.equal(parsed.business.roofingService, service.value);
    assert.deepEqual(parsed.answers, answers);
  }
});

test('wrong variants, missing services, missing answers and cross-audit choices are rejected', () => {
  for (const input of [
    { ...roofing, variant: 'unknown' },
    { ...roofing, business: { ...business, roofingService: '' } },
    { ...roofing, business: { ...business, roofingService: 'plumbing' } },
    { ...roofing, answers: general.answers },
    { ...general, answers },
    { ...roofing, answers: { ...answers, missed_inquiry_handling: 'booking-link' } },
    { ...roofing, answers: { ...answers, inspection_booking: 'invented' } },
    { ...general, answers: { ...general.answers, lead_source: 'not-sure' } },
  ]) assert.throws(() => parseAuditSubmission(input));
  for (const key of Object.keys(answers)) {
    const incomplete = { ...answers }; delete incomplete[key];
    assert.throws(() => parseAuditSubmission({ ...roofing, answers: incomplete }));
  }
});

test('contact consent and optional phone rules are unchanged for both variants', () => {
  for (const input of [roofing, general]) {
    assert.equal(parseAuditSubmission(input).contact.phone, '');
    assert.throws(() => parseAuditSubmission({ ...input, contact: { ...contact, consent: false } }));
    for (const key of ['smsNonMarketingConsent', 'smsMarketingConsent']) {
      assert.throws(() => parseAuditSubmission({ ...input, contact: { ...contact, [key]: true } }));
      assert.equal(parseAuditSubmission({ ...input, contact: { ...contact, [key]: true, phone: '+12025550123' } }).contact[key], true);
    }
  }
});

test('missed responses, manual inspection scheduling and unworked estimates determine priorities', () => {
  const report = buildFallbackReport(business, answers);
  assert.deepEqual(report.opportunities.map(item => item.id), ['roofing-estimates', 'roofing-response', 'roofing-inspections']);
  assert.deepEqual(getPreliminaryOpportunities(answers, business), report.opportunities);
  assert.match(report.opportunities[1].problem, /voicemail/);
  assert.match(report.opportunities[2].problem, /text or email/);
  assert.match(report.opportunities[2].recommendedAction, /included in your BotPager plan/);
  assert.match(report.businessSummary, /Orlando, FL/);
  assert.match(report.businessSummary, /roof replacements/);
  assert.match(report.businessSummary, /not an inspection of your website/);
});

test('existing online booking and automated estimate follow-up are acknowledged', () => {
  const report = buildFallbackReport(business, { ...answers, missed_inquiry_handling: 'live-team', inspection_booking: 'online-calendar', estimate_follow_up: 'automated' });
  const byId = Object.fromEntries(report.opportunities.map(item => [item.id, item]));
  assert.match(byId['roofing-inspections'].problem, /already choose a visit time online/);
  assert.match(byId['roofing-inspections'].recommendedAction, /Keep your existing calendar/);
  assert.match(byId['roofing-estimates'].problem, /already follow up automatically/);
  assert.equal(byId['roofing-inspections'].severity, 'low');
  assert.equal(byId['roofing-estimates'].severity, 'low');
});

test('unknown lead flow and low-volume referral dependence produce different priorities', () => {
  const unknown = getRoofingOpportunities(business, { ...answers, monthly_inquiries: 'not-sure', estimate_follow_up: 'automated' });
  assert.ok(unknown.some(item => item.id === 'roofing-lead-tracking'));
  const referral = getRoofingOpportunities(business, { ...answers, lead_source: 'referrals', monthly_inquiries: '0-10', estimate_follow_up: 'automated' });
  assert.ok(referral.some(item => item.id === 'roofing-local-demand'));
  assert.ok(referral.some(item => item.recommendedAction.includes('Orlando, FL')));
});

test('commercial service personalizes advice without inferring website defects or revenue', () => {
  const report = buildFallbackReport({ ...business, roofingService: 'commercial' }, answers);
  assert.match(report.businessSummary, /commercial roofing/);
  assert.match(report.opportunities.find(item => item.id === 'roofing-inspections').recommendedAction, /commercial roofing/);
  assert.doesNotMatch(JSON.stringify(report), /\$\d|your website lacks|you are losing/);
});

test('every roofing answer combination yields three distinct, valid priorities', () => {
  let profiles = [{}];
  for (const question of roofingAuditQuestions) profiles = profiles.flatMap(profile => question.options.map(option => ({ ...profile, [question.key]: option.value })));
  assert.equal(profiles.length, 4500);
  for (const profile of profiles) {
    const opportunities = getRoofingOpportunities(business, profile);
    assert.equal(opportunities.length, 3);
    assert.equal(new Set(opportunities.map(item => item.id)).size, 3);
    assert.ok(opportunities.every(item => ['low', 'medium', 'high'].includes(item.severity) && item.recommendedAction));
  }
});

test('general audit keeps its original recommendation priorities', () => {
  const report = buildFallbackReport(general.business, general.answers);
  assert.deepEqual(report.opportunities.map(item => item.id), ['faster-response', 'consistent-follow-up', 'local-visibility']);
  assert.match(report.businessSummary, /plumbing/i);
  assert.ok(report.opportunities.every(item => !item.id.startsWith('roofing-')));
});

test('roofing report works without an AI provider', async () => {
  const result = await generateAuditReport(business, answers);
  assert.equal(result.source, 'rules');
  assert.deepEqual(result.report, buildFallbackReport(business, answers));
});

test('AI receives roofing context and labels, with no contact details', async () => {
  Object.assign(process.env, { OPENAI_API_KEY: 'test', OPENAI_MODEL: 'test-model' });
  const report = buildFallbackReport(business, answers);
  global.fetch = async (url, init) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    const body = JSON.parse(init.body), input = JSON.parse(body.input);
    assert.match(body.instructions, /Preserve the three supplied priority IDs/);
    assert.match(body.instructions, /never describe a process the customer already has as missing/);
    assert.equal(input.business.roofingService, 'Roof replacements');
    assert.equal(input.answers.inspection_booking, 'We coordinate by text or email');
    assert.equal(input.contact, undefined);
    assert.equal(body.store, false);
    return Response.json({ output_text: JSON.stringify(report) });
  };
  assert.equal((await generateAuditReport(business, answers)).source, 'openai');
});

test('AI failure or changed/duplicate priority IDs falls back to consistent roofing results', async () => {
  Object.assign(process.env, { OPENAI_API_KEY: 'test', OPENAI_MODEL: 'test-model' });
  for (const mode of ['invalid-id', 'duplicate-id', 'malformed', 'http-error', 'network-error']) {
    global.fetch = async () => {
      if (mode === 'network-error') throw new Error('offline');
      if (mode === 'http-error') return new Response('', { status: 503 });
      const report = buildFallbackReport(business, answers);
      report.opportunities[0].id = mode === 'duplicate-id' ? report.opportunities[1].id : 'invented';
      return Response.json({ output_text: mode === 'malformed' ? '{' : JSON.stringify(report) });
    };
    const result = await generateAuditReport(business, answers);
    assert.equal(result.source, 'rules', mode);
    assert.deepEqual(result.report, buildFallbackReport(business, answers));
  }
});

test('real API returns personalized reports for both variants without external services', async () => {
  for (const input of [roofing, general]) {
    const response = await submit(input), result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
    assert.equal(result.delivery, input.variant === 'roofing' ? 'processing' : 'preview');
    assert.equal(result.ok, true);
    assert.deepEqual(result.report, buildFallbackReport(input.business, input.answers));
  }
});

test('API rejects incomplete roofing input before CRM/AI work', async () => {
  const calls = configureCrm();
  const response = await submit({ ...roofing, answers: { ...answers, inspection_booking: '' } });
  assert.equal(response.status, 400);
  assert.equal(calls.length, 0);
});

test('roofing schedules the new sync after returning the report without invoking the old email integration', async () => {
  const calls = configureCrm();
  const response = await submit(roofing), result = await response.json();
  assert.equal(result.delivery, 'processing');
  assert.equal(result.report.opportunities.length, 3);
  assert.equal(calls.length, 0);
  assert.equal(afterTasks.length, 1);
});

test('general CRM retains its original source, tags, questions and report delivery', async () => {
  const calls = configureCrm();
  const result = await (await submit(general)).json();
  assert.equal(result.delivery, 'queued');
  assert.equal(calls[0].body.source, 'BotPager Local Growth Audit');
  assert.deepEqual(calls[1].body.tags, ['botpager-audit-submitted']);
  const note = calls.find(call => call.url.endsWith('/notes'));
  assert.match(note.body.body, /crm follow up: No system/);
  assert.match(note.body.body, /average customer value: \$1,000–\$5,000/);
  assert.doesNotMatch(note.body.body, /Priority roofing service/);
});
