/* Apex OS sync client: offline-first, no login, one-time private device pairing. */
(() => {
  'use strict';
  const CONFIG_KEY = 'apex-os-sync-pairing-v1';
  const BASE_KEY = 'apex-os-sync-base-v1';
  const PUBLIC_CFG = window.APEX_SUPABASE_CONFIG || {};
  let app = null;
  let pairing = null;
  let revision = 0;
  let baseState = null;
  let dirty = false;
  let busy = false;
  let initialized = false;
  let retryTimer = null;
  let pollTimer = null;
  let debounceTimer = null;
  let statusState = { kind: 'pending', label: 'SYNC SETUP PENDING', detail: 'Your work is saved locally while the cloud connection is prepared.' };

  function encodeRandom(bytes) {
    const b = new Uint8Array(bytes);
    crypto.getRandomValues(b);
    return Array.from(b, x => x.toString(16).padStart(2, '0')).join('');
  }
  function makePairing() {
    return { product: 'Apex OS Pairing', version: 1, workspaceId: encodeRandom(24), token: encodeRandom(32), createdAt: new Date().toISOString() };
  }
  function isPairing(v) {
    return !!v && v.product === 'Apex OS Pairing' && v.version === 1 &&
      typeof v.workspaceId === 'string' && /^[A-Za-z0-9_-]{32,80}$/.test(v.workspaceId) &&
      typeof v.token === 'string' && /^[A-Za-z0-9_-]{40,100}$/.test(v.token);
  }
  function readPairing() {
    try { const v = JSON.parse(localStorage.getItem(CONFIG_KEY) || 'null'); return isPairing(v) ? v : null; }
    catch { return null; }
  }
  function persistPairing() { if (pairing) localStorage.setItem(CONFIG_KEY, JSON.stringify(pairing)); }
  function updateStatus(kind, label, detail) {
    statusState = { kind, label, detail };
    const top = document.querySelector('#sync-top-status');
    if (top) { top.textContent = label; top.dataset.state = kind; }
    const labelNode = document.querySelector('#sync-status-label');
    const detailNode = document.querySelector('#sync-status-copy');
    const meta = document.querySelector('#sync-status-meta');
    if (labelNode) { labelNode.textContent = label; labelNode.dataset.state = kind; }
    if (detailNode) detailNode.textContent = detail;
    if (meta) meta.textContent = pairing ? `Workspace ID: ${pairing.workspaceId.slice(0, 8)}…${pairing.workspaceId.slice(-4)} · Server revision ${revision || 'not synced yet'}` : 'No pairing is configured yet.';
    const savedLabel = document.querySelector('#last-saved-label');
    if (savedLabel) {
      const savedAt = app && typeof app.getState === 'function' ? app.getState()?.lastSaved : null;
      const parsed = savedAt ? new Date(savedAt) : null;
      const time = parsed && !Number.isNaN(parsed.getTime()) ? parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
      if (time) savedLabel.textContent = `Saved locally ${time}${kind === 'connected' ? ' · cloud synced' : kind === 'offline' ? ' · local only' : ' · sync queued'}`;
      else savedLabel.textContent = kind === 'connected' ? 'Cloud connected · ready for first change' : kind === 'offline' ? 'Local copy ready · cloud retrying' : 'Local copy ready';
    }
  }
  async function api(action, extra = {}) {
    if (!PUBLIC_CFG.url || !PUBLIC_CFG.publishableKey || !PUBLIC_CFG.functionName) throw new Error('Supabase client configuration is missing.');
    if (!pairing) throw new Error('No workspace pairing is configured.');
    const endpoint = `${PUBLIC_CFG.url.replace(/\/$/, '')}/functions/v1/${PUBLIC_CFG.functionName}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Supabase publishable keys belong in `apikey`; do not send them as Bearer JWTs.
        apikey: PUBLIC_CFG.publishableKey
      },
      body: JSON.stringify({ action, workspaceId: pairing.workspaceId, token: pairing.token, ...extra })
    });
    let body = {};
    try { body = await response.json(); } catch { /* non-JSON error */ }
    if (!response.ok && response.status !== 409) throw new Error(body.error || `Cloud sync request failed (${response.status}).`);
    return { ...body, httpStatus: response.status };
  }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }
  function same(a, b) { try { return JSON.stringify(a) === JSON.stringify(b); } catch { return a === b; } }
  function isPlainObject(x) { return !!x && typeof x === 'object' && !Array.isArray(x); }
  // Apply only local edits made since the last common remote snapshot onto the newest server snapshot.
  // This preserves independent changes to different checklist/project records across devices.
  function mergeChanges(remote, local, previous) {
    if (same(local, previous)) return clone(remote);
    if (isPlainObject(local) && isPlainObject(previous)) {
      const result = isPlainObject(remote) ? clone(remote) : {};
      const keys = new Set([...Object.keys(local), ...Object.keys(previous)]);
      for (const key of keys) {
        const localHas = Object.prototype.hasOwnProperty.call(local, key);
        const prevHas = Object.prototype.hasOwnProperty.call(previous, key);
        if (localHas === prevHas && same(local[key], previous[key])) continue;
        if (!localHas) { delete result[key]; continue; }
        if (isPlainObject(local[key]) && isPlainObject(previous[key])) {
          result[key] = mergeChanges(isPlainObject(result[key]) ? result[key] : {}, local[key], previous[key]);
        } else {
          result[key] = clone(local[key]);
        }
      }
      return result;
    }
    return clone(local);
  }
  function rememberBase(s) {
    baseState = clone(s);
    try { localStorage.setItem(BASE_KEY, JSON.stringify(baseState)); } catch { /* local workspace still runs */ }
  }
  function readBase() {
    try { const v = JSON.parse(localStorage.getItem(BASE_KEY) || 'null'); return isPlainObject(v) ? v : null; }
    catch { return null; }
  }
  function localState() { return clone(app.getState()); }
  function applyRemote(s) {
    if (!isPlainObject(s)) return;
    app.applyState(clone(s));
  }
  async function initialize() {
    if (!pairing || busy) return;
    busy = true;
    try {
      // Snapshot the workspace before the request. If the user edits while the network is
      // responding, those newer edits are merged too instead of being overwritten by init.
      const localAtStart = localState();
      const result = await api('init', { state: localAtStart });
      revision = Number(result.revision || 1);
      const remoteState = isPlainObject(result.state) ? result.state : localAtStart;
      let merged = clone(remoteState);
      const base = baseState || readBase();
      if (!result.created) {
        if (base) {
          merged = mergeChanges(remoteState, localAtStart, base);
        } else if (app.hasLocalEdits?.()) {
          const defaults = typeof app.getDefaultState === 'function' ? app.getDefaultState() : {};
          merged = mergeChanges(remoteState, localAtStart, defaults);
        }
      }
      // Include changes made while the API request was in flight.
      const latestLocal = localState();
      merged = mergeChanges(merged, latestLocal, localAtStart);
      applyRemote(merged);
      rememberBase(remoteState);
      dirty = !same(merged, remoteState);
      initialized = true;
      if (dirty) updateStatus('pending', 'LOCAL CHANGES QUEUED', 'Local edits were merged with the shared workspace and are queued for upload.');
      else updateStatus('connected', 'CLOUD SYNC CONNECTED', 'Automatic sync is active. Your workspace is stored locally and synchronized through your private Supabase pairing.');
    } catch (e) {
      initialized = false;
      updateStatus('offline', 'LOCAL MODE · CLOUD RETRYING', `${e.message} Your changes remain on this device and will retry automatically.`);
    } finally {
      busy = false;
      if (dirty && navigator.onLine) setTimeout(() => { if (!busy) pushNow(); }, 180);
    }
  }
  async function pullNow() {
    if (!pairing || busy || dirty || !navigator.onLine) return;
    busy = true;
    try {
      const result = await api('pull');
      if (Number(result.revision) !== revision) {
        const base = baseState || readBase();
        const local = localState();
        const merged = base ? mergeChanges(result.state || {}, local, base) : (result.state || local);
        if (!same(merged, local)) applyRemote(merged);
        revision = Number(result.revision || 1);
        rememberBase(result.state || merged);
        if (!same(merged, result.state || {})) { dirty = true; await pushNowUnlocked(); }
        else updateStatus('connected', 'CLOUD SYNC CONNECTED', `Last sync checked ${new Date().toLocaleTimeString()}.`);
      } else {
        updateStatus('connected', 'CLOUD SYNC CONNECTED', `Last sync checked ${new Date().toLocaleTimeString()}.`);
      }
    } catch (e) {
      updateStatus('offline', 'LOCAL MODE · CLOUD RETRYING', `${e.message} Your local changes are safe; automatic retry is enabled.`);
    } finally { busy = false; }
  }
  async function pushNowUnlocked() {
    if (!pairing || !navigator.onLine) return;
    const local = localState();
    try {
      const result = await api('push', { expectedRevision: revision || 1, state: local });
      if (result.httpStatus === 409 || result.conflict) {
        const latest = result.state || {};
        const common = baseState || readBase();
        const merged = common ? mergeChanges(latest, local, common) : local;
        revision = Number(result.revision || revision || 1);
        if (!same(merged, latest)) {
          app.applyState(clone(merged));
          const retry = await api('push', { expectedRevision: revision, state: merged });
          if (retry.httpStatus === 409 || retry.conflict) {
            revision = Number(retry.revision || revision);
            rememberBase(retry.state || latest);
            dirty = true;
            updateStatus('conflict', 'SYNC CONFLICT · RETRYING', 'Both devices changed the workspace at once. Non-overlapping edits were merged; the next sync will retry.');
            return;
          }
          revision = Number(retry.revision || revision + 1);
          rememberBase(retry.state || merged);
        } else {
          rememberBase(latest);
        }
      } else {
        revision = Number(result.revision || revision + 1);
        rememberBase(result.state || local);
      }
      dirty = false;
      updateStatus('connected', 'CLOUD SYNC CONNECTED', `Synced ${new Date().toLocaleTimeString()}.`);
    } catch (e) {
      dirty = true;
      updateStatus('offline', 'LOCAL MODE · CLOUD RETRYING', `${e.message} Your changes remain saved locally.`);
    }
  }
  async function pushNow() {
    if (!pairing || busy || !dirty || !navigator.onLine) return;
    busy = true;
    try { await pushNowUnlocked(); } finally { busy = false; }
  }
  function queueSave(s) {
    if (!pairing || !initialized) return;
    dirty = true;
    updateStatus('pending', 'SYNC QUEUED', 'Saved locally. The latest changes are queued for cloud sync.');
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { if (!busy) pushNow(); }, 650);
  }
  async function importPairingFile(file) {
    const parsed = JSON.parse(await file.text());
    if (!isPairing(parsed)) throw new Error('That file is not a valid Apex OS pairing file.');
    pairing = { product: parsed.product, version: parsed.version, workspaceId: parsed.workspaceId, token: parsed.token, createdAt: parsed.createdAt || new Date().toISOString() };
    persistPairing();
    revision = 0; baseState = null; initialized = false; dirty = false;
    // Preserve deliberate offline edits while ensuring a fresh paired device starts from cloud state.
    const localAtStart = localState();
    const base = baseState || readBase() || (typeof app.getDefaultState === 'function' ? app.getDefaultState() : null);
    try {
      updateStatus('pending', 'PAIRING DEVICE…', 'Validating the pairing file and loading the shared workspace.');
      const result = await api('init', { state: localAtStart });
      revision = Number(result.revision || 1);
      const remoteState = isPlainObject(result.state) ? result.state : localAtStart;
      let merged = result.created
        ? clone(remoteState)
        : (base ? mergeChanges(remoteState, localAtStart, base) : clone(remoteState));
      // Do not drop edits made while the pairing request was in flight.
      merged = mergeChanges(merged, localState(), localAtStart);
      applyRemote(merged);
      rememberBase(remoteState);
      initialized = true;
      dirty = !same(merged, remoteState);
      if (dirty) await pushNow();
      if (!dirty) updateStatus('connected', 'DEVICE PAIRED · SYNC ACTIVE', 'This device now shares the workspace. Future changes sync automatically.');
      return true;
    } catch (e) {
      updateStatus('offline', 'PAIRING SAVED · BACKEND UNAVAILABLE', `${e.message} Pairing is saved; this device will retry when the backend is ready.`);
      throw e;
    }
  }
  function exportPairingFile() {
    if (!pairing) throw new Error('Pairing has not been initialised yet.');
    const payload = { product: 'Apex OS Pairing', version: 1, workspaceId: pairing.workspaceId, token: pairing.token, createdAt: pairing.createdAt, warning: 'Private access token. Anyone with this file can access your shared Apex OS workspace. Keep it private.' };
    const content = JSON.stringify(payload, null, 2);
    if (window.ApexAndroid && typeof window.ApexAndroid.saveTextFile === 'function') {
      window.ApexAndroid.saveTextFile('apex-os-device-pairing.json', content, 'application/json');
      return;
    }
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'apex-os-device-pairing.json'; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  function exportPairingCode() {
    if (!pairing) throw new Error('Pairing has not been initialised yet.');
    return JSON.stringify({ product: 'Apex OS Pairing', version: 1, workspaceId: pairing.workspaceId, token: pairing.token });
  }
  async function start(options) {
    app = options;
    pairing = readPairing();
    if (!pairing) { pairing = makePairing(); persistPairing(); }
    baseState = readBase();
    updateStatus('pending', 'CONNECTING TO SUPABASE…', 'Checking the private workspace. Local saves remain available if the network is down.');
    await initialize();
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => { if (!document.hidden) { if (!initialized) initialize(); else if (dirty) pushNow(); else pullNow(); } }, 12000);
    window.addEventListener('online', () => { if (!initialized) initialize(); else if (dirty) pushNow(); else pullNow(); });
    window.addEventListener('focus', () => { if (!document.hidden) { if (!initialized) initialize(); else if (dirty) pushNow(); else pullNow(); } });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { if (!initialized) initialize(); else if (dirty) pushNow(); else pullNow(); } });
  }
  async function callFunction(functionName, payload = {}) {
    if (!/^[a-z0-9-]{3,64}$/.test(functionName)) throw new Error('Invalid function name.');
    if (!PUBLIC_CFG.url || !PUBLIC_CFG.publishableKey || !pairing) throw new Error('Apex private workspace pairing is not ready. Open Settings and wait for cloud sync to connect.');
    const endpoint = `${PUBLIC_CFG.url.replace(/\/$/, '')}/functions/v1/${functionName}`;
    const response = await fetch(endpoint, { method:'POST', headers:{'Content-Type':'application/json', apikey:PUBLIC_CFG.publishableKey}, body:JSON.stringify({workspaceId:pairing.workspaceId, token:pairing.token, ...payload}) });
    let body = {}; try { body = await response.json(); } catch {}
    if (!response.ok) throw new Error(body.error || `Secure service request failed (${response.status}).`);
    return body;
  }
  window.ApexSync = { start, queueSave, importPairingFile, exportPairingFile, exportPairingCode, callFunction, getStatus: () => ({ ...statusState }), retry: () => initialized ? (dirty ? pushNow() : pullNow()) : initialize() };
})();
