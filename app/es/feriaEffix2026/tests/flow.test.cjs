const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '../../../..');

// Test-only TypeScript loader: no generated files or production credentials.
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
const originalResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) { return originalResolve.call(this, request.startsWith('@/') ? path.join(root, request.slice(2)) : request, ...args); };
const originalLoad = Module._load;
Module._load = function(request, ...args) { if (request === 'server-only') return {}; if (request === '@/lib/integrations/highlevel') return { getConfig: (locationId) => ({ token: 'test', locationId, userId: 'user', apiVersion: 'v3' }), highLevelRequest: mockRequest }; return originalLoad.call(this, request, ...args); };

const { campaign, campaignOpen } = require('../_lib/config.ts');
const { parseLead, validTimezone, safeUrl } = require('../_lib/validation.ts');
const { saveLead, receipt, book, coordinate, settings } = require('../_lib/server.ts');
const { effixCrm, firstEffixStage, getEffixConfig } = require('../_lib/crm.ts');
const { readRequest } = require('../_lib/http.ts');
const realNow = Date.now;
const now = Date.parse('2026-10-15T10:00:00-05:00');
const slot = '2026-10-16T10:00:00-05:00';
const input = { name: '  Ana   Pérez  ', business: 'Negocio de prueba', phone: '3001234567', country: 'CO', sector: 'servicios', goal: 'cotizar', consent: true, marketing: false, operationId: 'f6737ba2-8047-423b-bfc2-3d369afae7d2', websiteTrap: '', tracking: { utm_medium: 'nfc', tag_id: 'gus_01' } };
let state;

test.beforeEach(() => {
  Date.now = () => now;
  Object.assign(process.env, { EFFIX_ENABLED: 'true', EFFIX_PRIVACY_APPROVED: 'true', EFFIX_RECEIPT_SECRET: 'test-only-secret-with-at-least-32-characters', GHL_USER_ID: 'user', GHL_EFFIX_PIPELINE_ID: 'pipeline', GHL_EFFIX_STAGE_NEW_ID: 'new', GHL_EFFIX_STAGE_BENEFIT_ID: 'benefit', GHL_EFFIX_STAGE_BOOKED_ID: 'booked', GHL_EFFIX_STAGE_COORDINATION_ID: 'coordinate', GHL_EFFIX_CALENDAR_ID: 'calendar', EFFIX_CALENDAR_REQUIRES_EMAIL: 'false', EFFIX_SELLERS_JSON: '{"gus_01":"Gustavo"}', GHL_EFFIX_FIELDS_JSON: '{"business":"field-business","marketing_consent":"field-marketing"}' });
  state = { pipelines: [{ id: effixCrm.pipelineId, stages: [{ id: 'new', position: 0 }, { id: 'benefit', position: 1 }] }], opportunities: [], notes: [], tasks: [], events: [], calls: [], slots: [slot], fail: '', failed: false };
});
test.afterEach(() => { Date.now = realNow; });

async function mockRequest(config, target, init) {
  const url = new URL(target, 'https://mock.test'), method = init.method;
  const body = init.body ? JSON.parse(init.body) : {};
  state.calls.push({ path: url.pathname, method, body, query: Object.fromEntries(url.searchParams), locationId: config.locationId });
  if (state.fail === `${method}:${url.pathname}` && !state.failed) { state.failed = true; throw new Error('Simulated upstream failure'); }
  if (url.pathname === '/contacts/upsert') return { contact: { id: 'contact' } };
  if (url.pathname === '/opportunities/pipelines') return { pipelines: state.pipelines };
  if (url.pathname === '/opportunities/search') return { opportunities: state.opportunities };
  if (url.pathname === '/opportunities/' && method === 'POST') { const opportunity = { id: `opp-${state.opportunities.length + 1}`, ...body }; state.opportunities.push(opportunity); return { opportunity }; }
  if (url.pathname.startsWith('/opportunities/')) { const opportunity = state.opportunities.find(item => item.id === url.pathname.split('/').at(-1)); assert.ok(opportunity); if (method === 'PUT') Object.assign(opportunity, body); return { opportunity }; }
  if (url.pathname.endsWith('/notes')) { if (method === 'GET') return { notes: state.notes }; const note = { id: `note-${state.notes.length + 1}`, ...body }; state.notes.push(note); return { note }; }
  if (url.pathname.endsWith('/tags')) return {};
  if (url.pathname.endsWith('/free-slots')) return { '2026-10-16': { slots: state.slots } };
  if (url.pathname.endsWith('/appointments') && method === 'GET') return { events: state.events.map(({ id, title, calendarId, startTime, endTime, description }) => ({ id, title, calendarId, startTime, endTime, notes: description, status: 'booked' })) };
  if (url.pathname === '/calendars/events/appointments' && method === 'POST') { const event = { id: `event-${state.events.length + 1}`, address: 'https://meet.google.com/test-room', ...body }; state.events.push(event); return event; }
  if (url.pathname.startsWith('/calendars/events/appointments/')) return { event: state.events.find(item => item.id === url.pathname.split('/').at(-1)) };
  if (url.pathname.endsWith('/tasks')) { if (method === 'GET') return { tasks: state.tasks }; const task = { id: `task-${state.tasks.length + 1}`, ...body }; state.tasks.push(task); return { task }; }
  if (url.pathname === '/contacts/contact' && method === 'PUT') return { contact: { id: 'contact', ...body } };
  throw new Error(`Unmocked call: ${method} ${url.pathname}`);
}

test('50% aprobado y ventana exacta de Colombia', () => {
  assert.equal(campaign.discount, 50); assert.equal(campaign.code, 'EFFIX50');
  assert.equal(campaignOpen(Date.parse('2026-10-14T04:59:59Z')), false);
  assert.equal(campaignOpen(Date.parse('2026-10-14T05:00:00Z')), true);
  assert.equal(campaignOpen(Date.parse('2026-10-21T04:59:59Z')), true);
  assert.equal(campaignOpen(Date.parse('2026-10-21T05:00:00Z')), false);
});
test('normaliza WhatsApp colombiano y mantiene marketing opcional', () => {
  const lead = parseLead(input); assert.equal(lead.phone, '+573001234567'); assert.equal(lead.name, 'Ana Pérez'); assert.equal(lead.marketing, false);
  assert.equal(parseLead({ ...input, phone: '+573001234567' }).phone, lead.phone);
});
test('rechaza teléfonos inválidos, país incorrecto y autorización ausente', () => {
  for (const changes of [{ phone: '123' }, { phone: '+12025550123' }, { consent: false }, { sector: 'inventado' }, { goal: 'inventado' }, { operationId: 'falso' }, { country: 'OTHER', phone: '3001234567' }]) assert.throws(() => parseLead({ ...input, ...changes }));
  assert.equal(parseLead({ ...input, country: 'OTHER', phone: '+12025550123' }).phone, '+12025550123');
});
test('valida zona horaria y enlaces HTTPS; limita atribución', () => {
  assert.equal(validTimezone('America/Bogota'), 'America/Bogota'); assert.throws(() => validTimezone('Mars/Nowhere'));
  assert.equal(safeUrl('javascript:alert(1)'), undefined); assert.equal(safeUrl('https://user:password@example.com'), undefined);
  assert.deepEqual(parseLead({ ...input, tracking: { utm_source: 'effix', email: 'private@example.com', utm_content: 'texto libre' } }).tracking, { utm_source: 'effix' });
});
test('no activa sin configuración ni fuera de fechas', async () => {
  process.env.EFFIX_ENABLED = 'false'; assert.equal(settings().live, false); await assert.rejects(saveLead(parseLead(input))); assert.equal(state.calls.length, 0);
  process.env.EFFIX_ENABLED = 'true'; Date.now = () => Date.parse('2026-10-21T05:00:00Z'); await assert.rejects(saveLead(parseLead(input))); assert.equal(state.calls.length, 0);
});
test('CRM conserva la primera etapa y guarda consentimiento antes de activar; recibo firmado', async () => {
  const saved = await saveLead(parseLead(input)); assert.equal(saved.benefit, true); assert.equal(state.opportunities[0].pipelineStageId, 'new');
  const snapshot = JSON.parse(state.notes[0].body.split('\n').slice(1).join('\n'));
  assert.equal(snapshot.marketingConsent.granted, false); assert.equal(snapshot.tracking.vendedor, 'Gustavo'); assert.equal(snapshot.benefit.code, 'EFFIX50');
  const createdIndex = state.calls.findIndex(item => item.path === '/opportunities/' && item.method === 'POST');
  assert.equal(state.calls[createdIndex].body.pipelineStageId, 'new');
  const noteIndex = state.calls.findIndex(item => item.path.endsWith('/notes') && item.method === 'POST');
  const tagIndex = state.calls.findIndex(item => item.path.endsWith('/tags')); assert.ok(noteIndex < tagIndex);
  assert.equal(state.calls.some(item => item.method === 'PUT' && item.body.pipelineStageId), false);
  assert.equal(receipt(saved.receipt).opportunityId, 'opp-1'); assert.throws(() => receipt(saved.receipt + 'tampered')); Date.now = () => now + 25 * 3600_000; assert.throws(() => receipt(saved.receipt));
});
test('reintentos no duplican oportunidad ni nota; mismo teléfono permite varios negocios', async () => {
  await Promise.all([saveLead(parseLead(input)), saveLead(parseLead(input))]); assert.equal(state.opportunities.length, 1); assert.equal(state.notes.length, 1);
  await saveLead(parseLead({ ...input, business: 'NEGOCIO DE PRUEBA' })); assert.equal(state.opportunities.length, 1);
  await saveLead(parseLead({ ...input, business: 'Segundo negocio', operationId: '90be15c9-6097-4f5a-b706-1d5b39bdf2e5' })); assert.equal(state.opportunities.length, 2);
});
test('fallo de nota conserva Nuevo y reintento recupera sin duplicar', async () => {
  state.fail = 'POST:/contacts/contact/notes'; await assert.rejects(saveLead(parseLead(input))); assert.equal(state.opportunities[0].pipelineStageId, 'new');
  await saveLead(parseLead(input)); assert.equal(state.opportunities.length, 1); assert.equal(state.notes.length, 1); assert.equal(state.opportunities[0].pipelineStageId, 'new');
});
test('reserva real de 15 minutos y reintento devuelve misma cita', async () => {
  const saved = await saveLead(parseLead(input)), data = receipt(saved.receipt);
  const first = await book(data, { startTime: slot, timezone: 'America/Bogota' }); assert.equal(first.booking.id, 'event-1'); assert.equal(first.booking.meetingUrl, 'https://meet.google.com/test-room');
  assert.equal(Date.parse(first.booking.endTime) - Date.parse(first.booking.startTime), 900_000); assert.equal(state.opportunities[0].pipelineStageId, 'booked');
  const second = await book(data, { startTime: slot, timezone: 'America/Bogota' }); assert.equal(second.booking.id, first.booking.id); assert.equal(state.events.length, 1);
  const creation = state.calls.find(item => item.path === '/calendars/events/appointments' && item.method === 'POST'); assert.equal(creation.body.ignoreFreeSlotValidation, false); assert.equal(creation.body.ignoreDateRange, false);
});
test('horario ocupado y fallo de reserva no confirman cita', async () => {
  const data = receipt((await saveLead(parseLead(input))).receipt); state.slots = []; await assert.rejects(book(data, { startTime: slot, timezone: 'America/Bogota' })); assert.equal(state.events.length, 0);
  state.slots = [slot]; state.fail = 'POST:/calendars/events/appointments'; await assert.rejects(book(data, { startTime: slot, timezone: 'America/Bogota' })); assert.equal(state.opportunities[0].pipelineStageId, 'new');
});
test('correo se solicita solo al reservar cuando hace falta', async () => {
  const data = receipt((await saveLead(parseLead(input))).receipt); process.env.EFFIX_CALENDAR_REQUIRES_EMAIL = 'true';
  await assert.rejects(book(data, { startTime: slot, timezone: 'America/Bogota' })); assert.equal(state.events.length, 0);
  await book(data, { startTime: slot, timezone: 'America/Bogota', email: 'test@example.com', website: 'https://example.com' }); assert.equal(state.events.length, 1);
  assert.ok(state.calls.some(item => item.path === '/contacts/contact' && item.body.email === 'test@example.com'));
});
test('cita guardada sigue confirmada si falla sincronización de etapa', async () => {
  const data = receipt((await saveLead(parseLead(input))).receipt); state.fail = 'PUT:/opportunities/opp-1'; const result = await book(data, { startTime: slot, timezone: 'America/Bogota' }); assert.equal(result.booking.id, 'event-1'); assert.equal(result.stageSynced, false);
});
test('coordinar crea una tarea única, nunca una cita; falla sin éxito falso', async () => {
  const data = receipt((await saveLead(parseLead(input))).receipt); state.fail = 'POST:/contacts/contact/tasks'; await assert.rejects(coordinate(data)); assert.equal(state.tasks.length, 0);
  const first = await coordinate(data), second = await coordinate(data); assert.equal(first.taskId, second.taskId); assert.equal(state.tasks.length, 1); assert.equal(state.events.length, 0); assert.equal(state.opportunities[0].pipelineStageId, 'coordinate');
});
test('volver a registrar no retrocede una oportunidad con demo agendada', async () => {
  const data = receipt((await saveLead(parseLead(input))).receipt); await book(data, { startTime: slot, timezone: 'America/Bogota' }); await saveLead(parseLead(input)); assert.equal(state.opportunities[0].pipelineStageId, 'booked'); await assert.rejects(coordinate(data)); assert.equal(state.tasks.length, 0);
});
test('rechaza solicitudes externas, JSON inválido y cuerpos demasiado grandes', async () => {
  const request = (body, headers = {}) => new Request('https://botpager.com/es/feriaEffix2026/api/lead', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body });
  await assert.rejects(readRequest(request('{}', { origin: 'https://other.example.com' })));
  await assert.rejects(readRequest(request('not json')));
  await assert.rejects(readRequest(request(JSON.stringify({ value: 'a'.repeat(13_000) }))));
  assert.deepEqual(await readRequest(request('{"ok":true}', { origin: 'https://botpager.com' })), { ok: true });
  const proxied = new Request('http://localhost:3000/es/feriaEffix2026/api/lead', { method: 'POST', headers: { host: '127.0.0.1:3000', origin: 'http://127.0.0.1:3000', 'content-type': 'application/json' }, body: '{}' });
  assert.deepEqual(await readRequest(proxied), {});
});

test('recorrido conjunto admite negocio de un carácter y no inventa sector u objetivo', () => {
  const joint = parseLead({ ...input, origin: 'groovy-botpager', business: 'A', sector: undefined, goal: undefined });
  assert.equal(joint.business, 'A'); assert.equal(joint.sector, undefined); assert.equal(joint.goal, undefined);
  assert.equal(parseLead({ ...input, origin: 'groovy-botpager', business: 'a'.repeat(50) }).business.length, 50);
  assert.throws(() => parseLead({ ...input, origin: 'groovy-botpager', business: 'a'.repeat(51) }));
  assert.throws(() => parseLead({ ...input, sector: undefined, goal: undefined }));
});
test('recorrido conjunto guarda interés sin promoción, sin tags y sin cerrar ventas', async () => {
  Date.now = () => Date.parse('2026-10-13T12:00:00-05:00');
  delete process.env.GHL_EFFIX_STAGE_BENEFIT_ID;
  const saved = await saveLead(parseLead({ ...input, origin: 'groovy-botpager', sector: undefined, goal: undefined }));
  assert.equal(saved.benefit, false); assert.equal(receipt(saved.receipt).benefit, false);
  assert.equal(state.opportunities[0].status, 'open'); assert.equal(state.opportunities[0].pipelineStageId, 'new');
  const note = JSON.parse(state.notes[0].body.split('\n').slice(1).join('\n'));
  assert.equal(note.interest, 'Groovy + BotPager: recorrido completo'); assert.equal(note.sector, undefined); assert.equal(note.objective, undefined); assert.equal(note.benefit, undefined);
  assert.equal(note.tracking.vendedor, 'Gustavo'); assert.match(note.contactConsent.text, /Groovy \+ BotPager/);
  assert.equal(state.calls.some(call => call.path.endsWith('/tags')), false);
});
test('recorrido conjunto recupera un fallo y reutiliza agenda y coordinación firmadas', async () => {
  const joint = parseLead({ ...input, origin: 'groovy-botpager', sector: undefined, goal: undefined });
  state.fail = 'POST:/contacts/contact/notes'; await assert.rejects(saveLead(joint));
  const saved = await saveLead(joint); await saveLead(joint);
  assert.equal(state.opportunities.length, 1); assert.equal(state.notes.length, 1);
  const data = receipt(saved.receipt); await coordinate(data); assert.equal(state.tasks.length, 1);
  const result = await book(data, { startTime: slot, timezone: 'America/Bogota' }); assert.equal(result.booking.id, 'event-1');
  await saveLead(joint); assert.equal(state.opportunities[0].pipelineStageId, 'booked');
});

test('usa la subcuenta y pipeline indicados sin IDs de etapa configurados', async () => {
  delete process.env.GHL_EFFIX_PIPELINE_ID;
  delete process.env.GHL_EFFIX_STAGE_NEW_ID;
  delete process.env.GHL_EFFIX_STAGE_BENEFIT_ID;
  assert.equal(settings().live, true);
  await saveLead(parseLead({ ...input, origin: 'groovy-botpager', sector: undefined, goal: undefined }));
  assert.equal(state.opportunities[0].pipelineId, '4o6WiPB5RnPKn70WzABN');
  assert.equal(state.opportunities[0].locationId, 'ue94rPvevtVT7o7wCQt2');
  const lookup = state.calls.find(call => call.path === '/opportunities/pipelines');
  assert.equal(lookup.query.locationId, 'ue94rPvevtVT7o7wCQt2');
  assert.ok(state.calls.every(call => call.locationId === effixCrm.locationId));
});

test('reutiliza el token existente sin cambiar la ubicación del resto de BotPager', () => {
  const { getConfig } = require(path.join(root, 'lib/integrations/highlevel.ts'));
  const original = { token: process.env.GHL_PRIVATE_INTEGRATION_TOKEN, locationId: process.env.GHL_LOCATION_ID };
  try {
    process.env.GHL_PRIVATE_INTEGRATION_TOKEN = 'existing-botpager-token';
    process.env.GHL_LOCATION_ID = 'other-default-location';
    assert.equal(getConfig().locationId, 'other-default-location');
    const config = getConfig(effixCrm.locationId);
    assert.equal(config.locationId, effixCrm.locationId);
    assert.equal(config.token, 'existing-botpager-token');
    delete process.env.GHL_LOCATION_ID;
    assert.equal(getConfig(effixCrm.locationId).locationId, effixCrm.locationId);
    delete process.env.GHL_PRIVATE_INTEGRATION_TOKEN;
    assert.equal(getConfig(effixCrm.locationId), null);
  } finally {
    for (const [key, value] of [['GHL_PRIVATE_INTEGRATION_TOKEN', original.token], ['GHL_LOCATION_ID', original.locationId]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('crea en la primera posición aunque las etapas lleguen desordenadas', async () => {
  state.pipelines.unshift({ id: 'unrelated-pipeline', stages: [{ id: 'wrong', position: 0 }] });
  state.pipelines[1].stages = [{ id: 'last', position: 10 }, { id: 'middle', position: 3 }, { id: 'actual-first', position: 0 }];
  await saveLead(parseLead(input));
  assert.equal(state.opportunities[0].pipelineStageId, 'actual-first');
  assert.equal(state.calls.some(call => call.method === 'PUT' && call.body.pipelineStageId), false);
});

test('consulta el orden actual en cada registro y no retrocede una oportunidad existente', async () => {
  const data = receipt((await saveLead(parseLead(input))).receipt);
  await book(data, { startTime: slot, timezone: 'America/Bogota' });
  state.pipelines[0].stages.unshift({ id: 'new-first', position: -1 });
  await saveLead(parseLead(input));
  assert.equal(state.opportunities[0].pipelineStageId, 'booked');
  await saveLead(parseLead({ ...input, business: 'Otra empresa' }));
  assert.equal(state.opportunities[1].pipelineStageId, 'new-first');
});

test('resuelve posiciones numéricas, claves de orden y orden de API sin posición', async () => {
  for (const stages of [
    [{ id: 'later', position: '10' }, { id: 'first', position: '2' }],
    [{ id: 'later', position: 'a1' }, { id: 'first', position: 'a0' }],
    [{ id: 'first' }, { id: 'later' }],
  ]) {
    state.pipelines[0].stages = stages;
    assert.equal(await firstEffixStage(getEffixConfig()), 'first');
  }
});

test('no crea contactos si falla la consulta, falta el pipeline o su primera etapa', async () => {
  const cases = [[], [{ id: 'wrong-pipeline', stages: [{ id: 'wrong' }] }], [{ id: effixCrm.pipelineId, stages: [] }], [{ id: effixCrm.pipelineId, stages: [{ id: '' }, { id: 'later' }] }]];
  for (const pipelines of cases) {
    state.pipelines = pipelines;
    await assert.rejects(saveLead(parseLead(input)));
  }
  state.fail = 'GET:/opportunities/pipelines';
  await assert.rejects(saveLead(parseLead(input)));
  assert.equal(state.calls.some(call => call.method === 'POST'), false);
});
