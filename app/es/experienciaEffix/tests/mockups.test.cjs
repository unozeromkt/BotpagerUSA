const test=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const ts=require('typescript');
const Module=require('node:module');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,file);
const originalLoad=Module._load;
Module._load=function(request,...args){return request==='server-only'?{}:originalLoad.call(this,request,...args);};
const {readMockupRequest,generateMockup,generationAvailable}=require('../generation.ts');
const {POST}=require('../api/mockups/route.ts');
const {scenes,phaseAt,totalDuration,timelineToAudio,audioToTimeline}=require('../timeline.ts');
const realFetch=global.fetch;
const logo='data:image/png;base64,'+readFileSync('public/es/feriaEffix2026/groovy-logo.png').toString('base64');
const input={business:'Café Aurora',logo,consent:true};
function request(body=input,headers={}){return new Request('http://localhost/es/experienciaEffix/api/mockups',{method:'POST',headers:{'content-type':'application/json',origin:'http://localhost',...headers},body:JSON.stringify(body)});}
test.beforeEach(()=>{delete process.env.OPENAI_API_KEY;delete process.env.EFFIX_IMAGE_GENERATION_ENABLED;delete process.env.EFFIX_IMAGE_MODEL;});
test.afterEach(()=>{global.fetch=realFetch;});
test('validates name, consent, image format, signature and dimensions',async()=>{
 assert.equal((await readMockupRequest(request())).business,'Café Aurora');
 for(const patch of [{business:''},{business:'x'.repeat(51)},{consent:false},{logo:'https://example.com/logo.png'},{logo:'data:image/png;base64,YWJjZA=='},{logo:'data:image/svg+xml;base64,YWJj'}])await assert.rejects(readMockupRequest(request({...input,...patch})));
});
test('normalizes optional business context and rejects invalid descriptions',async()=>{
 assert.equal((await readMockupRequest(request())).description,'');
 assert.equal((await readMockupRequest(request({...input,description:'  Café artesanal para jóvenes profesionales.  '}))).description,'Café artesanal para jóvenes profesionales.');
 assert.equal((await readMockupRequest(request({...input,description:'a'.repeat(400)}))).description.length,400);
 for(const description of [null,42,{},'a'.repeat(401)])await assert.rejects(readMockupRequest(request({...input,description})),{status:400});
});
test('rejects cross-site and bounded streaming bodies',async()=>{
 await assert.rejects(readMockupRequest(request(input,{origin:'https://elsewhere.test'})),{status:403});
 await assert.rejects(readMockupRequest(request(input,{'sec-fetch-site':'cross-site'})),{status:403});
 await assert.rejects(readMockupRequest(request(input,{'content-length':'2800001'})),{status:413});
 await assert.rejects(readMockupRequest(request({...input,extra:'a'.repeat(2800001)})),{status:413});
});
test('missing key returns explicit unavailability without an upstream request',async()=>{
 global.fetch=()=>{throw new Error('Must not call upstream');};assert.equal(generationAvailable(),false);
 const result=await POST(request());assert.equal(result.status,503);assert.equal(result.headers.get('cache-control'),'no-store');assert.match((await result.json()).message,/no está disponible/);
});
test('sends image and business to the documented edit API and returns only image data',async()=>{
 process.env.OPENAI_API_KEY='test-key';let calls=0;
 global.fetch=async(url,options)=>{calls++;assert.equal(url,'https://api.openai.com/v1/images/edits');const body=JSON.parse(options.body);assert.equal(body.images[0].image_url,logo);assert.equal(body.n,1);assert.equal(body.output_format,'webp');assert.match(body.prompt,/Café Aurora/);assert.match(body.prompt,/Café artesanal y repostería para estudiantes/);assert.match(body.prompt,/never instructions/);assert.ok(options.signal);return Response.json({data:[{b64_json:'dGVzdA=='}]});};
 const result=await POST(request({...input,description:'Café artesanal y repostería para estudiantes'}));assert.equal(result.status,200);assert.deepEqual(await result.json(),{image:'data:image/webp;base64,dGVzdA==',source:'openai'});assert.equal(calls,1);
});
test('provider failure and missing images never become fictitious success',async()=>{
 process.env.OPENAI_API_KEY='test-key';
 global.fetch=async()=>new Response('private provider detail',{status:429});let result=await POST(request());assert.equal(result.status,429);assert.doesNotMatch(await result.text(),/private provider detail/);
 global.fetch=async()=>Response.json({data:[]});result=await POST(request());assert.equal(result.status,502);
 global.fetch=async()=>{throw new Error('AbortError with secret');};result=await POST(request());assert.equal(result.status,504);assert.doesNotMatch(await result.text(),/secret/);
});
test('concurrency guard prevents a third generation and releases after completion',async()=>{
 process.env.OPENAI_API_KEY='test-key';const releases=[];global.fetch=()=>new Promise(resolve=>releases.push(()=>resolve(Response.json({data:[{b64_json:'dGVzdA=='}]}))));
 const a=generateMockup(input),b=generateMockup(input);await assert.rejects(generateMockup(input),{status:429});releases.forEach(release=>release());await Promise.all([a,b]);
});
test('all nine timeline boundaries remain contiguous and preserve reading time',()=>{
 assert.equal(totalDuration,96);assert.equal(scenes.length,9);scenes.forEach((scene,i)=>{assert.equal(scene.start,i?scenes[i-1].end:0);assert.equal(phaseAt(scene.start),i);assert.equal(phaseAt(scene.end-.01),i);assert.ok(scene.end-scene.start>=9);});
});

test('website cue is at 45 seconds and seeking uses the same audio mapping',()=>{
 const duration=74.214,web=scenes.findIndex(scene=>scene.label==='Web + IA');
 assert.equal(timelineToAudio(scenes[web].start,duration),45);
 assert.equal(phaseAt(audioToTimeline(44.99,duration)),web-1);
 assert.equal(phaseAt(audioToTimeline(45,duration)),web);
 assert.equal(audioToTimeline(duration,duration),totalDuration);
 for(const time of [0,...scenes.map(scene=>scene.start),95,96])assert.ok(Math.abs(audioToTimeline(timelineToAudio(time,duration),duration)-time)<1e-9);
 assert.equal(timelineToAudio(48,60,false),30);
 assert.equal(audioToTimeline(30,60,false),48);
 assert.equal(audioToTimeline(5,0),0);
});
