const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const root = path.join(__dirname, '..');
const read = file => readFileSync(path.join(root, file), 'utf8');
const noop = () => {};
function evaluate(source, globals = {}) {
  const testModule = { exports: {} };
  const context = vm.createContext({ module: testModule, exports: testModule.exports, ...globals });
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  });
  vm.runInContext(compiled.outputText, context);
  return { api: testModule.exports, context };
}
function pixel(globals = {}, id) {
  return evaluate(read('lib/metaPixel.ts'), {
    process: { env: { NEXT_PUBLIC_META_PIXEL_ID: id } }, ...globals,
  });
}

test('base snippet initializes the configured pixel and sends exactly one initial PageView', () => {
  for (const [configured, expected] of [[undefined, '2358653438293907'], ['', '2358653438293907'], ['123456', '123456']]) {
    const inserted = [];
    const { api, context } = pixel({ document: {
      createElement: tag => ({ tag }),
      getElementsByTagName: () => [{ parentNode: { insertBefore: script => inserted.push(script) } }],
    } }, configured);
    context.window = context;
    vm.runInContext(api.META_PIXEL_BASE_CODE, context);
    assert.equal(api.META_PIXEL_ID, expected);
    assert.deepEqual(Array.from(context.fbq.queue, args => Array.from(args)), [
      ['init', expected], ['track', 'PageView'],
    ]);
    assert.equal(inserted.length, 1);
    assert.equal(inserted[0].src, 'https://connect.facebook.net/en_US/fbevents.js');
    assert.equal(inserted[0].async, true);
  }
});

test('route tracking skips initial/repeated effects and tracks pathname, query and back navigation', () => {
  const calls = [];
  const { api } = pixel({ window: { fbq: (...args) => calls.push(args) } });
  const tracker = api.createPageViewTracker();
  tracker.visit('/?'); // No duplicate while the afterInteractive script is still pending.
  tracker.initialize('/industries/roofing?utm_source=meta');
  tracker.visit('/industries/roofing?utm_source=meta');
  tracker.visit('/industries/roofing?utm_source=meta');
  assert.equal(calls.length, 0);
  tracker.visit('/free-growth-audit?');
  tracker.visit('/free-growth-audit?');
  tracker.initialize('/free-growth-audit?'); // Repeated onReady must not reset history.
  tracker.visit('/free-growth-audit?step=2');
  tracker.visit('/industries/roofing?utm_source=meta');
  assert.deepEqual(calls, Array.from({ length: 3 }, () => ['track', 'PageView']));
});

test('trackEvent is safe during SSR, with a blocked SDK, or when the SDK throws', () => {
  for (const globals of [{}, { window: {} }, { window: { fbq: () => { throw new Error('blocked'); } } }]) {
    assert.doesNotThrow(() => pixel(globals).api.trackEvent('Lead'));
  }
  const calls = [];
  const { api } = pixel({ window: { fbq: (...args) => calls.push(args) } });
  for (const name of ['Contact', 'Lead', 'Schedule']) api.trackEvent(name);
  api.trackEvent('ViewContent', { content_name: 'Roofing' });
  assert.deepEqual(calls, [
    ['track', 'Contact'], ['track', 'Lead'], ['track', 'Schedule'],
    ['track', 'ViewContent', { content_name: 'Roofing' }],
  ]);
});

test('component uses afterInteractive and renders the matching noscript fallback', () => {
  const { api: helper } = pixel({}, '123456');
  const scripts = [];
  const { api } = evaluate(read('components/MetaPixel.tsx'), { require: name => {
    if (name === '@/lib/metaPixel') return helper;
    if (name === 'next/script') return props => { scripts.push(props); return null; };
    if (name === 'next/navigation') return { usePathname: () => '/', useSearchParams: () => new URLSearchParams() };
    return require(name);
  } });
  const html = renderToStaticMarkup(React.createElement(api.MetaPixel));
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].id, 'meta-pixel');
  assert.equal(scripts[0].strategy, 'afterInteractive');
  assert.equal(scripts[0].children, helper.META_PIXEL_BASE_CODE);
  assert.match(html, /<noscript><img height="1" width="1" style="display:none" alt="" src="https:\/\/www.facebook.com\/tr\?id=123456&amp;ev=PageView&amp;noscript=1"\/><\/noscript>/);
});

test('delegated CTA clicks handle nested icons, skip disabled controls, and clean up', () => {
  const calls = [];
  const effects = [];
  const listeners = new Set();
  class Element {
    constructor(cta) { this.cta = cta; }
    closest(selector) { assert.equal(selector, '[data-meta-event="Contact"]'); return this.cta; }
  }
  const { api } = evaluate(read('components/MetaPixel.tsx'), {
    Element,
    document: {
      addEventListener: (name, handler, capture) => { assert.equal(name, 'click'); assert.equal(capture, true); listeners.add(handler); },
      removeEventListener: (name, handler) => listeners.delete(handler),
    },
    require: name => {
      if (name === '@/lib/metaPixel') return { ...pixel().api, trackEvent: (...args) => calls.push(args) };
      if (name === 'react') return { ...React, useEffect: effect => effects.push(effect), useState: initial => [typeof initial === 'function' ? initial() : initial, noop] };
      if (name === 'next/script') return () => null;
      if (name === 'next/navigation') return {};
      return require(name);
    },
  });
  api.MetaPixel();
  let cleanup = effects[0]();
  cleanup();
  cleanup = effects[0](); // Strict Mode setup/cleanup cycle leaves one listener.
  assert.equal(listeners.size, 1);
  const click = [...listeners][0];
  click({ target: new Element({ matches: () => false }) });
  click({ target: new Element({ matches: () => true }) });
  click({ target: new Element(null) });
  click({ target: {} });
  assert.deepEqual(calls, [['Contact']]);
  cleanup();
  assert.equal(listeners.size, 0);
});

// Execute the real submission handlers with stubbed APIs, without posting leads
// or bookings to the CRM or introducing a browser test dependency.
function handler(file, name, globals) {
  const source = ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let found;
  function visit(node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node;
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.ok(found, `${file}: ${name} exists`);
  return evaluate(`${found.getText(source)}\nmodule.exports = ${name};`, globals).api;
}

const fixtures = [
  { file: 'app/audit/audit-experience.tsx', name: 'submitAudit', event: 'Lead', payload: { ok: true, report: {} } },
  { file: 'app/growth-game/growth-game-experience.tsx', name: 'submitLead', event: 'Lead', payload: { ok: true, result: {} } },
  { file: 'app/visibility-audit/visibility-audit-experience.tsx', name: 'unlockReport', event: 'Lead', payload: { ok: true } },
  { file: 'components/latam-pages.tsx', name: 'submit', event: 'Lead', payload: { ok: true } },
  { file: 'app/es/feriaEffix2026/experience.tsx', name: 'submit', event: 'Lead', payload: { lead: { receipt: 'demo-receipt', benefit: true } } },
  { file: 'app/es/feriaEffix2026/experience.tsx', name: 'reserve', event: 'Schedule', payload: { booking: { id: 'demo-booking' } } },
  { file: 'app/es/experienciaEffix/contact.tsx', name: 'submit', event: 'Lead', payload: { lead: { receipt: 'demo-receipt' } } },
  { file: 'app/es/experienciaEffix/contact.tsx', name: 'reserve', event: 'Schedule', payload: { booking: { id: 'demo-booking' } } },
];
for (const fixture of fixtures) {
  test(`${fixture.file}: ${fixture.event} only after confirmed ${fixture.name}`, async () => {
    for (const outcome of ['success', 'http-error', 'missing-confirmation', 'network-error']) {
      const calls = [], pending = [], errors = [];
      const response = outcome === 'missing-confirmation' ? {} : fixture.payload;
      const globals = {
        trackEvent: (...args) => calls.push(args),
        fetch: async () => {
          if (outcome === 'network-error') throw new Error('offline');
          return { ok: outcome !== 'http-error', json: async () => response };
        },
        api: async () => {
          if (outcome === 'network-error' || outcome === 'http-error') throw new Error('request failed');
          return response;
        },
        run: action => { const task = action().catch(error => errors.push(error)); pending.push(task); return task; },
        contact: { name: 'Demo', firstName: 'Demo', businessName: 'Demo Roofing', email: 'demo@example.com', consent: true, phone: '' },
        fields: { business: 'Demo Roofing', email: 'demo@example.com' },
        business: {}, answers: {}, completedAnswers: {}, tracking: { current: {} },
        report: { sitePreview: {} }, lead: { consent: true }, reduceMotion: true,
        settings: { live: true }, reportGate: false, onComplete: noop,
        operation: { current: 'demo-operation' }, jointExperience: { origin: 'demo' }, sector: 'roofing', goal: 'book',
        saved: { receipt: 'demo-receipt' }, selected: 'demo-slot', timezone: 'America/New_York', zone: 'America/New_York', email: 'demo@example.com', website: '',
        event: noop, URLSearchParams,
        FormData: class { entries() { return []; } get() { return 'on'; } },
        CustomEvent: class {},
        window: { scrollTo: noop, dispatchEvent: noop, location: { search: '' } },
        setError: error => { if (error) errors.push(error); },
      };
      for (const setter of ['setStage','setReport','setResult','setDelivery','setMessage','setDeliveryMessage','setStatus','setEmail','setSaved','setStep','setBooking','setBusy']) globals[setter] = noop;
      globals.setStatus = status => { if (status === 'error') errors.push(status); };
      await handler(fixture.file, fixture.name, globals)({ preventDefault: noop, currentTarget: { reset: noop } });
      await Promise.all(pending);
      assert.deepEqual(calls, outcome === 'success' ? [[fixture.event]] : [], outcome);
      assert.equal(errors.length, outcome === 'success' ? 0 : 1, `${outcome}: existing success/error behavior preserved`);
    }
  });
}
