const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
require.extensions['.ts'] = (testModule, file) => testModule._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
}).outputText, file);
const resolve = Module._resolveFilename, load = Module._load, tasks = [];
Module._resolveFilename = function(request, ...args) { return resolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args); };
Module._load = function(request, ...args) {
  if (request === 'server-only') return {};
  if (request === 'next/server') return { after: callback => tasks.push(callback) };
  return load.call(this, request, ...args);
};

const { auditOptionLabels, auditFieldIds, buildAuditCustomFields, buildRoofingContact, buildAuditConsentEvidence, captureAuditEvidence, completionDate } = require('../lib/ghl/auditMapping.ts');
const { auditGhlRequest, getAuditGhlConfig, retryAfterMs } = require('../lib/ghl/auditHttp.ts');
const { encryptAuditReplay, decryptAuditReplay } = require('../lib/ghl/auditReplay.ts');
const { syncRoofingAudit } = require('../lib/ghl/syncRoofingAudit.ts');
const { parseAuditSubmission } = require('../lib/audit/validation.ts');
const { auditConsent } = require('../lib/audit/consent.ts');
const { roofingAuditQuestions, roofingServices } = require('../lib/audit/roofing-questions.ts');
const { buildFallbackReport } = require('../lib/audit/recommendations.ts');
const { POST } = require('../app/api/audit/route.ts');
const { spawnSync } = require('node:child_process');
const os = require('node:os');

const input = {
  variant: 'roofing', business: { industry: 'Roofing', roofingService: 'repairs', city: 'Orlando', state: 'fl', website: 'example.com' },
  answers: { lead_source: 'google', monthly_inquiries: '11-25', missed_inquiry_handling: 'voicemail', inspection_booking: 'phone', estimate_follow_up: 'none' },
  contact: { firstName: 'Demo', businessName: 'Demo Roofing', email: ' DEMO@EXAMPLE.COM ', phone: '', consent: true, smsNonMarketingConsent: false, smsMarketingConsent: false, websiteTrap: '' },
  tracking: { source: 'direct', utmSource: 'test', utmMedium: 'cpc', utmCampaign: 'audit' },
};
const evidence = { requestId: 'test-request-1', submittedAt: '2026-11-20T00:10:00.000Z', ip: '192.0.2.1', userAgent: 'Test browser', formVersion: 'test-sha' };
function job(changes={}) {
  const submission = parseAuditSubmission({ ...input, ...changes });
  return { submission, report: buildFallbackReport(submission.business, submission.answers), evidence };
}
const oldEnv = { ...process.env }, oldFetch = global.fetch;
let calls, contacts, opportunities, notes, tags, logs, delays, time, intercept, nextContact;
let runtime;
test.beforeEach(() => {
  for (const key of Object.keys(process.env)) if (/^(GHL_|OPENAI_)/.test(key)) delete process.env[key];
  Object.assign(process.env, { GHL_PRIVATE_INTEGRATION_TOKEN: 'test-token-never-log', GHL_LOCATION_ID: 'location', GHL_AUDIT_PIPELINE_ID: 'pipeline', GHL_AUDIT_STAGE_ID: 'new-stage' });
  calls=[]; contacts=new Map(); opportunities=[]; notes=[]; tags=new Set(['existing-customer']); logs=[]; delays=[]; tasks.length=0; time=0; intercept=undefined; nextContact=1;
  runtime={ fetch: mockFetch, now:()=>time, sleep:async ms=>{delays.push(ms);time+=ms;} };
});
test.afterEach(() => {
  global.fetch=oldFetch;
  for (const key of Object.keys(process.env)) if (/^(GHL_|OPENAI_)/.test(key)) delete process.env[key];
  for (const [key,value] of Object.entries(oldEnv)) if (/^(GHL_|OPENAI_)/.test(key)) process.env[key]=value;
});
async function mockFetch(url, init) {
  const parsed=new URL(url), body=init.body?JSON.parse(init.body):undefined;
  assert.equal(init.headers.Version, parsed.pathname === '/opportunities/search' ? 'v3' : '2021-07-28');
  assert.equal(init.headers.Authorization, 'Bearer test-token-never-log');
  assert.ok(init.signal);
  const call={path:parsed.pathname,query:Object.fromEntries(parsed.searchParams),method:init.method,body};
  calls.push(call);
  const override=await intercept?.(call);
  if(override) return override;
  if(call.path==='/opportunities/pipelines') return Response.json({pipelines:[{id:'pipeline',stages:[{id:'new-stage'}]}]});
  if(call.path==='/contacts/upsert') {
    assert.equal(body.tags, undefined);
    const contact=contacts.get(body.email)??{id:`contact-${nextContact++}`};
    Object.assign(contact,body); contacts.set(body.email,contact);
    return Response.json({contact});
  }
  if(call.path.endsWith('/tags')&&call.method==='POST') {body.tags.forEach(tag=>tags.add(tag));return Response.json({tags:[...tags]});}
  if(call.path==='/opportunities/search') {
    assert.equal(call.query.location_id, undefined); assert.equal(call.query.pipeline_id, undefined);
    assert.equal(call.query.pipelineId, 'pipeline'); assert.equal(call.query.locationId, 'location');
    return Response.json({opportunities:opportunities.filter(item=>item.contactId===call.query.contactId&&item.pipelineId===call.query.pipelineId&&item.status===call.query.status)});
  }
  if(call.path==='/opportunities/'&&call.method==='POST') {
    assert.equal(body.source, undefined);
    const opportunity={id:`opportunity-${opportunities.length+1}`,...body};opportunities.push(opportunity);return Response.json({opportunity});
  }
  if(call.path.endsWith('/notes')) {
    if(call.method==='GET') return Response.json({notes});
    if(call.method==='POST') {notes.push({id:`note-${notes.length+1}`,...body});return Response.json({note:notes.at(-1)});}
  }
  throw new Error('Unexpected endpoint or method');
}
const sync = value => syncRoofingAudit(value??job(), {runtime,log:record=>logs.push(record)});

test('operator CLI validates encrypted exports without printing PII or making requests, and rejects missing chunks', () => {
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'roofing-replay-'));
  try {
    const record=encryptAuditReplay(job(),'cli-test-key');
    const split=Math.ceil(record.data.length/2);
    const records=[0,1].map(part=>({event:'roofing_audit_replay',requestId:evidence.requestId,...record,part,total:2,data:record.data.slice(part*split,(part+1)*split)}));
    const file=path.join(directory,'logs.jsonl');
    fs.writeFileSync(file,records.map(record=>JSON.stringify({type:'log',data:{message:JSON.stringify(record)}})).join('\n'));
    const args=['--conditions=react-server',path.join(root,'scripts/replay-roofing-audit.cjs'),file,evidence.requestId,'--dry-run'];
    const env={...process.env,GHL_AUDIT_REPLAY_SECRET:'cli-test-key'};
    const good=spawnSync(process.execPath,args,{env,encoding:'utf8'});
    assert.equal(good.status,0,good.stderr);
    assert.match(good.stdout,/roofing_audit_replay_validated/);
    assert.doesNotMatch(good.stdout+good.stderr,/demo@example.com|Demo Roofing|192\.0\.2\.1/);
    fs.writeFileSync(file,JSON.stringify(records[0]));
    const incomplete=spawnSync(process.execPath,args,{env,encoding:'utf8'});
    assert.equal(incomplete.status,1);
    assert.doesNotMatch(incomplete.stdout+incomplete.stderr,/demo@example.com|cli-test-key/);
  } finally { fs.rmSync(directory,{recursive:true,force:true}); }
});

test('all form options map to the exact fixed GHL labels, including ASCII volume ranges', () => {
  const allowed={
    roofingService:['Roof replacements','Roof repairs & leaks','Storm damage','Commercial roofing','A mix of roofing services','Other roofing services'],
    lead_source:['Google Search or Maps','Referrals','Social media','Paid advertising','A mix of sources','Not sure'],
    monthly_inquiries:['0-10','11-25','26-50','51-100','100+','Not sure'],
    missed_inquiry_handling:['They get instant answers','Our team answers','We get back to them later','They reach voicemail','Some inquiries get missed'],
    inspection_booking:['They need to call us','We coordinate by text or email','They submit a request form','They choose a time online','There is no consistent process'],
    estimate_follow_up:['We usually wait for them','We follow up once','Our team follows up several times','Follow-up happens automatically','Not sure'],
  };
  for(const [key,labels] of Object.entries(allowed)) assert.deepEqual(Object.values(auditOptionLabels[key]),labels,key);
  for(const q of roofingAuditQuestions) assert.deepEqual(Object.keys(auditOptionLabels[q.key]),q.options.map(o=>o.value));
  assert.deepEqual(Object.keys(auditOptionLabels.roofingService),roofingServices.map(s=>s.value));
});

test('all 23 fields use the supplied IDs and save compact report, source, UTMs and consent', () => {
  const fields=buildAuditCustomFields(job());
  assert.equal(fields.length,23);
  const byId=Object.fromEntries(fields.map(f=>[f.id,f.field_value]));
  assert.equal(byId['2F6wpI6dxrSrGUObjGjv'],'Roof repairs & leaks');
  assert.equal(byId['QX96xG1bt41Bi5SBntih'],'11-25');
  assert.equal(byId['84tINOq71KPmu4lpdaMR'],'test');
  assert.equal(byId['bhLVbxip1TU1exDwKCdZ'],'cpc');
  assert.equal(byId['3qdvLTXvq1MOJe509il0'],'audit');
  assert.equal(byId['Yk1DK4L5KQz1macc16uq'],'2026-11-19');
  assert.equal(byId['dhCyMcdVYU1c0Gm6Wavd'],'Yes');
  assert.equal(byId['xcNNml0lkY71ZshwbVkl'],'No');
  assert.equal(byId['PUTGqy22Krmb0ZqtJvmM'],'No');
  assert.equal(byId[auditFieldIds.summary],job().report.opportunities.map(o=>`${o.severity}: ${o.id}`).join(' | '));
  assert.equal(byId[auditFieldIds.opportunity1],`${job().report.opportunities[0].severity} - ${job().report.opportunities[0].title}`);
  assert.ok(fields.every(f=>f.field_value!==''));
});

test('completion date handles New York midnight and daylight savings', () => {
  assert.equal(completionDate('2026-11-20T04:59:00Z'),'2026-11-19');
  assert.equal(completionDate('2026-11-20T05:00:00Z'),'2026-11-20');
  assert.equal(completionDate('2026-07-20T03:59:00Z'),'2026-07-19');
  assert.equal(completionDate('2026-07-20T04:00:00Z'),'2026-07-20');
});

test('normalizes email, state, website and valid US phone; omits empty or invalid phone', () => {
  const normalized=buildRoofingContact(job({contact:{...input.contact,phone:'(202) 555-0123'}}),'location');
  assert.equal(normalized.email,'demo@example.com'); assert.equal(normalized.phone,'+12025550123');
  assert.equal(normalized.state,'FL'); assert.equal(normalized.website,'https://example.com/');
  assert.equal(normalized.source,'Free Growth Audit - Roofing'); assert.equal(normalized.tags,undefined);
  const omitted=buildRoofingContact(job({business:{...input.business,website:''},contact:{...input.contact,phone:'123'}}),'location');
  assert.equal(omitted.phone,undefined); assert.equal(omitted.website,undefined);
  assert.doesNotMatch(JSON.stringify(omitted),/websiteTrap/);
});

test('SMS consent requires a valid phone, not just non-empty text', () => {
  for(const phone of ['', '123', 'not-a-phone']) for(const key of ['smsNonMarketingConsent','smsMarketingConsent'])
    assert.throws(()=>job({contact:{...input.contact,phone,[key]:true}}),/phone/);
});

test('consent evidence uses exact shared copy and trusted server metadata', () => {
  const request=new Request('https://www.botpager.com/api/audit',{headers:{'x-forwarded-for':'192.0.2.1, 10.0.0.1','user-agent':'Example agent'}});
  const captured=captureAuditEvidence(request); assert.equal(captured.ip,'192.0.2.1');assert.equal(captured.userAgent,'Example agent');
  const text=buildAuditConsentEvidence(job());
  for(const copy of Object.values(auditConsent)) assert.ok(text.includes(`"${copy}"`));
  assert.match(text,/form version test-sha/); assert.match(text,/SMS marketing consent: No/); assert.match(text,/Phone provided: none/);
  assert.equal(captureAuditEvidence(new Request('https://example.com',{headers:{'x-forwarded-for':'not-an-ip'}})).ip,'');
});

test('creates a contact, adds tags, opens the specified stage and saves the full report', async () => {
  const result=await sync(); assert.equal(result.ok,true); assert.equal(contacts.size,1); assert.equal(opportunities.length,1);
  assert.equal(opportunities[0].pipelineStageId,'new-stage'); assert.equal(opportunities[0].monetaryValue,0);assert.equal(opportunities[0].assignedTo,undefined);
  assert.deepEqual([...tags],['existing-customer','auditoria-roofing']);
  assert.match(notes[0].body,/Recommended action:/);assert.match(notes[0].body,/How do homeowners schedule/);
  assert.equal(calls.some(call=>call.method==='DELETE'||call.path.includes('/workflow/')||call.path.includes('/conversations/')),false);
});

test('resubmission updates the contact and preserves an existing opportunity stage', async () => {
  const first=await sync(); opportunities[0].pipelineStageId='qualified-stage';
  const updated=job({answers:{...input.answers,monthly_inquiries:'51-100'}});updated.evidence={...evidence,requestId:'resubmission'};
  const second=await sync(updated);
  assert.equal(second.contactId,first.contactId);assert.equal(second.opportunityId,first.opportunityId);
  assert.equal(contacts.size,1);assert.equal(opportunities.length,1);assert.equal(opportunities[0].pipelineStageId,'qualified-stage');
  assert.equal(calls.some(call=>call.method==='PUT'),false);
  assert.equal(contacts.get('demo@example.com').customFields.find(f=>f.id===auditFieldIds.monthly_inquiries).field_value,'51-100');
});

test('replaying the same job does not duplicate an opportunity or report note', async () => {
  await sync();await sync();assert.equal(opportunities.length,1);assert.equal(notes.length,1);
});

test('concurrent submissions for one contact are serialized', async () => {
  const results=await Promise.all([sync(),sync()]);assert.ok(results.every(r=>r.ok));assert.equal(opportunities.length,1);
});

test('existing closed opportunity does not prevent searching for a new open opportunity', async () => {
  opportunities.push({id:'old',contactId:'contact-1',pipelineId:'pipeline',pipelineStageId:'won-stage',status:'won'});
  assert.equal((await sync()).ok,true);assert.equal(opportunities.length,2);assert.equal(opportunities[0].status,'won');
});

test('SMS tags are additive and later unchecked boxes only update consent fields', async () => {
  await sync(job({contact:{...input.contact,phone:'+12025550123',smsNonMarketingConsent:true,smsMarketingConsent:true}}));
  assert.ok(tags.has('sms-consent-transactional'));assert.ok(tags.has('sms-consent-marketing'));
  await sync();assert.ok(tags.has('sms-consent-marketing'));
  const fields=contacts.get('demo@example.com').customFields;
  assert.equal(fields.find(f=>f.id===auditFieldIds.smsMarketingConsent).field_value,'No');
  assert.equal(calls.some(c=>c.method==='DELETE'),false);
});

test('optional assigned user is included only when configured', async () => {
  process.env.GHL_ASSIGNED_USER_ID='assigned-user';await sync();assert.equal(opportunities[0].assignedTo,'assigned-user');
});

test('legacy token is reused and dedicated override takes precedence', () => {
  assert.equal(getAuditGhlConfig().token,'test-token-never-log');
  process.env.GHL_PRIVATE_TOKEN='override';assert.equal(getAuditGhlConfig().token,'override');
});

test('429 honors Retry-After; 5xx retries at 1, 2 and 4 seconds', async () => {
  let attempt=0;
  const r={...runtime,fetch:async()=>++attempt<4?Response.json({traceId:'trace-1'},{status:attempt===1?429:503,headers:{'Retry-After':'3'}}):Response.json({ok:true})};
  await auditGhlRequest(getAuditGhlConfig(),'/contacts/upsert',{method:'POST'},'test',r);
  assert.deepEqual(delays,[3000,2000,4000]);assert.equal(attempt,4);
  assert.equal(retryAfterMs(new Date(10_000).toUTCString(),5000),5000);
});

test('does not retry 400, 401, 403 or 422 and preserves only safe error metadata', async () => {
  for(const status of [400,401,403,422]) {
    let attempts=0;
    await assert.rejects(auditGhlRequest(getAuditGhlConfig(),'/contacts/upsert',{method:'POST'},'upsert_contact',{...runtime,fetch:async()=>{attempts++;return Response.json({message:'demo@example.com test-token-never-log',traceId:'trace-safe'},{status});}}), error=>error.status===status&&error.traceId==='trace-safe'&&!error.message.includes('demo@example.com'));
    assert.equal(attempts,1);
  }
});

test('long Retry-After defers replay instead of retrying early', async () => {
  let attempts=0;
  await assert.rejects(auditGhlRequest(getAuditGhlConfig(),'/contacts/upsert',{method:'POST'},'test',{...runtime,fetch:async()=>{attempts++;return Response.json({},{status:429,headers:{'Retry-After':'600'}});}},30_000),error=>error.code==='RETRY_DEFERRED');
  assert.equal(attempts,1);assert.equal(delays.length,0);
});

test('ambiguous create failure reconciles before retry and does not create a duplicate', async () => {
  let failed=false;
  intercept=async call=>{
    if(call.path==='/opportunities/'&&!failed){failed=true;opportunities.push({id:'already-created',...call.body});return Response.json({traceId:'ambiguous'},{status:503});}
  };
  const result=await sync();assert.equal(result.ok,true);assert.equal(result.opportunityId,'already-created');
  assert.equal(calls.filter(c=>c.path==='/opportunities/').length,1);
});

test('GHL duplicate-race response preserves the existing opportunity', async () => {
  intercept=async call=>{
    if(call.path==='/opportunities/'){opportunities.push({id:'race-winner',...call.body,pipelineStageId:'qualified'});return Response.json({code:'OPPORTUNITY_NO_DUPLICATE'},{status:400});}
  };
  const result=await sync();assert.equal(result.ok,true);assert.equal(result.opportunityId,'race-winner');assert.equal(opportunities[0].pipelineStageId,'qualified');
});

test('failures produce encrypted replay records without plaintext PII or tokens', async () => {
  intercept=async()=>Response.json({traceId:'trace-503',message:'demo@example.com'},{status:503});
  const result=await sync();assert.equal(result.ok,false);
  assert.equal(calls.length,4);assert.deepEqual(delays,[1000,2000,4000]);
  const output=JSON.stringify(logs);
  for(const privateValue of ['demo@example.com','test-token-never-log','192.0.2.1','Demo Roofing','Test browser']) assert.ok(!output.includes(privateValue));
  assert.ok(logs.some(l=>l.event==='roofing_audit_sync_failed'&&l.traceId==='trace-503'));
  const chunks=logs.filter(l=>l.event==='roofing_audit_replay').sort((a,b)=>a.part-b.part);
  assert.ok(chunks.length>0);assert.equal(chunks.length,chunks[0].total);
  const decoded=decryptAuditReplay({...chunks[0],data:chunks.map(c=>c.data).join('')},'test-token-never-log');
  assert.deepEqual(decoded,job());
});

test('replay encryption authenticates the key and ciphertext', () => {
  const encrypted=encryptAuditReplay(job(),'stable-recovery-secret');
  assert.deepEqual(decryptAuditReplay(encrypted,'stable-recovery-secret'),job());
  assert.throws(()=>decryptAuditReplay(encrypted,'wrong-key'));
  assert.throws(()=>decryptAuditReplay({...encrypted,tag:Buffer.alloc(16).toString('base64')},'stable-recovery-secret'));
});

test('honeypot skips all CRM work; missing consent and invalid SMS phone return 400', async () => {
  global.fetch=mockFetch;
  for(const [contact,status] of [[{...input.contact,websiteTrap:'spam'},200],[{...input.contact,consent:false},400],[{...input.contact,smsMarketingConsent:true,phone:''},400],[{...input.contact,smsMarketingConsent:true,phone:'123'},400]]) {
    const response=await POST(new Request('http://localhost/api/audit',{method:'POST',body:JSON.stringify({...input,contact})}));
    assert.equal(response.status,status);
  }
  assert.equal(tasks.length,0);assert.equal(calls.length,0);
});

test('API responds with the report before any GHL call, even with a rejected token', async () => {
  global.fetch=async()=>Response.json({traceId:'trace-auth'},{status:401});
  const messages=[],info=console.info;console.info=value=>messages.push(value);
  try {
    const response=await POST(new Request('http://localhost/api/audit',{method:'POST',body:JSON.stringify(input)}));
    const result=await response.json();assert.equal(response.status,200);assert.equal(result.report.opportunities.length,3);assert.equal(result.delivery,'processing');assert.equal(tasks.length,1);
    assert.equal(messages.length,0);await tasks[0]();
    assert.ok(messages.some(value=>value.includes('roofing_audit_sync_failed')));assert.doesNotMatch(JSON.stringify(result),/trace-auth|GHL|token/i);
  } finally {console.info=info;}
});
