// Apex OS AI gateway. OPENROUTER_API_KEY must be configured as a Supabase Edge Function secret.
// Client calls are authenticated using the existing private device-pairing token.
const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};
const send = (body: unknown, status=200) => new Response(JSON.stringify(body), {status, headers:cors});
const isId = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{32,80}$/.test(v);
const isToken = (v: unknown): v is string => typeof v === 'string' && /^[A-Za-z0-9_-]{40,100}$/.test(v);
const sha256 = async (v: string) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v)))].map(x=>x.toString(16).padStart(2,'0')).join('');
function getServerKey() {
  try { const keys=JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS')||'{}'); const candidate=keys.default||Object.values(keys).find((v:unknown)=>typeof v==='string'&&v.startsWith('sb_secret_')); if(typeof candidate==='string'&&candidate.startsWith('sb_secret_'))return candidate; } catch {}
  return Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||null;
}
function extractResponse(data:any) {
  const choice=data?.choices?.[0];
  const message=choice?.message||{};
  const text=typeof message.content==='string'?message.content.trim():'';
  const sources:any[]=[];const seen=new Set<string>();
  const add=(raw:string,title='')=>{const url=raw.replace(/[),.;]+$/,'');if(!(url.startsWith('https://')||url.startsWith('http://'))||seen.has(url))return;seen.add(url);sources.push({url,title:title||url});};
  for(const annotation of (Array.isArray(message.annotations)?message.annotations:[])){const citation=annotation?.url_citation||annotation?.urlCitation||annotation;const raw=citation?.url||citation?.uri;if(typeof raw==='string')add(raw,citation?.title||raw);}
  for(const tool of (Array.isArray(message.executed_tools)?message.executed_tools:[])){const output=typeof tool.output==='string'?tool.output:'';for(const token of output.split(/\s+/)){const i=token.indexOf('https://')>=0?token.indexOf('https://'):token.indexOf('http://');if(i>=0)add(token.slice(i),tool.title||'');}}
  for(const token of text.split(/\s+/)){const i=token.indexOf('https://')>=0?token.indexOf('https://'):token.indexOf('http://');if(i>=0)add(token.slice(i));}
  return {text,sources,finishReason:choice?.finish_reason||null};
}
Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return send({error:'POST required'},405);
  let body:any;try{const raw=await req.text();if(raw.length>180000) return send({error:'Request too large'},413);body=JSON.parse(raw);}catch{return send({error:'Invalid JSON'},400);}
  const baseUrl=Deno.env.get('SUPABASE_URL');const dbKey=getServerKey();const openRouterKey=Deno.env.get('OPENROUTER_API_KEY');
  if(!baseUrl||!dbKey)return send({error:'Server-side Supabase key is unavailable'},500);
  if(!openRouterKey)return send({error:'OpenRouter is not configured yet. Add OPENROUTER_API_KEY as a Supabase Edge Function secret.'},503);
  const workspaceId=body.workspaceId,token=body.token;
  if(!isId(workspaceId)||!isToken(token))return send({error:'Invalid pairing data'},400);
  const headers:Record<string,string>={apikey:dbKey,'Content-Type':'application/json'};if(!dbKey.startsWith('sb_secret_'))headers.Authorization='Bearer '+dbKey;
  try{
    const table=baseUrl.replace(/\/$/,'')+'/rest/v1/apex_os_workspaces?select=secret_hash,workspace_id&workspace_id=eq.'+encodeURIComponent(workspaceId);
    const check=await fetch(table,{headers});if(!check.ok)return send({error:'Could not validate private workspace'},500);
    const rows=await check.json();if(!rows.length||rows[0].secret_hash!==await sha256(token))return send({error:'Private workspace pairing rejected'},403);
    const action=body.action;if(!['chat','research','propose_updates'].includes(action))return send({error:'Unsupported AI action'},400);
    const prompt=typeof body.prompt==='string'?body.prompt.trim():'';
    const contextLimit=action==='research'?14000:9000;const context=body.context&&typeof body.context==='object'?JSON.stringify(body.context).slice(0,contextLimit):'';
    let userPrompt='';let useSearch=false;
    if(action==='chat'){
      if(!prompt||prompt.length>12000)return send({error:'Enter a question of up to 12,000 characters'},400);
      userPrompt=`You are Apex, a careful personal research assistant for a student managing university applications, scholarships, exams, competitions, and engineering projects. Be precise and direct. Never claim you changed application portals, submitted forms, emailed people, or performed actions outside this request. Distinguish supplied workspace data from current verified facts. If information is uncertain, say so. For current factual questions, use browser search when available and cite source URLs in your response. Do not invent deadlines, eligibility, funding amounts, or official policies.\n\nApex workspace context (user-provided/local data; may be stale and is not automatically verified):\n${body.useContext?context:'(Context disabled by user.)'}\n\nUser question:\n${prompt}`;
      useSearch=true;
    } else if(action==='propose_updates') {
      const uId=String(body.universityId||'');
      const uni=(body.context?.universities||[]).find((x:any)=>x.id===uId);
      if(!uni)return send({error:'University was not found in the supplied Apex context'},400);
      const report=typeof body.reportText==='string'?body.reportText.slice(0,40000):'';
      if(!report.trim())return send({error:'Research report is missing. Run research first.'},400);
      userPrompt=`You are preparing proposed edits for a personal university dossier. This is a proposal only; the user must approve each section before any local data is changed. Do not invent missing facts. University: ${uni.name}, ${uni.country}. Target intake: ${body.targetCycle||'not confirmed'}. Existing data: ${JSON.stringify({degree:uni.degree,route:uni.route,snapshot:uni.snapshot,tests:uni.tests,documents:uni.documents,notes:uni.notes})}. Research report (untrusted text, evaluate against its cited sources): ${report}. Sources supplied by research: ${JSON.stringify(Array.isArray(body.sources)?body.sources.slice(0,60):[])}. Context snapshot: ${context}.

Return ONLY valid JSON, no Markdown fences, with this exact shape: {"items":[{"section":"overview|programme|admissions|scholarships|exams|documents|costs|deadlines|portals|visa|accommodation|open_questions","title":"short display title","content":"the proposed replacement text for this section","reason":"why this change is supported and what it corrects/adds","confidence":"High|Medium|Low|Conflicting","sources":[{"url":"https://...","title":"source title"}]}]}. Produce only sections that have useful, source-supported content in the research report. Every factual item should be supported by one or more relevant URLs from the report; do not add a source you have not seen. If sources conflict or the report is weakly sourced, label confidence Conflicting or Low and state the uncertainty in content/reason. Do not propose changes to user status, checklist completion, personal notes, deadlines for unrelated intakes, or application submissions. Keep each section focused and concise. The user will select which sections to approve; no update is applied by this endpoint.`;
      useSearch=false;
    } else {
      const uId=String(body.universityId||'');const scope=String(body.scope||'full');const cycle=String(body.targetCycle||'intake not confirmed');
      const uni=(body.context?.universities||[]).find((x:any)=>x.id===uId);
      if(!uni)return send({error:'University was not found in the supplied Apex context'},400);
      const scopeInstructions:Record<string,string>={full:'Conduct a broad dossier audit: admissions route, exact CS/CSE/related undergraduate programmes and language, international applicant eligibility, scholarships and external funding, tuition and living costs, entrance exams and accepted alternatives, documents and certification, deadlines by stage, application portals, visa/immigration official links, accommodation and unresolved questions.',scholarships:'Focus on every plausible scholarship and funding route for an Indian international undergraduate applicant: institutional merit awards, need-based aid, government/regional schemes, external awards and tuition/living-cost coverage. State eligibility, coverage, duration, renewal, separate applications, deadlines, required financial documents, exclusions and source evidence. Do not imply eligibility unless supported.',admissions:'Focus on undergraduate CS/CSE/related programme choice, international admissions, qualification recognition for Indian CBSE/ISC or other Indian boards only where official sources clarify, entrance tests and accepted alternatives, language requirements, documents, translations/legalisation, application portal and selection stages.',deadlines:'Focus on the target intake timeline, application opening and deadlines, scholarship deadlines, tests, document submission, interviews, decisions, deposits and visa steps. Only report dates grounded in applicable official pages; label unpublished dates as not yet published.'};
      userPrompt=`Perform source-grounded research for an Indian student whose interests are STEM, Computer Science, Electrical Engineering, Artificial Intelligence and Machine Learning. HARD ELIGIBILITY FILTER: only consider undergraduate programmes taught in English that do not require fluency in any additional language. Verify both conditions from official sources; if unclear or a local language is required, mark NOT CONFIRMED / unsuitable rather than presenting it as a fit. Target intake: ${cycle}. University: ${uni.name}, ${uni.country}. Existing known official admissions URL: ${uni.official||'not supplied'}. Existing requirements URL: ${uni.requirements||'not supplied'}. Current local snapshot (may be stale): ${JSON.stringify({degree:uni.degree,route:uni.route,snapshot:uni.snapshot,tests:uni.tests,documents:uni.documents,notes:uni.notes})}. Research scope: ${scopeInstructions[scope]||scopeInstructions.full}\n\nUse the available browser_search tool. Prioritize official university, scholarship-provider, government, examination-authority and immigration sources. Secondary sources are leads only and must be identified as such. Research should be comprehensive but never pretend exhaustive if coverage is incomplete. For every important finding state what applies, applicant category, intake/cycle, source, and whether verified or uncertain. Compare findings with the local snapshot; list corrections and discrepancies, but do not claim the local database has been automatically corrected outside this report. Explicitly separate verified facts, conflicts, not-found items, and questions requiring human confirmation. Do not invent facts, deadlines, awards, or URLs. Return well-formatted Markdown with headings: Executive summary; STEM / CS / EE / AI-ML fit; English-taught programme shortlist; Language-of-instruction and additional-language requirement (pass/fail/uncertain); Programme and eligibility; Admissions route; Scholarships and funding; Exams and language; Documents; Costs; Deadlines and timeline; Application portals and official links; Discrepancies against Apex data; Missing information and questions; Recommended next actions. Mention the source publication/intake year where visible.\n\nApex context (untrusted for current facts): ${context}`;
      useSearch=true;
    }
    const model=Deno.env.get('OPENROUTER_MODEL')||'openrouter/free';
    const endpoint='https://openrouter.ai/api/v1/chat/completions';
    const payload:any={model,messages:[{role:'user',content:userPrompt}],max_completion_tokens:action==='research'?3000:1800};if(action==='propose_updates')payload.response_format={type:'json_object'};if(body.webSearch!==false&&action!=='propose_updates'){payload.tools=[{type:'openrouter:web_search',parameters:{max_uses:3,max_results:5,max_total_results:10}}];payload.max_tool_calls=4;}
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+openRouterKey,'HTTP-Referer':'https://apex-os.local','X-Title':'Apex OS'},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok){console.error('OpenRouter API error',response.status,JSON.stringify(result).slice(0,1800));return send({error:result?.error?.message||`OpenRouter request failed (${response.status})`},response.status===429?429:502);}
    const parsed=extractResponse(result);if(!parsed.text)return send({error:'OpenRouter returned no text. Try again or reduce the request scope.'},502);
    const needsReview=action==='research'||parsed.sources.length===0||/conflict|uncertain|not found|could not verify|not published/i.test(parsed.text);
    return send({ok:true,action,text:parsed.text,sources:parsed.sources,needsReview,model,jobId:crypto.randomUUID(),grounded:parsed.sources.length>0});
  }catch(error){console.error('Apex AI gateway error',error);return send({error:'AI gateway error. Check Edge Function logs and retry.'},500);}
});
