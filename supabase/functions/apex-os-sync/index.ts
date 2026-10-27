const cors = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"apikey,content-type","Access-Control-Allow-Methods":"POST,OPTIONS","Content-Type":"application/json"};
const send = (body: unknown, status = 200) => new Response(JSON.stringify(body), {status, headers: cors});
const isId = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_-]{32,80}$/.test(v);
const isToken = (v: unknown): v is string => typeof v === "string" && /^[A-Za-z0-9_-]{40,100}$/.test(v);
const isState = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const sizeOf = (v: unknown) => new TextEncoder().encode(JSON.stringify(v)).byteLength;
const sha256 = async (v: string) => [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)))].map(x => x.toString(16).padStart(2,"0")).join("");

function getServerKey() {
  // Prefer the current opaque secret API key dictionary; keep a legacy fallback during migration.
  try {
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const candidate = keys.default || Object.values(keys).find((v: unknown) => typeof v === "string" && v.startsWith("sb_secret_"));
    if (typeof candidate === "string" && candidate.startsWith("sb_secret_")) return candidate;
  } catch { /* Fall back to the legacy JWT key while it remains supported. */ }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", {headers: cors});
  if (req.method !== "POST") return send({error:"POST required"},405);
  const baseUrl = Deno.env.get("SUPABASE_URL");
  const key = getServerKey();
  if (!baseUrl || !key) return send({error:"Server-side Supabase key is unavailable"},500);
  let b: any;
  try { const raw = await req.text(); if (raw.length > 1200000) return send({error:"Payload too large"},413); b = JSON.parse(raw); }
  catch { return send({error:"Invalid JSON"},400); }
  const id = b.workspaceId, token = b.token, action = b.action;
  if (!isId(id) || !isToken(token)) return send({error:"Invalid pairing data"},400);

  const tokenHash = await sha256(token);
  const table = baseUrl.replace(/\/$/,"") + "/rest/v1/apex_os_workspaces";
  const headers: Record<string,string> = {apikey:key,"Content-Type":"application/json",Prefer:"return=representation"};
  // Opaque sb_secret_* keys must be sent via apikey only; legacy JWT service-role keys also need Authorization.
  if (!key.startsWith("sb_secret_")) headers.Authorization = "Bearer " + key;

  const getRow = async () => {
    const r = await fetch(table + "?select=workspace_id,secret_hash,state,revision,server_updated_at&workspace_id=eq." + encodeURIComponent(id), {headers});
    if (!r.ok) throw new Error("Database read failed (" + r.status + ")");
    return (await r.json())[0] ?? null;
  };
  try {
    let row = await getRow(), created = false;
    if (action === "init" && !row) {
      const state = isState(b.state) ? b.state : {};
      if (sizeOf(state) > 1000000) return send({error:"State too large"},413);
      const r = await fetch(table, {
        method:"POST",
        headers:{...headers,Prefer:"resolution=ignore-duplicates,return=representation"},
        body:JSON.stringify({workspace_id:id,secret_hash:tokenHash,state,revision:1,client_updated_at:state.lastSaved || new Date().toISOString(),server_updated_at:new Date().toISOString()})
      });
      if (!r.ok) return send({error:"Database create failed (" + r.status + ")"},500);
      const rows = await r.json(); created = rows.length > 0; row = rows[0] ?? await getRow();
    }
    if (!row) return send({error:"Workspace not found"},404);
    if (row.secret_hash !== tokenHash) return send({error:"Pairing token rejected"},403);
    if (action === "init" || action === "pull") return send({ok:true,created,state:row.state,revision:Number(row.revision),updatedAt:row.server_updated_at});
    if (action !== "push") return send({error:"Unknown action"},400);
    const expected = Number(b.expectedRevision), state = b.state;
    if (!Number.isSafeInteger(expected) || expected < 1 || !isState(state)) return send({error:"Invalid push data"},400);
    if (sizeOf(state) > 1000000) return send({error:"State too large"},413);
    if (Number(row.revision) !== expected) return send({ok:false,conflict:true,state:row.state,revision:Number(row.revision),updatedAt:row.server_updated_at},409);
    const stamp = new Date().toISOString();
    const r = await fetch(table + "?workspace_id=eq." + encodeURIComponent(id) + "&revision=eq." + expected, {
      method:"PATCH",headers,
      body:JSON.stringify({state,revision:expected+1,client_updated_at:state.lastSaved || stamp,server_updated_at:stamp})
    });
    if (!r.ok) return send({error:"Database update failed (" + r.status + ")"},500);
    const rows = await r.json();
    if (!rows.length) {
      row = await getRow();
      return send({ok:false,conflict:true,state:row?.state,revision:Number(row?.revision || 0),updatedAt:row?.server_updated_at},409);
    }
    const saved = rows[0];
    return send({ok:true,state:saved.state,revision:Number(saved.revision),updatedAt:saved.server_updated_at});
  } catch (e) {
    console.error("Apex OS sync error:", e);
    return send({error:"Sync backend error; local data remains saved"},500);
  }
});
